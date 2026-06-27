# Brainlift — Population Path (Early Submission)

**Project:** *Population Path* — a Brilliant-style, learn-by-doing web app teaching the **Demographic Transition Model (DTM)**, a unit of AP Human Geography. Persona: a 14–15-year-old studying for the AP exam.

---

## Phase 2 — AI feature decisions (the core)

**Model choice.** Bumped from `gpt-4o-mini` to **`gpt-4o`**, with **automatic fallback to `gpt-4o-mini`** if gpt-4o is unavailable — the larger model writes sharper exam stimuli; the fallback makes it so the feature works under errors/rate limits.

**Three features shipped:**

- **Wrong-answer nudge** — tailored 1–2 sentence hint grounded in the learner's actual attempt + validator outcome, gated by a no-giveaway guard (`hintGuard.ts`). This ensures the user gets direct feedback on wrong answers but they can still try again and have to apply themselves to solve it. 
- **"Explain it back"** — AI grades a short free response against a rubric (0–3); omitted entirely when AI is off; shows a retry message (never the answer) on API failure. This feature was chosen because it matches very well for the AP exam component of the target persona. Practicing Free response answers with tailored grading is extremely important and these bite sized explain questions make it easier to digest than a full FRQ.
- **End-of-lesson AP-style skill check** — 3 MCQs from verifiable templates, answers **recomputed from `dtm.ts`** before display; retries up to 3× and drops any unverified question. This adaptation of the skill check concept from Brilliant is meant to give direct practice with AP Style questions that have long setups and answers. 

**Three features deliberately skipped (restraint as design):**

- **Misconception coach** — cut to keep checkpoint scope tight; the deterministic mastery path already guides next steps.
- **Free-roaming chatbot tutor** — this felt a bit lazy and didn't provide the value i wanted in my app. 
- **LLM-driven path reordering** — deterministic mastery gating does this honestly; an LLM adds risk, not value.

**Known limitation (deliberate triage, not an oversight).** Skill-check questions are **correct and verified, but the writing isn't yet at full AP rigor** — distractors/prose aren't sharp enough. Correctness was non-negotiable. **Sunday plan:** (1) the stronger model (already on `gpt-4o`) for sharper stimuli, and (2) **expand verifiable templates to the newer lessons** — L4 (limits of growth / density + Malthus), L6 (migration), L7 (place-the-country) — whose concepts don't yet map onto the current five (`stage-from-rates`, `population-trend`, `pyramid-stage`, `sector-dominant`, `cause-of-death`). I'd rather not show a question then show an incorrect one. 

---