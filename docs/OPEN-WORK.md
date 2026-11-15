# Open work

Reviewed 2026-11-14 against `main` at `4b478fd`, then updated the same day for teacher tools Phase 2 and
its review fixes on branch `claude/jolly-ritchie-xg28qj`. On that branch `npm test` (783 tests),
`npx tsc -b`, `npm run build` and the solo Playwright suite (15 tests) pass. `npm run test:db` passed before
the review fixes and has not been run since (see Phase 2, to-do 1). This page lists what is left, with the
source of each item.

## 1. Teacher tools, Phases 2 to 5

Source: `docs/teacher-tools/plan.md` and `student-integration.md`. Each phase needs its own spec and plan.

### Phase 2: built, not yet deployed or checked end to end

Built on 2026-11-14 (spec and plan: `docs/superpowers/archive/`, `2026-11-14-teacher-tools-phase2`): `grid`
and `parse` items, points and structured answers, the five forms generators, the Forms panel in the
assignment builder, print.

**To do on the owner's computer before this is deployed:**

1. **Apply the migration before merging the PR.** `main` deploys on every push
   (`.github/workflows/pages.yml`), so merging first puts the new client on the live site against the old
   schema. Until `supabase/migrations/20261114000001_points_and_structured_answers.sql` is applied to the
   LatinIQ project (`supabase db push`):
   - publishing **any** assignment fails, module and vocab ones included (the insert sends a `points`
     column that does not exist);
   - the student result page and the teacher attempt detail fail (they select `given_json`, `earned`,
     `possible` and `parts`);
   - grid and parse answers in tests are graded wrong (the old `submit_test` reads `given` as text);
   - practice answers fail to save (`record_practice_response_v2` does not exist).

   Run `npm run test:db` first: the fix wave (F1 to F12, G1 to G7) changed the migration and its SQL tests
   were reviewed by reading only, because the machine that made them had no Postgres 16.
2. Check the whole path once against the real backend, which no cloud session can do: publish a synopsis,
   take it as a student in practice and in test mode, look at the result, the gradebook, the attempt detail
   and the print page.
3. Look at a grid on a real phone (375px) on the real route. The layout was checked at 375 to 1024px in
   Chrome with a test harness (`docs/teacher-tools/phase2-review/phone-recheck.md`), not on a phone.

**Parked from the Phase 2 review** (`docs/teacher-tools/phase2-review/review.md` and `fix-review.md`):

- `assignments.source` is readable by enrolled students. For a forms assignment it holds each word's full
  entry (all four principal parts of a verb), so a student who queries the REST API directly can read it.
  No worse than `lexicon` and `questions`, which everyone can read. The owner chose to close it in Phase 3
  (column grants and a teacher-only way to read `source`).
- A deponent synopsis has a single "Forms" column, so the gerundive never appears.
- No word picker for parse and make: the generator takes `words`, but the Forms panel does not offer it.
- `responses.earned` and `possible` stay nullable after the backfill (consider `set not null`).
- Grader parity on hand-made pool rows: on a grid with duplicate cell ids, ids missing from `rows`, or a
  key on a given cell, the TypeScript grader and SQL `grade_parts` count differently. Generated items never
  have these.

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
