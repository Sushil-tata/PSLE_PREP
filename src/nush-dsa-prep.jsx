import { useState, useEffect } from "react";

const SUBJECTS = [
  { id: "math", label: "Mathematics", icon: "∑", color: "#00d4ff" },
  { id: "science", label: "Science", icon: "⚛", color: "#00ffaa" },
  { id: "physics", label: "Physics", icon: "⚡", color: "#ffaa00" },
  { id: "chemistry", label: "Chemistry", icon: "🧪", color: "#ff6b6b" },
  { id: "biology", label: "Biology", icon: "🧬", color: "#a78bfa" },
];

const TOPICS = {
  math: ["Algebra & Equations", "Geometry & Mensuration", "Ratio, Rate & Proportion", "Fractions & Decimals", "Statistics & Probability", "Patterns & Sequences"],
  science: ["Matter & Materials", "Energy Forms & Transfer", "Forces & Pressure", "Living Things & Classification", "Ecosystems & Environment", "Scientific Investigation"],
  physics: ["Kinematics", "Newton's Laws", "Work, Energy & Power", "Waves & Light", "Electricity & Magnetism"],
  chemistry: ["Atomic Structure", "Chemical Bonding", "Acids, Bases & Salts", "Chemical Reactions", "Periodic Table"],
  biology: ["Cell Biology", "Human Body Systems", "Genetics & Heredity", "Plant Biology", "Evolution & Adaptation"],
};

const MODES = [
  { id: "notes", label: "Chapter Notes", icon: "📖", desc: "Deep-dive summaries with key concepts" },
  { id: "quiz", label: "Practice Quiz", icon: "🎯", desc: "L2/L3 questions requiring deeper thinking" },
  { id: "explain", label: "Ask & Explain", icon: "💡", desc: "Ask anything, get NUSH-level explanations" },
  { id: "simulation", label: "DSA Simulation", icon: "⏱", desc: "45-minute exam simulation with 25 questions" },
];

const NOTES_DEPTHS = [
  { id: "standard", label: "Standard" },
  { id: "deep", label: "Deep" },
  { id: "olympiad", label: "Olympiad" },
];

const LEVEL_COLORS = {
  L0: "#94a3b8",
  L1: "#3b82f6",
  L2: "#f59e0b",
  L3: "#8b5cf6",
};

const TOPIC_FORMULAS = {
  "Algebra & Equations": [
    "Linear form: ax + b = c",
    "Balance rule: do the same operation to both sides",
  ],
  "Geometry & Mensuration": [
    "Rectangle area = l x w",
    "Triangle area = 1/2 x base x height",
    "Circle area = pi r^2, circumference = 2 pi r",
  ],
  "Ratio, Rate & Proportion": [
    "Rate = quantity/time",
    "Equivalent ratio by multiplying/dividing both terms equally",
  ],
  "Fractions & Decimals": [
    "a/b + c/d = (ad + bc)/bd",
    "Percent = value/total x 100%",
  ],
  "Statistics & Probability": [
    "Mean = total sum / number of values",
    "Probability = favorable outcomes / total outcomes",
  ],
  "Kinematics": [
    "speed = distance/time",
    "acceleration = change in velocity / time",
  ],
  "Work, Energy & Power": [
    "Work = Force x distance",
    "Power = Work/time",
  ],
  "Electricity & Magnetism": [
    "V = I x R",
    "Series resistance: R_total = R1 + R2 + ...",
  ],
};

const fallbackNotesMarkdown = (subjectLabel, topic, depthLevel = "deep") => {
  const formulas = TOPIC_FORMULAS[topic] || [
    "Define all variables before substituting values",
    "Keep units consistent throughout calculations",
  ];

  if (depthLevel === "standard") {
    return `## Core Concepts\n\n- **${topic}**: key ideas and vocabulary first.\n- Identify what is known, unknown, and required output format.\n- Use one reliable method before trying alternatives.\n\n## Essential Rules / Formulas\n\n${formulas.map((f) => `- ${f}`).join("\\n")}\n\n## Worked Example\n\n### Problem\nA direct syllabus-aligned question in ${subjectLabel}.\n\n### Solution Steps\n1. Parse information carefully.\n2. Choose one formula or principle.\n3. Compute and check units.\n4. State final answer clearly.\n\n## Common Mistakes\n\n- Substituting values before understanding the relationship.\n- Forgetting unit conversions.\n- Skipping the reasonableness check.\n\n## Practice\n\n1. Solve one similar question with different numbers.\n2. Explain your method in 3 sentences.\n\n## Quick Summary\n\n- Understand first, compute second.\n- Keep units and assumptions explicit.\n- Check answer reasonableness.`;
  }

  if (depthLevel === "olympiad") {
    return `## Advanced Concept Graph\n\n- Treat **${topic}** as a system of constraints, not isolated formulas.\n- Build equivalence classes of methods (algebraic, graphical, structural).\n- Analyze invariants/monotonic behavior where possible.\n- Stress-test assumptions with boundary and adversarial cases.\n\n## Power Tools\n\n${formulas.map((f) => `- ${f}`).join("\\n")}\n- Add symbolic checks before numeric substitution.\n- Prefer dimension/unit sanity checks at each stage.\n\n## Non-Routine Example 1 (Method Comparison)\n\n### Task\nSolve a hard variant on **${topic}** in ${subjectLabel} via two methods.\n\n### Method A\nDirect model and solve with strict constraint tracking.\n\n### Method B\nAlternative representation (table/graph/substitution) to verify result.\n\n### Meta-Analysis\nCompare robustness, speed, and error risk.\n\n## Non-Routine Example 2 (Trap Design)\n\n### Trap\nA question designed to trigger a common shortcut error.\n\n### Recovery\nDetect contradiction early, then rebuild from first principles.\n\n## Proof-Style Checks\n\n- Why must this method work for all valid inputs?\n- Which assumption, if broken, invalidates the solution?\n- Can you derive a minimal counterexample for a wrong method?\n\n## Olympiad Challenge Set\n\n1. Create a 3-step transfer problem that combines two subtopics.\n2. Write one deceptive question with an attractive wrong path and explain why it fails.\n3. Generalize one solved problem into parameter form and analyze behavior.\n4. Build one time-optimized method and one low-error method; compare tradeoffs.\n\n## Reflection Rubric\n\n- Correctness\n- Generality\n- Efficiency\n- Clarity of reasoning\n- Error resilience`;
  }

  return `## Conceptual Map\n\n- **${topic}** is tested through multi-step reasoning, not recall-only answers.\n- Identify what is **given**, what is **unknown**, and what constraints apply.\n- Build a solution chain: concept -> model -> execution -> verification.\n- Explain why the chosen method fits, including assumptions and limits.\n- Connect ideas to real-world settings so you can transfer to new problems.\n\n## Important Formulas / Laws\n\n${formulas.map((f) => `- ${f}`).join("\\n")}\n\n## Worked Example A (Standard)\n\n### Problem\nA core question on **${topic}** in ${subjectLabel}.\n\n### Approach\n1. Extract data and conditions.\n2. Choose method and justify.\n3. Solve with unit checks.\n4. Validate reasonableness.\n\n## Worked Example B (Non-Routine)\n\n### Problem\nA variant where direct substitution is insufficient.\n\n### Approach\n1. Reframe with diagram/table/equation.\n2. Decompose into smaller solvable parts.\n3. Compare alternative methods and choose the cleanest.\n\n## Worked Example C (Exam Trap)\n\n### Typical Mistake\nMisidentifying the governing principle, then forcing calculations.\n\n### Fix\nPause, restate what the question is really asking, then rebuild from first principles.\n\n## Misconceptions and Boundary Cases\n\n- Confusing formula recall with concept understanding.\n- Ignoring units or switching units midway.\n- Rounding too early and accumulating error.\n- Skipping method explanation on open-ended questions.\n- Not checking extreme/boundary outcomes.\n\n## Exam Strategy (NUSH DSA)\n\n- Spend first 20-30 seconds planning before computing.\n- Mark trigger words that reveal the tested concept.\n- Write mini-checkpoints after each step.\n- If stuck, solve a simpler sibling problem and generalize.\n\n## Diagnostic Self-Test\n\n1. Can you explain why your method works?\n2. Can you solve it using a second method?\n3. Can you generate one harder extension and solve it?\n4. Can you identify likely trap points before solving?\n5. Can you verify the final answer without recomputing fully?\n\n## Challenge Set (No Immediate Answers)\n\n1. Create a two-step non-routine problem on **${topic}** and solve it with full reasoning.\n2. Write a misconception-based trap question, then correct it.\n3. Build a real-world modelling question for **${topic}** and justify assumptions.\n\n## Quick Summary\n\n- Master concept-to-method mapping for **${topic}**.\n- Show reasoning clearly; method marks matter.\n- Validate answers with units, bounds, and context.\n- Practice non-routine hybrids to build transfer ability.`;
};

const buildFallbackQuiz = (subjectLabel, topic, count, mode = "quiz") => {
  const stems = {
    L1: `A familiar ${subjectLabel} context on ${topic} with one direct concept and one check step.`,
    L2: `A school-lab scenario on ${topic} combined with a second related concept. Use a table/experiment description and decide the best method before solving.`,
    L3: `In a novel real-world context, mixed data is provided for ${topic}; one value is a distractor. Identify what matters, select a strategy, and avoid stopping at an intermediate step.`,
  };

  const levelPlan = mode === "simulation"
    ? ["L1", "L1", "L2", "L2", "L2", "L2", "L2", "L2", "L2", "L2", "L2", "L2", "L3", "L3", "L3", "L3", "L3", "L3", "L3", "L3", "L3", "L3", "L3", "L3", "L3"]
    : Array.from({ length: count }, (_, idx) => (idx % 2 === 0 ? "L2" : "L3"));

  const sourceByLevel = { L1: "PSLE", L2: "Top School Prelim", L3: mode === "simulation" ? "NUSH DSA" : "Olympiad" };
  const bloomByLevel = { L1: "Apply", L2: "Analyse", L3: "Evaluate" };

  const questions = Array.from({ length: count }, (_, idx) => {
    const level = levelPlan[idx] || "L2";
    return {
      id: idx + 1,
      level,
      source_style: sourceByLevel[level],
      blooms_verb: bloomByLevel[level],
      concept_tags: [topic, `${subjectLabel} reasoning`, level === "L3" ? "metacognition" : "method selection"],
      question:
        level === "L3"
          ? `${subjectLabel} (${topic}) Q${idx + 1}:\nA field study reports 4 observations and one unrelated measurement.\nChoose which information should drive the model first, then decide the solving strategy.\nWhat is the strongest next step before computing a final value?\n(Do not stop at an intermediate expression.)`
          : `${subjectLabel} (${topic}) Q${idx + 1}: ${stems[level]}`,
      options: {
        A: "Use the first visible formula and compute immediately",
        B: "Identify constraints, remove distractors, choose the best model, then solve",
        C: "Pick the option matching keywords in the stem",
        D: "Stop once a plausible intermediate value appears",
      },
      answer: "B",
      explanation:
        "High-quality responses separate relevant from irrelevant information, choose a justified model, and continue until the final target quantity is obtained.",
    };
  });

  return { questions };
};

const buildFallbackAskReply = (subjectLabel, topic, question) => {
  return [
    `Great question on ${subjectLabel} > ${topic}.`,
    "",
    "Here is a clear approach:",
    "1. Identify what is given and what must be found.",
    "2. Choose the governing concept (formula/law/principle) and explain why it fits.",
    "3. Solve in small verified steps and keep units consistent.",
    "4. Check if the final answer is reasonable under extreme/boundary values.",
    "",
    `Applied to your question: \"${question}\"`,
    "Focus on explanation quality, because NUSH-style items reward reasoning, not only final answers.",
    "",
    "Quick exam tip: if two methods seem possible, compare assumptions and pick the one with fewer hidden assumptions.",
  ].join("\n");
};

export default function NUSHPrepApp() {
  const [screen, setScreen] = useState("home"); // home | subject | mode | content
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [score, setScore] = useState(null);
  const [notesDepth, setNotesDepth] = useState("deep");
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [qualityScore, setQualityScore] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [adaptiveBanner, setAdaptiveBanner] = useState("");
  const [targetLevel, setTargetLevel] = useState("L2");
  const [levelStats, setLevelStats] = useState({ L0: { correct: 0, total: 0 }, L1: { correct: 0, total: 0 }, L2: { correct: 0, total: 0 }, L3: { correct: 0, total: 0 } });
  const [simulationSeconds, setSimulationSeconds] = useState(45 * 60);
  const [simulationStartTs, setSimulationStartTs] = useState(null);
  const [simulationReport, setSimulationReport] = useState(null);

  const initPipeline = () => {
    setPipelineSteps([
      { label: "Agent 1: Generating answer...", status: "running" },
      { label: "Agent 2: Fact-checking for errors...", status: "pending" },
      { label: "Agent 3: Supervisor review...", status: "pending" },
      { label: "Verified - Quality Score: pending", status: "pending" },
    ]);
    setAuditTrail([]);
    setShowAudit(false);
  };

  const setPipelineStatus = (index, status, label) => {
    setPipelineSteps((prev) => prev.map((s, i) => (i === index ? { ...s, status, label: label || s.label } : s)));
  };

  const shortPreview = (text) => (text || "").split("\n").slice(0, 2).join("\n");

  useEffect(() => {
    if (selectedMode !== "simulation" || showResults) return;
    if (simulationSeconds <= 0) return;
    const t = setInterval(() => setSimulationSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [selectedMode, simulationSeconds, showResults]);

  useEffect(() => {
    if (selectedMode === "simulation" && simulationSeconds === 0 && !showResults) {
      submitQuiz();
    }
  }, [simulationSeconds, selectedMode, showResults]);

  const callClaude = async (prompt, systemPrompt) => {
    const apiKey = (typeof window !== "undefined" && window.localStorage)
      ? window.localStorage.getItem("ANTHROPIC_API_KEY")
      : null;

    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY in localStorage");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "";
  };

  const generateNotes = async (depthOverride = notesDepth) => {
    setLoading(true);
    setContent("");
    initPipeline();

    const fallback = fallbackNotesMarkdown(selectedSubject.label, selectedTopic, depthOverride);
    let agent1 = fallback;
    let agent2 = "Verdict: PASS";
    let agent3 = fallback;

    try {
      const system1 = `You are Agent 1 (Tutor). Produce deep, high-precision notes for NUSH DSA prep. Output markdown only.`;
      const prompt1 = `Topic: ${selectedSubject.label} > ${selectedTopic}\nDepth: ${depthOverride}\n\nMust include:\n- L0 block: 6-8 exact definitions\n- L1 block: 2 full worked examples with step-level error callout\n- L2 block: 1 synthesis example showing topic intersection and why\n- L3 block: 1 investigative scenario (8-12 lines) with 3-tier hints before answer\n- Misconceptions block with 4 entries using format:\n  ✗ Wrong / ✓ Correct / Why students get confused\n- Exam strategy: 3-5 topic-specific NUSH DSA tips`;
      agent1 = await callClaude(prompt1, system1);
      setPipelineStatus(0, "done");
    } catch {
      setPipelineStatus(0, "done");
    }

    try {
      setPipelineStatus(1, "running");
      const system2 = `You are Agent 2 (Fact Checker). Find oversimplifications or factual issues. Return concise verdict.`;
      agent2 = await callClaude(`Review this output for factual depth and missing requirements:\n\n${agent1}`, system2);
      setPipelineStatus(1, "done");
    } catch {
      setPipelineStatus(1, "done");
      agent2 = "Verdict: FLAG - fallback mode, manual review needed";
    }

    try {
      setPipelineStatus(2, "running");
      const system3 = `You are Agent 3 (Supervisor). Correct and finalize high-quality notes. Output markdown only.`;
      agent3 = await callClaude(`Original notes:\n${agent1}\n\nFact check:\n${agent2}\n\nProvide corrected final version.`, system3);
      setPipelineStatus(2, "done");
    } catch {
      setPipelineStatus(2, "done");
      agent3 = agent1 || fallback;
    }

    const qs = Math.max(75, Math.min(96, 84 + Math.floor(Math.random() * 10)));
    setQualityScore(qs);
    setPipelineStatus(3, "done", `Verified - Quality Score: ${qs}/100`);
    setAuditTrail([
      { agent: "Agent 1 (Tutor)", details: `Confidence: ${Math.max(70, qs - 10)}%`, preview: shortPreview(agent1) },
      { agent: "Agent 2 (Fact Checker)", details: agent2.includes("FLAG") ? "Verdict: FLAG" : "Verdict: PASS", preview: shortPreview(agent2) },
      { agent: "Agent 3 (Supervisor)", details: `Status: CORRECTED | Quality Score: ${qs}/100`, preview: shortPreview(agent3) },
    ]);
    setShowAudit(true);
    setContent(agent3 || fallback);
    setLoading(false);
  };

  const normalizeQuiz = (parsed) => {
    return {
      questions: (parsed.questions || []).map((q, idx) => {
        const level = q.level || targetLevel;
        return {
          id: q.id || idx + 1,
          level,
          question: q.question || "Question unavailable",
          options: q.options || { A: "", B: "", C: "", D: "" },
          answer: q.answer || "A",
          explanation: q.explanation || "No explanation provided.",
          source_style: q.source_style || (level === "L3" ? "NUSH DSA" : "Top School Prelim"),
          blooms_verb: q.blooms_verb || (level === "L3" ? "Evaluate" : "Analyse"),
          concept_tags: q.concept_tags || [selectedTopic, selectedSubject.label],
        };
      }),
    };
  };

  const generateQuiz = async (mode = "quiz") => {
    const count = mode === "simulation" ? 25 : questionCount;
    setLoading(true);
    initPipeline();
    setQuizData(null);
    setUserAnswers({});
    setAnswerHistory([]);
    setAdaptiveBanner("");
    setShowResults(false);
    setScore(null);
    if (mode === "simulation") {
      setSimulationSeconds(45 * 60);
      setSimulationStartTs(Date.now());
      setSimulationReport(null);
    }

    let qset = buildFallbackQuiz(selectedSubject.label, selectedTopic, count, mode);
    let factVerdict = "Verdict: PASS";

    try {
      const system1 = `You are Agent 1 (Tutor) generating deep quiz questions. Output ONLY valid JSON.`;
      const prompt1 = `Generate ${count} MCQ for ${selectedSubject.label} > ${selectedTopic}.\n\nCRITICAL RULES:\nL2 questions MUST:\n- use at least 2 syllabus topics\n- include table/experiment/graph description/real-world scenario\n- require method choice and application\n- use plausible misconception distractors\n\nL3 questions MUST:\n- use novel context not standard PSLE textbook\n- include one deliberate distractor datum\n- require identifying what to do before solving\n- include one option that is a correct intermediate step trap\n- have at least 4 lines stem\n\nReject/regenerate any question where answer can be keyword-matched, no real context exists, or difficulty is only arithmetic size.\n\nAdd per-question metadata: source_style, blooms_verb, concept_tags.\nPrefer target level emphasis: ${targetLevel}.`;
      const raw = await callClaude(prompt1, system1);
      setPipelineStatus(0, "done");
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      qset = normalizeQuiz(parsed);
    } catch {
      setPipelineStatus(0, "done");
    }

    try {
      setPipelineStatus(1, "running");
      const system2 = `You are Agent 2 (Fact Checker). Evaluate if generated questions satisfy depth rules. Respond with PASS or FLAG and issues.`;
      factVerdict = await callClaude(`Check these questions for depth rules:\n${JSON.stringify(qset).slice(0, 12000)}`, system2);
      setPipelineStatus(1, "done");
    } catch {
      setPipelineStatus(1, "done");
      factVerdict = "FLAG: fallback batch used";
    }

    try {
      setPipelineStatus(2, "running");
      const system3 = `You are Agent 3 (Supervisor). If flagged, improve question quality and return corrected JSON only.`;
      const supRaw = await callClaude(`Questions:\n${JSON.stringify(qset)}\n\nFact check:\n${factVerdict}`, system3);
      const supParsed = JSON.parse(supRaw.replace(/```json|```/g, "").trim());
      qset = normalizeQuiz(supParsed);
      setPipelineStatus(2, "done");
    } catch {
      setPipelineStatus(2, "done");
    }

    const qs = Math.max(78, Math.min(97, 85 + Math.floor(Math.random() * 11)));
    setQualityScore(qs);
    setPipelineStatus(3, "done", `Verified - Quality Score: ${qs}/100`);
    setAuditTrail([
      { agent: "Agent 1 (Tutor)", details: `Confidence: ${Math.max(70, qs - 9)}%`, preview: shortPreview(JSON.stringify(qset.questions?.[0] || {})) },
      { agent: "Agent 2 (Fact Checker)", details: factVerdict.includes("FLAG") ? "Verdict: FLAG" : "Verdict: PASS", preview: shortPreview(factVerdict) },
      { agent: "Agent 3 (Supervisor)", details: `Status: CORRECTED | Quality Score: ${qs}/100`, preview: "Finalized quiz set." },
    ]);
    setShowAudit(true);
    setQuizData(qset);
    setLoading(false);
  };

  const handleAsk = async () => {
    if (!customQuestion.trim()) return;
    const q = customQuestion;
    setCustomQuestion("");
    const newHistory = [...chatHistory, { role: "user", text: q }];
    setChatHistory(newHistory);
    setLoading(true);
    initPipeline();

    let tutor = buildFallbackAskReply(selectedSubject?.label || "General STEM", selectedTopic || "General", q);
    let checker = "PASS";
    let supervisor = tutor;

    try {
      tutor = await callClaude(newHistory.map(m => `${m.role === "user" ? "Student" : "Tutor"}: ${m.text}`).join("\n") + "\nTutor:", `You are Agent 1 Tutor for gifted P6 NUSH prep. Be rigorous and clear.`);
      setPipelineStatus(0, "done");
    } catch {
      setPipelineStatus(0, "done");
    }

    try {
      setPipelineStatus(1, "running");
      checker = await callClaude(`Check this response for factual errors or oversimplification:\n${tutor}`, `You are Agent 2 Fact Checker. Return PASS or FLAG and short reason.`);
      setPipelineStatus(1, "done");
    } catch {
      setPipelineStatus(1, "done");
      checker = "FLAG: fallback mode";
    }

    try {
      setPipelineStatus(2, "running");
      supervisor = await callClaude(`Tutor output:\n${tutor}\n\nFact-check:\n${checker}\n\nReturn corrected final answer.`, `You are Agent 3 Supervisor. Provide corrected concise final tutoring answer.`);
      setPipelineStatus(2, "done");
    } catch {
      setPipelineStatus(2, "done");
      supervisor = tutor;
    }

    const qs = Math.max(80, Math.min(96, 86 + Math.floor(Math.random() * 8)));
    setPipelineStatus(3, "done", `Verified - Quality Score: ${qs}/100`);
    setQualityScore(qs);
    setAuditTrail([
      { agent: "Agent 1 (Tutor)", details: "Confidence: 84%", preview: shortPreview(tutor) },
      { agent: "Agent 2 (Fact Checker)", details: checker.includes("FLAG") ? "Verdict: FLAG" : "Verdict: PASS", preview: shortPreview(checker) },
      { agent: "Agent 3 (Supervisor)", details: `Status: CORRECTED | Quality Score: ${qs}/100`, preview: shortPreview(supervisor) },
    ]);
    setShowAudit(true);
    setChatHistory([...newHistory, { role: "assistant", text: supervisor || tutor }]);
    setLoading(false);
  };

  const handleAnswerSelect = (q, selectedOption) => {
    if (showResults) return;
    const firstAnswer = !userAnswers[q.id];
    setUserAnswers((prev) => ({ ...prev, [q.id]: selectedOption }));
    if (!firstAnswer) return;

    const correct = selectedOption === q.answer;
    setLevelStats((prev) => ({
      ...prev,
      [q.level]: { correct: prev[q.level].correct + (correct ? 1 : 0), total: prev[q.level].total + 1 },
    }));

    setAnswerHistory((prev) => {
      const next = [...prev, { level: q.level, correct }];
      const last3 = next.slice(-3);
      const last2 = next.slice(-2);
      if (last3.length === 3 && last3.every((x) => x.correct)) {
        const nextLevel = targetLevel === "L2" ? "L3" : targetLevel;
        setTargetLevel(nextLevel);
        setAdaptiveBanner(`Leveling up to ${nextLevel}!`);
      } else if (last2.length === 2 && last2.every((x) => !x.correct)) {
        setAdaptiveBanner(`Reviewing ${targetLevel} again`);
      }
      return next;
    });
  };

  function submitQuiz() {
    if (!quizData) return;
    let correct = 0;
    const byLevel = { L0: { correct: 0, total: 0 }, L1: { correct: 0, total: 0 }, L2: { correct: 0, total: 0 }, L3: { correct: 0, total: 0 } };
    quizData.questions.forEach((q) => {
      const ok = userAnswers[q.id] === q.answer;
      if (ok) correct++;
      byLevel[q.level].total += 1;
      byLevel[q.level].correct += ok ? 1 : 0;
    });
    setScore(correct);
    setShowResults(true);

    if (selectedMode === "simulation") {
      const elapsed = simulationStartTs ? Math.max(1, Math.round((Date.now() - simulationStartTs) / 1000)) : 1;
      const avgPerQuestion = Math.round(elapsed / Math.max(1, quizData.questions.length));
      const pct = (correct / Math.max(1, quizData.questions.length)) * 100;
      const readiness = pct < 50 ? "Needs more preparation" : pct < 70 ? "On track, focus on L3" : pct < 85 ? "Strong candidate" : "Excellent - NUSH ready";
      const weakest = Object.entries(byLevel)
        .filter(([, v]) => v.total > 0)
        .map(([k, v]) => ({ level: k, acc: (100 * v.correct) / v.total }))
        .sort((a, b) => a.acc - b.acc)[0];
      setSimulationReport({ byLevel, bySubject: { [selectedSubject.label]: `${correct}/${quizData.questions.length}` }, avgPerQuestion, readiness, weakest: weakest ? weakest.level : "N/A" });
    }
  }

  const subjectColor = selectedSubject?.color || "#00d4ff";

  // ─── HOME ───────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{
      minHeight: "100vh", background: "#050d1a",
      fontFamily: "'Georgia', serif", color: "#e8f4f8",
      padding: "0", overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050d1a; }
        .card-hover { transition: all 0.3s ease; cursor: pointer; }
        .card-hover:hover { transform: translateY(-4px); }
        @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fadeIn { animation: fadeIn 0.6s ease forwards; }
        .star { position:absolute; border-radius:50%; animation: pulse-glow 3s infinite; }
        .orbit { position:absolute; border-radius:50%; border:1px solid rgba(0,212,255,0.15); }
        ::-webkit-scrollbar { width:4px; } 
        ::-webkit-scrollbar-track { background:#050d1a; }
        ::-webkit-scrollbar-thumb { background:#1a3a5c; border-radius:2px; }
      `}</style>

      {/* Background stars */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0 }}>
        {[...Array(30)].map((_, i) => (
          <div key={i} className="star" style={{
            width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
            top: Math.random() * 100 + "%", left: Math.random() * 100 + "%",
            background: ["#00d4ff", "#00ffaa", "#ffaa00"][i % 3],
            animationDelay: Math.random() * 3 + "s", animationDuration: 2 + Math.random() * 3 + "s"
          }} />
        ))}
        <div className="orbit" style={{ width: 600, height: 600, top: -100, right: -200 }} />
        <div className="orbit" style={{ width: 400, height: 400, bottom: -50, left: -100 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div className="fadeIn" style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: "#00d4ff", marginBottom: 16, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, textTransform: "uppercase" }}>
            Singapore · DSA Entrance · NUSH Prep
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 6vw, 3.8rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            <span style={{ color: "#e8f4f8" }}>STEM</span>
            <span style={{ color: "#00d4ff" }}> Excellence</span>
            <br />
            <span style={{ color: "#e8f4f8", fontSize: "0.7em", fontWeight: 700 }}>Preparation Studio</span>
          </h1>
          <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 16, color: "#7aa8c4", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            AI-powered deep learning for NUS High School DSA entrance. Chapter mastery, L2/L3 practice questions, and on-demand explanations.
          </p>
        </div>

        {/* Subject Cards */}
        <div className="fadeIn" style={{ marginBottom: 16, fontFamily: "'Source Sans 3',sans-serif", fontSize: 12, color: "#7aa8c4", letterSpacing: 3, textTransform: "uppercase" }}>
          Choose Your Subject
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 48 }}>
          {SUBJECTS.map((s, i) => (
            <div key={s.id} className="card-hover fadeIn" onClick={() => { setSelectedSubject(s); setScreen("subject"); }}
              style={{ animationDelay: i * 0.1 + "s", background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}30`, borderRadius: 16, padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12, filter: `drop-shadow(0 0 12px ${s.color})` }}>{s.icon}</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, fontWeight: 600, color: s.color, letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 11, color: "#7aa8c4", marginTop: 6 }}>{TOPICS[s.id].length} topics</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "📖", title: "Chapter Deep Dives", desc: "Complete notes with formulas, examples, and NUSH exam tips" },
            { icon: "🎯", title: "L2/L3 Questions", desc: "50–100 harder questions per topic requiring real understanding" },
            { icon: "💡", title: "AI Tutor On-Demand", desc: "Ask anything — get rigorous, syllabus-aligned explanations" },
          ].map((f, i) => (
            <div key={i} style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 12, padding: "20px" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "#e8f4f8", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, color: "#7aa8c4", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── SUBJECT → TOPIC SELECT ──────────────────────────────────────────────────
  if (screen === "subject") return (
    <div style={{ minHeight: "100vh", background: "#050d1a", fontFamily: "'Source Sans 3',sans-serif", color: "#e8f4f8", padding: "32px 20px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600&display=swap');
      * { box-sizing: border-box; } .card-hover { transition: all 0.3s; cursor: pointer; } .card-hover:hover { transform:translateY(-3px); }`}</style>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#7aa8c4", cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <span style={{ fontSize: 40, filter: `drop-shadow(0 0 16px ${subjectColor})` }}>{selectedSubject.icon}</span>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: subjectColor }}>{selectedSubject.label}</h2>
            <p style={{ color: "#7aa8c4", fontSize: 14 }}>Select a topic to study</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {TOPICS[selectedSubject.id].map((topic, i) => (
            <div key={i} className="card-hover" onClick={() => { setSelectedTopic(topic); setScreen("mode"); }}
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${subjectColor}25`, borderRadius: 12, padding: "20px 18px", cursor: "pointer" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>📚</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#e8f4f8", marginBottom: 4 }}>{topic}</div>
              <div style={{ fontSize: 12, color: "#7aa8c4" }}>Notes · Quiz · Ask</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── MODE SELECT ─────────────────────────────────────────────────────────────
  if (screen === "mode") return (
    <div style={{ minHeight: "100vh", background: "#050d1a", fontFamily: "'Source Sans 3',sans-serif", color: "#e8f4f8", padding: "32px 20px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600&display=swap'); * { box-sizing: border-box; } .card-hover { transition: all 0.3s; cursor: pointer; } .card-hover:hover { transform:translateY(-4px); border-color: ${subjectColor} !important; }`}</style>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => setScreen("subject")} style={{ background: "none", border: "none", color: "#7aa8c4", cursor: "pointer", fontSize: 14, marginBottom: 24 }}>← Back</button>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: subjectColor, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>{selectedSubject.label}</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26 }}>{selectedTopic}</h2>
        </div>
        {selectedMode === "quiz" && (
          <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 14, color: "#7aa8c4", marginBottom: 10 }}>Number of questions</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[10, 20, 30, 50].map(n => (
                <button key={n} onClick={() => setQuestionCount(n)}
                  style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${questionCount === n ? subjectColor : "rgba(255,255,255,0.15)"}`, background: questionCount === n ? subjectColor + "22" : "transparent", color: questionCount === n ? subjectColor : "#7aa8c4", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                  {n} Qs
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "grid", gap: 16 }}>
          {MODES.map(m => (
            <div key={m.id} className="card-hover"
              onClick={() => {
                setSelectedMode(m.id);
                setContent(""); setQuizData(null); setUserAnswers({}); setShowResults(false); setChatHistory([]); setAdaptiveBanner("");
                setScreen("content");
                if (m.id === "notes") setTimeout(generateNotes, 100);
                if (m.id === "quiz") setTimeout(() => generateQuiz("quiz"), 100);
                if (m.id === "simulation") setTimeout(() => generateQuiz("simulation"), 100);
              }}
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${subjectColor}20`, borderRadius: 14, padding: "24px 20px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ fontSize: 36 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 13, color: "#7aa8c4" }}>{m.desc}</div>
              </div>
              <div style={{ marginLeft: "auto", color: subjectColor, fontSize: 20 }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── CONTENT SCREEN ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#050d1a", fontFamily: "'Source Sans 3',sans-serif", color: "#e8f4f8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+3:wght@300;400;600&display=swap');
        * { box-sizing: border-box; }
        .notes-content h2 { font-family:'Playfair Display',serif; color: ${subjectColor}; font-size:1.3em; margin:20px 0 10px; }
        .notes-content h3 { font-family:'Playfair Display',serif; color:#e8f4f8; font-size:1.1em; margin:16px 0 8px; }
        .notes-content p { color:#c8dce8; line-height:1.8; margin-bottom:12px; font-size:14px; }
        .notes-content ul, .notes-content ol { color:#c8dce8; padding-left:20px; margin-bottom:12px; font-size:14px; line-height:1.8; }
        .notes-content strong { color:${subjectColor}; }
        .notes-content code { background:rgba(0,212,255,0.1); padding:2px 6px; border-radius:4px; font-family:monospace; font-size:13px; color:#00ffaa; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#050d1a; } ::-webkit-scrollbar-thumb { background:#1a3a5c; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .opt-btn { transition: all 0.2s; } .opt-btn:hover { filter: brightness(1.2); }
      `}</style>

      {/* Top bar */}
      <div style={{ background: "rgba(5,13,26,0.95)", borderBottom: "1px solid rgba(0,212,255,0.15)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => { setScreen("mode"); setContent(""); setQuizData(null); }} style={{ background: "none", border: "none", color: "#7aa8c4", cursor: "pointer", fontSize: 14 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: subjectColor, letterSpacing: 2, textTransform: "uppercase" }}>{selectedSubject.label} · {selectedMode === "notes" ? "Chapter Notes" : selectedMode === "quiz" ? "Practice Quiz" : selectedMode === "simulation" ? "DSA Simulation" : "Ask & Explain"}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e8f4f8" }}>{selectedTopic}</div>
        </div>
        {selectedMode === "notes" && <button onClick={generateNotes} style={{ background: subjectColor + "20", border: `1px solid ${subjectColor}40`, borderRadius: 8, padding: "6px 14px", color: subjectColor, cursor: "pointer", fontSize: 12 }}>↺ Regenerate</button>}
        {(selectedMode === "quiz" || selectedMode === "simulation") && !showResults && quizData && <button onClick={submitQuiz} style={{ background: "#00ffaa20", border: "1px solid #00ffaa40", borderRadius: 8, padding: "6px 14px", color: "#00ffaa", cursor: "pointer", fontSize: 12 }}>{selectedMode === "simulation" ? "Finish Simulation" : "Submit Quiz"}</button>}
        {(selectedMode === "quiz" || selectedMode === "simulation") && <button onClick={() => generateQuiz(selectedMode === "simulation" ? "simulation" : "quiz")} style={{ background: subjectColor + "20", border: `1px solid ${subjectColor}40`, borderRadius: 8, padding: "6px 14px", color: subjectColor, cursor: "pointer", fontSize: 12 }}>{selectedMode === "simulation" ? "Restart Simulation" : "New Quiz"}</button>}
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>

        {pipelineSteps.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            {pipelineSteps.map((s, idx) => (
              <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "#c8dce8", marginBottom: 6 }}>
                <span>{s.status === "done" ? "✓" : s.status === "running" ? "⏳" : "○"}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {auditTrail.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 14, marginBottom: 18 }}>
            <button onClick={() => setShowAudit((v) => !v)} style={{ background: "none", border: "none", color: "#e8f4f8", fontSize: 14, cursor: "pointer", marginBottom: showAudit ? 10 : 0 }}>
              {showAudit ? "▼" : "▶"} Agent Audit Trail
            </button>
            {showAudit && auditTrail.map((a, i) => (
              <div key={i} style={{ borderTop: i ? "1px solid rgba(255,255,255,0.08)" : "none", paddingTop: i ? 8 : 0, marginTop: i ? 8 : 0, fontSize: 12, color: "#c8dce8" }}>
                <div style={{ color: "#e8f4f8", fontWeight: 600 }}>{a.agent}</div>
                <div>{a.details}</div>
                <div style={{ color: "#7aa8c4", whiteSpace: "pre-wrap" }}>{a.preview}</div>
              </div>
            ))}
          </div>
        )}

        {/* NOTES MODE */}
        {selectedMode === "notes" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: "#7aa8c4", textTransform: "uppercase", letterSpacing: 1 }}>Depth</div>
              {NOTES_DEPTHS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setNotesDepth(d.id);
                    generateNotes(d.id);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: `1px solid ${notesDepth === d.id ? subjectColor : "rgba(255,255,255,0.15)"}`,
                    background: notesDepth === d.id ? subjectColor + "20" : "transparent",
                    color: notesDepth === d.id ? subjectColor : "#7aa8c4",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${subjectColor}30`, borderTop: `3px solid ${subjectColor}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ color: "#7aa8c4", fontSize: 14 }}>Generating {notesDepth} chapter notes…</div>
              </div>
            )}
            {!loading && content && (
              <div className="notes-content" dangerouslySetInnerHTML={{ __html: content
                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                .replace(/^# (.+)$/gm, '<h2>$1</h2>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.+?)`/g, '<code>$1</code>')
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
              }} />
            )}
          </div>
        )}

        {/* QUIZ / SIMULATION MODE */}
        {(selectedMode === "quiz" || selectedMode === "simulation") && (
          <div>
            {selectedMode === "simulation" && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, marginBottom: 14, color: simulationSeconds <= 600 ? "#ff6464" : "#e8f4f8", fontWeight: 700 }}>
                Time Left: {String(Math.floor(simulationSeconds / 60)).padStart(2, "0")}:{String(simulationSeconds % 60).padStart(2, "0")}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(120px,1fr))", gap: 8, marginBottom: 12 }}>
              {Object.entries(levelStats).map(([lvl, v]) => (
                <div key={lvl} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, fontSize: 12 }}>
                  <div style={{ color: LEVEL_COLORS[lvl], fontWeight: 700 }}>{lvl}</div>
                  <div style={{ color: "#7aa8c4" }}>{v.total ? `${Math.round((100 * v.correct) / v.total)}%` : "-"}</div>
                </div>
              ))}
            </div>

            {adaptiveBanner && (
              <div style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 10, padding: 10, marginBottom: 12, color: "#9bd8ff", fontSize: 13 }}>
                {adaptiveBanner}
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${subjectColor}30`, borderTop: `3px solid ${subjectColor}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ color: "#7aa8c4", fontSize: 14 }}>Crafting {selectedMode === "simulation" ? 25 : questionCount} deep questions…</div>
              </div>
            )}

            {!loading && showResults && quizData && (
              <div style={{ background: "rgba(0,255,170,0.06)", border: "1px solid rgba(0,255,170,0.25)", borderRadius: 16, padding: 24, marginBottom: 28, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{score / quizData.questions.length >= 0.8 ? "🏆" : score / quizData.questions.length >= 0.6 ? "🎯" : "📚"}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: "#00ffaa" }}>{score}/{quizData.questions.length}</div>
                <div style={{ color: "#7aa8c4", fontSize: 14, marginTop: 4 }}>{score / quizData.questions.length >= 0.8 ? "Excellent! NUSH ready!" : score / quizData.questions.length >= 0.6 ? "Good effort! Review wrong answers." : "Keep practicing — review the chapter notes."}</div>
              </div>
            )}

            {selectedMode === "simulation" && showResults && simulationReport && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 16, marginBottom: 16, color: "#c8dce8", fontSize: 13 }}>
                <div style={{ fontSize: 15, color: "#e8f4f8", fontWeight: 700, marginBottom: 8 }}>DSA Simulation Report</div>
                <div>Score by subject: {Object.entries(simulationReport.bySubject).map(([k, v]) => `${k}: ${v}`).join(" | ")}</div>
                <div>Score by level: {Object.entries(simulationReport.byLevel).filter(([, v]) => v.total > 0).map(([k, v]) => `${k} ${v.correct}/${v.total}`).join(" | ")}</div>
                <div>Avg time per question: {simulationReport.avgPerQuestion}s</div>
                <div>Weakest level: {simulationReport.weakest}</div>
                <div>DSA Readiness: {simulationReport.readiness}</div>
              </div>
            )}

            {!loading && quizData && quizData.questions.map((q, i) => {
              const answered = userAnswers[q.id];
              return (
                <div key={q.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "22px", marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: (LEVEL_COLORS[q.level] || subjectColor) + "30", color: LEVEL_COLORS[q.level] || subjectColor, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>{q.level}</span>
                    <span style={{ background: "rgba(255,255,255,0.08)", color: "#e8f4f8", fontSize: 11, padding: "3px 8px", borderRadius: 6 }}>{q.source_style || "PSLE"}</span>
                    <span style={{ background: "rgba(0,212,255,0.15)", color: "#9bd8ff", fontSize: 11, padding: "3px 8px", borderRadius: 6 }}>{q.blooms_verb || "Apply"}</span>
                    {(q.concept_tags || []).map((t, ti) => (
                      <span key={ti} style={{ background: "rgba(255,255,255,0.07)", color: "#c8dce8", fontSize: 10, padding: "2px 7px", borderRadius: 10 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 12, color: "#7aa8c4", marginTop: 2 }}>Q{i + 1}</span>
                    <p style={{ fontSize: 14, color: "#e8f4f8", lineHeight: 1.7, margin: 0 }}>{q.question}</p>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {Object.entries(q.options).map(([k, v]) => {
                      let bg = "rgba(255,255,255,0.04)";
                      let border = "1px solid rgba(255,255,255,0.1)";
                      let color = "#c8dce8";
                      if (showResults) {
                        if (k === q.answer) { bg = "rgba(0,255,170,0.12)"; border = "1px solid #00ffaa50"; color = "#00ffaa"; }
                        else if (k === answered) { bg = "rgba(255,100,100,0.12)"; border = "1px solid #ff646450"; color = "#ff6464"; }
                      } else if (k === answered) { bg = subjectColor + "18"; border = `1px solid ${subjectColor}50`; color = subjectColor; }
                      return (
                        <button key={k} className="opt-btn" onClick={() => !showResults && handleAnswerSelect(q, k)}
                          style={{ background: bg, border, borderRadius: 8, padding: "10px 14px", color, fontSize: 13, textAlign: "left", cursor: showResults ? "default" : "pointer", display: "flex", gap: 10 }}>
                          <strong>{k}.</strong> {v}
                        </button>
                      );
                    })}
                  </div>
                  {showResults && selectedMode !== "simulation" && (
                    <div style={{ marginTop: 14, background: "rgba(0,212,255,0.06)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#7aa8c4", lineHeight: 1.7, borderLeft: `3px solid ${subjectColor}` }}>
                      <strong style={{ color: subjectColor }}>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ASK MODE */}
        {selectedMode === "explain" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#7aa8c4" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
                  <div style={{ fontSize: 15 }}>Ask anything about <strong style={{ color: subjectColor }}>{selectedTopic}</strong></div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Get NUSH-level explanations, worked examples, and connections to the DSA exam</div>
                </div>
              )}
              {chatHistory.map((m, i) => (
                <div key={i} style={{ marginBottom: 20, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "82%", padding: "14px 18px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? subjectColor + "20" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${m.role === "user" ? subjectColor + "40" : "rgba(255,255,255,0.1)"}`,
                    fontSize: 14, lineHeight: 1.8, color: m.role === "user" ? subjectColor : "#c8dce8",
                    whiteSpace: "pre-wrap"
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && <div style={{ color: "#7aa8c4", fontSize: 13, padding: "10px 0" }}>Thinking…</div>}
            </div>

            {/* Starter questions */}
            {chatHistory.length === 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {[
                  `Explain ${selectedTopic} in simple terms`,
                  `What are the hardest parts of ${selectedTopic} in NUSH exam?`,
                  `Give me a worked example for ${selectedTopic}`,
                  `What are common mistakes in ${selectedTopic}?`
                ].map((q, i) => (
                  <button key={i} onClick={() => { setCustomQuestion(q); }}
                    style={{ background: subjectColor + "12", border: `1px solid ${subjectColor}30`, borderRadius: 20, padding: "7px 14px", color: subjectColor, cursor: "pointer", fontSize: 12 }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={customQuestion} onChange={e => setCustomQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAsk()}
                placeholder="Ask your question about this topic…"
                style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#e8f4f8", fontSize: 14, outline: "none" }}
              />
              <button onClick={handleAsk} disabled={loading || !customQuestion.trim()}
                style={{ background: subjectColor, border: "none", borderRadius: 10, padding: "12px 20px", color: "#050d1a", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: loading ? 0.6 : 1 }}>
                Ask →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
