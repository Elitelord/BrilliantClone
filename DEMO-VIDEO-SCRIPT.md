# Demo Video Script — Population Path (DTM)

A 3–5 minute early-submission demo. Target runtime **~4:00**. Read this top to bottom once, do a single rehearsal run, then record.

---

## 1. Which lesson to record

### ✅ RECORD: **Lesson 1 — "The Engine of Growth"** (`dtm-engine`)

**Why this one:** It is the only lesson that lets you demo all three AI features in a single clean pass *and* gives the AI its best chance of looking sharp on camera. Its skill check uses the `stage-from-rates` and `population-trend` templates — the two most robustly verified paths in `src/lib/ai/verify.ts` (and the exact shape the skill-check prompt's worked example is built around), so generated questions almost always verify and render. It also opens on the single most iconic visual in the whole unit (the live birth/death rate curves with the natural-increase gap), and its wrong-answer beat (`predict-tfr-cbr`) is a one-click multiple-choice with a juicy, recoverable misconception — perfect for showing the nudge *diagnosing* a mistake.

**It contains all three AI features:**
- **Wrong-answer nudge** — fires on any graded step; best triggered at the `predict-tfr-cbr` multiple-choice step.
- **Explain-it-back** — the lesson's final step (`explain-stage2-boom`), AI-graded free response.
- **Skill check** — 3 AI-generated AP-style MCQs after you finish, re-verified against DTM logic.

### 🔁 BACKUP: **Lesson 2 — "Reading Population Pyramids"** (`population-pyramids`)

Slightly shorter (12 steps vs 14) and has the most visually striking hero (drag-to-reshape a population pyramid). It also has all three AI features and a clean skill-check template (`pyramid-stage`). Use it if L1 misbehaves on the day. Trade-off: `pyramid-stage` verification is a touch less bulletproof than `stage-from-rates`, so rehearse/re-roll the skill check (see notes below).

> **Caveat I confirmed while reading the content:** In every early lesson the `explain-back` step is the **last** step, immediately before the skill check. That's good news — **one lesson (L1) covers all three AI features end-to-end**, no splitting needed. (If you ever wanted explain-back on a different lesson, L2, L3-structure, and L3-epi all have one too.) The newer lessons — `limits-of-growth`, `why-people-move`, `place-country` — should be **avoided for the recording**: their concepts (density/Malthus, migration, place-the-country) map to skill-check templates that verify far less reliably, so the skill check can come up short or empty.

---

## 2. Before you hit record (2-minute prep)

1. **Pick your environment.** Record against the deployed site for credibility: **https://brilliantclone-b4a2a.web.app** (sign in with the reviewer demo account `demo@brilliantclone.app` / `PopulationPathDemo1!`). If the network or live AI feels flaky, fall back to `npm run dev` on localhost — same UX, more control.
2. **Confirm AI is on.** You should see the skill check appear at the end of a lesson and the nudge/explain-back grading work. (If they don't appear, AI is disabled and the demo can't show them.)
3. **Rehearse the skill check ONCE.** The skill check is generated live via the OpenAI API (model just bumped to **gpt-4o**), so quality varies per generation. Do a full practice run of `dtm-engine` to the skill check. If a question looks weak or awkward, **re-roll it**: exit the lesson, re-enter, replay the final `explain-back` step, and finish again to regenerate a fresh set. Lock in a run where all 3 questions look sharp, then record.
4. **Position for a clean run.** Progress resumes mid-lesson. For the cleanest take, start `dtm-engine` from the course path and click `Continue` through the intro `learn`/`explore` steps quickly — or pre-advance to just before your hero beat and use a jump cut.
5. **Have your wrong answer ready.** At `predict-tfr-cbr`, the deliberately-wrong-but-tempting choice is **"A has a younger population…"** — pick that to trigger a meaty nudge, then correct to **"B has a younger population…"**.

---

## 3. Timed shot-by-shot script (~4:00)

> Framing rule (how this is judged): lead with **WHO** and the **PROBLEM**, then spend the bulk of the time on the **AI features as user value** — not a feature list. Keep secondary features to a quick mention.

### 0:00 – 0:25 — Intro: who + the problem (25s)
- **On screen:** Home / course path of *Population Path* (the DTM course).
- **Do:** Slowly scroll the course path so the lessons + mastery are visible.
- **Say:** *"This is Population Path. It teaches the Demographic Transition Model — a core unit of AP Human Geography — to a 14- or 15-year-old studying for the exam. The problem with how most kids review: flashcards and re-reading build recognition, not understanding. But AP questions are application-heavy — you have to reason from data, not recite a definition. So I built three AI features that push students to actually *think*. Let me show them inside one lesson."*

### 0:25 – 0:50 — The hero interaction (25s)
- **On screen:** Open **"The Engine of Growth"**, advance to the **idealized 5-stage rate graph** (`explore-model`).
- **Do:** Drag the stage handle 1 → 5. Let the natural-increase gap shade live and the population bar respond.
- **Say:** *"Everything starts here — students don't read about the model, they manipulate it. Drag across the five stages and you watch the gap between births and deaths drive the population in real time. That's the 'learn by doing' core — now here's where the AI makes it stick."*

### 0:50 – 1:40 — AI Feature 1: the wrong-answer nudge (50s)
- **On screen:** Advance to the **`predict-tfr-cbr`** multiple-choice step (two countries, same CBR, different TFR).
- **Do:** Deliberately pick the wrong **"A has a younger population…"** → click **Check**. Wait for the AI nudge to appear under the feedback bar. Read it on screen. Then switch to **"B has a younger population…"** and check again — correct.
- **Say:** *"Watch what happens when a student gets it wrong. It doesn't just mark it red — the AI diagnoses *this student's specific mistake* and nudges them toward the idea without giving away the answer. That's the difference between a flashcard saying 'wrong' and a tutor saying 'here's where your thinking slipped.' Now they fix it themselves — and it sticks."*

### 1:40 – 2:35 — AI Feature 2: explain it back (55s)
- **On screen:** Advance to the final step, **`explain-stage2-boom`** ("In your own words, why does population explode in Stage 2?").
- **Do:** Type a *partial* answer (e.g. *"Because death rates drop."*) and **Check** — let the AI grade it and ask for more. Then add the missing piece (*"…while birth rates stay high, so the gap widens"*) and check again to pass.
- **Say:** *"This is the one I care about most. Instead of picking an option, the student has to explain the concept in their own words — and the AI grades it against a rubric. That's retrieval practice — the single most effective thing for actually remembering this on exam day. Notice it caught the incomplete answer and pushed for the full mechanism, just like a teacher would."*

### 2:35 – 3:25 — AI Feature 3: the skill check (50s)
- **On screen:** Finish the lesson → the **3-question AP-style skill check** generates and appears.
- **Do:** Answer the questions (answer the first correctly, optionally miss one to show feedback). Let the per-question explanation show.
- **Say:** *"Finishing the lesson triggers a skill check: three AP-exam-style application questions, generated fresh each time so it's never the same quiz twice. The key part — every correct answer is re-verified against the model's own DTM logic before it's shown. So the AI can generate endless practice but can *never* teach the student something false. That's AP-level rigor a student can trust."*

### 3:25 – 3:45 — Secondary features, brief (20s)
- **On screen:** Pop over to the leaderboard, account page, and overall mastery on the home screen.
- **Say:** *"Quickly — there's also a leaderboard, accounts with saved progress across devices, and overall mastery tracking per concept, so students stay motivated and always know what to study next."*

### 3:45 – 4:05 — Architecture close (20s)
- **On screen:** Back on the course path, or a quick glance at a lesson file if you want to show "lessons are data."
- **Say:** *"Under the hood: lessons are just data, the AI is grounded in the live lesson state and verified against real DTM math, and the whole app still teaches end-to-end with AI turned completely off. The AI is an amplifier on a solid foundation — not a crutch. Thanks for watching."*

**Total: ~4:05** (comfortably inside the 3–5 minute window).

---

## 4. Quick recording checklist

- [ ] Signed in on **https://brilliantclone-b4a2a.web.app** (or localhost) with AI confirmed ON.
- [ ] Rehearsed `dtm-engine` once; skill-check questions look sharp (re-rolled if not).
- [ ] Know the wrong answer to click at `predict-tfr-cbr` (pick "A…", then correct to "B…").
- [ ] Have a partial explain-back answer ready, then the full one.
- [ ] Screen recorder set to capture the feedback bar / nudge area clearly.
- [ ] Mic check; one rehearsal of the voiceover for pacing.
