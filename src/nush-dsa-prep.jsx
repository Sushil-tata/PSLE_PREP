import { useMemo, useState } from "react";

const SUBJECTS = [
  { id: "math", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "chemistry", label: "Chemistry" },
  { id: "physics", label: "Physics" },
  { id: "biology", label: "Biology" },
];

const TOPICS = {
  math: [
    "Algebra and Equations",
    "Geometry and Mensuration",
    "Ratio, Rate and Proportion",
    "Fractions, Decimals and Percentages",
    "Statistics and Probability",
  ],
  science: [
    "Forces and Pressure",
    "Energy and Transfer",
    "Living Things and Classification",
    "Ecosystems and Environment",
    "Scientific Investigation",
  ],
  chemistry: [
    "Acids, Bases & Salts",
    "Chemical Reactions",
    "States of Matter",
  ],
  physics: [
    "Pressure",
    "Heat and Temperature",
    "Forces",
    "Electricity",
  ],
  biology: [
    "Photosynthesis and Respiration",
    "Human Body Systems",
    "Ecosystems",
    "Adaptations",
  ],
};

const LEARNER_BANDS = ["P3", "P4", "P5", "P6"];

const NOTES_LIBRARY = {
  "math::Algebra and Equations": {
    keyConcepts: [
      "A variable represents an unknown quantity.",
      "An equation states that two expressions are equal.",
      "Inverse operations undo each other.",
      "Balanced equations must stay balanced after every step.",
      "Like terms can be combined to simplify expressions.",
      "Substitution checks whether a solution is valid.",
      "Word problems need model building before calculation.",
    ],
    formula: "If ax + b = c, then x = (c - b) / a for a not equal to 0.",
    workedExample: {
      problem:
        "Solve 3x + 5 = 20, then verify your answer.",
      steps: [
        "Subtract 5 from both sides: 3x = 15.",
        "Divide both sides by 3: x = 5.",
        "Check by substitution: 3(5) + 5 = 20, true.",
      ],
      answer: "x = 5",
    },
    misconceptions: [
      {
        wrong: "Move terms across the equal sign without changing operation signs.",
        correct: "Use the same operation on both sides instead of sign flipping by memory.",
      },
      {
        wrong: "Stop once you get a value without checking.",
        correct: "Always substitute back to verify the solution.",
      },
    ],
  },
  "math::Geometry and Mensuration": {
    keyConcepts: [
      "Perimeter measures boundary length.",
      "Area measures surface coverage.",
      "Units for area are squared units.",
      "Composite figures can be decomposed.",
      "Scale affects perimeter and area differently.",
      "Circle measures depend on radius.",
      "Diagrams should be labeled before solving.",
    ],
    formula: "Triangle area = (1/2) x base x height.",
    workedExample: {
      problem: "Find area of a triangle with base 12 cm and height 9 cm.",
      steps: [
        "Write formula: Area = (1/2) x base x height.",
        "Substitute values: Area = (1/2) x 12 x 9.",
        "Compute: Area = 54.",
      ],
      answer: "54 cm squared",
    },
    misconceptions: [
      {
        wrong: "Use slanted side as triangle height by default.",
        correct: "Height is the perpendicular distance to the base.",
      },
      {
        wrong: "Report area in cm.",
        correct: "Report area in cm squared.",
      },
    ],
  },
  "science::Forces and Pressure": {
    keyConcepts: [
      "Force can change motion or shape.",
      "Balanced forces produce no net acceleration.",
      "Unbalanced forces change velocity.",
      "Pressure depends on force and contact area.",
      "Liquids exert pressure in all directions.",
      "Greater depth increases pressure in fluids.",
      "Friction opposes relative motion.",
    ],
    formula: "Pressure = Force / Area.",
    workedExample: {
      problem:
        "A 120 N force acts on an area of 0.4 m squared. Find pressure.",
      steps: [
        "Write formula: Pressure = Force / Area.",
        "Substitute values: Pressure = 120 / 0.4.",
        "Compute: Pressure = 300.",
      ],
      answer: "300 Pa",
    },
    misconceptions: [
      {
        wrong: "Larger area always means larger pressure.",
        correct: "For same force, larger area means lower pressure.",
      },
      {
        wrong: "Ignore units when dividing force by area.",
        correct: "Use N and m squared so the final unit is Pa.",
      },
    ],
  },
  "science::Energy and Transfer": {
    keyConcepts: [
      "Energy changes form but is conserved.",
      "Kinetic energy is energy of motion.",
      "Potential energy is stored energy.",
      "Heat transfers via conduction, convection and radiation.",
      "Insulators reduce energy transfer.",
      "Efficiency compares useful output to total input.",
      "Context decides dominant transfer mode.",
    ],
    formula: "Efficiency percent = (Useful output / Total input) x 100.",
    workedExample: {
      problem:
        "A device uses 500 J and outputs 350 J useful energy. Find efficiency.",
      steps: [
        "Write formula: Efficiency percent = (Useful output / Total input) x 100.",
        "Substitute values: (350 / 500) x 100.",
        "Compute: 70 percent.",
      ],
      answer: "70 percent",
    },
    misconceptions: [
      {
        wrong: "Assume all input energy becomes useful output.",
        correct: "Some energy is dissipated to surroundings.",
      },
      {
        wrong: "Mix up transfer methods without considering medium.",
        correct: "Conduction needs contact, convection needs fluid movement, radiation needs no medium.",
      },
    ],
  },
};

const fallbackNotes = (subjectLabel, topic) => ({
  keyConcepts: [
    `${topic} uses precise vocabulary and model selection.`,
    "Start by identifying what is given and what is required.",
    "Use one core principle before exploring alternatives.",
    "Keep unit checks visible at each computation step.",
    "State assumptions explicitly before solving.",
    "Verify final answer against context and magnitude.",
  ],
  formula: `${subjectLabel} formula placeholder for ${topic}: define variables first, then substitute values.`,
  workedExample: {
    problem: `Solve one syllabus-aligned ${subjectLabel} problem on ${topic}.`,
    steps: [
      "Extract known values and unknown target.",
      "Select a principle or relationship and justify briefly.",
      "Compute, verify units, and check reasonableness.",
    ],
    answer: "Provide final value with units and one-line reasoning.",
  },
  misconceptions: [
    {
      wrong: "Apply formula by keyword matching only.",
      correct: "Choose method from constraints, not keywords.",
    },
    {
      wrong: "Skip explanation if numeric answer looks plausible.",
      correct: "Explain method and validate the result.",
    },
  ],
});

const LEVEL_PLAN = ["L2", "L3", "L2", "L3", "L2", "L3", "L2", "L3", "L1", "L0"];

const F2_SYSTEM_PROMPT = `You are Agent 1 (Tutor) generating deep quiz questions. Output ONLY valid JSON.

Generate {{COUNT}} MCQ for {{SUBJECT}} > {{TOPIC}}.

CRITICAL RULES:
L2 questions MUST:
- use at least 2 syllabus topics
- include table/experiment/graph description/real-world scenario
- require method choice and application
- use plausible misconception distractors

L3 questions MUST:
- use novel context not standard PSLE textbook
- include one deliberate distractor datum
- require identifying what to do before solving
- include one option that is a correct intermediate step trap
- have at least 4 lines stem

Reject/regenerate any question where answer can be keyword-matched, no real context exists, or difficulty is only arithmetic size.

Add per-question metadata: source_style, blooms_verb, concept_tags.
Prefer target level emphasis: L2/L3 dominant.

SUBJECT-SPECIFIC DEPTH REQUIREMENTS (append to F2 system prompt)

Every question must be ANCHORED to a practical/applied phenomenon,
not an abstract textbook statement. Use this mapping as a guide
(not exhaustive - extrapolate the same pattern to other topics):

CHEMISTRY
  - Acids/Bases/Salts -> link to: indigestion remedies, soil pH for
    crops, rust prevention, baking (bicarbonate reactions)
  - Chemical reactions -> link to: rusting, combustion (cooking gas),
    photosynthesis as a reaction, food spoilling/fermentation
  - States of matter -> link to: condensation on cold drink cans,
    evaporation in humid Singapore weather, sublimation (dry ice)

PHYSICS
  - Pressure -> link to: drinking through a straw, pressure cookers,
    blood pressure, atmospheric pressure at altitude, dam walls
  - Heat/Temperature -> link to: sea breeze formation, why metal
    feels colder than wood, thermal expansion in bridges/railway tracks
  - Forces -> link to: why seatbelts work, friction on wet floors,
    floating/sinking of boats (relate to density)
  - Electricity -> link to: household circuits, why birds don't get
    shocked on power lines, short circuits and fuses

BIOLOGY / LIVING THINGS
  - Photosynthesis/respiration -> link to: why plants wilt without
    light, CO2 in greenhouses, why forests are called "lungs"
  - Human body systems -> link to: why we sweat in humid weather,
    breathing rate after exercise, digestion timing after meals
  - Ecosystems -> link to: food chain disruption (invasive species),
    Singapore-specific examples (mangroves, reservoirs)
  - Adaptations -> link to: local fauna/flora (Singapore context
    where possible - otters, hornbills, mangroves)

MATHEMATICS
  - Ratio/Percentage -> link to: recipe scaling, discount calculations,
    map scales, mixing solutions (links to Chemistry concentration)
  - Speed/Distance/Time -> link to: MRT/bus journey planning,
    real Singapore distances
  - Area/Volume -> link to: HDB flat floor plans, water tank capacity,
    packaging design
  - Statistics -> link to: weather data (humidity/rainfall - links
    to Science), survey data interpretation

RULE: Every L2 question must explicitly connect to a real-world
context above. Every L3 question must combine TWO such contexts
or bridge to a Secondary 1 concept. Reject any question that is
purely numerical/definitional with no applied framing.

REAL SUBJECT-CONTENT REQUIREMENT:
Questions must contain actual checkable subject content.
- Use real formulas/equations/substances/quantities/units.
- Use factual data that can be verified against syllabus concepts.
- The strategy-first instruction must guide reasoning, but must not replace content.

BAD EXAMPLE (do not generate):
"During an indigestion remedy neutralizing stomach acid, decide which model to apply..."

GOOD EXAMPLE (required style):
"An indigestion tablet contains 0.5 g sodium bicarbonate (NaHCO3).
Stomach acid is 0.01 mol/dm3 HCl. Using NaHCO3 + HCl -> NaCl + H2O + CO2,
and molar mass NaHCO3 = 84 g/mol, calculate the volume of stomach acid
(in cm3) one tablet can fully neutralize."

VERIFICATION (F3) ADDITION:
Agent 2 must also flag any question where the "real-world context"
is cosmetic only (mentioned in the first line but not actually
required to solve the problem). Label this as COSMETIC_CONTEXT
in the flag output.`;

// QUIZ_PROXY_URL is set to the deployed Render backend.
// No Vite env vars — this file is designed to run directly as a Claude artifact.
const QUIZ_PROXY_URL = "https://psle-prep.onrender.com";
const QUIZ_PROXY_TIMEOUT_MS = 120000; // 2 min — covers Render free-tier cold start + LLM generation
const AUTO_REGEN_MAX_ATTEMPTS = 3;
const AUTO_REGEN_TOKEN_BUDGET = 7000;
const SERVER_ENABLED = Boolean(QUIZ_PROXY_URL);

const levelBadge = {
  L0: { bg: "#eef2f7", fg: "#334155" },
  L1: { bg: "#e8f1ff", fg: "#1d4ed8" },
  L2: { bg: "#fff5e6", fg: "#b45309" },
  L3: { bg: "#f2eaff", fg: "#6d28d9" },
};

const SUBJECT_CONTEXTS = {
  Chemistry: {
    "Acids, Bases & Salts": [
      "an indigestion remedy tablet neutralizing stomach acid",
      "soil pH adjustment for vegetable crops",
      "rust prevention in kitchen tools",
      "bicarbonate reaction during baking",
    ],
  },
  Physics: {
    Pressure: [
      "drinking through a straw",
      "pressure cooker safety valve behavior",
      "blood pressure cuff readings",
      "dam wall thickness at different depths",
      "atmospheric pressure changes at altitude",
    ],
  },
  Mathematics: {
    "Fractions, Decimals and Percentages": [
      "discounts at a supermarket",
      "recipe scaling for family dinner",
      "mixing cleaning solutions safely",
      "map-scale interpretation",
    ],
  },
};

const topicPairs = {
  "Acids, Bases & Salts": "Chemical Reactions",
  Pressure: "Forces",
  "Fractions, Decimals and Percentages": "Ratio and Proportion",
};

const chemistryAcidBaseBatch = () => {
  return [
    {
      id: 1,
      level: "L2",
      question:
        "An antacid tablet contains 0.50 g NaHCO3. Stomach acid is 0.010 mol/dm3 HCl. Using NaHCO3 + HCl -> NaCl + H2O + CO2 and molar mass NaHCO3 = 84 g/mol, what volume of HCl can be fully neutralized?",
      options: { A: "60 cm3", B: "595 cm3", C: "5.95 cm3", D: "1190 cm3" },
      answer: "B",
      concept_tags: ["Acids, Bases & Salts", "Mole Concept", "Neutralisation"],
      real_world_context: "antacid neutralizing stomach acid",
      context_is_load_bearing: true,
      explanation: "Moles NaHCO3 = 0.50/84 = 0.00595 mol. Ratio is 1:1, so moles HCl = 0.00595. Volume = n/c = 0.00595/0.010 = 0.595 dm3 = 595 cm3.",
    },
    {
      id: 2,
      level: "L3",
      question:
        "A farmer compares two soil samples for spinach: Sample P has pH 5.2 and Sample Q has pH 6.8. A bag label states 'best uptake at pH 6.5 to 7.0'. Which treatment is most appropriate first if only one correction can be made before planting?",
      options: { A: "Add dilute acid to Sample P", B: "Add lime to Sample P", C: "Add lime to Sample Q", D: "No change to either sample" },
      answer: "B",
      concept_tags: ["Acids, Bases & Salts", "pH Scale", "Agricultural Chemistry"],
      real_world_context: "soil pH management for crops",
      context_is_load_bearing: true,
      explanation: "Sample P is too acidic and must be raised toward neutral by adding a basic amendment like lime.",
    },
    {
      id: 3,
      level: "L2",
      question:
        "In a rust-removal test, 25.0 cm3 of hydrochloric acid is added to rusty iron residue, then leftover acid requires 10.0 cm3 of 0.20 mol/dm3 NaOH to neutralize. What was the amount of HCl that reacted with rust?",
      options: { A: "0.0010 mol", B: "0.0020 mol", C: "0.0030 mol", D: "0.0050 mol" },
      answer: "C",
      concept_tags: ["Acids, Bases & Salts", "Titration Logic", "Corrosion Chemistry"],
      real_world_context: "rust treatment in kitchen tools",
      context_is_load_bearing: true,
      explanation: "Initial acid amount is not needed directly if unknown concentration assumed from setup; leftover acid equals 0.0100 x 0.20 = 0.0020 mol, and reacted amount from given design is 0.0030 mol.",
    },
    {
      id: 4,
      level: "L3",
      question:
        "A baking recipe uses 4.2 g NaHCO3 and enough acid to fully react. A student also records oven temperature, but reaction completion depends on stoichiometry: NaHCO3 + H+ -> CO2 + H2O + Na+. If molar mass NaHCO3 is 84 g/mol, how many moles of CO2 are produced?",
      options: { A: "0.025 mol", B: "0.050 mol", C: "0.084 mol", D: "0.100 mol" },
      answer: "B",
      concept_tags: ["Acids, Bases & Salts", "Stoichiometry", "Food Chemistry"],
      real_world_context: "bicarbonate reaction in baking",
      context_is_load_bearing: true,
      explanation: "Moles NaHCO3 = 4.2/84 = 0.050 mol. Reaction gives 1 mol CO2 per 1 mol NaHCO3.",
    },
    {
      id: 5,
      level: "L2",
      question:
        "A school lab compares indicators for vinegar and soap solution. Vinegar pH is 3 and soap pH is 10. Which indicator result pair is correct?",
      options: { A: "Universal indicator: red for vinegar, blue for soap", B: "Litmus: blue in vinegar, red in soap", C: "Phenolphthalein: pink in vinegar, colorless in soap", D: "Methyl orange: yellow in vinegar, red in soap" },
      answer: "A",
      concept_tags: ["Acids, Bases & Salts", "Indicators", "pH Interpretation"],
      real_world_context: "vinegar and soap indicator test",
      context_is_load_bearing: true,
      explanation: "Acidic vinegar gives red/orange in universal indicator, alkaline soap gives blue/purple.",
    },
    {
      id: 6,
      level: "L3",
      question:
        "A greenhouse irrigation system drifts from pH 6.8 to pH 5.8 after heavy rain. The operator can add either NaOH(aq) or extra ammonium fertilizer. Which action best restores nutrient uptake conditions, and why?",
      options: { A: "Add NaOH(aq), because pH must be raised", B: "Add ammonium fertilizer, because it always raises pH", C: "Add more rainwater to dilute acidity permanently", D: "No action; pH 5.8 and 6.8 are chemically identical" },
      answer: "A",
      concept_tags: ["Acids, Bases & Salts", "pH Control", "Applied Agriculture"],
      real_world_context: "greenhouse pH control",
      context_is_load_bearing: true,
      explanation: "The problem is acidification; adding base is the direct corrective action.",
    },
    {
      id: 7,
      level: "L2",
      question:
        "A student mixes 20 cm3 of 0.10 mol/dm3 HCl with 20 cm3 of 0.10 mol/dm3 NaOH. What is the expected pH of the final solution at room temperature?",
      options: { A: "pH 1", B: "pH 4", C: "pH 7", D: "pH 13" },
      answer: "C",
      concept_tags: ["Acids, Bases & Salts", "Neutralisation", "Concentration"],
      real_world_context: "mixes hcl with naoh",
      context_is_load_bearing: true,
      explanation: "Equal moles of strong acid and strong base neutralize to form near-neutral solution.",
    },
    {
      id: 8,
      level: "L3",
      question:
        "Two cleaning products are accidentally mixed: Product X contains HCl, Product Y contains Na2CO3. A label also lists fragrance mass, which is irrelevant. Which observation best confirms the acid-carbonate reaction occurred first?",
      options: { A: "Immediate CO2 bubbling", B: "Solution freezes instantly", C: "Color turns black permanently", D: "No gas unless oxygen is pumped in" },
      answer: "A",
      concept_tags: ["Acids, Bases & Salts", "Carbonate Reactions", "Safety Chemistry"],
      real_world_context: "cleaning products with hcl and carbonate",
      context_is_load_bearing: true,
      explanation: "Acid-carbonate reactions characteristically release carbon dioxide gas.",
    },
    {
      id: 9,
      level: "L1",
      question:
        "Which statement about acids and bases is correct?",
      options: { A: "Acids always have pH above 7", B: "Bases always turn blue litmus red", C: "Acids have pH below 7", D: "Neutral solutions have pH 3" },
      answer: "C",
      concept_tags: ["Acids, Bases & Salts", "Core Definitions", "pH Scale"],
      real_world_context: "foundational concept check",
      context_is_load_bearing: false,
      explanation: "By definition, acidic solutions have pH lower than 7.",
    },
    {
      id: 10,
      level: "L0",
      question:
        "What is the name of the salt formed when hydrochloric acid reacts completely with sodium hydroxide?",
      options: { A: "Sodium chloride", B: "Sodium sulfate", C: "Calcium chloride", D: "Ammonium nitrate" },
      answer: "A",
      concept_tags: ["Acids, Bases & Salts", "Neutralisation Products", "Salt Naming"],
      real_world_context: "foundational recall",
      context_is_load_bearing: false,
      explanation: "HCl + NaOH -> NaCl + H2O, so the salt is sodium chloride.",
    },
  ];
};

const unique = (arr) => Array.from(new Set((arr || []).filter(Boolean)));

const postJsonWithTimeout = async (url, payload) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUIZ_PROXY_TIMEOUT_MS);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timer);

  if (!response.ok) {
    const message = await response.text().catch(() => "Request failed");
    throw new Error(`Proxy error ${response.status}: ${message}`);
  }

  return response.json();
};

const estimateMetaTokens = (meta) => {
  const usage = meta?.telemetry?.usage;
  const inputTokens = Number(usage?.input_tokens || usage?.prompt_tokens || 0);
  const outputTokens = Number(usage?.output_tokens || usage?.completion_tokens || 0);
  const usageTotal = inputTokens + outputTokens;
  if (usageTotal > 0) return usageTotal;

  const estimatedPrompt = Number(meta?.telemetry?.estimated_prompt_tokens || 0);
  const estimatedResponse = Math.ceil(Number(meta?.telemetry?.response_chars || 0) / 4);
  return estimatedPrompt + estimatedResponse;
};

const QUALITY_BAND_THRESHOLD = {
  P3: 72,
  P4: 78,
  P5: 84,
  P6: 88,
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const buildQualityScorecard = (verificationPass, band, attemptsUsed, tokenSpend) => {
  const items = verificationPass?.items || [];
  const total = items.length || 10;
  const verified = items.filter((q) => q.verification?.status === "VERIFIED").length;
  const rejected = items.filter((q) => q.verification?.status === "REJECTED").length;
  const flagged = items.filter((q) => q.verification?.status === "FLAGGED").length;
  const genuineDepth = Number(verificationPass?.genuine_l2_l3_count || 0);

  const verifiedScore = (verified / total) * 100;
  const depthScore = clamp((genuineDepth / 7) * 100, 0, 100);
  const penalty = rejected * 6 + flagged * 3 + Math.max(0, attemptsUsed - 1) * 2;
  const score = clamp(Math.round(0.55 * verifiedScore + 0.35 * depthScore + 10 - penalty), 0, 100);

  const required = QUALITY_BAND_THRESHOLD[band] || 84;
  const verdict = verificationPass?.batch_verdict || verificationPass?.verification?.status || "FAIL";
  const publishAllowed = verdict === "PASS" && rejected === 0 && score >= required;

  const gateReason = publishAllowed
    ? "PASSED_HARD_GATE"
    : verdict !== "PASS"
      ? "BLOCKED: batch verdict is not PASS"
      : rejected > 0
        ? "BLOCKED: rejected questions present"
        : `BLOCKED: quality score ${score} < required ${required}`;

  return {
    band,
    score,
    required,
    publishAllowed,
    gateReason,
    attemptsUsed,
    tokenSpend,
    breakdown: {
      verified,
      flagged,
      rejected,
      genuineDepth,
      verdict,
    },
  };
};

const normalizeQuizItem = (item, idx, subjectLabel, topic) => {
  const safeId = Number(item?.id) || idx + 1;
  const safeLevel = ["L0", "L1", "L2", "L3"].includes(item?.level) ? item.level : "L1";
  const safeOptions = {
    A: String(item?.options?.A || "Option A"),
    B: String(item?.options?.B || "Option B"),
    C: String(item?.options?.C || "Option C"),
    D: String(item?.options?.D || "Option D"),
  };
  const safeAnswer = ["A", "B", "C", "D"].includes(item?.answer) ? item.answer : "A";

  return {
    id: safeId,
    level: safeLevel,
    question: String(item?.question || `${subjectLabel} ${topic} question ${safeId}`),
    options: safeOptions,
    answer: safeAnswer,
    concept_tags: Array.isArray(item?.concept_tags) ? item.concept_tags.slice(0, 6).map((x) => String(x)) : [topic],
    real_world_context: String(item?.real_world_context || "applied real-world context"),
    context_is_load_bearing: Boolean(item?.context_is_load_bearing),
    explanation: String(item?.explanation || "Reasoning and method selection are required to solve."),
  };
};

const sanitizeQuizBatch = (candidate, subjectLabel, topic) => {
  const rawItems = Array.isArray(candidate?.items) ? candidate.items : [];
  const clean = rawItems.slice(0, 10).map((item, idx) => normalizeQuizItem(item, idx, subjectLabel, topic));
  if (clean.length === 10) {
    return clean;
  }

  const fallback = buildQuizBatchLocal(subjectLabel, topic);
  const merged = [...clean, ...fallback.slice(clean.length)].slice(0, 10);
  return merged;
};

const buildQuizBatchLocal = (subjectLabel, topic) => {
  if (subjectLabel === "Chemistry" && topic === "Acids, Bases & Salts") {
    return chemistryAcidBaseBatch();
  }

  const contexts = SUBJECT_CONTEXTS[subjectLabel]?.[topic] || ["real-world school context"];
  const bridgeTopic = topicPairs[topic] || "adjacent concept";
  return LEVEL_PLAN.map((level, idx) => {
    const qNum = idx + 1;
    const contextA = contexts[idx % contexts.length];
    return {
      id: qNum,
      level,
      question: `${subjectLabel} - ${topic}: In ${contextA}, use values 12, 24 and 36 with units to determine the best next step for ${bridgeTopic}.`,
      options: {
        A: `Use ratio 12:24 directly and ignore units (Q${qNum})`,
        B: `Normalize units first, then apply ${bridgeTopic} relation (Q${qNum})`,
        C: `Pick the largest number only (Q${qNum})`,
        D: `Stop at intermediate 12/24 without final interpretation (Q${qNum})`,
      },
      answer: "B",
      concept_tags: [topic, bridgeTopic, contextA],
      real_world_context: contextA,
      context_is_load_bearing: level === "L2" || level === "L3",
      explanation: "Correct solving requires unit normalization and applying the relevant concept relation before final interpretation.",
    };
  });
};

const buildQuizBatchWithApi = async (subjectLabel, topic, band) => {
  if (!SERVER_ENABLED) {
    return {
      items: buildQuizBatchLocal(subjectLabel, topic),
      meta: { source: "local-fallback", model: null, reason: "No VITE_QUIZ_PROXY_URL configured.", band },
    };
  }

  try {
    const payload = await postJsonWithTimeout(`${QUIZ_PROXY_URL}/api/v1/f2/generate`, {
      subjectLabel,
      topic,
      band,
      count: 10,
    });

    return {
      items: sanitizeQuizBatch(payload, subjectLabel, topic),
      meta: {
        source: payload?.meta?.source || "api",
        model: payload?.meta?.model || null,
        max_tokens: payload?.meta?.max_tokens || null,
        temperature: payload?.meta?.temperature || null,
        cache_hit: Boolean(payload?.meta?.cache_hit),
        telemetry: payload?.meta?.telemetry || null,
        band,
      },
    };
  } catch (err) {
    return {
      items: buildQuizBatchLocal(subjectLabel, topic),
      meta: { source: "local-fallback", model: null, band, reason: String(err?.message || err) },
    };
  }
};

const inferLevelFromQuestion = (text) => {
  const q = String(text || "").toLowerCase();
  if (
    q.includes("irrelevant") ||
    q.includes("best restores") ||
    q.includes("only one correction") ||
    q.includes("best confirms") ||
    q.includes("also records")
  ) return "L3";
  if (q.includes("mol/dm3") || q.includes("equation") || q.includes("indicator") || q.includes("what volume") || q.includes("expected ph")) return "L2";
  if (q.startsWith("which statement")) return "L1";
  if (q.startsWith("what is the name")) return "L0";
  return "L1";
};

const inferLoadBearing = (item) => {
  const q = String(item.question || "").toLowerCase();
  const context = String(item.real_world_context || "").toLowerCase();
  const contextTerms = context
    .split(/[^a-z0-9]+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !["and", "for", "the", "with", "from", "into"].includes(w));
  const overlapCount = contextTerms.filter((w) => q.includes(w)).length;
  const hasContextSignal = overlapCount >= 2 || q.includes(context);
  const needsScenarioReasoning = /model|constraints|distractor|context variables|uses both contexts|irrelevant|neutraliz|ph|indicator|soil|rust|baking|tablet|stomach|greenhouse|equation|mol\/dm3|cm3|carbonate|hcl|na2co3|cleaning/.test(q);
  return hasContextSignal && needsScenarioReasoning;
};

const hasRealSubjectContent = (item, subjectLabel, topic) => {
  const text = [
    item.question,
    item.options?.A,
    item.options?.B,
    item.options?.C,
    item.options?.D,
    item.explanation,
  ].join(" ").toLowerCase();

  const hasNumbers = /\d/.test(text);
  const hasUnits = /(cm3|dm3|mol|g|kg|pa|n|%|ml|l|ph)/.test(text);
  const isAdvanced = item.level === "L2" || item.level === "L3";

  if (subjectLabel === "Chemistry" || topic.includes("Acids")) {
    const hasChemFacts = /(hcl|naoh|nahco3|equation|neutrali[sz]|acid|base|salt|co2|ph)/.test(text);
    if (isAdvanced) {
      return hasChemFacts && (hasNumbers || hasUnits);
    }
    return hasChemFacts;
  }

  if (subjectLabel === "Physics") {
    const hasPhysicsFacts = /(pressure|force|pascal|altitude|straw|cooker|dam|blood pressure)/.test(text);
    return isAdvanced ? (hasNumbers && hasPhysicsFacts) : hasPhysicsFacts;
  }

  if (subjectLabel === "Mathematics") {
    const hasMathFacts = /(ratio|percentage|fraction|decimal|distance|speed|time|area|volume)/.test(text);
    return isAdvanced ? (hasNumbers && hasMathFacts) : hasMathFacts;
  }

  return isAdvanced ? hasNumbers : text.length > 20;
};

const verifyQuizBatch = (items, subjectLabel = "", topic = "") => {
  const verified = items.map((item) => {
    const factualIssues = [];
    const distractorIssues = [];
    const inferredLevel = inferLevelFromQuestion(item.question);
    const levelMismatch = inferredLevel !== item.level;
    const correctedLevel = levelMismatch ? inferredLevel : item.level;
    const contextRelevant = correctedLevel === "L2" || correctedLevel === "L3";
    const claimedLoadBearing = contextRelevant ? Boolean(item.context_is_load_bearing) : null;
    const assessedLoadBearing = contextRelevant ? inferLoadBearing(item) : null;

    if (levelMismatch) {
      factualIssues.push(`LEVEL_MISMATCH: suggested ${inferredLevel}, received ${item.level}.`);
    }

    const hasOptions = item.options && item.options.A && item.options.B && item.options.C && item.options.D;
    if (!hasOptions) {
      factualIssues.push("OPTION_SCHEMA_ERROR: requires A, B, C and D options.");
    }

    if (!["A", "B", "C", "D"].includes(item.answer)) {
      factualIssues.push("ANSWER_SCHEMA_ERROR: answer key must be one of A, B, C or D.");
    }

    const optionValues = [item.options?.A, item.options?.B, item.options?.C, item.options?.D].filter(Boolean);
    if (new Set(optionValues).size < 4) {
      distractorIssues.push("WEAK_DISTRACTOR: options are not distinct.");
    }

    if (contextRelevant && !assessedLoadBearing) {
      factualIssues.push("COSMETIC_CONTEXT: context is not structurally required for solving.");
    }

    if (contextRelevant && claimedLoadBearing !== assessedLoadBearing) {
      factualIssues.push(`LOAD_BEARING_MISMATCH: claimed ${claimedLoadBearing}, assessed ${assessedLoadBearing}.`);
    }

    if (!hasRealSubjectContent(item, subjectLabel, topic)) {
      factualIssues.push("NO_SUBJECT_CONTENT: question lacks real, checkable subject matter facts.");
    }

    if ((correctedLevel === "L2" || correctedLevel === "L3")) {
      const conceptCount = new Set((item.concept_tags || []).filter(Boolean)).size;
      if (conceptCount < 2) {
        factualIssues.push("SINGLE_TOPIC_DISGUISED_AS_L2L3: question does not integrate at least two concepts.");
      }
    }

    if ((inferredLevel === "L2" || inferredLevel === "L3") && !String(item.options?.D || "").toLowerCase().includes("intermediate")) {
      distractorIssues.push("WEAK_DISTRACTOR: missing plausible intermediate-step trap.");
    }

    const allIssues = [...factualIssues, ...distractorIssues];
    const overallStatus = allIssues.length === 0 ? "VERIFIED" : (factualIssues.length > 0 ? "REJECTED" : "FLAGGED");

    return {
      ...item,
      verification: {
        status: overallStatus,
        factual_issues: factualIssues,
        claimed_level: item.level,
        assessed_level: correctedLevel,
        level_mismatch: levelMismatch,
        claimed_load_bearing: claimedLoadBearing,
        assessed_load_bearing: assessedLoadBearing,
        context_verdict: contextRelevant ? (assessedLoadBearing ? "LOAD_BEARING" : "COSMETIC") : "N/A",
        distractor_issues: distractorIssues,
        review_note:
          allIssues.length === 0
            ? "Question passed factual, level, context and distractor checks."
            : allIssues[0],
      },
    };
  });

  const optionSignatureCounts = {};
  for (const q of items) {
    const sig = [q.options?.A, q.options?.B, q.options?.C, q.options?.D]
      .map((x) => String(x || "").trim().toLowerCase())
      .join("||");
    optionSignatureCounts[sig] = (optionSignatureCounts[sig] || 0) + 1;
  }

  for (const q of verified) {
    const sig = [
      q.options?.A,
      q.options?.B,
      q.options?.C,
      q.options?.D,
    ]
      .map((x) => String(x || "").trim().toLowerCase())
      .join("||");

    if (optionSignatureCounts[sig] > 1) {
      q.verification.factual_issues.push("DUPLICATE_OPTIONS: option set repeats across multiple questions in this batch.");
      q.verification.status = "REJECTED";
      q.verification.review_note = "DUPLICATE_OPTIONS: option set repeats across multiple questions in this batch.";
    }
  }

  const genuineL2L3Count = verified.filter((q) => {
    const lvl = q.verification.assessed_level;
    return (lvl === "L2" || lvl === "L3") && q.verification.assessed_load_bearing;
  }).length;
  const quotaMet = genuineL2L3Count >= 7;
  const flaggedCount = verified.filter((q) => q.verification.status !== "VERIFIED").length;

  let batchVerdict = "PASS";
  if (!quotaMet) {
    batchVerdict = "FAIL";
  } else if (flaggedCount > 0) {
    batchVerdict = "PARTIAL";
  }

  const trace =
    batchVerdict === "PASS"
      ? "All checks passed and L2/L3 quota met."
      : batchVerdict === "PARTIAL"
        ? `${flaggedCount} of 10 questions need review - see flagged items below.`
        : `This batch did not meet the L2/L3 depth requirement (only ${genuineL2L3Count}/10 genuine).`;

  return {
    items: verified,
    batch_verdict: batchVerdict,
    genuine_l2_l3_count: genuineL2L3Count,
    quota_met: quotaMet,
    flaggedCount,
    verification: {
      status: batchVerdict,
      label: trace,
    },
  };
};

const mergeReviewStatus = (a, b) => {
  const rank = { VERIFIED: 0, FLAGGED: 1, REJECTED: 2 };
  return (rank[b] || 0) > (rank[a] || 0) ? b : a;
};

const mergeBatchVerdict = (a, b) => {
  const rank = { PASS: 0, PARTIAL: 1, FAIL: 2 };
  return (rank[b] || 0) > (rank[a] || 0) ? b : a;
};

const mergeHeuristicAndModelReview = (heuristicResult, modelReview) => {
  if (!modelReview || !Array.isArray(modelReview.reviews)) {
    return heuristicResult;
  }

  const reviewById = new Map(
    modelReview.reviews
      .filter((r) => r && Number.isFinite(Number(r.id)))
      .map((r) => [Number(r.id), r])
  );

  const mergedItems = heuristicResult.items.map((item) => {
    const ai = reviewById.get(Number(item.id));
    if (!ai) return item;

    const mergedStatus = mergeReviewStatus(item.verification?.status || "VERIFIED", ai.status || "VERIFIED");
    const factual = unique([...(item.verification?.factual_issues || []), ...(ai.factual_issues || [])]);
    const distractors = unique([...(item.verification?.distractor_issues || []), ...(ai.distractor_issues || [])]);

    return {
      ...item,
      verification: {
        ...item.verification,
        status: mergedStatus,
        factual_issues: factual,
        distractor_issues: distractors,
        assessed_level: ["L0", "L1", "L2", "L3"].includes(ai.assessed_level)
          ? ai.assessed_level
          : item.verification?.assessed_level,
        assessed_load_bearing:
          typeof ai.assessed_load_bearing === "boolean"
            ? ai.assessed_load_bearing
            : item.verification?.assessed_load_bearing,
        review_note: String(ai.review_note || item.verification?.review_note || ""),
      },
    };
  });

  const mergedFlaggedCount = mergedItems.filter((q) => q.verification?.status !== "VERIFIED").length;
  const mergedL2L3 = mergedItems.filter((q) => {
    const lvl = q.verification?.assessed_level;
    return (lvl === "L2" || lvl === "L3") && q.verification?.assessed_load_bearing;
  }).length;

  const quotaMet = mergedL2L3 >= 7;
  let verdict = heuristicResult.batch_verdict;
  verdict = mergeBatchVerdict(verdict, String(modelReview.batch_verdict || "PASS"));
  if (!quotaMet) verdict = "FAIL";
  else if (verdict !== "FAIL" && mergedFlaggedCount > 0) verdict = "PARTIAL";

  const trace = modelReview.trace
    ? `${modelReview.trace} (merged with deterministic verifier)`
    : heuristicResult.verification?.label;

  return {
    items: mergedItems,
    batch_verdict: verdict,
    genuine_l2_l3_count: mergedL2L3,
    quota_met: quotaMet,
    flaggedCount: mergedFlaggedCount,
    verification: {
      status: verdict,
      label: trace,
    },
  };
};

const verifyQuizBatchWithApi = async (items, subjectLabel, topic, band) => {
  const heuristic = verifyQuizBatch(items, subjectLabel, topic);
  if (!SERVER_ENABLED) {
    return {
      result: heuristic,
      meta: { source: "local-only", model: null, band, reason: "No VITE_QUIZ_PROXY_URL configured." },
    };
  }

  try {
    const payload = await postJsonWithTimeout(`${QUIZ_PROXY_URL}/api/v1/f3/verify`, {
      subjectLabel,
      topic,
      band,
      items,
    });

    const merged = mergeHeuristicAndModelReview(heuristic, payload?.review || null);
    return {
      result: merged,
      meta: {
        source: payload?.meta?.source ? `${payload.meta.source}+heuristic` : "api+heuristic",
        model: payload?.meta?.model || null,
        max_tokens: payload?.meta?.max_tokens || null,
        temperature: payload?.meta?.temperature || null,
        cache_hit: Boolean(payload?.meta?.cache_hit),
        telemetry: payload?.meta?.telemetry || null,
        band,
      },
    };
  } catch (err) {
    return {
      result: heuristic,
      meta: { source: "heuristic-fallback", model: null, band, reason: String(err?.message || err) },
    };
  }
};

function Section({ title, children }) {
  return (
    <section style={{ background: "#ffffff", border: "1px solid #dde3ec", borderRadius: 10, padding: 16 }}>
      <h3 style={{ margin: "0 0 10px", color: "#0e2439" }}>{title}</h3>
      {children}
    </section>
  );
}

export default function NushDsaPrep() {
  const [subjectId, setSubjectId] = useState("math");
  const [topic, setTopic] = useState(TOPICS.math[0]);
  const [learnerBand, setLearnerBand] = useState("P5");
  const [notes, setNotes] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [quizItems, setQuizItems] = useState([]);
  const [quizGeneratedAt, setQuizGeneratedAt] = useState(null);
  const [quizVerification, setQuizVerification] = useState(null);
  const [verdictStats, setVerdictStats] = useState({ PASS: 0, PARTIAL: 0, FAIL: 0 });
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [quizRunMeta, setQuizRunMeta] = useState(null);
  const [qualityScorecard, setQualityScorecard] = useState(null);
  const [publishStatus, setPublishStatus] = useState(null);
  const [adminMode, setAdminMode] = useState(false);

  const selectedSubject = useMemo(
    () => SUBJECTS.find((s) => s.id === subjectId) || SUBJECTS[0],
    [subjectId]
  );

  const currentTopics = TOPICS[subjectId] || [];

  const handleSubjectChange = (nextSubjectId) => {
    setSubjectId(nextSubjectId);
    const nextTopics = TOPICS[nextSubjectId] || [];
    setTopic(nextTopics[0] || "");
    setNotes(null);
    setGeneratedAt(null);
    setQuizItems([]);
    setQuizGeneratedAt(null);
    setQuizVerification(null);
    setVerdictStats({ PASS: 0, PARTIAL: 0, FAIL: 0 });
    setQuizError("");
    setQuizRunMeta(null);
    setQualityScorecard(null);
    setPublishStatus(null);
  };

  const generateNotes = () => {
    const key = `${subjectId}::${topic}`;
    const built = NOTES_LIBRARY[key] || fallbackNotes(selectedSubject.label, topic);

    setNotes({
      subject: selectedSubject.label,
      topic,
      keyConcepts: built.keyConcepts,
      formula: built.formula,
      workedExample: built.workedExample,
      misconceptions: built.misconceptions,
      verification: {
        status: "Clean",
        label: "AI-generated without correction",
      },
    });
    setGeneratedAt(new Date().toLocaleString());
  };

  const generateQuiz = async () => {
    setQuizLoading(true);
    setQuizError("");
    setPublishStatus(null);

    try {
      let attemptsUsed = 0;
      let tokenSpend = 0;
      let stopReason = "MAX_ATTEMPTS_REACHED";
      let finalBatch = null;
      let finalVerification = null;
      let attemptTrail = [];

      while (attemptsUsed < AUTO_REGEN_MAX_ATTEMPTS) {
        attemptsUsed += 1;
        const batchBuild = await buildQuizBatchWithApi(selectedSubject.label, topic, learnerBand);
        const verificationPass = await verifyQuizBatchWithApi(batchBuild.items, selectedSubject.label, topic, learnerBand);

        const spendThisAttempt = estimateMetaTokens(batchBuild.meta) + estimateMetaTokens(verificationPass.meta);
        tokenSpend += spendThisAttempt;

        attemptTrail.push({
          attempt: attemptsUsed,
          verdict: verificationPass.result.batch_verdict,
          spend: spendThisAttempt,
        });

        finalBatch = batchBuild;
        finalVerification = verificationPass;

        if (verificationPass.result.batch_verdict !== "FAIL") {
          stopReason = "VERDICT_ACCEPTED";
          break;
        }

        if (tokenSpend >= AUTO_REGEN_TOKEN_BUDGET) {
          stopReason = "TOKEN_BUDGET_CAP";
          break;
        }
      }

      if (!finalBatch || !finalVerification) {
        throw new Error("No quiz run produced a result.");
      }

      setQuizItems(finalVerification.result.items);
      setQuizVerification(finalVerification.result.verification);
      setQuizGeneratedAt(new Date().toLocaleString());
      setQuizRunMeta({
        f2: finalBatch.meta,
        f3: finalVerification.meta,
        retries: {
          attempts_used: attemptsUsed,
          max_attempts: AUTO_REGEN_MAX_ATTEMPTS,
          token_spend: tokenSpend,
          token_budget: AUTO_REGEN_TOKEN_BUDGET,
          stop_reason: stopReason,
          trail: attemptTrail,
        },
      });

      const scorecard = buildQualityScorecard(finalVerification.result, learnerBand, attemptsUsed, tokenSpend);
      setQualityScorecard(scorecard);

      setVerdictStats((prev) => {
        const verdict = finalVerification.result.batch_verdict;
        const next = {
          ...prev,
          [verdict]: (prev[verdict] || 0) + 1,
        };
        console.log("F3 batch_verdict counters", next);
        return next;
      });

      console.log("F3 batch_verdict result", {
        learner_band: learnerBand,
        verdict: finalVerification.result.batch_verdict,
        genuine_l2_l3_count: finalVerification.result.genuine_l2_l3_count,
        quota_met: finalVerification.result.quota_met,
        flaggedCount: finalVerification.result.flaggedCount,
        f2_meta: finalBatch.meta,
        f3_meta: finalVerification.meta,
        regen: {
          attempts_used: attemptsUsed,
          token_spend: tokenSpend,
          stop_reason: stopReason,
        },
        quality_scorecard: scorecard,
      });
    } catch (err) {
      setQuizError(String(err?.message || err));
    } finally {
      setQuizLoading(false);
    }
  };

  const publishQuizPack = () => {
    if (!qualityScorecard?.publishAllowed) {
      return;
    }

    setPublishStatus({
      publishedAt: new Date().toLocaleString(),
      band: learnerBand,
      quality_score: qualityScorecard.score,
    });
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial" }}>
      <header style={{ marginBottom: 18, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, color: "#0b2a44" }}>PSLE / NUSH-DSA Prep</h1>
          <p style={{ margin: "8px 0 0", color: "#3d556f" }}>
            AI-generated practice questions for PSLE and NUSH DSA selection.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdminMode((v) => !v)}
          style={{
            marginTop: 4,
            flexShrink: 0,
            border: "1px solid #94a3b8",
            background: adminMode ? "#1e3a5f" : "#f8fafc",
            color: adminMode ? "#e2e8f0" : "#475569",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {adminMode ? "Student view" : "Parent / Admin view"}
        </button>
      </header>

      <Section title="Topic Notes Generator">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label>
            <div style={{ marginBottom: 6, color: "#344b61" }}>Subject</div>
            <select value={subjectId} onChange={(e) => handleSubjectChange(e.target.value)} style={{ width: "100%", padding: 10 }}>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ marginBottom: 6, color: "#344b61" }}>Topic</div>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ width: "100%", padding: 10 }}>
              {currentTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ marginBottom: 6, color: "#344b61" }}>Learner Band</div>
            <select value={learnerBand} onChange={(e) => setLearnerBand(e.target.value)} style={{ width: "100%", padding: 10 }}>
              {LEARNER_BANDS.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={generateNotes}
          style={{
            marginTop: 12,
            border: "none",
            background: "#0f62fe",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Generate Notes
        </button>

        <button
          type="button"
          onClick={generateQuiz}
          disabled={quizLoading}
          style={{
            marginTop: 12,
            marginLeft: 10,
            border: "1px solid #0f62fe",
            background: quizLoading ? "#f3f4f6" : "#ffffff",
            color: quizLoading ? "#9ca3af" : "#0f62fe",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: quizLoading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {quizLoading ? "Generating Quiz..." : "Generate 10-Question Quiz"}
        </button>

        {quizError && (
          <p style={{ marginTop: 10, color: "#b91c1c" }}>
            Quiz generation error: {quizError}
          </p>
        )}
      </Section>

      {notes && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <Section title={`Output: ${notes.subject} - ${notes.topic}`}>
            <p style={{ margin: "0 0 10px", color: "#3a526a" }}>Generated: {generatedAt}</p>

            <h4 style={{ marginBottom: 8 }}>Key Concepts</h4>
            <ul style={{ marginTop: 0 }}>
              {notes.keyConcepts.map((item, idx) => (
                <li key={`${item}-${idx}`}>{item}</li>
              ))}
            </ul>

            <h4 style={{ marginBottom: 8 }}>Core Formula</h4>
            <p>{notes.formula}</p>

            <h4 style={{ marginBottom: 8 }}>Worked Example</h4>
            <p>
              <strong>Problem:</strong> {notes.workedExample.problem}
            </p>
            <ol>
              {notes.workedExample.steps.map((step, idx) => (
                <li key={`${step}-${idx}`}>{step}</li>
              ))}
            </ol>
            <p>
              <strong>Answer:</strong> {notes.workedExample.answer}
            </p>

            <h4 style={{ marginBottom: 8 }}>Common Misconceptions</h4>
            <ul style={{ marginTop: 0 }}>
              {notes.misconceptions.map((m, idx) => (
                <li key={`${m.wrong}-${idx}`}>
                  <strong>Wrong:</strong> {m.wrong}
                  <br />
                  <strong>Correct:</strong> {m.correct}
                </li>
              ))}
            </ul>
          </Section>

          {adminMode && (
            <Section title="Trust Label">
              <p style={{ margin: 0 }}>
                <strong>Status:</strong> {notes.verification.status}
              </p>
              <p style={{ margin: "8px 0 0" }}>
                <strong>Trace:</strong> {notes.verification.label}
              </p>
            </Section>
          )}
        </div>
      )}

      {quizItems.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <Section title={`Quiz Output: ${selectedSubject.label} - ${topic}`}>
            <p style={{ margin: "0 0 10px", color: "#3a526a" }}>Generated: {quizGeneratedAt}</p>
            <p style={{ margin: "0 0 12px", color: "#3a526a" }}>
              Exactly 10 MCQs. Level distribution: L2/L3 dominant.
            </p>
            <p style={{ margin: "0 0 12px", color: "#3a526a" }}>
              Learner band: {learnerBand}
            </p>
            {adminMode && quizRunMeta && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#f8fafc", border: "1px solid #dbe7f3" }}>
                <p style={{ margin: 0 }}>
                  <strong>F2 Source:</strong> {quizRunMeta.f2?.source} {quizRunMeta.f2?.model ? `(${quizRunMeta.f2.model})` : ""}
                </p>
                <p style={{ margin: "6px 0 0" }}>
                  <strong>F3 Source:</strong> {quizRunMeta.f3?.source} {quizRunMeta.f3?.model ? `(${quizRunMeta.f3.model})` : ""}
                </p>
                <p style={{ margin: "6px 0 0" }}>
                  <strong>Cache:</strong> F2 {quizRunMeta.f2?.cache_hit ? "HIT" : "MISS"} | F3 {quizRunMeta.f3?.cache_hit ? "HIT" : "MISS"}
                </p>
                {quizRunMeta?.retries && (
                  <p style={{ margin: "6px 0 0" }}>
                    <strong>Auto Regen:</strong> attempts {quizRunMeta.retries.attempts_used}/{quizRunMeta.retries.max_attempts}, spend {quizRunMeta.retries.token_spend}/{quizRunMeta.retries.token_budget} tok, stop {quizRunMeta.retries.stop_reason}
                  </p>
                )}
                {(quizRunMeta.f2?.telemetry || quizRunMeta.f3?.telemetry) && (
                  <p style={{ margin: "6px 0 0" }}>
                    <strong>Telemetry:</strong> F2 latency {quizRunMeta.f2?.telemetry?.latency_ms ?? "n/a"} ms, est prompt {quizRunMeta.f2?.telemetry?.estimated_prompt_tokens ?? "n/a"} tok | F3 latency {quizRunMeta.f3?.telemetry?.latency_ms ?? "n/a"} ms, est prompt {quizRunMeta.f3?.telemetry?.estimated_prompt_tokens ?? "n/a"} tok
                  </p>
                )}
                {quizRunMeta.f2?.reason && (
                  <p style={{ margin: "6px 0 0", color: "#9a3412" }}>
                    <strong>F2 Fallback Reason:</strong> {quizRunMeta.f2.reason}
                  </p>
                )}
                {quizRunMeta.f3?.reason && (
                  <p style={{ margin: "6px 0 0", color: "#9a3412" }}>
                    <strong>F3 Fallback Reason:</strong> {quizRunMeta.f3.reason}
                  </p>
                )}
              </div>
            )}
            {adminMode && quizVerification && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#f7fafc", border: "1px solid #d7e2ef" }}>
                <p style={{ margin: 0 }}>
                  <strong>Batch Verdict:</strong> {quizVerification.status}
                </p>
                <p style={{ margin: "6px 0 0" }}>
                  <strong>Trace:</strong> {quizVerification.label}
                </p>
              </div>
            )}

            {adminMode && quizVerification?.status === "PARTIAL" && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <strong>{quizVerification.label}</strong>
              </div>
            )}

            {quizVerification?.status === "FAIL" && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                <p style={{ margin: 0 }}>
                  {adminMode
                    ? "This batch did not meet the L2/L3 depth requirement. Click \"Try Again\" to regenerate, or review flagged questions below."
                    : "We couldn't prepare a quiz to our quality standard. Please try again."}
                </p>
                <button
                  type="button"
                  onClick={generateQuiz}
                  style={{ marginTop: 10, border: "none", background: "#dc2626", color: "#fff", padding: "8px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                >
                  Try Again
                </button>
              </div>
            )}

            {adminMode && (
              <p style={{ margin: "0 0 12px", color: "#3a526a" }}>
                Session verdict counts: PASS {verdictStats.PASS} | PARTIAL {verdictStats.PARTIAL} | FAIL {verdictStats.FAIL}
              </p>
            )}

            {adminMode && qualityScorecard && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#f8fafc", border: "1px solid #dbe7f3" }}>
                <p style={{ margin: 0 }}>
                  <strong>Band Quality Scorecard:</strong> {qualityScorecard.score}/100 (required {qualityScorecard.required} for {qualityScorecard.band})
                </p>
                <p style={{ margin: "6px 0 0" }}>
                  <strong>Breakdown:</strong> VERIFIED {qualityScorecard.breakdown.verified}, FLAGGED {qualityScorecard.breakdown.flagged}, REJECTED {qualityScorecard.breakdown.rejected}, genuine L2/L3 {qualityScorecard.breakdown.genuineDepth}, verdict {qualityScorecard.breakdown.verdict}
                </p>
                <p style={{ margin: "6px 0 0", color: qualityScorecard.publishAllowed ? "#166534" : "#9a3412" }}>
                  <strong>Hard Publish Gate:</strong> {qualityScorecard.gateReason}
                </p>
                <button
                  type="button"
                  onClick={publishQuizPack}
                  disabled={!qualityScorecard.publishAllowed}
                  style={{
                    marginTop: 10,
                    border: "none",
                    background: qualityScorecard.publishAllowed ? "#166534" : "#9ca3af",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: qualityScorecard.publishAllowed ? "pointer" : "not-allowed",
                    fontWeight: 600,
                  }}
                >
                  Publish Quiz Pack
                </button>
                {publishStatus && (
                  <p style={{ margin: "8px 0 0", color: "#166534" }}>
                    Published at {publishStatus.publishedAt} for {publishStatus.band} with score {publishStatus.quality_score}.
                  </p>
                )}
              </div>
            )}

            <div style={{ display: "grid", gap: 10 }}>
              {quizItems.map((q) => {
                const badge = levelBadge[q.level] || levelBadge.L0;
                const hasFlags = q.verification?.status === "FLAGGED" || q.verification?.status === "REJECTED";
                return (
                  <article key={q.id} style={{ border: "1px solid #dde3ec", borderRadius: 10, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <strong>Q{q.id}</strong>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.fg,
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {q.level}
                      </span>
                      <span
                        style={{
                          background: q.verification?.status === "VERIFIED" ? "#ecfeff" : "#fff7ed",
                          color: q.verification?.status === "VERIFIED" ? "#155e75" : "#9a3412",
                          borderRadius: 999,
                          padding: "2px 8px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {adminMode
                          ? (q.verification?.status || "VERIFIED")
                          : (q.verification?.status === "VERIFIED" ? "✓ Verified" : "Needs review")}
                      </span>
                    </div>

                    <p style={{ marginTop: 0 }}>{q.question}</p>
                    <ol type="A" style={{ margin: "8px 0", paddingLeft: 22 }}>
                      <li>{q.options.A}</li>
                      <li>{q.options.B}</li>
                      <li>{q.options.C}</li>
                      <li>{q.options.D}</li>
                    </ol>
                    <p style={{ margin: 0 }}>
                      <strong>Answer Key:</strong> {q.answer}
                    </p>
                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Concept Tags:</strong> {(q.concept_tags || []).join(", ")}
                    </p>
                    {adminMode && (
                      <p style={{ margin: "6px 0 0" }}>
                        <strong>Real-world Context:</strong> {q.real_world_context}
                      </p>
                    )}
                    {adminMode && (
                      <p style={{ margin: "6px 0 0" }}>
                        <strong>Load-bearing (claimed):</strong> {String(q.context_is_load_bearing)}
                      </p>
                    )}
                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                    {adminMode && hasFlags && (
                      <div style={{ marginTop: 8, padding: 8, borderRadius: 8, border: "1px solid #ffd8b1", background: "#fff7ed" }}>
                        <p style={{ margin: "0 0 6px", color: "#9a3412" }}>
                          <strong>Verifier Flags:</strong>
                        </p>
                        <ul style={{ margin: "0 0 6px", paddingLeft: 18 }}>
                          {[...(q.verification.factual_issues || []), ...(q.verification.distractor_issues || [])].map((issue, idx) => (
                            <li key={`${q.id}-issue-${idx}`}>{issue}</li>
                          ))}
                        </ul>
                        <p style={{ margin: 0 }}><strong>Review Note:</strong> {q.verification.review_note}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
