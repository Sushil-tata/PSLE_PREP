require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");
const { jsonrepair } = require("jsonrepair");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8787);
const ANTHROPIC_API_URL = process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const F2_MODEL = process.env.F2_MODEL || "claude-sonnet-4-5";
const F3_MODEL = process.env.F3_MODEL || "claude-sonnet-4-5";
const F2_MAX_TOKENS = Number(process.env.F2_MAX_TOKENS || 2200);
const F3_MAX_TOKENS = Number(process.env.F3_MAX_TOKENS || 1200);
const F2_CHUNK_SIZE = Math.max(1, Math.min(10, Number(process.env.F2_CHUNK_SIZE || 5)));
const F2_MAX_CALLS = Math.max(1, Number(process.env.F2_MAX_CALLS || 4));
const F2_RECOVERY_CALLS = Math.max(0, Number(process.env.F2_RECOVERY_CALLS || 1));
const F2_CHUNK_MAX_TOKENS = Math.max(300, Number(process.env.F2_CHUNK_MAX_TOKENS || 1400));
const F2_TEMPERATURE = Number(process.env.F2_TEMPERATURE || 0.2);
const F3_TEMPERATURE = Number(process.env.F3_TEMPERATURE || 0.1);
const CACHE_TTL_MS = Number(process.env.QUIZ_CACHE_TTL_MS || 600000);
const REDIS_URL = String(process.env.REDIS_URL || "").trim();
const REDIS_KEY_PREFIX = String(process.env.REDIS_KEY_PREFIX || "nush:quiz:");
const CACHE_TTL_SECONDS = Math.max(1, Math.floor(CACHE_TTL_MS / 1000));

const cache = new Map();
let cacheBackend = "memory";
let redisClient = null;

const BAND_RULES = {
  P3: {
    name: "Primary 3",
    numeric: "small integers and straightforward fractions; avoid dense multi-step algebra",
    language: "short stems, concrete nouns, one distractor concept max",
    depth: "L2 limited to one bridge concept; L3 rare and scaffolded",
  },
  P4: {
    name: "Primary 4",
    numeric: "mixed operations, decimals, percentages with clear units",
    language: "moderate stem length and explicit constraints",
    depth: "L2 standard, L3 with one non-obvious decision",
  },
  P5: {
    name: "Primary 5",
    numeric: "multi-step calculations with ratio/rate and conversions",
    language: "longer stems with one irrelevant datum allowed",
    depth: "L2/L3 dominant, concept integration expected",
  },
  P6: {
    name: "Primary 6",
    numeric: "full PSLE-level complexity and tight unit reasoning",
    language: "dense applied contexts with realistic constraints",
    depth: "L3 frequent, includes method-selection traps",
  },
};

function stableKey(payload) {
  const json = JSON.stringify(payload);
  return crypto.createHash("sha256").update(json).digest("hex");
}

function cacheKey(key) {
  return `${REDIS_KEY_PREFIX}${key}`;
}

async function initCache() {
  if (!REDIS_URL) return;

  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on("error", (err) => {
      console.error("Redis cache error:", err.message);
    });
    await redisClient.connect();
    cacheBackend = "redis";
    console.log("Cache backend: redis");
  } catch (err) {
    redisClient = null;
    cacheBackend = "memory";
    console.warn("Redis unavailable, falling back to memory cache:", err.message);
  }
}

async function readCache(key) {
  if (cacheBackend === "redis" && redisClient) {
    const raw = await redisClient.get(cacheKey(key));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_err) {
      return null;
    }
  }

  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

async function writeCache(key, value) {
  if (cacheBackend === "redis" && redisClient) {
    await redisClient.setEx(cacheKey(key), CACHE_TTL_SECONDS, JSON.stringify(value));
    return;
  }

  cache.set(key, { ts: Date.now(), value });
}

function estimateTokens(text) {
  return Math.ceil(String(text || "").length / 4);
}

function modelTier(modelName) {
  const m = String(modelName || "").toLowerCase();
  if (m.includes("opus")) return 3;
  if (m.includes("sonnet")) return 2;
  if (m.includes("haiku")) return 1;
  return 0;
}

function resolveVerifierModel(generatorModel, verifierModel) {
  return modelTier(verifierModel) < modelTier(generatorModel)
    ? generatorModel
    : verifierModel;
}

const EFFECTIVE_F3_MODEL = resolveVerifierModel(F2_MODEL, F3_MODEL);

const F3_SYSTEM_PROMPT = [
  "You are a strict STEM reviewer for Singapore primary competition prep. Output JSON only.",
  "Independently solve the question from scratch using only the numbers given in the question stem. Compare YOUR computed answer to the stated answer key. If they differ, REJECT the question - do not adjust your reasoning, invent different input numbers, or change assumptions to make the stated answer key fit.",
  "Additionally, verify all given numbers in the question are internally consistent with each other (e.g. a sub-quantity cannot exceed its parent total) before checking the final answer. If inconsistent, REJECT and flag as DATA_INCONSISTENCY.",
].join(" ");

function parseJsonObjectFromText(rawText) {
  if (!rawText) {
    throw new Error("Empty model response.");
  }

  const text = String(rawText).trim();
  try {
    return JSON.parse(text);
  } catch (_err) {
    try {
      return JSON.parse(jsonrepair(text));
    } catch (_repairErr) {
      // continue with narrower extraction paths
    }

    const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      const fencedText = fenced[1].trim();
      try {
        return JSON.parse(fencedText);
      } catch (_fencedErr) {
        return JSON.parse(jsonrepair(fencedText));
      }
    }

    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      const sliced = text.slice(first, last + 1);
      try {
        return JSON.parse(sliced);
      } catch (_sliceErr) {
        return JSON.parse(jsonrepair(sliced));
      }
    }

    throw new Error("No parseable JSON object in model response.");
  }
}

async function callClaudeJson({ model, system, prompt, maxTokens, temperature }) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Server missing ANTHROPIC_API_KEY.");
  }

  const startedAt = Date.now();
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Claude API error ${response.status}: ${message}`);
  }

  const payload = await response.json();
  const rawText = (payload.content || [])
    .map((part) => (part && part.type === "text" ? part.text : ""))
    .join("\n")
    .trim();

  const data = parseJsonObjectFromText(rawText);

  return {
    data,
    telemetry: {
      provider: "anthropic",
      model,
      max_tokens: maxTokens,
      temperature,
      latency_ms: Date.now() - startedAt,
      prompt_chars: prompt.length,
      response_chars: rawText.length,
      estimated_prompt_tokens: estimateTokens(prompt),
      usage: payload.usage || null,
    },
  };
}

function gradeBandPrompt(band) {
  const b = BAND_RULES[band] || BAND_RULES.P5;
  return [
    `Learner band: ${band} (${b.name}).`,
    `Numeric complexity: ${b.numeric}.`,
    `Language complexity: ${b.language}.`,
    `Depth profile: ${b.depth}.`,
  ].join("\n");
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function optionSignature(options) {
  return [options?.A, options?.B, options?.C, options?.D]
    .map((x) => normalizeText(x))
    .join("||");
}

function isP5ScopeDrift(item) {
  const text = [
    item.question,
    item.options?.A,
    item.options?.B,
    item.options?.C,
    item.options?.D,
    item.explanation,
  ].join(" ").toLowerCase();

  const bannedTerms = [
    "calculus",
    "derivative",
    "integral",
    "logarithm",
    "trigonometric",
    "matrix",
    "simultaneous equation",
    "quadratic formula",
  ];

  return bannedTerms.some((term) => text.includes(term));
}

function normalizeF2Item(raw, fallbackId) {
  const options = {
    A: String(raw?.options?.A || "").trim(),
    B: String(raw?.options?.B || "").trim(),
    C: String(raw?.options?.C || "").trim(),
    D: String(raw?.options?.D || "").trim(),
  };

  const answer = String(raw?.answer || "").trim().toUpperCase();
  const level = String(raw?.level || "L1").trim().toUpperCase();

  return {
    id: Number(raw?.id) || fallbackId,
    level: ["L0", "L1", "L2", "L3"].includes(level) ? level : "L1",
    question: String(raw?.question || "").trim(),
    options,
    answer,
    concept_tags: Array.isArray(raw?.concept_tags)
      ? raw.concept_tags.map((x) => String(x).trim()).filter(Boolean)
      : [],
    real_world_context: String(raw?.real_world_context || "").trim(),
    context_is_load_bearing: Boolean(raw?.context_is_load_bearing),
    explanation: String(raw?.explanation || "").trim(),
  };
}

function evaluateF2Item(item, seenQuestions, seenOptions, band) {
  const reasons = [];
  const q = normalizeText(item.question);

  if (q.length < 18) reasons.push("SHORT_OR_INCOMPLETE_QUESTION");

  const hasAllOptions = item.options.A && item.options.B && item.options.C && item.options.D;
  if (!hasAllOptions) reasons.push("INCOMPLETE_OPTIONS");

  const distinctOptions = new Set([item.options.A, item.options.B, item.options.C, item.options.D].map((x) => normalizeText(x))).size;
  if (distinctOptions < 4) reasons.push("DUPLICATE_OPTIONS");

  if (!["A", "B", "C", "D"].includes(item.answer)) reasons.push("INVALID_ANSWER_KEY");

  if (item.level === "L3" && item.concept_tags.length < 2) {
    reasons.push("WEAK_CONCEPT_INTEGRATION");
  }
  if (item.level === "L2" && item.concept_tags.length < 1) {
    reasons.push("MISSING_CONCEPT_TAGS");
  }

  if (!item.real_world_context) reasons.push("MISSING_REAL_WORLD_CONTEXT");

  if (seenQuestions.has(q)) reasons.push("DUPLICATE_QUESTION");

  const sig = optionSignature(item.options);
  if (seenOptions.has(sig)) reasons.push("REPEATED_OPTION_SIGNATURE");

  if ((band === "P5" || band === "P4" || band === "P3") && isP5ScopeDrift(item)) {
    reasons.push("NON_P5_SCOPE_DRIFT");
  }

  const ok = reasons.length === 0;
  return { ok, reasons, q, sig };
}

function buildF2Prompt({ subjectLabel, topic, band, count, qualityHints = [], avoidStems = [] }) {
  const distributionLine =
    count >= 10
      ? "Target distribution: 4xL2, 4xL3, 1xL1, 1xL0."
      : "Target distribution for this chunk: L2/L3 dominant with at most one L1/L0 item.";

  const hintLine = qualityHints.length
    ? `Quality issues to avoid from prior attempts: ${qualityHints.join(", ")}.`
    : "";

  const avoidLine = avoidStems.length
    ? `Do not repeat these stems/fragments: ${avoidStems.join(" || ")}.`
    : "";

  return [
    `Generate exactly ${count} MCQs for ${subjectLabel} > ${topic}.`,
    gradeBandPrompt(band),
    distributionLine,
    hintLine,
    avoidLine,
    "L2/L3 must integrate at least two concepts and require applied reasoning.",
    "Reject cosmetic context, keyword-matchable stems, and weak distractors.",
    "STRICT: no duplicate questions, no duplicate option sets, no incomplete options, and no non-P5 scope drift.",
    "Each L2/L3 must contain one plausible intermediate-step trap option.",
    "Output strict JSON only using:",
    "{\"items\":[{\"id\":number,\"level\":\"L0|L1|L2|L3\",\"question\":string,\"options\":{\"A\":string,\"B\":string,\"C\":string,\"D\":string},\"answer\":\"A|B|C|D\",\"concept_tags\":string[],\"real_world_context\":string,\"context_is_load_bearing\":boolean,\"explanation\":string}]}",
  ].filter(Boolean).join("\n");
}

function buildF3Prompt({ subjectLabel, topic, band, items }) {
  const compactItems = (items || []).map((q) => ({
    id: q.id,
    level: q.level,
    question: q.question,
    options: q.options,
    answer: q.answer,
    concept_tags: q.concept_tags,
    real_world_context: q.real_world_context,
    context_is_load_bearing: q.context_is_load_bearing,
  }));

  return [
    `Subject: ${subjectLabel}`,
    `Topic: ${topic}`,
    gradeBandPrompt(band),
    "Review these MCQs strictly for load-bearing context, factual rigor, and distractor quality:",
    JSON.stringify(compactItems),
    "Output strict JSON only:",
    "{\"batch_verdict\":\"PASS|PARTIAL|FAIL\",\"trace\":string,\"reviews\":[{\"id\":number,\"status\":\"VERIFIED|FLAGGED|REJECTED\",\"assessed_level\":\"L0|L1|L2|L3\",\"assessed_load_bearing\":boolean|null,\"factual_issues\":string[],\"distractor_issues\":string[],\"review_note\":string}]}",
  ].join("\n");
}

function buildF2RepairPrompt({ subjectLabel, topic, band, targets, qualityHints = [], avoidStems = [] }) {
  const targetLine = targets
    .map((t) => `id=${t.id}, level=${t.level || "L2"}, issue=${t.issue || "General quality fix"}`)
    .join(" | ");

  const hintLine = qualityHints.length
    ? `Avoid these known issues: ${qualityHints.join(", ")}.`
    : "";

  const avoidLine = avoidStems.length
    ? `Do not repeat these stems/fragments: ${avoidStems.join(" || ")}.`
    : "";

  return [
    `Regenerate exactly ${targets.length} MCQs for ${subjectLabel} > ${topic}.`,
    gradeBandPrompt(band),
    "These are targeted replacements for previously flagged items. Keep IDs exactly as provided.",
    `Targets: ${targetLine}`,
    hintLine,
    avoidLine,
    "STRICT: no duplicates, complete options, valid answer key, real-world context required.",
    "Output strict JSON only using:",
    "{\"items\":[{\"id\":number,\"level\":\"L0|L1|L2|L3\",\"question\":string,\"options\":{\"A\":string,\"B\":string,\"C\":string,\"D\":string},\"answer\":\"A|B|C|D\",\"concept_tags\":string[],\"real_world_context\":string,\"context_is_load_bearing\":boolean,\"explanation\":string}]}",
  ].filter(Boolean).join("\n");
}

function reviewHasIssues(reviewItem) {
  return (
    (Array.isArray(reviewItem?.factual_issues) && reviewItem.factual_issues.length > 0) ||
    (Array.isArray(reviewItem?.distractor_issues) && reviewItem.distractor_issues.length > 0)
  );
}

function reviewPassedIndependentCheck(reviewItem) {
  const status = String(reviewItem?.status || "").toUpperCase();
  return status === "VERIFIED" && !reviewHasIssues(reviewItem);
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "nush-dsa-proxy",
    model_config: {
      f2_model: F2_MODEL,
      f3_model_requested: F3_MODEL,
      f3_model_effective: EFFECTIVE_F3_MODEL,
      verifier_guardrail_applied: EFFECTIVE_F3_MODEL !== F3_MODEL,
    },
    cache_backend: cacheBackend,
    cache_size: cacheBackend === "memory" ? cache.size : null,
    redis_connected: cacheBackend === "redis",
  });
});

app.post("/api/v1/f2/generate", async (req, res) => {
  const subjectLabel = String(req.body.subjectLabel || "").trim();
  const topic = String(req.body.topic || "").trim();
  const band = String(req.body.band || "P5").trim().toUpperCase();
  const count = Math.max(1, Math.min(10, Number(req.body.count || 10)));

  if (!subjectLabel || !topic) {
    return res.status(400).json({ error: "subjectLabel and topic are required" });
  }

  const cacheKey = stableKey({ endpoint: "f2", subjectLabel, topic, band, count });
  const cached = await readCache(cacheKey);
  if (cached) {
    return res.json({ ...cached, meta: { ...cached.meta, cache_hit: true, cache_backend: cacheBackend } });
  }

  try {
    const allItems = [];
    const telemetryByCall = [];
    let callsUsed = 0;
    const maxCallsBudget = F2_MAX_CALLS + F2_RECOVERY_CALLS;
    const seenQuestions = new Set();
    const seenOptions = new Set();
    const rejectedReasonCounts = {};
    const rejectedStemSamples = [];

    while (allItems.length < count && callsUsed < maxCallsBudget) {
      const remaining = count - allItems.length;
      const chunkTarget = Math.min(F2_CHUNK_SIZE, remaining);
      const isRecoveryCall = callsUsed >= F2_MAX_CALLS;
      const isLastMile = remaining <= 2;
      const topReasons = Object.entries(rejectedReasonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([k]) => k);

      const prompt = buildF2Prompt({
        subjectLabel,
        topic,
        band,
        count: isRecoveryCall ? remaining : chunkTarget,
        qualityHints: isRecoveryCall
          ? [...topReasons, "RECOVERY_MODE_FILL_MISSING_ITEMS_ONLY"]
          : topReasons,
        avoidStems: rejectedStemSamples.slice(-6),
      });

      const { data, telemetry } = await callClaudeJson({
        model: F2_MODEL,
        system: "You are a strict STEM tutor for Singapore primary learners. Output JSON only.",
        prompt,
        maxTokens: isLastMile
          ? Math.min(F2_MAX_TOKENS, 900)
          : Math.min(F2_MAX_TOKENS, F2_CHUNK_MAX_TOKENS),
        temperature: F2_TEMPERATURE,
      });

      callsUsed += 1;
      telemetryByCall.push(telemetry);

      const chunkItems = Array.isArray(data.items) ? data.items : [];
      for (const rawItem of chunkItems) {
        if (allItems.length >= count) break;
        const item = normalizeF2Item(rawItem, allItems.length + 1);
        const check = evaluateF2Item(item, seenQuestions, seenOptions, band);
        if (!check.ok) {
          for (const reason of check.reasons) {
            rejectedReasonCounts[reason] = (rejectedReasonCounts[reason] || 0) + 1;
          }
          if (item.question) {
            rejectedStemSamples.push(item.question.slice(0, 120));
          }
          continue;
        }

        seenQuestions.add(check.q);
        seenOptions.add(check.sig);
        allItems.push({
          ...item,
          id: allItems.length + 1,
        });
      }

      if (chunkItems.length === 0) break;
    }

    if (allItems.length < count) {
      throw new Error(`Insufficient generated items: ${allItems.length}/${count} after ${callsUsed} calls.`);
    }

    const totalLatency = telemetryByCall.reduce((sum, t) => sum + Number(t?.latency_ms || 0), 0);
    const totalPromptTokens = telemetryByCall.reduce((sum, t) => sum + Number(t?.usage?.input_tokens || 0), 0);
    const totalOutputTokens = telemetryByCall.reduce((sum, t) => sum + Number(t?.usage?.output_tokens || 0), 0);

    const responsePayload = {
      items: allItems,
      meta: {
        source: "api",
        cache_hit: false,
        cache_backend: cacheBackend,
        model: F2_MODEL,
        max_tokens: F2_MAX_TOKENS,
        temperature: F2_TEMPERATURE,
        band,
        telemetry: {
          provider: "anthropic",
          model: F2_MODEL,
          max_tokens: F2_MAX_TOKENS,
          temperature: F2_TEMPERATURE,
          calls_used: callsUsed,
          max_calls_budget: maxCallsBudget,
          chunk_size: F2_CHUNK_SIZE,
          chunk_max_tokens: Math.min(F2_MAX_TOKENS, F2_CHUNK_MAX_TOKENS),
          latency_ms: totalLatency,
          usage: {
            input_tokens: totalPromptTokens,
            output_tokens: totalOutputTokens,
          },
          rejected_reason_counts: rejectedReasonCounts,
          calls: telemetryByCall,
        },
      },
    };

    await writeCache(cacheKey, responsePayload);
    return res.json(responsePayload);
  } catch (err) {
    return res.status(502).json({
      error: "F2 generation failed",
      details: String(err.message || err),
      meta: {
        source: "error",
        cache_hit: false,
        cache_backend: cacheBackend,
        band,
      },
    });
  }
});

app.post("/api/v1/f3/verify", async (req, res) => {
  const subjectLabel = String(req.body.subjectLabel || "").trim();
  const topic = String(req.body.topic || "").trim();
  const band = String(req.body.band || "P5").trim().toUpperCase();
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  if (!subjectLabel || !topic || items.length === 0) {
    return res.status(400).json({ error: "subjectLabel, topic and items are required" });
  }

  const cacheKey = stableKey({ endpoint: "f3", subjectLabel, topic, band, items });
  const cached = await readCache(cacheKey);
  if (cached) {
    return res.json({ ...cached, meta: { ...cached.meta, cache_hit: true, cache_backend: cacheBackend } });
  }

  const prompt = buildF3Prompt({ subjectLabel, topic, band, items });

  try {
    const { data, telemetry } = await callClaudeJson({
      model: EFFECTIVE_F3_MODEL,
      system: F3_SYSTEM_PROMPT,
      prompt,
      maxTokens: F3_MAX_TOKENS,
      temperature: F3_TEMPERATURE,
    });

    const responsePayload = {
      review: {
        batch_verdict: data.batch_verdict || "PARTIAL",
        trace: data.trace || "Model review completed.",
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
      },
      meta: {
        source: "api",
        cache_hit: false,
        cache_backend: cacheBackend,
        model_requested: F3_MODEL,
        model: EFFECTIVE_F3_MODEL,
        max_tokens: F3_MAX_TOKENS,
        temperature: F3_TEMPERATURE,
        band,
        telemetry,
      },
    };

    await writeCache(cacheKey, responsePayload);
    return res.json(responsePayload);
  } catch (err) {
    return res.status(502).json({
      error: "F3 verification failed",
      details: String(err.message || err),
      meta: {
        source: "error",
        cache_hit: false,
        cache_backend: cacheBackend,
        band,
      },
    });
  }
});

app.post("/api/v1/f3/repair", async (req, res) => {
  const subjectLabel = String(req.body.subjectLabel || "").trim();
  const topic = String(req.body.topic || "").trim();
  const band = String(req.body.band || "P5").trim().toUpperCase();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const review = req.body.review || {};

  if (!subjectLabel || !topic || items.length === 0 || !Array.isArray(review.reviews)) {
    return res.status(400).json({
      error: "subjectLabel, topic, items and review.reviews are required",
    });
  }

  try {
    const reviewById = new Map();
    for (const r of review.reviews) {
      const id = Number(r?.id);
      if (id > 0) reviewById.set(id, r);
    }

    const flaggedTargets = items
      .map((item) => {
        const itemId = Number(item?.id);
        const r = reviewById.get(itemId);
        const status = String(r?.status || "").toUpperCase();
        const hasIssue = Array.isArray(r?.factual_issues) && r.factual_issues.length > 0;
        const hasDistractorIssue = Array.isArray(r?.distractor_issues) && r.distractor_issues.length > 0;
        const flagged = status === "REJECTED" || status === "FLAGGED" || hasIssue || hasDistractorIssue;
        if (!flagged) return null;

        const issues = [];
        if (Array.isArray(r?.factual_issues)) issues.push(...r.factual_issues);
        if (Array.isArray(r?.distractor_issues)) issues.push(...r.distractor_issues);
        if (r?.review_note) issues.push(String(r.review_note));

        return {
          id: itemId,
          level: String(item?.level || r?.assessed_level || "L2").toUpperCase(),
          issue: issues.filter(Boolean).slice(0, 2).join("; ") || "Quality issue",
          stem: String(item?.question || "").slice(0, 120),
        };
      })
      .filter(Boolean);

    if (flaggedTargets.length === 0) {
      const existingPrompt = buildF3Prompt({ subjectLabel, topic, band, items });
      const { data, telemetry } = await callClaudeJson({
        model: EFFECTIVE_F3_MODEL,
          system: F3_SYSTEM_PROMPT,
        prompt: existingPrompt,
        maxTokens: F3_MAX_TOKENS,
        temperature: F3_TEMPERATURE,
      });

      return res.json({
        items,
        review: {
          batch_verdict: data.batch_verdict || "PASS",
          trace: data.trace || "No flagged items to repair.",
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
        },
        meta: {
          source: "api",
          model: F2_MODEL,
          verifier_model: EFFECTIVE_F3_MODEL,
          repaired_count: 0,
          repaired_ids: [],
          band,
          telemetry: {
            repair_calls_used: 0,
            verify: telemetry,
          },
        },
      });
    }

    const untouched = items.filter((item) => !flaggedTargets.some((t) => t.id === Number(item?.id)));
    const seenQuestions = new Set();
    const seenOptions = new Set();
    for (const raw of untouched) {
      const item = normalizeF2Item(raw, Number(raw?.id) || 1);
      const q = normalizeText(item.question);
      if (q) seenQuestions.add(q);
      seenOptions.add(optionSignature(item.options));
    }

    const replacements = [];
    const replacedIds = new Set();
    const rejectedReasonCounts = {};
    const repairTelemetry = [];
    let repairCallsUsed = 0;
    const maxRepairCalls = 1 + Math.max(0, F2_RECOVERY_CALLS);

    while (replacedIds.size < flaggedTargets.length && repairCallsUsed < maxRepairCalls) {
      const remainingTargets = flaggedTargets.filter((t) => !replacedIds.has(t.id));
      const topReasons = Object.entries(rejectedReasonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([k]) => k);

      const prompt = buildF2RepairPrompt({
        subjectLabel,
        topic,
        band,
        targets: remainingTargets,
        qualityHints: topReasons,
        avoidStems: flaggedTargets.map((t) => t.stem).filter(Boolean).slice(-6),
      });

      const { data, telemetry } = await callClaudeJson({
        model: F2_MODEL,
        system: "You are a strict STEM tutor fixing only flagged quiz items. Output JSON only.",
        prompt,
        maxTokens: Math.min(F2_MAX_TOKENS, F2_CHUNK_MAX_TOKENS),
        temperature: F2_TEMPERATURE,
      });

      repairCallsUsed += 1;
      repairTelemetry.push(telemetry);

      const targetById = new Map(remainingTargets.map((t) => [t.id, t]));
      const generated = Array.isArray(data.items) ? data.items : [];

      for (const rawItem of generated) {
        const targetId = Number(rawItem?.id);
        if (!targetById.has(targetId) || replacedIds.has(targetId)) continue;

        const normalized = normalizeF2Item(rawItem, targetId);
        normalized.id = targetId;

        const expectedLevel = String(targetById.get(targetId)?.level || normalized.level || "L2").toUpperCase();
        normalized.level = ["L0", "L1", "L2", "L3"].includes(expectedLevel) ? expectedLevel : normalized.level;

        const check = evaluateF2Item(normalized, seenQuestions, seenOptions, band);
        if (!check.ok) {
          for (const reason of check.reasons) {
            rejectedReasonCounts[reason] = (rejectedReasonCounts[reason] || 0) + 1;
          }
          continue;
        }

        replacements.push(normalized);
        replacedIds.add(targetId);
        seenQuestions.add(check.q);
        seenOptions.add(check.sig);
      }

      if (generated.length === 0) break;
    }

    const finalItems = items.map((item) => {
      const id = Number(item?.id);
      const replacement = replacements.find((r) => r.id === id);
      return replacement || item;
    });

    const verifyPrompt = buildF3Prompt({ subjectLabel, topic, band, items: finalItems });
    const { data: verified, telemetry: verifyTelemetry } = await callClaudeJson({
      model: EFFECTIVE_F3_MODEL,
      system: F3_SYSTEM_PROMPT,
      prompt: verifyPrompt,
      maxTokens: F3_MAX_TOKENS,
      temperature: F3_TEMPERATURE,
    });

    const verifiedReviews = Array.isArray(verified.reviews) ? verified.reviews : [];
    const verifiedReviewById = new Map(
      verifiedReviews
        .map((r) => [Number(r?.id), r])
        .filter(([id]) => Number.isFinite(id) && id > 0),
    );
    const passedRepairedIds = Array.from(replacedIds).filter((id) =>
      reviewPassedIndependentCheck(verifiedReviewById.get(id)),
    );
    const failedRepairedIds = Array.from(replacedIds).filter((id) => !passedRepairedIds.includes(id));

    const repairInputTokens = repairTelemetry.reduce((sum, t) => sum + Number(t?.usage?.input_tokens || 0), 0);
    const repairOutputTokens = repairTelemetry.reduce((sum, t) => sum + Number(t?.usage?.output_tokens || 0), 0);

    return res.json({
      items: finalItems,
      review: {
        batch_verdict: verified.batch_verdict || "PARTIAL",
        trace: verified.trace || "Repair and verification completed.",
        reviews: Array.isArray(verified.reviews) ? verified.reviews : [],
      },
      meta: {
        source: "api",
        model: F2_MODEL,
        verifier_model: EFFECTIVE_F3_MODEL,
        repaired_count: passedRepairedIds.length,
        repaired_ids: passedRepairedIds.sort((a, b) => a - b),
        repaired_but_failed_verification_ids: failedRepairedIds.sort((a, b) => a - b),
        flagged_target_count: flaggedTargets.length,
        band,
        telemetry: {
          repair_calls_used: repairCallsUsed,
          repair_rejected_reason_counts: rejectedReasonCounts,
          usage: {
            input_tokens: repairInputTokens + Number(verifyTelemetry?.usage?.input_tokens || 0),
            output_tokens: repairOutputTokens + Number(verifyTelemetry?.usage?.output_tokens || 0),
            repair_input_tokens: repairInputTokens,
            repair_output_tokens: repairOutputTokens,
            verify_input_tokens: Number(verifyTelemetry?.usage?.input_tokens || 0),
            verify_output_tokens: Number(verifyTelemetry?.usage?.output_tokens || 0),
          },
          repair_calls: repairTelemetry,
          verify: verifyTelemetry,
        },
      },
    });
  } catch (err) {
    return res.status(502).json({
      error: "F3 repair failed",
      details: String(err.message || err),
      meta: {
        source: "error",
        cache_hit: false,
        cache_backend: cacheBackend,
        band,
      },
    });
  }
});

initCache().finally(() => {
  app.listen(PORT, () => {
    console.log(`NUSH DSA proxy listening on port ${PORT}`);
  });
});
