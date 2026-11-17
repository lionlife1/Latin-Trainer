# Open work

Reviewed 2026-11-15 on branch `claude/busy-cori-dlfb5n`. `npm test` (777 tests), `npx tsc -b`, `npm run build`
and the solo Playwright suite (15 tests) pass. This page lists what is left, with the source of each item.

## 0. To run locally

- `supabase/seed-lexicon.sql` was regenerated (verb, noun and core-row fixes). Apply it to the LatinIQ
  database from a local session; cloud sessions have no access.

## 1. Teacher tools, Phases 2 to 5

Source: `docs/teacher-tools/plan.md` and `student-integration.md`. Each phase needs its own spec and plan.

- Phase 2: the morphology engine is built (`src/lib/morph/`). Still open: `grid`, `parse` and give-the-form
  item types, the schema change for structured answers and points, synopsis and paradigm generators online
  and in print, per-student variants.
- Phase 3: builder, library, teacher-written items, tags.
- Phase 4: passages, translation, grading queue.
- Phase 5: accommodations, analysis by tag, NLE and JCL practice templates.
- Left over from Phase 1: check the Gimkit and Blooket export layouts against fresh templates (they were
  written from memory; the help pages are outside the cloud sessions' network allowlist, so do this
  locally), Kahoot export, large-print options, tags and "combine lists".
- The five pilot questions at the end of the plan are unanswered.

## 2. Verb and Forms follow-ups

Source: `docs/trainer-core-verbs-followups.md` (details there).

- The 2026-11-15 audit closed the intransitive review, *poscere*, Endless perfect passives, future
  participles, plural-only nouns and several noun, verb and adjective data errors.
- Still open: verbs with no perfect; Lodge plural-only nouns missing from the core lexicon (plan
  `2026-11-15-lodge-plural-nouns.md`); numerals and locatives in Forms; *memor* ablative.
- **Strict / exceptions mode**: keep exceptions (*vātum*, *ruitūrus*, *sitim*) out of normal drills and
  in a separate strict mode. Needs a spec.

## 3. Student features deferred by the specs

- Class vocab lists as study sets, and spaced repetition for them.
- Translation practice.
- README roadmap: video lessons with checkpoints, Microsoft school sign-in, a live class game mode.

## 4. Housekeeping

- Done 2026-11-15: `npm audit` is clean (vite 7, vitest 4, react-router 7); the main bundle is 47 kB
  (routes are lazy). A plain `npm install` crashes on npm 10.9 while resolving vitest 4's peers; use
  `npm install --legacy-peer-deps` to add packages (`npm ci` works as is).
- Grammar module M13 was reviewed with no changes needed.
