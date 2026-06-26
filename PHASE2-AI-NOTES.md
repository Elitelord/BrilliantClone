# Phase 2 — AI Feature Decision Notes

> Working notes to feed the Brainlift's "Phase decisions" section (which AI features were chosen/skipped and why). **Not the build plan** — that comes after these decisions are locked. The Brainlift has other components too (tools/workflow, prompting strategies, code split, key learnings); these notes only cover the AI-feature decision.

## Context / constraints (from the brief)

- Phase 2 = **AI features**, and it has two parts: **decide**, then **build**.
- Hard rules: **ground every AI feature in the lesson's structured state, not raw text**; **verify anything checkable against the subject's logic**; **the app must keep teaching with AI turned off** (AI = additions, not replacements).
- We already have the right substrate: typed `Interaction` content model (`types/content.ts`), authored lessons (`content/lessons/*`), and outcome-based `validators.ts` (our ground-truth checker). **Implemented** in `src/lib/ai/` (Phase 0 foundation + Phase 2 features).
- Persona: 14–15 y/o studying AP Human Geography (Unit 2) for the exam → exam-style practice + plain-language explanation are high value.

## Backend decision

**Chosen: Firebase AI Logic (Gemini Developer API).**

| | Firebase AI Logic (Gemini) | Cloud Functions → OpenAI/Anthropic |
|---|---|---|
| Effort | Low — part of Firebase Web SDK; `firebase init ailogic` + init client; no server | High — new `functions/` dir, deploy pipeline, CORS, key mgmt |
| Cost | **Free tier** to start; pay-as-you-go later; no Blaze needed | **Blaze (billing) required** even to deploy functions + provider API cost |
| Key safety | Keys never on client; secured by **App Check** | Keys fully server-side |
| Structured output | **Native JSON-schema output** (ideal for validated problem gen) | Provider-dependent |
| Model choice | Gemini only | Any provider (Claude/GPT) |

**Why:** static Vite SPA already 100% on Firebase → lowest-friction path, free tier suits the demo, and schema-enforced JSON output is exactly what the "generate → validate" loop needs.
**Caveats to handle at build time:** (1) must enable **App Check** (required for safe AI Logic use); (2) likely a Firebase SDK bump from `^10.13.2` for the `firebase/ai` entrypoint.
**Pick Functions instead only if** we specifically need Claude/GPT or heavy server orchestration — not worth it for this timeline.

## AI features

### Shipping (FINAL — 3 in-lesson AI features + skill check)

1. **Wrong-answer nudge** — after a wrong check, AI adds feedback grounded in the learner's *current attempt* + validator outcome. Instant feedback stays vague; the nudge is the tailored mini-hint. One API call per wrong try. Pre-answer "stuck" hints are authored-only (AI off); AI help fires when mistakes happen, which matches learn-by-doing.
2. **AP-style end-of-lesson Skill Check** — Brilliant-style **3-question MCQ quiz** after the last step, before celebration. Plain exam-like MCQs; AI generates from verifiable templates; **`verify.ts` recomputes correct answers from `dtm.ts`** before display. Updates mastery, not lesson first-try score. Skipped when AI off.
3. **"Explain it back" — AI-graded free response** — learner types 1–2 sentences; AI grades against a rubric. **Step is omitted when AI is off** (no self-assess fallback). On quota/API failure, learner sees a retry message — not the model answer.

**Consolidated (Phase 2 revision):** Pre-answer AI hints removed — wrong-answer nudge is the in-step AI help. Drag/slider steps use vague instant wrong feedback; tailored nudge loads async below it. Saves quota vs hint+explain overlap.

### Deliberately skipped (document in Brainlift)

- **End-of-lesson "misconception coach"** — considered (would turn attempt history into a personalized debrief) but **cut for the early submission** to keep scope tight; the deterministic mastery path already guides next steps. Revisit in Phase 3.
- **Free-roaming chatbot tutor** — brief explicitly warns against bolting one on; not grounded; low signal.
- **Full LLM-driven path reordering** — our deterministic mastery gating already does this honestly; an LLM adds risk, not value.

## Cross-cutting build requirements (apply to every feature)

- **Grounding layer:** serialize step state (interaction config + learner's current values + validator outcome) into model context — never raw page text.
- **Verification layer:** wrap generation/answer-checks so outputs pass `validators.ts` before reaching the learner; reject/retry on failure.
- **AI-off resilience:** feature flag + graceful fallback (missing key / disabled) so the app fully teaches without AI — the brief tests this explicitly.
- **Security/deploy:** enable App Check; redeploy hosting.
