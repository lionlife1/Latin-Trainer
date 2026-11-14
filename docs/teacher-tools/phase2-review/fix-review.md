# Phase 2 fix wave: review and follow-ups

Review of the fix wave (F1 to F12, diff since `786dcd5`) on 2026-11-14. Two reviewers ran: Opus for F1, F2,
F5 and F6, and Sonnet for the rest. The F10 to F12 layout was rechecked in Chrome (`phone-recheck.md`).

## Verdicts

- F1: the `get_attempt_items` change is correct and tested. The reviewer marked it "wrong" because of the
  `assignments.source` finding below; it was downgraded and parked.
- F2, F5: correct, with notes (follow-ups below).
- F3, F4, F6, F7, F11, F12: correct.
- F8, F9: correct, with notes.
- F10: failed in the browser. Practice and test pages cap content at 680px (`.drill-body`), so a 6-column
  grid was still a squeezed table at 901px and wider, and 4-column principal parts clipped long forms. Fixed
  as G1.

## Follow-ups done in this wave (G1 to G7)

- G1: grids with 4 or more columns get `data-wide`. Inside `.drill-body` they always use cards; on the
  review page they use cards up to 900px and a table above. Recheck 2 passed at 375 to 1024px.
- G2: a 4th part in -urus no longer also accepts -um (`sum` accepts *futurus*, rejects *futurum*).
- G3: test that the forms question count is capped at 20.
- G4: multiple-choice choices of module questions are shuffled at publish. The answer was stored first in
  44% of the 285 questions and the hidden shape keeps stored order.
- G5: `bestAttempt` orders a null score or zero total last, as the SQL does (`nulls last`).
- G6: SQL test that an equal ratio goes to the higher score (5/10 beats a later 1/2).
- G7: `maxLength=200` on the inputs where students type answers (type-in, grid cells), so the server's
  20,000-character limit (F5) is only a backstop.

## Parked (decision for the owner)

- **`assignments.source` is readable by enrolled students.** For a forms assignment it holds each word's
  full entry (for a verb, all four principal parts). A student who queries the REST API directly can read it.
  Parked because the same answers are already public: `lexicon` and `questions` are readable by everyone, so
  this is no worse than looking the word up. Closing it means column grants on `assignments` and a
  teacher-only way to read `source`, which is a design change. Candidate for Phase 3.

## Not verified

- `npm run test:db` was not run: this machine has no Postgres 16 or psql. The SQL changes and the new G6 case
  were reviewed by reading only. Run it before applying the migration.
