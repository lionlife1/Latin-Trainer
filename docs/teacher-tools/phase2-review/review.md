# Teacher tools Phase 2: whole-branch review

Scope: `git diff origin/main..HEAD` (10 commits, 49 files). Read-only review against the spec
`docs/superpowers/archive/specs/2026-11-14-teacher-tools-phase2-design.md`. No tests were run by the reviewer.

Summary: **2 Critical, 4 Important, 9 Minor.** Verdict: **fix first.**

---

## Critical

### C1. A principal-parts test item gives away its answers in `question.id` before the test is submitted

- `src/lib/formsItems.ts:248-249`: `item_key = \`pp|${wordKey(w)}\`` and `question.id = item_key`.
- `wordKey` (`formsItems.ts:31-33`) is `${kind}:${normalize(entryOf(w))}`. For a verb, `entryOf` returns
  `principalParts(w.verb)` (`src/lib/morph/index.ts:45`, `verbs.ts:455-460`): the full answer.
- `get_attempt_items` hides an item by removing `answers`, `correct`, `explanation` and `key`
  (migration lines 159-160). It does not remove `id`.

Failing scenario: a teacher publishes a Principal parts test on *moneo*. A student starts the attempt and
calls `get_attempt_items`, or opens the network tab. The item comes back as
`{"id":"pp|verb:moneo, monere, monui, monitus", "type":"grid", "prompt":"…moneo…Principal parts", …}`.
The id holds all four parts, and the prompt shows only the first. The test is worth nothing.

This does not happen with the other kinds, because their prompts already show `entryOf(w)`. The leak is
still a trap waiting for the next generator. The test in `formsItems.test.ts:173`
(`expect(it.question.id).toBe(it.item_key)`) requires the leaking id.

Fix: give the question an id that does not depend on the answer, such as a short hash of `item_key`. Or
strip `id` from the hidden shape in `get_attempt_items` as well, but the client keys React lists by
`q.id`. Add an SQL test that the hidden question text for a pp item does not contain the 2nd part.

### C2. The gradebook pairs the best score with a total from a different attempt, and picks the "best" attempt by raw points

- Migration `gradebook`, lines 276-280: `max(t.score), max(t.total)` are separate aggregates, and
  `best_attempt_id` orders by `t.score desc`.
- Student side: `src/features/student/api.ts:44` also picks `best` by raw `score`.
- Before this branch every attempt had `total = n`, so this was harmless. Now `total` is the sum of the
  points of the sampled items. Points vary by item: one per grid cell, so *puella* is 10 points, *bonus* is
  30, and a deponent synopsis has fewer cells than a regular one.

Failing scenario: a paradigm assignment with question_count 1 and a pool of {puella (10 cells), bonus
positive (30 cells)}, max_attempts 2.
- Attempt A draws puella and scores 9/10 (90%).
- Attempt B draws bonus and scores 12/30 (40%).
- The gradebook and the CSV show **12/30** (score from B, total from B by coincidence), not 9/10. If B had
  scored 8/30, it would show **9/30**, a pair that no attempt has.
- The score links to attempt B. The student's own page shows B, "12/30 · 40%".

Fix: in `gradebook`, choose one best attempt per student and assignment, ordered by
`score/nullif(total,0) desc, submitted_at desc`, for example with a lateral/`distinct on`. Return that
attempt's `score` and `total` together. Make the same change in `listMyAssignments`.

---

## Important

### I1. The student's result page crashes for any submitted test with a type-in item while answers are hidden

- `src/features/items/registry.tsx:35`: `ReviewBody` calls `correctDisplay(q)` on every render.
- `correctDisplay` for a type-in reads `q.answers[0]` (`grading.ts:80`).
- The hidden shape has no `answers`, so this throws `TypeError`.
- Before this branch the call was inside the `revealed && !correct &&` guard, so it never ran on hidden
  items.

Failing scenario: a test with `reveal_answers` on, attempts left, and no due date passed (the normal case).
The student submits and opens `/s/attempt/:id`, or "Results" from the class page. `AttemptReview`
throws and the page is blank. The tests do not catch it: `AttemptResult.test.tsx` only uses revealed
questions.

Fix: compute `shown` only when `revealed && !correct`, or make `correctDisplay` tolerate a missing
`answers`/`key`. Add a test with a hidden type-in item.

### I2. Correct forms and valid parses never show in review, for students or for the teacher

- `src/features/student/AttemptResult.tsx:20`: `revealed = 'answers' in q || 'correct' in q`. Grid and
  parse items carry `key`, so `revealed` is always false for them.
- `GridItem.tsx:163` and `ParseItem.tsx:137` then never show the correct form or the valid parses.
- This also affects `AttemptDetail`, which reuses `AttemptReview` with the full question, and
  practice-mode assignments.

The spec requires this: "Review shows the student's grid with right and wrong cells and the correct
forms, and the parse with every valid reading when answers are revealed". The component tests pass
`revealed` directly, so they miss it.

Fix: `revealed = 'answers' in q || 'correct' in q || 'key' in q`, plus a test through `AttemptReview`.

### I3. Merging before the migration is applied breaks publishing, result pages and grid tests, not only practice saves

`.github/workflows/pages.yml` deploys on every push to `main`. `docs/OPEN-WORK.md:18-22` says only that
practice answers fail to save if the client is deployed first. In fact, until the migration runs:
- `publishAssignment` inserts a `points` column that does not exist, so **every** publish fails, including
  module and vocab assignments.
- `getResponses` selects `given_json, earned, possible, parts`, so the student result page and the teacher
  attempt detail fail with a PostgREST 400.
- The old `submit_test` reads `e ->> 'given'` as text, so grid and parse answers are graded wrong.

Fix: apply the migration to the LatinIQ project **before** merging the PR. Say so in the PR description
and in OPEN-WORK. The alternative is to make the client tolerate the old schema, which is not worth it.

### I4. A student can store answers of any size

The old code capped `given` at 500 characters (`left(..., 500)`). The new code stores
`given_json = coalesce(r.given, 'null')` as sent (migration lines 186-187 and 238). Nothing limits its size
or keys.

Failing scenario: a student calls `submit_test` or `record_practice_response_v2` with a `given` object
holding thousands of keys or multi-megabyte strings. It is stored for good in `responses`, which the
teacher's screens read back.

Fix: before inserting, keep only the keys the question has (cell ids or field ids) and trim each value to
about 100 characters, or reject when `pg_column_size(p_given)` is over a few KB.

---

## Minor

1. **The TypeScript and SQL graders can disagree on hand-made questions.**
   - TS `grade()` for a grid counts only cells that appear in `rows`, have no `given` and have a key entry.
     It counts a cell id twice if it appears twice.
   - SQL `grade_parts` counts every key entry once, including ids missing from the rows or on a given
     cell.
   - In SQL, a `key` that is not an object, or `fields` that is not an array, raises an error and aborts
     the whole `submit_test`.
   - The generators never produce these shapes (the invariant test in `formsItems.test.ts:170` covers
     them), so only a teacher who writes pool rows through the API can hit this.
   - Optional fix: put the TS rule in SQL (key ids that are answer cells in the rows) and guard with
     `jsonb_typeof`.
2. **`earnedPoints` rounds differently from SQL `round(numeric, 2)`, but no production code calls it.**
   It uses binary floating point: `earnedPoints({right:1,outOf:2},0.03)` gives 0.01, SQL gives 0.02.
   Other cases: (0.06, 7/12) gives 0.03 against 0.04, and (0.04, 21/24) gives 0.03 against 0.04. The server
   is authoritative, so this only matters if the function is used later. Fix it by rounding
   `points*100*right/outOf` as an integer ratio.
3. **`grade_parts` has no `set search_path`** and calls `latin_normalize` unqualified. It is not security
   definer, so this is a linter warning (Supabase advisor `function_search_path_mutable`), not a hole.
4. **`responses.earned` and `possible` stay nullable after the backfill.** Consider `set not null`.
5. **Principal parts accept one exact form.** The 4th part accepts only `monitus`, not the supine
   `monitum` that Wheelock-style books use. A deponent's 3rd part must include `sum`. This was a decision
   made without the owner and should be listed in OPEN-WORK.
6. **A deponent synopsis has a single "Forms" column**, so the gerundive (future passive participle)
   never appears.
7. **No word picker for parse and make.** The spec's config lists "optional word list". The generator
   supports `words`, but `FormsSource` does not offer it.
8. **The forms question count defaults to 1 for synopsis, paradigm and principal parts**
   (`AssignmentBuilder.tsx`, `formsDefault`). A teacher who picks five verbs gets one chart per student
   unless they change the count. The spec says nothing here, but the default is surprising; consider the
   number of chosen words.
9. **SQL test coverage gaps.**
   - "No key before submit" checks only for `key` and `answers` keys, not the item text (it would not catch
     C1).
   - Nothing checks that grid and parse items keep their `key` after a reveal.
   - No old-client `submit_test` with a string `given` on a grid item.
   - No fractional rounding case (1 point, 1/3 cells, giving 0.33).
   - No gradebook case with different totals across attempts (C2).

---

## Checked and found sound

- **Security-definer functions.**
  - `start_attempt`, `get_attempt_items` and `finish_practice` keep their ownership checks.
  - `submit_test` and `record_practice_response_v2` keep theirs through `own_open_attempt`, which also
    blocks a second submission.
  - All set `search_path = public`.
  - `get_attempt_items` and `gradebook` are dropped and created again, then revoked from public/anon and
    granted to authenticated.
  - `record_practice_response_v2` is revoked from public and anon and granted to authenticated.
  - `grade_parts` is granted to anon, like `grade_item`; it is a pure function with no table access.
- **Forging scores.** `earned` and `possible` are computed only on the server. RLS still gives students no
  write access to `responses` or `attempts`. The `parts` a student can read after submitting carry only
  `ok` flags, not answers.
- **Migration.**
  - The int-to-numeric change on `attempts.score/total` has no dependent views, indexes or policies.
  - `gradebook` is replaced with numeric columns. `item_analysis` does not need a change, because its
    existing `latin_normalize(given) <> ''` already skips grid and parse responses.
  - The backfill is correct.
  - Old call shapes keep working: `record_practice_response(text)` calls v2, and `submit_test` accepts a
    string `given`.
- **Grader parity on normal input.** Both sides treat these the same way:
  - Macrons, case and whitespace, through the shared normalize and the existing fixture.
  - Blank or non-string cells, string given for grid/parse, object given for mc/typein.
  - Parse ties (strict `>`, first wins), field order, and `outOf = 0`.
- **Generators.**
  - The parse key is every analysis of the form within the word that has the same field set.
  - Verbs without a passive get no Voice field; deponents get none either.
  - Parse cells are finite only.
  - Perfect passive and compound infinitives accept feminine and neuter through `acceptedForms`.
  - Item keys are stable.
  - Parse and make generate 3× the count, bounded.
  - "All six" gives six synopsis items.
- **Client.**
  - The offline queue flushes old string jobs (tested).
  - `TestRunner` autosave holds objects and loads old string answers (tested).
  - A partly filled grid is submitted.
  - `recordPractice` treats a missing v2 function as retryable, not permanent.
  - Print: grid and parse copies and keys, "different questions per version", points total.
