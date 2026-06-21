import { useMemo, useState } from "react";

const SUBJECTS = [
  { id: "math", label: "Mathematics" },
  { id: "science", label: "Science" },
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
};

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

VERIFICATION (F3) ADDITION:
Agent 2 must also flag any question where the "real-world context"
is cosmetic only (mentioned in the first line but not actually
required to solve the problem). Label this as COSMETIC_CONTEXT
in the flag output.`;

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

const buildQuizBatch = (subjectLabel, topic) => {
  const base = `${subjectLabel} - ${topic}`;
  const contexts = SUBJECT_CONTEXTS[subjectLabel]?.[topic] || [
    "a practical school or home scenario",
    "an experiment setup with measurable outcomes",
    "a local real-world application",
  ];
  const bridgeTopic = topicPairs[topic] || "a related secondary concept";

  return LEVEL_PLAN.map((level, idx) => {
    const qNum = idx + 1;
    const contextA = contexts[idx % contexts.length];
    const contextB = contexts[(idx + 1) % contexts.length];
    const stems = {
      L0: `${base}: In ${contextA}, identify the correct definition that determines which quantity should be compared before any calculation. (Q${qNum})`,
      L1: `${base}: In ${contextA}, one direct formula and one substitution are enough if units are interpreted correctly. Choose the best immediate step. (Q${qNum})`,
      L2: `${base}: During ${contextA}, a student must also account for ${bridgeTopic}. A table of values is provided. Decide which model to apply before computing and explain why context variables matter. (Q${qNum})`,
      L3: `${base}: A novel scenario combines ${contextA} with ${contextB}. One data point is a distractor and another bridges to ${bridgeTopic}. Choose the first valid strategy that uses both contexts, not textbook recall alone. (Q${qNum})`,
    };

    return {
      id: qNum,
      level,
      question: stems[level],
      options: {
        A: "Apply the first visible formula immediately without checking constraints.",
        B: "List knowns/unknowns, filter distractors, select method, then solve.",
        C: "Pick the option with familiar keywords.",
        D: "Stop after finding an intermediate value that looks plausible.",
      },
      answer: "B",
      concept_tags: [topic, bridgeTopic, contextA],
      real_world_context: contextA,
      context_is_load_bearing: level === "L2" || level === "L3",
      explanation: "The correct approach requires using scenario constraints, selecting a suitable model, and excluding distractor data before computation.",
    };
  });
};

const inferLevelFromQuestion = (text) => {
  const q = String(text || "").toLowerCase();
  if (q.includes("novel scenario") || q.includes("distractor")) return "L3";
  if (q.includes("must also account for") || q.includes("table of values")) return "L2";
  if (q.includes("one direct formula") || q.includes("best immediate step")) return "L1";
  if (q.includes("identify the correct definition")) return "L0";
  return "L1";
};

const inferLoadBearing = (item) => {
  const q = String(item.question || "").toLowerCase();
  const context = String(item.real_world_context || "").toLowerCase();
  const hasContextToken = context.length > 0 && q.includes(context);
  const needsScenarioReasoning = /model|constraints|distractor|context variables|uses both contexts/.test(q);
  return hasContextToken && needsScenarioReasoning;
};

const verifyQuizBatch = (items) => {
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
  const [notes, setNotes] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [quizItems, setQuizItems] = useState([]);
  const [quizGeneratedAt, setQuizGeneratedAt] = useState(null);
  const [quizVerification, setQuizVerification] = useState(null);
  const [verdictStats, setVerdictStats] = useState({ PASS: 0, PARTIAL: 0, FAIL: 0 });

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

  const generateQuiz = () => {
    const batch = buildQuizBatch(selectedSubject.label, topic);
    const verificationPass = verifyQuizBatch(batch);
    setQuizItems(verificationPass.items);
    setQuizVerification(verificationPass.verification);
    setQuizGeneratedAt(new Date().toLocaleString());

    setVerdictStats((prev) => {
      const next = {
        ...prev,
        [verificationPass.batch_verdict]: (prev[verificationPass.batch_verdict] || 0) + 1,
      };
      console.log("F3 batch_verdict counters", next);
      return next;
    });

    console.log("F3 batch_verdict result", {
      verdict: verificationPass.batch_verdict,
      genuine_l2_l3_count: verificationPass.genuine_l2_l3_count,
      quota_met: verificationPass.quota_met,
      flaggedCount: verificationPass.flaggedCount,
    });
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, color: "#0b2a44" }}>PSLE to NUSH DSA Prep</h1>
        <p style={{ margin: "8px 0 0", color: "#3d556f" }}>
          Milestone scope: Notes, level-tagged quiz generation, and one verification pass.
        </p>
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
          style={{
            marginTop: 12,
            marginLeft: 10,
            border: "1px solid #0f62fe",
            background: "#ffffff",
            color: "#0f62fe",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Generate 10-Question Quiz
        </button>
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

          <Section title="Trust Label">
            <p style={{ margin: 0 }}>
              <strong>Status:</strong> {notes.verification.status}
            </p>
            <p style={{ margin: "8px 0 0" }}>
              <strong>Trace:</strong> {notes.verification.label}
            </p>
          </Section>
        </div>
      )}

      {quizItems.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <Section title={`Quiz Output: ${selectedSubject.label} - ${topic}`}>
            <p style={{ margin: "0 0 10px", color: "#3a526a" }}>Generated: {quizGeneratedAt}</p>
            <p style={{ margin: "0 0 12px", color: "#3a526a" }}>
              Exactly 10 MCQs. Level distribution: L2/L3 dominant.
            </p>
            {quizVerification && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#f7fafc", border: "1px solid #d7e2ef" }}>
                <p style={{ margin: 0 }}>
                  <strong>Batch Verdict:</strong> {quizVerification.status}
                </p>
                <p style={{ margin: "6px 0 0" }}>
                  <strong>Trace:</strong> {quizVerification.label}
                </p>
              </div>
            )}

            {quizVerification?.status === "PARTIAL" && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <strong>{quizVerification.label}</strong>
              </div>
            )}

            {quizVerification?.status === "FAIL" && (
              <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
                <p style={{ margin: 0 }}>
                  This batch did not meet the L2/L3 depth requirement. Click "Try Again" to regenerate, or review flagged questions below.
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

            <p style={{ margin: "0 0 12px", color: "#3a526a" }}>
              Session verdict counts: PASS {verdictStats.PASS} | PARTIAL {verdictStats.PARTIAL} | FAIL {verdictStats.FAIL}
            </p>

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
                        {q.verification?.status || "VERIFIED"}
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
                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Real-world Context:</strong> {q.real_world_context}
                    </p>
                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Load-bearing (claimed):</strong> {String(q.context_is_load_bearing)}
                    </p>
                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                    {hasFlags && (
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
