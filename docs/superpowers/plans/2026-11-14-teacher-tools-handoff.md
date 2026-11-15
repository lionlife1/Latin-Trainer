# Teacher tools: handoff plan (Phase 2 finish, then Phase 3)

Written 2026-11-14 by the orchestrating session, for a new session to pick up. Branch:
`claude/jolly-ritchie-xg28qj`, which was fast-forwarded to the Phase 2 branch (`claude/eager-mayer-rsdbnr`).

How to work: the main session plans, adjudicates and commits. Subagents do the code, the review and the
verification (see the Delegation table in `CLAUDE.md`). The owner asked for review by subagents too.

## Where things stand

Done:

- Phase 2 verified on this branch: 766 unit tests, `tsc -b`, build, `npm run test:db` (local Postgres 16),
  solo Playwright (15 pass, 1 classroom test skipped: it needs the real backend).
- Whole-branch review of Phase 2 (Opus): `docs/teacher-tools/phase2-review/review.md`. Verdict: fix first.
  2 Critical, 4 Important, 9 Minor.
- Phone-width check of grid and parse inputs in a real browser:
  `docs/teacher-tools/phase2-review/phone-check.md`. 2 real defects, 2 minor.
- The fix decisions for all of the above: `docs/teacher-tools/phase2-review/fix-brief.md` (F1 to F12).

State of the fix wave:

- The implementer finished F1 to F12 (commits `86cfab5` and the one after it; its own report is
  `docs/teacher-tools/phase2-review/fix-report.md`). It reports 778 unit tests, `tsc -b`, the build and
  `test:db` passing. **None of this has been reviewed or independently verified.**
- Its own concerns: the F10 to F12 CSS and UI tests were written after the code and nothing was checked in
  a browser; a six-column grid between about 901px and 1000px is still a cramped table; F8 lets any 4th
  part in -us accept -um (for example *futurum*).
- The Phase 3 spec draft: if finished it is at
  `docs/superpowers/specs/2026-11-14-teacher-tools-phase3-design.md`, marked DRAFT. If that file does not
  exist, the draft was lost with the session and Step 5 starts from Step 4's scope.

## Step 1: finish the Phase 2 fix wave

1. Read the fix report. Re-run the phone harness check for F10 to F12 (the method is in
   `phone-check.md`), including a 6-column grid at 950px.
2. Dispatch a reviewer (Sonnet is enough; Opus for F1, F2 and F5, which touch the migration) on the diff
   since `786dcd5`, with the fix brief as the spec. Fix what it finds.
3. Run the `verifier`: `npm test`, `npx tsc -b`, `npm run build`,
   `PGBIN=/usr/lib/postgresql/16/bin npm run test:db`, `npx playwright test --trace off`.
4. Commit and push.

The two that matter most:

- **F1, answer leak.** A principal-parts question's `id` contains all four principal parts, and
  `get_attempt_items` does not strip `id`. Fix: the hidden shape replaces `id` with the pool id.
- **F2, gradebook.** `gradebook` takes `max(score)` and `max(total)` from different attempts (9/10 and
  8/30 show as 9/30). Fix: both come from the attempt with the best ratio.

## Step 2: update the docs

In `docs/OPEN-WORK.md`, Phase 2 section:

- Replace to-do 1 with the stronger warning from review finding I3: `main` deploys on every push
  (`.github/workflows/pages.yml`). Until the migration is applied, publishing any assignment fails, result
  pages fail and grid and parse tests are graded wrong. **Apply the migration before merging the PR.**
- To-do 3 (phone check): done in a harness; the real route still needs a look on a real phone.
- Add the review's parked minors: no gerundive in a deponent synopsis, no word picker for parse and make,
  `earned` and `possible` nullable, grader parity on hand-made pool rows.

## Step 3: open the Phase 2 pull request

`claude/jolly-ritchie-xg28qj` into `main`. The owner asked for this PR. Do not merge it. The body must say:

- What Phase 2 adds, and what the review found and fixed.
- **Before merging:** apply `supabase/migrations/20261114000001_points_and_structured_answers.sql` to the
  LatinIQ project from the owner's computer (`supabase db push`). Merging first breaks the live site.
- **After merging:** check the flow once against the real backend (publish a synopsis, take it in practice
  and test mode, result, gradebook, attempt detail, print), and look at a grid on a real phone.

If the Phase 3 spec is committed on the same branch before the PR merges, it rides along. It is docs only.

## Step 4: Phase 3 scope (decided with the owner)

In:

- R1. `assessments`: a reusable document with title, instructions, kind (quiz, test, homework, practice
  set) and ordered sections. A section has heading, instructions, points per item, shuffle and a source.
  Sources: module questions, a vocab list, a forms generator config (today's three builder kinds, folded
  in and reusing their panels), and My questions (by hand, or "N random with tag X").
- R2. A builder ("Create") with a sections editor and a preview (student view, answer key; print is the
  existing print route extended to sections).
- R3. Templates: Vocab quiz, Synopsis quiz, Chapter test, Blank; and save-as-template.
- R4. Library: My questions (teacher-written, private, tagged, optional explanation) in the types `mc`,
  `typein`, `tf`, `match`, `cloze`, `choice-inline`. Vocab lists move under Library in the nav.
- R5. Tags: built-in tags following the NLE syllabus, plus teacher custom tags.
- R6. The four new item types through the whole stack: types, public shapes, `Given`, the TypeScript
  grader and its SQL twin with per-part credit, registry renderers, print, 375px layouts.
- R7. Assign an assessment to a class with delivery settings. Items are generated in the teacher's browser
  at publish and snapshotted into `assignment_pool` with their section. Old assignments keep working.
- R8. Forms generators can use words from a teacher's vocab list. A lexicon entry carries its morphology
  only in the headword text (`abdō, -ere, -didī, -ditus`), so this needs a headword-to-`MorphWord`
  conversion (see how `scripts/build-seed.ts` builds the `CORE_*` pools) and a report to the teacher of
  words that could not be converted.
- R9. Server-picked variant sets: a generated section with "different words per student" publishes N
  complete variants with the same structure and points; `start_attempt` picks one. Print versions A/B/C
  map onto variants.
- R10. Student side: section outline on the intro card, question grid grouped by section, section
  instructions in the runner, kind tag on the Class page, per-section scores on the result page.

Out:

- `short` items: Phase 4, with the grading queue.
- Passages, `translate`, derivatives: Phase 4 and 5.
- Practice → Vocab study sets: the owner did not select it; stays in `OPEN-WORK.md` section 3.
- "Answer N of M" sections, sharing between teachers, `strictMacrons`, teacher override, accommodations,
  analysis by tag.

Constraints:

- One new, additive migration after `20261114000001`. New tables use owner RLS like `vocab_lists`.
- Students never receive a key before submit. Lesson from Phase 2: no visible field, `id` included, may
  encode an answer.
- The server has no morphology engine; keys are computed in the browser at publish.
- The TypeScript and SQL graders are tested from one shared table of cases.
- One renderer per item type through `src/features/items/registry.tsx`; no `q.type` branching elsewhere.
- No drag and drop, no rich text editor.

Facts about the code that the design depends on:

- Types: `src/lib/types.ts` (`DrillQuestion`, `Given`, `PublicQuestion`); `PoolItem` in `src/lib/vocab.ts`;
  `AssignmentSource` and `publishAssignment` in `src/features/teacher/api.ts`.
- `start_attempt` samples `assignment_pool` with `order by random() limit n` into `attempt_items`
  `(attempt_id, position, pool_id)`.
- `assignments` has had no column added since the first schema; `assignment_pool` gained `points`.
- Forms words come only from `defaultFormsPools()` (`src/lib/formsQuestions.ts`): `trainerPool()`,
  `CORE_NOUNS`, `CORE_ADJECTIVES`, `PRONOUNS`. None are linked to the `lexicon` table.
- Nothing named assessment, section, tag or template exists yet as data.
- Teacher routes: `src/features/teacher/TeacherRoutes.tsx`; nav in `src/components/ClassroomShell.tsx`.

## Step 5: Phase 3 spec, then the owner reads it

1. If the DRAFT spec exists, have an Opus reviewer check it against Step 4 and against the code, then
   revise. If not, dispatch an Opus agent to write it from Step 4, using the Phase 2 spec in
   `docs/superpowers/archive/specs/` as the model for length and tone. Decisions made without the owner
   are marked *Assumed*.
2. Commit the spec to `docs/superpowers/specs/` and **stop**. The owner wants to read it before any
   implementation, and will decide then whether an Opus session executes it.

## Step 6: Phase 3 implementation (after the owner approves the spec)

Split into four plans in `docs/superpowers/plans/`, executed in order, each verified on its own:

The order follows the spec's "Implementation order" (chosen 2026-11-14: the student screens are built against
fixture data next to the renderers, so they do not wait for the builder):

1. Schema, item types and graders: the migration (including closing the `assignments.source` exposure),
   the four new types with placeholder renderers, both graders, the shared case table.
2. Renderers, print and the student side: registry entries for the four types, phone layouts, sectioned
   print, intro outline, sectioned question grid, kind tags, per-section results.
3. Library: vocab-list words in forms, tags, My questions and its editor, Library in the nav.
4. Assessments: sections and sources, variants, the builder and preview, templates, publish and assign,
   `AssignmentBuilder` retired.

Per task: `implementer` (Sonnet) writes it test-first, a reviewer subagent checks it against the plan
task, the `verifier` (Haiku) runs the suites, the main session commits. Text that students read goes to
`latin-content-writer`. Finish each plan with a whole-plan review on Opus.

The migration cannot be applied from a cloud session. Each plan that changes SQL ends with a note in
`OPEN-WORK.md` saying what the owner has to run locally.
