# Open work

Reviewed 2026-11-14 against `main` at `4b478fd`, then updated the same day for teacher tools Phase 2 on
branch `claude/eager-mayer-rsdbnr`. On that branch `npm test` (766 tests), `npx tsc -b`, `npm run build`,
`npm run test:db` and the solo Playwright suite (15 tests) pass. This page lists what is left, with the
source of each item.

## 1. Teacher tools, Phases 2 to 5

Source: `docs/teacher-tools/plan.md` and `student-integration.md`. Each phase needs its own spec and plan.

### Phase 2: built, not yet deployed or checked end to end

Built on 2026-11-14 (spec and plan: `docs/superpowers/archive/`, `2026-11-14-teacher-tools-phase2`): `grid`
and `parse` items, points and structured answers, the five forms generators, the Forms panel in the
assignment builder, print.

**To do on the owner's computer before this is deployed:**

1. Apply `supabase/migrations/20261114000001_points_and_structured_answers.sql` to the LatinIQ project
   (`supabase db push`). The new client calls `record_practice_response_v2`, which does not exist before
   that, so practice answers fail to save if the client is deployed first.
2. Check the whole path once against the real backend, which no cloud session can do: publish a synopsis,
   take it as a student in practice and in test mode, look at the result, the gradebook, the attempt detail
   and the print page.
3. Look at a grid on a phone (375px). The card layout was written from the spec and tested only in jsdom.

**Decided without the owner** (the spec was not brainstormed; change any of these):

- Words come only from the built-in pools, not from a textbook or a teacher's vocab list.
- No meaning rows on synopses; macrons are ignored.
- Points: one per grid cell, one per parse item, one per typed or multiple-choice item. A parse item gives
  partial credit per field, against the best-matching valid parse.
- A student gets different questions from a classmate only when the pool is larger than the question count.

**Cut from Phase 2:**

- Sections and mixed-type assessments; pre-generated variant sets picked by the server (Phase 3).
- Words drawn from a teacher's vocab list (Phase 3).
- Meaning rows, `strictMacrons`, teacher override, `needs_review` / `graded_by` / `reason_codes` (Phase 4).
- Item analysis by part (the `parts` are stored; the report is Phase 5).
- Noun-adjective pair paradigms (*vir bonus*).
- Grids in solo Practice, and "try the wrong cells again".
- The one-page-per-screen test runner with a sectioned question grid (Phase 3).

### Later phases

- Phase 3: builder, library, teacher-written items, tags.
- Phase 4: passages, translation, grading queue.
- Phase 5: accommodations, analysis by tag, NLE and JCL practice templates.
- Left over from Phase 1: check the Gimkit and Blooket export layouts against fresh templates (they were
  written from memory), Kahoot export, large-print options, tags and "combine lists".
- The five pilot questions at the end of the plan are still unanswered by the owner.

## 2. Verb and Forms follow-ups

Source: `docs/trainer-core-verbs-followups.md` (details there).

- Review the hand-made `INTRANSITIVE` list.
- The engine gives passive forms for intransitive verbs that are not on that list (*sedeor* from
  *sedeo*), so forms assignments can ask for them.
- Verbs with no perfect are excluded; *poscere* has no passive.
- Known limits: masculine-only perfect passives in Endless, some wrong future participles (*ruitūrus*),
  no plural-only nouns, numerals or locatives in Forms.

## 3. Student features deferred by the specs

- Class vocab lists as study sets, and spaced repetition for them.
- Translation practice.
- README roadmap: video lessons with checkpoints, Microsoft school sign-in, a live class game mode.

## 4. Housekeeping

- `npm ci` reports 8 audit findings (2 critical, 1 high, 5 moderate). Not triaged.
- The main bundle is 640 kB, over Vite's 500 kB warning.
