# Population Path — Learn the Demographic Transition Model by doing

> **Live app:** https://brilliantclone-b4a2a.web.app

> **Subject:** AP Human Geography — the **Demographic Transition Model (DTM)**, taught Brilliant-style: no videos, no AI, just interactive problems with instant feedback. Built for a 14–15 year old studying for the AP exam (and the curious).

This is the **Phase 1 MVP**: a deployed, mobile-first, learn-by-doing web app with three interactive lessons that build on each other, auth, persistent progress, a mastery-gated course path, and a daily streak. It teaches the DTM with **zero AI** (per the project brief's hard rule for Phase 1).

## The course

A single course — *The Demographic Transition Model* — with three lessons:

1. **The Engine of Growth** — drag a handle across the 5 stages and watch the gap between the birth and death curves drive population growth. Includes a historical view of England 1700s→today.
2. **Reading Population Pyramids** — reshape a pyramid (drag its base and top) and classify real countries (Niger, USA, Japan) by their age structure.
3. **From Farms to Factories to Offices** — drag the primary/secondary/tertiary employment split and connect a country's job mix to its DTM stage (including a one-family generational story).

Each lesson is a sequence of interactive steps (explore → predict → solve → connect) with instant, hand-written feedback on every answer.

## Tech stack

- **React + TypeScript + Vite**
- **Tailwind CSS** (mobile-first), **Framer Motion** (animations/celebration)
- **Custom SVG + d3-scale** for all interactive visuals (rate graph, population pyramid, sector bars) — one shared, 60fps, touch-friendly primitive
- **Firebase** — Auth (email/password + Google) and Cloud Firestore (progress, mastery, streaks), Firebase Hosting
- **Zustand** for app state, **React Router** for routing

Lessons are **data** (typed `Lesson`/`Step` objects), not hardcoded UI, so new lessons are cheap to add and the model is ready for AI generation in a later phase.

## Architecture overview

```
src/
  types/         content.ts (Lesson/Step schema), interaction.ts, progress.ts
  content/       lessons/*.ts (the 3 lessons) + index.ts (course + lookups)
  lib/           dtm.ts (model math), validators.ts (per-type, outcome-based),
                 mastery.ts, streak.ts, persistence.ts, firebase.ts, svg.ts
  store/         authStore.ts, progressStore.ts (Zustand)
  components/
    interactions/  RateGraph, PopulationPyramid, SectorBars, MultipleChoice,
                   InteractionRenderer (dispatch on interaction.type)
    lesson/        LessonRunner (step engine), FeedbackBar, StepProgress, Celebration
    path/          CoursePath, LessonNode
    habit/         StreakBadge
    auth/          AuthGate (route guard)
    common/        Spinner
  routes/        HomePage, LessonPage, LoginPage
  App.tsx, main.tsx, index.css
```

Data flow: `LessonRunner` renders a step's `interaction` via `InteractionRenderer`, captures the learner's state, runs a pure validator (`lib/validators.ts`) that returns an *outcome*, and shows outcome-keyed hand-written feedback. Progress, mastery, and streak changes flow through `progressStore` to Firestore (or localStorage for guests).

### Content model (key idea)

```ts
type Interaction =
  | { type: 'rate-graph'; config: RateGraphConfig }
  | { type: 'population-pyramid'; config: PyramidConfig }
  | { type: 'sector-bars'; config: SectorConfig }
  | { type: 'multiple-choice'; config: McConfig };
// validators return { correct, outcome?, detail? }; feedback is keyed by outcome.
```

## Setup

Requirements: Node.js 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

The app runs **without** Firebase — it falls back to a local guest account stored in `localStorage`, so you can try every lesson immediately.

### Enable accounts + cross-device sync (Firebase)

1. Create a Firebase project and a **Web app**; copy the config.
2. `cp .env.example .env` and fill in the `VITE_FIREBASE_*` values.
3. In the Firebase console: enable **Authentication** (Email/Password + Google) and create a **Cloud Firestore** database.
4. Restart `npm run dev`.

## Deploy (Firebase Hosting)

```bash
npm run deploy     # vite build + firebase deploy --only hosting
```

Make sure `.firebaserc` points to your project ID (`firebase projects:list` to check). Firestore security rules live in `firestore.rules` (each user can read/write only their own data) and deploy with `firebase deploy --only firestore:rules`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run type-check` | TypeScript check (no emit) |
| `npm run preview` | Preview the production build |
| `npm run deploy` | Build + deploy to Firebase Hosting |

## MVP scope

In scope (Phase 1): 3 interactive lessons, instant hand-written feedback, progress + resume, course path with mastery and next-step recommendation, streaks, auth, mobile, deploy.

Out of scope (later phases): all AI features, full spaced-repetition/learning-science layer, the world-map "Place the Country" lesson, population-pyramid anomalies lesson, leagues/XP. See `prd.md` for the full breakdown.
