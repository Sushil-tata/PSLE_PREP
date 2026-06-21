# Maths Generation Quality Diagnosis

**Batch:** `test_runs/f3_maths.json` (commit 895da50)  
**Verdict:** PARTIAL — 5/10 rejected (IDs 2, 3, 5, 7, 10); 5/10 verified (IDs 1, 4, 6, 8, 9)

---

## 1. Pattern Across the 5 Rejected Items

All 10 questions in this batch are **pressure word problems** (force/area/Pa). All 5 rejections fall into three distinct error types:

### Type A — Factor-of-10 unit conversion error (IDs 7, 10)

F2 consistently applies `1 N/cm² = 1,000 Pa` when the correct conversion is `1 N/cm² = 10,000 Pa`. This produces an answer key that is exactly 10× too small.

- **ID 7:** 3,000 N ÷ 120 cm² = 25 N/cm² → F2 states 25,000 Pa (correct: 250,000 Pa)
- **ID 10:** pressure difference = 0.14 N/cm² → F2 states 140 Pa (correct: 1,400 Pa)

The error is identical in both cases: F2 multiplies by 1,000 (the N/m² → Pa factor) rather than 10,000. It appears to conflate `N/cm²` with `N/m²` at the conversion step.

### Type B — Arithmetic inconsistency in multi-step chain (IDs 2, 5)

F2 invents scenario numbers, then produces an answer key that cannot be derived from those numbers.

- **ID 2:** Cylindrical tank (r = 70 cm, h = 120 cm, tank mass = 15 kg). F2 claims answer C = 0.878 N/cm²; F3's independent calculation gives 1.21 N/cm². The discrepancy suggests F2 computed a draft answer at an earlier stage, then changed numbers (or wrote the scenario around a different set of numbers) without reconciling.
- **ID 5:** Bus on 6 wheels (total mass 6,000 kg, area/wheel = 150 cm²). F2 claims 40,000 Pa; F3 computes ≈666,700 Pa. The answer key is consistent with omitting the g = 10 conversion (treating mass in kg as force in N) *and* then applying the wrong Pa factor — two compounding errors.

### Type C — Undeclared variable (ID 3)

F2 writes the question referencing a "40 cm × 10 cm edge" but only declares two plank dimensions (120 cm × 40 cm) in the problem givens. The 10 cm thickness was used in the intended solution without being stated.

---

## 2. Cluster Summary

| Error type                             | IDs    | Count |
|----------------------------------------|--------|-------|
| Wrong N/cm² → Pa conversion (×10 off) | 7, 10  | 2     |
| Multi-step number chain inconsistency  | 2, 5   | 2     |
| Missing dimension in givens            | 3      | 1     |

No clustering by difficulty level: the 5 rejections span L2 (IDs 3, 5, 10) and L3 (IDs 2, 7).

---

## 3. Comparison: Maths vs Chemistry vs Physics

All three subjects' F3 batches ran over pressure or multi-step quantitative topics. The structural difference is in **how much freedom F2 has when inventing numbers**:

**Chemistry** (acid-base neutralisation): Every question anchors to an explicitly-stated ratio (e.g., "3 parts vinegar : 2 parts NaOH"). F2 picks one clean volume, applies the ratio, and the arithmetic is a single multiply/divide. The ratio constraint eliminates most paths to an inconsistent answer key. Chemistry's raw F3 had ~3 rejections before repair.

**Physics** (pressure): F2 is given explicit formulas and constants in the prompt context (ρgh, g = 10 N/kg, density of water = 1000 kg/m³). The formula structure acts as a scaffold — F2 can anchor a chosen depth to a target pressure and work backwards to consistent numbers. Physics raw F3 had ~4 rejections before repair.

**Maths** (pressure word problems): F2 must invent *every* quantity freely — object dimensions, mass, area — and ensure the entire chain (mass × 10 → force, force ÷ area → pressure in N/cm², then × 10,000 → Pa) self-checks. There is no ratio anchor and no formula constant that constrains the invented numbers. F2 generates the scenario, numbers, and answer key in a single forward pass within the 1,400-token chunk window (~280 tokens per question), leaving no room for arithmetic self-verification. Maths raw F3: 5 rejections with no prior repair cycle.

---

## 4. Root Cause Hypothesis

**Word-problem pressure questions maximise the number of freely-invented quantities that must mutually satisfy a multi-step chain.** Specifically:

1. **Long invention chain, no anchor**: Each question requires F2 to invent 3–5 numbers (mass, 2–3 dimensions, sometimes density or rate) that must all satisfy P = F/A with correct unit handling. With no formula anchor or ratio constraint, the probability of a consistency slip compounds with chain length.

2. **Systematic N/cm² → Pa conversion error**: The conversion `1 N/cm² = 10,000 Pa` is non-obvious (it is not `1 N/m² = 1 Pa` scaled directly). F2 appears to have a persistent low-confidence representation of this factor and defaults to ×1,000. This single bug accounts for 2 of the 5 rejections and is entirely predictable and correctable.

3. **Tight token budget hides the error**: At 1,400 tokens per 5-question chunk, F2 has no budget for internal backtracking. Chemistry and Physics question types are simpler to self-verify in one pass; pressure word problems require a multi-step check that doesn't fit in the remaining generation budget.

4. **Missing-variable error is a prose/givens ordering problem**: When F2 writes the problem narrative before finalising the givens list, dimensions that "feel implicit" (a plank has a thickness) get used in the solution but omitted from the stem.

---

## 5. Recommended Prompt Changes to Test

These are hypotheses only — do not apply without review.

### Change 1 — "Givens-first" constraint

**Current:** F2 writes the question stem freely, then fills in answer and explanation.

**Proposed addition to `buildF2Prompt`:**

```
For every word problem involving numeric calculation, list ALL given quantities 
in a structured "givens" block before writing the question stem:
  "givens": [{"quantity": "mass", "value": 36, "unit": "kg"}, ...]
The question stem may only reference quantities that appear in this givens block.
Compute the answer from the givens block and verify it before writing the options.
```

**Why:** Forces F2 to commit to numbers before writing prose. Eliminates the undeclared-variable failure mode (ID 3 pattern) and creates a checklist that self-exposes arithmetic inconsistencies (IDs 2, 5 pattern) during generation, not only at F3.

### Change 2 — Explicit unit-conversion step in explanation

**Proposed addition to `buildF2Prompt`:**

```
If the question involves a unit conversion between N/cm² and Pa, the explanation 
field must include this step written out explicitly:
  "Converting: X N/cm² × 10,000 = Y Pa  (since 1 N/cm² = 10,000 Pa)"
Do not use 1,000 as the conversion factor between N/cm² and Pa.
```

**Why:** Directly targets the systematic ×10 error in IDs 7 and 10. Embedding the correct conversion factor as a quoted rule into the prompt is the lowest-friction fix for a single known, recurring error. It also makes unit errors visible to F3 in the explanation field (F3 can spot "× 1,000" and reject immediately), without requiring a structural change to the pipeline.

---

*Investigation only — no F2/F3 prompt changes applied. Awaiting review before modification.*
