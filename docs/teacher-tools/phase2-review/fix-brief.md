# Phase 2 fix wave: brief

Repo: /home/user/Latin-Trainer, branch claude/jolly-ritchie-xg28qj. Read CLAUDE.md first.

Two reports describe the defects in detail, with file:line and failing scenarios. Read both before coding:
- Review: docs/teacher-tools/phase2-review/review.md
- Phone check: docs/teacher-tools/phase2-review/phone-check.md

The migration supabase/migrations/20261114000001_points_and_structured_answers.sql has NOT been applied
to any real database, so edit it in place (do not add a second migration). Never edit older migrations.

Work test-first: for each fix write the failing test, see it fail, then fix. Decisions below are final;
where a report suggests a different fix, follow this brief.

## Fixes (all required)

F1 (review C1, answer leak). In `get_attempt_items`, when the item is returned in its hidden shape, also
overwrite the question's `id` with the pool row's id as text (`jsonb_set(..., '{id}', to_jsonb(pool_id::text))`),
so no generator can leak through `id`. The revealed shape keeps the original id. Check every client use of
`q.id` on test items (TestRunner, autosave, React keys) still works with that id. Add a SQL test: for an
open test attempt, no hidden item's JSON text contains its own `item_key`, and specifically a principal
parts item's JSON does not contain the 2nd-4th parts. Do not change `item_key` (students cannot read
assignment_pool) and do not weaken the existing `id === item_key` generator test.

F2 (review C2, gradebook). Best attempt = the submitted attempt with the highest score/total ratio
(ties: higher score, then most recent). `gradebook` must return `best_score` and `total` from that one
attempt, and `best_attempt_id` must be the same attempt. Apply the same rule in the client where the
student class page picks a best score (src/features/student/api.ts, around line 44), sharing one helper
if both TS call sites can use it. SQL test: attempts 9/10 and 8/30 report 9 and 10. Vitest for the client.

F3 (review I1). Review of a type-in or mc item whose answers are hidden must not crash: do not call
`correctDisplay` (or anything reading `answers`/`correct`/`key`) when the item is not revealed. Component
test with a public-shape typein question.

F4 (review I2). `revealed` in AttemptResult must be true for grid and parse items that carry `key`.
Prefer one small helper (e.g. `isRevealed(q)`) over repeating the property checks. Test: a revealed grid
shows the correct forms in wrong cells; a revealed parse shows every valid parse; a hidden one shows neither.

F5 (review I4). Reject oversized answers on the server in both `record_practice_response_v2` and
`submit_test`: raise an exception when `length(given::text) > 20000` for one response. SQL test for both.

F6 (review minor). Give `grade_parts` `set search_path = public` (keep it immutable if Postgres allows;
if not, say so in your report and keep whichever is correct).

F7 (review minor). `earnedPoints` in src/lib/grading.ts: if it has no callers outside tests, delete it
and its tests. If it has callers, make its rounding match SQL `round(numeric, 2)` (half away from zero)
and add a test with a half case.

F8 (review minor, Latin). Principal parts grids: for the 4th part accept both the `-us` participle and
the `-um` supine (monitus / monitum); for deponents accept the 3rd part with or without `sum`
(hortatus sum / hortatus). The key (first accepted form) stays as the engine prints it. Tests for
moneo and one deponent.

F9 (review minor). Forms question count default of 1: follow the review's description and make the
default match the other content kinds' behaviour (the pool size capped the same way they are). If the
report's description turns out not to match the code, leave it and say so.

F10 (phone defects 1 and 2). Grids with more than 4 columns use the card layout up to 900px wide
instead of 640px, so the 6-column adjective grid never renders as a cramped table; and `.grid-answer` /
`.grid-correct` get `overflow-wrap: anywhere` so long answers cannot widen the page. Implement with a
class or data attribute on the grid (e.g. `data-wide`) set from the column count, and CSS media queries;
no JS resize listeners.

F11 (phone defect 3). In the card layout the column label sits beside its input (label left, input
filling the rest of the row), as the spec says, not above it.

F12 (phone defect 4). Right and wrong grid cells and parse fields must not rely on colour alone: add a
visible mark (check / cross) with an accessible text alternative. Keep the existing colours.

## Not in this wave (do not do)

Gerundive in deponent synopses, a word picker for parse/make, making `earned`/`possible` NOT NULL,
grader parity on hand-made pool rows. Do not touch docs/.

## Done means

- `npm test`, `npx tsc -b`, `npm run build` pass; `PGBIN=/usr/lib/postgresql/16/bin npm run test:db` passes.
- Do NOT commit. Leave the changes in the working tree.
- Do not dispatch subagents.
- Write a report to /tmp/claude-0/-home-user-Latin-Trainer/db5ffdd8-df4e-5749-8a03-5dd5a78129fe/scratchpad/phase2-fix-report.md:
  per fix F1-F12: done / not done, files touched, the test that covers it, and anything you decided
  differently from this brief and why. Your final message: status (DONE / DONE_WITH_CONCERNS / BLOCKED),
  one line of test counts, and any concerns. Nothing else.
