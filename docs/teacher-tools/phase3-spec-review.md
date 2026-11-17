# Phase 3 spec: review and decisions

Review of the DRAFT `docs/superpowers/specs/2026-11-14-teacher-tools-phase3-design.md` on 2026-11-14 by an
Opus reviewer, against handoff Step 4 and the code. Verdict: close to plannable, not ready. 1 Critical,
10 Important, 12 Minor. The orchestrator spot-checked C1, I1, I2 and I6 in the code (all hold) and accepted
every finding. Line numbers refer to the draft.

The owner, before the review, accepted the draft's own recommendations for its six open decisions and its
plan order (Schema → Renderers and student side → Library → Assessments).

## Critical

**C1. The parked `assignments.source` exposure is not closed** (draft 167-168, 207-211, 595). Students can
select every column of `assignments` (`20261031000002_rls.sql:90-91,111`); for an old forms assignment
`source` holds each word's full entry. Nothing in the client reads `source`; teachers load assignments with
`select('*')` (`src/features/teacher/api.ts:56,58`), students with the column list `A_COLS`
(`src/features/student/api.ts:31`). Plain column grants would make the deployed teacher pages fail
("permission denied for column source") between applying the migration and merging.

Decision: a teacher-only side table plus a trigger, which keeps old clients working.
- `assignment_sources (assignment_id uuid primary key references assignments on delete cascade, source
  jsonb not null)`, RLS `is_class_teacher(assignment_class(assignment_id))`, explicit grants.
- An `after insert or update of source` trigger on `assignments` (security definer,
  `set search_path = public`) that, when `new.source - 'kind' <> '{}'::jsonb`, upserts the full source into
  `assignment_sources` and updates the row to `jsonb_build_object('kind', new.source->>'kind')`. The guard
  stops the trigger re-firing on its own update. (An after trigger, because a before trigger cannot insert
  the child row: the parent does not exist yet.)
- A one-time backfill moves existing sources. This is the one deliberate change to old rows.
- SQL test: a student's `select source from assignments` returns only `{"kind": ...}`; the teacher reads the
  full source from `assignment_sources`.

## Important

- **I1. Macron-only options grade as the same answer** (271-273, 325, 342, 347, 516). `latin_normalize`
  strips macrons (`20261031000003_functions.sql:4-7`), so in choice-inline `puella|puellā` the wrong option is
  graded right; `print.ts:34` picks the key letter the same way. Decision: choice-inline options get
  positional ids (`o1`…, shuffled at publish), `key` maps blank id → option id, graded by exact id like
  `match`. `validateTeacherItem` rejects MC choices, choice-inline options and match right entries that are
  equal after `normalize` ("Two options differ only in macrons; use choose-the-form instead"). Grader cases
  for both go in the shared case file.
- **I2. Pool lookup by `pp1` misses all 136 hand-written verbs** (405-407, 415). `trainerPool()` is `VERBS`
  plus uncovered `CORE_VERBS` (`src/lib/conjugator.ts:182-186`); hand-written verbs have no `pp1`
  (`src/lib/morph/types.ts:25-26`). Decision: index verbs by `lemmaKey` of the first principal part as
  `principalParts`/`entryOf` prints it (`pp1`, else `firstPart`, else `IRREGULAR_PARTS`). Test that *sum,
  esse, fuī, futūrus* and *amō, -āre* resolve `via: 'pool'`.
- **I3. Plan 1 cannot pass `tsc`** (313-314, 651-656). `ITEM_RENDERERS` is a full `Record` over
  `DrillQuestion['type']` (`registry.tsx:138`). Decision: Plan 1 adds placeholder registry entries for the
  four types ("This question type is not available yet"); Plan 2 replaces them.
- **I4. "Matching sets of 5" (accepted) is not designed** (189, 524, 635-636, 670-674). Decision: vocab
  source gets `formats: ('l2e' | 'e2l' | 'match5')[]`; `buildVocabMatch(items, rng)` makes sets of 5
  headwords and definitions, item key `vocab-match:<sorted item ids>`, 1 point per pair; duplicate
  definitions in a set share one right id (I5). *Assumed:* the Vocab quiz template gets a Matching section.
  Task added to Plan 4.
- **I5. Duplicate right-column text in `match`** (291-295, 327, 345). Decision: `toQuestion` dedupes right
  texts by `normalize`; pairs with the same right text key to the same right id. Grader case added.
- **I6. Parse/make variants rarely reach N** (382-388). `buildDrawn` makes `count * 3` items
  (`src/lib/formsItems.ts:338`). Decision: `buildFormsPool` takes an optional `target`; the variant builder
  asks for `count × N`. In a section, the section's `count` is used and the config's own `count` is ignored.
- **I7. Practice mode delivers every key** (71-72, 331-333). `get_attempt_items` reveals in practice
  (`20261114000001:154`) because `DrillSession` grades locally. Decision: "Leaks checked" says practice mode
  delivers keys by design and only test mode is secure; the assign dialog says under Practice "Students can
  see answers as they go; use Test for graded work."
- **I8. Teacher API reads not updated** (574-581, 211-212). Decision: `getAssignmentPool` selects
  `section, variant, position`; `AssignmentRow` gains `assessment_id, kind, instructions, sections,
  settings`.
- **I9. Module sections must keep G4's shuffle** (365). Decision: `modules` →
  `shuffleModuleChoices(modulePool(...), rng)`; both move to `src/lib/assessment.ts`.
- **I10. Variant count when one section cannot fill 2** (386-387). Decision: N = the smallest count among
  sections that can fill at least 2; a section that cannot is published without variants (sampling) and the
  teacher is told.

## Minor (all accepted)

- M1 (496): `ModulesSource` and `VocabSource` are extracted from inline JSX in `AssignmentBuilder.tsx:156-201`.
- M2 (559): the teacher attempt page uses `AttemptReview`, not `AttemptResult`; put per-section lines and
  grouping there, and fetch `assignments.sections` for headings.
- M3 (423): verbs use `shortGloss` (`scripts/lexicon/verbs.ts:95`); move it too. A list item's
  `definition_override` counts as the list's definition.
- M4 (120-121): tag check also needs `array_position(tags, null) is null and '' <> all(tags)`.
- M5 (154): size checks on `assignments.sections` (`jsonb_array_length <= 20`, `octet_length`) and a type
  check on `settings`.
- M6 (129): name the new trigger function `public.touch_updated_at()` with `set search_path = public`.
- M7 (561): state `answerIsHtml` and `showsScore` for each new type.
- M8 (14-16): the fix wave has landed (`4318138`, `11bd88e`); drop the hedge.
- M9 (503): preview shows variant A with a version switcher.
- M10 (648): Plan 1 needs `npm run test:db`; with no Postgres 16 the plan stops before its last task and says
  so in `OPEN-WORK.md`.
- M11 (367, 207): add `fromStoredFormsConfig(config, pools)` to turn stored words back into `MorphWord`s.
- M12 (432): pin the coverage numbers in the coverage test, not the spec.
