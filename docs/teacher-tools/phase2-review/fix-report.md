# Phase 2 fix wave: report

Final checks: `npm test` 74 files / 778 tests pass; `npx tsc -b` clean; `npm run build` ok;
`PGBIN=/usr/lib/postgresql/16/bin npm run test:db` PASS for functions, lexicon, rls.

Note: while I worked, a commit "wip: Phase 2 review fixes in progress" (86cfab5) appeared on the branch with my
changes. I did not make it. One later edit (the TS null fix in src/lib/bestAttempt.ts) is uncommitted on top of it.

| Fix | Status | Files | Covered by |
|---|---|---|---|
| F1 hidden id | done | migration (get_attempt_items) | functions.test.sql "hidden item does not contain its own item_key", "...2nd to 4th parts", "hidden item id is the pool row id", "revealed item keeps its own id". Seen red first. Client: TestRunner/RunAssignment key by pool_id or the question object, DrillSession keys by q.id (still unique per pool row). Nothing else reads q.id. The existing `id === item_key` generator test is untouched. |
| F2 gradebook | done | migration (gradebook), src/lib/bestAttempt.ts, src/features/student/api.ts | functions.test.sql (9/10 vs 8/30 gives 9, 10, same attempt id; tie goes to the later one); src/lib/bestAttempt.test.ts |
| F3 hidden review crash | done | src/features/items/registry.tsx | AttemptResult.test.tsx (typein and mc hidden) |
| F4 isRevealed | done | src/lib/grading.ts (`isRevealed`), AttemptResult.tsx | AttemptResult.test.tsx (grid revealed/hidden, parse revealed/hidden, through AttemptReview) |
| F5 oversized | done | migration (submit_test, record_practice_response_v2; errcode P0001, limit 20000 chars of given::text) | functions.test.sql, both functions, plus a normal answer still accepted |
| F6 search_path | done | migration (grade_parts stays immutable; Postgres accepts `set search_path` on it) | functions.test.sql checks pg_proc.proconfig |
| F7 earnedPoints | done: no callers outside tests, deleted with its test | grading.ts, grading.test.ts | tsc/npm test |
| F8 variants | done | src/lib/formsItems.ts (`acceptedPart`), formsItems.test.ts | moneo (monitus, monitum) and hortor (hortatus sum, hortatus); existing key test updated |
| F9 count default | done: the review matched the code (`formsDefault` was 1) | AssignmentBuilder.tsx | AssignmentBuilder.test.tsx (synopsis of one verb now defaults to 6, the pool size) |
| F10 wide grids | done | GridItem.tsx (`data-wide="true"` when columns > 4), classroom.css | GridItem.test.tsx (attribute); CSS not browser-tested |
| F11 label beside input | done | GridItem.tsx (td content wrapped in `.grid-cell`), classroom.css (td flex, label 5.5em) | CSS only, not browser-tested |
| F12 marks | done | GridItem.tsx (`Mark`: check/cross with role=img and aria-label Correct/Incorrect), ParseItem.tsx (aria-hidden check/cross before the existing Right/Wrong tag) | GridItem.test.tsx, ParseItem.test.tsx |

## Deviations and notes
- F10-F12 UI code was written before its tests; I then wrote tests that pass but did not see them red. CSS has no visual check
  (no browser run). Please look at it on a phone width.
- F10: wide grids stay as cards up to 900px; between 901px and about 1000px a six-column grid is still a table with narrow
  inputs (the brief fixed the breakpoint at 900). The new mark beside each input in review/practice takes a little width there.
- F8: the supine variant is added to any 4th part ending in "us" (so "futurus" also accepts "futurum"); acceptable but not exact.
- F2: SQL uses numeric division for the ratio; TS uses float division. Equal ratios compare equal in both for realistic values.
- The client best-attempt helper is covered by its own unit test; `listMyAssignments` itself has no test.
- Learner-visible text added: aria-labels "Correct" / "Incorrect"; glyphs check/cross. No other copy.
