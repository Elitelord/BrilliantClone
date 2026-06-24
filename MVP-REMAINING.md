# MVP Remaining Work

Minimum bar: **PDF Phase 1 gate** (deployed, public, learn-by-doing app with auth, persistence, mobile, zero AI).  
Your `prd.md` goes further (3 lessons, mastery path, streaks) — most of that is already built in code.

Legend: **Required (PDF Phase 1)** · **Optional (PRD polish / later phases)** · **Accepted (no action needed for MVP)**

---

## What you need to do (manual / account / deploy)

These require your Firebase project, credentials, or judgment. An AI cannot complete them without your accounts.

### Required — PDF Phase 1 blockers

| Task | Status |
|------|--------|
| **Create / configure Firebase project** | Done (`brilliantclone-b4a2a`) |
| **Enable Authentication** | Done (you confirmed) |
| **Create Firestore database** | Done (you confirmed) |
| **Copy `.env.example` → `.env`** and fill `VITE_FIREBASE_*` values | Done (you confirmed) |
| **Deploy Firestore rules + Hosting** | Done — https://brilliantclone-b4a2a.web.app |
| **Run the 5 PDF acceptance tests on the live URL** | **You** — see checklist below |
| **Commit and push to GitHub** | **You** — repo still mostly uncommitted |
| **Add deployed URL to README** | Done |

### PDF acceptance test checklist (run on deployed app)

- [ ] Complete one lesson end-to-end; get problems wrong; recover using feedback
- [ ] Manipulate an interactive element; visual responds in real time
- [ ] Leave mid-lesson; return later — progress and streak persist
- [ ] Finish a lesson — home path recommends a sensible next step
- [ ] Full flow on a phone-sized screen (or DevTools mobile emulation)
- [ ] Hand to someone unfamiliar with DTM — do they actually learn? (qualitative)

### Optional — not required for PDF Phase 1

| Task | Notes |
|------|-------|
| Record demo video (3–5 min) | Full submission (Sunday deadline in brief), not Phase 1 gate |
| Write 1-page Brainlift | Full submission |
| Configure custom domain on Firebase Hosting | Nice polish |
| Set up Firebase App Check | Extra abuse protection; not in PDF gate |
| Add ESLint + Prettier | PRD tooling suggestion; not in PDF gate |
| Password reset / email verification in UI | Security polish; not in PDF gate |

---

## What to have an AI do (code / content / automation)

Hand these to Cursor (or similar) in follow-up sessions.

### Required — if anything breaks after your deploy

| Task | Notes |
|------|-------|
| **Fix Firestore rule rejections** | If writes fail after deploy, rules may need tuning to match exact document shapes |
| **Fix auth / merge edge cases** | Guest → account merge is implemented; report bugs if progress doesn't carry over |

### Optional — PRD polish (not PDF Phase 1 unless noted)

| Task | PDF impact |
|------|------------|
| Wire `stepsNeedingReview()` into recommendations | PRD asks for review after repeated wrong answers; **not explicit in PDF gate** |
| Restore authored wrong-answer hints on MC / classify / curve-draw steps | Better pedagogy; PDF says "hint or explanation" — generic retry messages may be weak |
| Code-split bundle (Firebase, Framer Motion) | Helps **first interaction < 2s** performance target |
| Add Vitest smoke tests for validators + mastery | PRD tooling; not PDF gate |
| Show concept mastery or daily goal progress on home | PRD extras |
| Streak freeze/charges UI | Brilliant parity; not MVP |
| Locked-lesson toast on home when redirected from URL | UX polish |
| Update README interaction list (currently outdated) | Docs only |

### Accepted — no fix needed for PDF Phase 1

| Topic | Rationale |
|-------|-----------|
| **Client-side answer validation** | Answers live in the JS bundle by design for a static SPA. Fine for a learning app; only matters if progress were used for formal grading. Server-side validation would require Cloud Functions — out of PDF Phase 1 scope. |
| **Guest data in plain localStorage** | Expected for offline/local mode; progress is not sensitive PII. |

---

## Already fixed

| Issue | Fix |
|-------|-----|
| Lesson unlock bypass via URL | `LessonPage` redirects home if prerequisites incomplete |
| Logout leaves stale progress in memory | `authStore.logout()` calls `progressStore.reset()` |
| Guest → account loses progress | Pending guest merge on sign-up/sign-in |
| Firestore writes unvalidated | `firestore.rules` validates document shapes + bounds |
| TypeScript check failure | `LessonRunner` narrows `feedback` before `FeedbackBar` |
| **Resume / refresh lost slide index** | Mount race wrote `stepIndex=0` over saved progress; fixed with `restored` gate + immediate sync on hydrate. Local mirror now writes **before** Firestore. |

---

## Quick deploy reference

```bash
npm run deploy   # build + deploy hosting + firestore rules
```

Live URL: **https://brilliantclone-b4a2a.web.app**

After any code change, re-run `npm run deploy` and re-test the acceptance checklist.
