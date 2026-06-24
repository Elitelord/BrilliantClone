# Brilliant — Research & Reference

> Reference notes on how Brilliant works, written to guide a "learn-by-doing" clone (one subject, built deep). Source: Brilliant help center, FAQ, `llms.txt`, engineering/design blogs, and third-party breakdowns (researched Jun 2026). Use this as the north star for product and pedagogy decisions; map every MVP requirement back to a principle here.

---

## 1. What Brilliant Is (in one line)

A STEM learning app (iOS, Android, web) that teaches **by doing, not watching**. No videos. Every concept is taught through interactive problems with instant feedback, so the learner builds intuition by experimenting and figuring things out themselves. ~10M+ learners, ages 13–113.

**Mission framing:** "Create a world of great problem solvers." The bet is that *active problem-solving sticks and passive content doesn't* — they claim interactive learning is ~6x more effective than video.

---

## 2. Core Pedagogy (the part that actually matters to clone)

This is the soul of the product. The tech is downstream of these principles.

1. **Problem-first, not explanation-first.** A lesson drops you into a problem or puzzle *before* teaching the idea. You poke at it, get it wrong, and only then does the concept get formalized. This "primes" the brain — you understand *why* it works, not just *what* the answer is.
2. **Learn by doing / manipulation.** The learner *acts* on something — drags, taps, adjusts a slider, plots a point, builds a sequence — and watches the result change. The interaction is the lesson; it's not decoration on top of text.
3. **Intuition before formalism.** Build a mental model through hands-on exploration first; introduce notation/formulas/vocabulary after the intuition has landed.
4. **Mistakes are part of learning (non-judgmental).** Getting it wrong is expected and safe. Wrong answers get a *hint or explanation*, never just a red X. This lowers the anxiety that kills learning (esp. math anxiety).
5. **Read the explanation even when right.** Getting a problem right ≠ the concept landed. They nudge learners to read the "why" after a correct answer too — that's often where deep understanding forms.
6. **Bite-sized, frequent, low-friction.** Lessons are a few minutes each. Target ~15 min/day. Finishing one should feel good. Short + consistent beats long + occasional.
7. **Scaffolding that fades.** Start supported (hints, partial structure), then gradually remove support so problems stay just hard enough to grow from ("desirable difficulty").
8. **First-principles, from the ground up.** Designed so a beginner can start knowing little and come out understanding something real.

> Acceptance test Brilliant uses internally and the project brief echoes: **hand it to someone who doesn't know the subject and see if they actually learn it.** That test matters most.

---

## 3. Anatomy of a Lesson

A **lesson** = a short, ordered sequence of **interactive steps**. Each step generally:

1. Introduces or extends one idea (often via a question/visual, not a paragraph).
2. Makes the learner *do something* with it (solve, manipulate, predict, sort, build).
3. Gives **instant, specific feedback** on the action.
4. Reveals/reinforces the underlying concept ("the why").

Key properties:
- **One concept per lesson**, broken into small interactive beats.
- Steps mix explanation + hands-on practice; **practice checkpoints** test understanding as you go.
- Difficulty ramps within and across lessons.
- A real course has *many problem variations per concept* (Brilliant authors 20+ problems per concept, ~1000+ per course) so learners can truly master an idea, not just see it once. For an MVP you don't need this volume — but the **content model must make adding variations cheap.**

**Hierarchy:** `Learning Path → Course → Lesson → Step (interactive problem)`.
- **Course** = self-contained unit on a topic (e.g., "Visual Algebra", "Circuits", "Probability Fundamentals").
- **Learning Path** = curated, ordered sequence of courses for a subject area (Foundational Math, Programming & CS, Python, Data Analysis, Science, Logical Reasoning, etc.).
- Courses have **prerequisite structure** — foundations unlock before advanced topics.

---

## 4. Interaction / Problem Types (beyond multiple choice)

Brilliant's whole differentiation is **rich, manipulable problems**. The interaction should *teach the idea*. Examples by subject:

| Subject | Signature interactions |
|---|---|
| Algebra | drag terms across an equation, balance both sides, plot lines on a grid |
| Probability/Stats | run simulations, drag/reshape distributions, sample from dice/decks and watch outcomes |
| Physics | adjust sliders on projectile/pendulum/circuit and watch it respond live |
| Geometry | drag points, measure angles, build/transform shapes |
| Programming | small code/logic puzzles with run-and-check feedback, fill-in-the-blank code, drag-to-order steps |
| Logic/Puzzles | deduction grids, truth tables, step-by-step reasoning you assemble |

Common reusable interaction primitives to consider building:
- **Slider → live visual** (most reusable: one number drives a chart/sim).
- **Drag-and-drop / reorder** (sort items, order steps, move terms).
- **Tap-to-select on a visual** (pick a region/point/node).
- **Plot a point / draw on a grid or number line.**
- **Tap-to-build a sequence** (assemble an answer from pieces).
- **Multiple choice** — fine as *one* type, but never the only type.

> MVP requires **at least one rich problem type beyond multiple choice**, fitting the subject, plus **a visual element that responds in real time**.

---

## 5. Feedback System

- **Instant** (Brilliant feels immediate; the project target is **<100ms**).
- **Specific to what the learner did** — not a generic "wrong."
- **Wrong answers teach**: a hint, a nudge, a partial solution, or a plain-language explanation tied to the likely misconception. Then let them retry.
- **Right answers get reinforcement** too (short "why it works").
- **Hand-written** for the MVP (no AI). Each problem ships with its own correct/incorrect feedback authored ahead of time.
- Game-feel: animations, haptics, and small celebrations make feedback satisfying (see §7).

---

## 6. Mastery, Path & Adaptivity

- **Mastery tracking:** record what the learner attempted, got right/wrong, and how confidently. Don't advance until a concept is genuinely mastered ("mastery learning") — gate the next step on a clear mastery signal.
- **Adaptive next step:** recommend what to do next based on performance. When someone repeatedly gets a concept wrong, **surface a review or an easier step before moving on**, instead of pushing forward.
- **Resume where you left off:** remember the exact stopping point mid-lesson.
- **Path that "knows where you are":** the course path should feel personalized — unlock/recommend the sensible next lesson.
- (Premium can jump around; free users go sequentially — a monetization detail, not core to the clone.)

> MVP requires: progress + mastery layer, "pick up where you left off," and a **sensible next-step recommendation** after finishing a lesson.

---

## 7. The Habit Loop (gamification / retention)

Retention is treated as a *product*, not decoration — a dedicated "user motivation" design pod exists. Mechanics:

- **Streaks:** consecutive days learned. To extend a streak you must complete **3 problems OR one full lesson** in a day. Miss a day → resets to 0.
- **Streak charges / freezes:** earned "saves" that protect a streak if you miss a day (lose a charge instead of the streak). Reduces the fear/punishment of a single slip.
- **XP (experience points):** earned by completing lessons and solving problems; amount scales with effort. Repeating a finished lesson earns no XP (anti-gaming).
- **Leagues + leaderboards:** weekly competition, groups of 30 learners, XP resets weekly, top/bottom move up/down. 10 league tiers named after elements (Hydrogen → Lithium → Carbon → Neon → Titanium → Xenon → Barium → Neodymium → Tungsten → Einsteinium).
- **Levels / progression:** XP and progress unlock content; gives a long-term goal.
- **Daily reminders / widgets:** nudge the learner back (iOS home-screen widget shows streak).
- **Game feel:** animations, haptic feedback, milestone celebrations; learning-path nodes are animated (built with Rive). Goal: make a math/science habit feel fun and unintimidating.

> MVP requires: **streaks, milestones, a sense of daily progress**, and making lesson completion satisfying. Don't over-build — streak + daily goal + visible progress + a finish celebration is enough to start. Leagues/XP-leaderboards are nice-to-have, not MVP-critical.

---

## 8. Persistence & Platform

- Progress, streaks, and history **sync across sessions and devices** — leave mid-lesson on web, resume on phone.
- **Mobile-first**: bite-sized lessons designed for phones, touch input. (Project requires it works well on mobile screen sizes.)
- Free tier: first two levels of every course, up to two lessons/day, sequential; Premium: unlimited, jump anywhere, no ads. (Business model context only.)

---

## 9. How Brilliant Builds Content (content model insight)

From their engineering/design blog ("Hand-crafted, machine-made"):

- They **design the "game" (core interaction) per topic first** — weeks of work on the right interaction + concept sequence so learning "feels like flow."
- Then they mass-produce **carefully calibrated problem variations** (the unglamorous but essential part): enough variations to master each idea, enough edge cases, a smooth difficulty ramp.
- Problems are **structured/configurable assets**, not blobs of HTML. A designer can tweak a config (layout, parameters) and regenerate variations. This is exactly the project brief's point #1.
- Everything goes through **human review for correctness** — a single wrong problem can reinforce a misconception or shake confidence. (For Phase 2 AI: verify against subject logic / a math engine; never let AI emit a wrong answer.)

**Implication for our content model:**
- Represent a lesson as **data** — an ordered list of typed steps, each with: a prompt, an interaction type + its config/parameters, the correct answer/validation rule, and authored feedback for right/wrong (and hints).
- Keep interaction *types* as reusable components; instances are just config. This is what lets you add lessons fast (and lets AI generate them later in Phase 2).
- Validation/correctness logic lives with the content, decoupled from rendering.

### Sketch of a lesson content schema (illustrative, not prescriptive)

```jsonc
{
  "id": "slope-intro",
  "course": "visual-algebra",
  "title": "What is slope?",
  "concept": "Slope measures steepness: rise over run.",
  "prerequisites": ["coordinate-plane-basics"],
  "steps": [
    {
      "id": "step-1",
      "kind": "explore",            // explore | predict | solve | sort | build
      "prompt": "Drag the line. Watch the slope value change.",
      "interaction": {
        "type": "slider-graph",     // reusable component id
        "config": { "min": -3, "max": 3, "start": 1 }
      },
      "feedback": { "onExplore": "Steeper line = bigger slope number." }
    },
    {
      "id": "step-2",
      "kind": "solve",
      "prompt": "Make a line with slope 2.",
      "interaction": { "type": "plot-line", "config": { "grid": 10 } },
      "answer": { "rule": "slope == 2", "tolerance": 0.0 },
      "feedback": {
        "correct": "Yes — for every 1 right, the line goes up 2.",
        "incorrect": "Not quite. Slope 2 means up 2 for every 1 across.",
        "hint": "Count the rise for a run of 1."
      }
    }
  ]
}
```

### Suggested data entities (persistence layer)
- `User` (auth: id, name/email)
- `Course` / `Lesson` / `Step` (content, can be static JSON to start)
- `Progress` (user × lesson → completed steps, current step for resume)
- `Attempt` (user × step → correct?, count, timestamp) → feeds mastery
- `Mastery` (user × concept → score/state) → drives next-step recommendation
- `Streak` (current count, last-active date, charges) + `DailyActivity`
- `XP`/`Milestones` (optional for MVP)

---

## 10. Mapping Brilliant → the MVP Gate (Phase 1, no AI)

Hard rule: **no AI in the MVP.** Prove the core teaches on its own. Checklist:

| MVP requirement | Brilliant principle it comes from |
|---|---|
| Chosen subject + specific user persona | §1 one subject, go deep |
| One interactive lesson on a real concept | §3 anatomy of a lesson |
| ≥1 directly-manipulated problem (drag/slider/plot/reorder) | §4 interaction types |
| A visual element that responds in real time | §2.2, §4 |
| Instant, specific, hand-written feedback (right & wrong) | §5 feedback |
| Progress persists; resume mid-lesson | §6, §8 |
| Accounts + names (auth) | §8 |
| Works on mobile screen sizes | §8 |
| Deployed + public | (project requirement) |
| Course path + mastery + next-step recommendation | §6 |
| Streaks + milestones + daily progress | §7 |

**Performance targets (test on deployed app):** feedback <100ms · visuals 60 FPS · first interaction <2s · touch on mobile · multiple concurrent learners.

**Depth over breadth:** 4–6 lessons that build on each other and genuinely teach > 30 shallow ones. Build *one great lesson first*, by hand, then extend the path.

---

## 11. Recommended Build Order (from the brief, aligned to phases)

1. One interactive lesson driven by a **content model** (data, not HTML). ← hardest, do first
2. Instant feedback incl. helpful responses to wrong answers.
3. Progress + persistence across sessions.
4. Course path + mastery tracking + next-step recommendation.
5. Streaks + milestones.
6. *(Phase 2)* AI features grounded in lesson state (problem gen, targeted hints, adaptive path, plain-language wrong-answer explanations) — verified against subject logic / math engine. App must still work with AI off.
7. *(Phase 3)* Learning science: retrieval practice, spaced repetition, interleaving, mastery learning, scaffolding/desirable difficulty, sharper explanatory feedback.

---

## 12. Suggested Tech (recommended, not required)

- **Frontend:** React/Vue/Svelte. Interactive visuals via **HTML5 Canvas, SVG, D3, or Konva.js**. (Brilliant uses Rive for animated path/character feel.)
- **Backend/auth/persistence:** Firebase, Supabase, or a custom server.
- **Content:** structured JSON lesson format (so lessons are data + AI-generatable later).
- **Phase 2 AI:** OpenAI / Anthropic Claude for generation & hints, **+ a math engine (SymPy / math.js) for ground-truth checks.**
- **Deploy:** Vercel, Firebase Hosting, or Render.

---

## 13. Choosing a Subject + Persona (open decisions — for later)

The brief makes **subject + persona the most important decision.** Bar for a good subject: *teachable through hands-on interaction and visuals*, and you can build several real lessons this week.

Candidate subjects (with the interaction that makes them shine):
- **Algebra / Visual Algebra** — drag terms, balance equations, plot lines. Very visual, clear right/wrong, easy mastery signals.
- **Probability & Statistics** — simulations, sampling, draggable distributions. Great "watch it respond" payoff.
- **Physics (mechanics / circuits / pendulum)** — sliders on a sim. High wow-factor, slightly more sim-physics work.
- **Geometry** — drag points, measure angles, transform shapes. Naturally manipulable.
- **Programming / logic puzzles** — fill-in/reorder code, run-and-check. Strong instant-feedback fit.
- **Logic & deduction** — grids, truth tables. Light on rendering, heavy on clever problem design.

When picking, also pin down the **persona**: who exactly (age, goal, prior knowledge, context)? The whole app is designed around them. (Decision still pending — feeds the PRD.)

> Next: user decides subject + persona + drafts 4–6 lessons → writes PRD → hand to agent for an implementation plan.

---

## 14. Spiky Takeaways

- The **interactive lesson is the hard, valuable part.** If the lesson doesn't teach without AI, no AI will save it. Build that first and make it genuinely good.
- **Interaction must teach the idea, not decorate it.** A slider that changes a graph the learner reasons about > a slider that just looks cool.
- **Wrong answers are a teaching moment**, not a failure state. The quality of wrong-answer feedback is most of the magic.
- **Content as data** is the unlock: it makes adding lessons cheap now and AI generation possible later.
- **Retention is engineered** (streaks/XP/leagues/game-feel), but it's worthless if the core lesson doesn't teach. Order: teach → smart → sticky.
- **Depth beats breadth.** One subject, a real learning path, each lesson earns its place.
