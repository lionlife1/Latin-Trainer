# Open work

Reviewed 2026-11-14 against `main` at `4b478fd`. On that commit `npm test` (708 tests), `npx tsc -b`,
`npm run build` and the solo Playwright suite (15 tests) pass. All seven plans in
`docs/superpowers/archive/plans/` are implemented. This page lists what is left, with the source of each item.

## 1. Classroom backend: exists, deployment state not verified

Source: student redesign plan, Task 10; README "Deploying".

- The LatinIQ Supabase project exists (per the owner, 2026-11-14). The Supabase connector cannot see it:
  it is connected to another account and shows only "Competition Productivity". Access is through a
  `.env` token on the owner's computer, in local sessions. See `CLAUDE.md`, "Supabase backend".
- Not checked in this review, because a cloud session cannot reach the project: whether all 8 migrations
  are applied, both seed files are loaded, the three edge functions are deployed, the Auth Site URL and
  rate limits are set, and the GitHub Actions Variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  are set so the public site runs in classroom mode. Check these from a local session.
- Never run against a real stack in review: `npm run test:db` and the classroom e2e (`E2E_SUPABASE=1`).

## 2. Teacher tools, Phases 2 to 5

Source: `docs/teacher-tools/plan.md` and `student-integration.md`. Each phase needs its own spec and plan.

- Phase 2: the morphology engine is built (`src/lib/morph/`). Still open: `grid`, `parse` and give-the-form
  item types, the schema change for structured answers and points, synopsis and paradigm generators online
  and in print, per-student variants.
- Phase 3: builder, library, teacher-written items, tags.
- Phase 4: passages, translation, grading queue.
- Phase 5: accommodations, analysis by tag, NLE and JCL practice templates.
- Left over from Phase 1: check the Gimkit and Blooket export layouts against fresh templates (they were
  written from memory), Kahoot export, large-print options, tags and "combine lists".
- The five pilot questions at the end of the plan are unanswered.

## 3. Verb and Forms follow-ups

Source: `docs/trainer-core-verbs-followups.md` (details there).

- Review the hand-made `INTRANSITIVE` list.
- Verbs with no perfect are excluded; *poscere* has no passive.
- Known limits: masculine-only perfect passives in Endless, some wrong future participles (*ruitūrus*),
  no plural-only nouns, numerals or locatives in Forms.

## 4. Student features deferred by the specs

- Class vocab lists as study sets, and spaced repetition for them.
- Translation practice.
- README roadmap: video lessons with checkpoints, Microsoft school sign-in, a live class game mode.

## 5. Housekeeping

- `npm ci` reports 8 audit findings (2 critical, 1 high, 5 moderate). Not triaged.
- The main bundle is 640 kB, over Vite's 500 kB warning.
