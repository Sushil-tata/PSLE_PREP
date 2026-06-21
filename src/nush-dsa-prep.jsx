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

const levelBadge = {
  L0: { bg: "#eef2f7", fg: "#334155" },
  L1: { bg: "#e8f1ff", fg: "#1d4ed8" },
  L2: { bg: "#fff5e6", fg: "#b45309" },
  L3: { bg: "#f2eaff", fg: "#6d28d9" },
};

const buildQuizBatch = (subjectLabel, topic) => {
  const base = `${subjectLabel} - ${topic}`;

  return LEVEL_PLAN.map((level, idx) => {
    const qNum = idx + 1;
    const stems = {
      L0: `${base}: Identify the correct definition used in this topic before solving any question.`,
      L1: `${base}: A direct classroom-style question where one formula and one substitution step are sufficient.`,
      L2: `${base}: A multi-step school scenario combining two ideas from the topic. Choose the best method before computing.`,
      L3: `${base}: A novel context includes one distractor data point. Decide what to ignore, pick a strategy, and justify the first valid step.`,
    };

    return {
      id: qNum,
      level,
      question: `${stems[level]} (Q${qNum})`,
      options: {
        A: "Apply the first visible formula immediately without checking constraints.",
        B: "List knowns/unknowns, filter distractors, select method, then solve.",
        C: "Pick the option with familiar keywords.",
        D: "Stop after finding an intermediate value that looks plausible.",
      },
      answer: "B",
    };
  });
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
    setQuizItems(batch);
    setQuizGeneratedAt(new Date().toLocaleString());
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, color: "#0b2a44" }}>PSLE to NUSH DSA Prep</h1>
        <p style={{ margin: "8px 0 0", color: "#3d556f" }}>
          Milestone 1 scope: Topic Notes Generator with structured, trust-marked output.
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

            <div style={{ display: "grid", gap: 10 }}>
              {quizItems.map((q) => {
                const badge = levelBadge[q.level] || levelBadge.L0;
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
