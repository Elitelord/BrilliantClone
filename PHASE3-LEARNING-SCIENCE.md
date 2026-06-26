# Phase 3 — Learning Science Notes

> Raw notes from a learning-science lecture, organized to feed **Phase 3 (final submission)**: the learning-science layer — spaced repetition, interleaving engine, formal scaffolding/fading (see `prd.md` line 49). These are the **principles + design intent** to lean on when building that layer; they are *not yet a build plan*. Picks up after the early submission. Persona stays the same: a 14–15 y/o studying AP Human Geography (DTM) for the exam.

## TL;DR — what Phase 3 should bake in

- Design around **retrieval, spacing, and interleaving** — the three highest-utility principles.
- Treat learning as **recursive, not linear**: deliberately bring back old concepts instead of marking a stage "done."
- Build a **prerequisite map**, decide what must be known, and **generate parallel diagnostic items + adaptive forms at scale**.
- Use **practice testing + distributed (spaced) practice** as the core mechanic; de-emphasize re-reading/highlighting/summarizing.
- For AI feedback, aim **beyond text** — generate visuals/images/video where possible.

---

## 1. What does (and doesn't) indicate or cause learning

**Poor indicators of learning**
- **Engagement** is not a good indicator of learning.
- **Time on task** is not a good indicator of learning.

**Misconceptions about knowledge**
- Knowledge **isn't strictly domain-specific**, but it also **doesn't transfer far or near** as much as people assume — don't count on transfer.

**Working memory**
- Working memory is **limited — usually ~7 items**. Don't overload a single step.

**Prior knowledge / context**
- **Prior information is essential**: context helps students understand.
- Previewing the topic beforehand helps students **activate the relevant components in their brain** to recall information.
- That activated recall then lets them **move through new information faster**.

**Study strategies — utility ranking**
- **Best utility:** practice testing, distributed (spaced) practice.
- **Better/high utility:** self-explanation, interleaved practice.
- **Lower utility:** summarizing, highlighting, re-reading.

**Habits / framing that don't help**
- **Multitasking** is not effective.
- **Cramming** is not effective.
- Being good at a subject is often framed as **talent rather than effort** (a framing to push back on, not to design around).

---

## 2. Core model: learning is recursive

- Learning is **recursive, not linear**.
- **Revisiting old concepts helps more than leaving a stage behind.**
- Knowledge should **build upon itself**; retrieval should keep reaching for the **higher-threshold concepts** as they become accessible.

---

## 3. The three best-practice principles

### Retrieval
- Make learners **retrieve** (recall/produce) rather than re-read.
- **Rephrase definitions** in retrieval quizzes so the learner isn't just memorizing wording — force them to reconstruct meaning.
- Retrieval should target the **high-threshold concepts**, not just trivia.

### Spacing
- Use **little-and-often** spacing.
- **Gap too short → retrieval is too easy → learning isn't effective.** Need enough time that retrieval still *succeeds* but isn't trivial.
- Rule of thumb: a **~10–20% test delay** before restudy of the material.

### Interleaving
- **Mix up the type of problem** rather than blocking one type at a time.

---

## 4. Implementation guidance for the Phase 3 layer

- **Map prerequisites** — build the prereq graph for the curriculum (DTM concepts → dependencies).
- **Decide what's needed to know** — define the must-know set / mastery targets per concept.
- **Generate parallel diagnostic items** — multiple equivalent items per concept so retrieval/spacing doesn't reuse the identical question.
- **Generate adaptive forms at scale** — adaptive quiz forms produced programmatically (ties into AI generation from Phase 2).
- **Distractors:** design MCQ distractors that **fit into the curriculum** (plausible, curriculum-aligned wrong answers — not throwaway options).
- **Rephrase on retrieval:** vary the phrasing of definitions/prompts so learners can't pattern-match memorized strings.

---

## 5. AI-generated feedback (essays, etc.)

- For AI feedback on essays and free responses, **generate more than just text** — ideally **images / visuals / videos** where possible.

---

## Open questions to resolve when building (not yet decided)

- Concrete spacing schedule / algorithm (how to compute the next-review delay per item from the 10–20% rule).
- How the prereq map + diagnostic items connect to the existing `mastery.ts` / content model.
- Which feedback gets visuals vs. text, and how to generate them within the Firebase AI Logic setup from Phase 2.
