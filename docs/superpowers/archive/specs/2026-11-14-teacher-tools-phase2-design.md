# Teacher tools Phase 2: forms items, points, generators

Written 2026-11-14. Source: `docs/teacher-tools/plan.md` (Phase 2) and `student-integration.md`.
The morphology engine in `src/lib/morph/` is finished and is used as it is.

**This spec was not brainstormed with the owner.** The owner asked for the work to proceed unattended, so
every open question below was answered by the author. Each answer is marked *Assumed* and can be changed.

## Goal

A teacher can publish a forms assignment (synopsis, paradigm chart, principal parts, parse-this-form,
make-this-form), students do it online with partial credit, and the teacher can print it with an answer key.

## Pilot questions (plan.md), as assumed

1. **Textbook.** Not needed for this phase. Words come from the built-in pools (`trainerPool()`,
   `CORE_NOUNS`, `CORE_ADJECTIVES`, `PRONOUNS`). *Assumed.*
2. **Paper or screens.** Both: the owner asked for online and print.
3. **Meaning rows and macrons.** No meaning rows on synopses in this phase: they need a person to grade them,
   and the grading queue is Phase 4. Macrons are ignored, as everywhere else (the engine emits forms without
   macrons). *Assumed.*
4. **Accommodations** and 5. **JCL/NLE exams**: Phase 5, nothing here depends on them.

## Cut from Phase 2, and why

The plan's Phase 2 is too large for one phase. These are moved out:

| Cut | Why | Goes to |
|---|---|---|
| Sections and mixed-type assessments | Needs the `assessments` table and builder | Phase 3 |
| Per-student variants as pre-generated variant sets picked by the server | Needs sections. The existing sampling already gives each student a different draw when the pool is larger than the question count; that is what this phase offers | Phase 3 |
| Meaning rows, `strictMacrons`, teacher override | Need the grading queue | Phase 4 |
| `needs_review`, `graded_by`, `reason_codes` columns | Nothing writes them yet | Phase 4 |
| Noun-adjective pair paradigms (*vir bonus*) | Agreement logic not in the engine's generic API | Later |
| Words drawn from a teacher's vocab list | Needs lexicon-to-engine matching | Phase 3 |
| Grids in solo Practice → Forms, "try the wrong cells again" | Not needed for the teacher flow | Later |
| Item analysis by part (which cells are missed) | `parts` are stored now; the report is Phase 5 | Phase 5 |
| One-page-per-screen test runner with sectioned question grid | No sections yet | Phase 3 |

## Item types

`DrillQuestion` gains two members. Answers live in one top-level `key`, so the public shape is the question
without `key` (the server strips it with `- 'key'`).

```ts
export interface GridCell { id: string; given?: string }      // given = shown, not asked
export interface GridRow { label: string; cells: (GridCell | null)[] }  // null = no such form
export interface GridQuestion extends QuestionBase {
  type: 'grid';
  columns: string[];                 // header per column, same length as every row's cells
  rows: GridRow[];
  key: Record<string, string[]>;     // cell id -> accepted forms, for every cell without `given`
}

export interface ParseField { id: string; label: string; options: { value: string; label: string }[] }
export interface ParseQuestion extends QuestionBase {
  type: 'parse';
  fields: ParseField[];
  key: Record<string, string>[];     // every valid parse: field id -> option value
}
```

Give-the-form is the existing `typein` from `makeFormQuestion`; no new type.

**Given.** `type Given = string | Record<string, string>`: a string for `mc`/`typein`, cell id → text for
`grid`, field id → option value for `parse`.

**Grading.** One function, mirrored in SQL:

```ts
export interface Grade { right: number; outOf: number; parts: { id: string; ok: boolean }[] }
export function grade(q: DrillQuestion, given: Given): Grade
export function earnedPoints(g: Grade, points: number): number   // round(points * right / outOf, 2)
```

- `mc`, `typein`: one part with id `answer`; `outOf` 1.
- `grid`: one part per key cell, in row order; a cell is right when `normalize(given[id])` equals a
  normalized accepted form.
- `parse`: one part per field. The student's answer is compared with every parse in `key`; the parse with
  the most matching fields is used (ties: the first). So *puellae* accepts genitive singular, dative
  singular or nominative plural, and a student who mixes two readings gets credit for the better one.
- `isCorrect(q, given)` stays and means `right === outOf`.

**Points.** Each pool item has `points`. Defaults set by the generators: `mc`/`typein` 1, `parse` 1,
`grid` one per answer cell. Earned = `points × right / outOf`, rounded to 2 places.

## Schema (one new migration, additive)

- `assignment_pool.points numeric(8,2) not null default 1 check (points > 0)`.
- `responses.given_json jsonb`, `responses.earned numeric(8,2)`, `responses.possible numeric(8,2)`,
  `responses.parts jsonb`. Existing rows are backfilled: `given_json = to_jsonb(given)`,
  `earned = correct::int`, `possible = 1`. `given` (text) stays; for grid and parse it is `''`.
  `correct` stays and is `earned = possible`.
- `attempts.score` and `attempts.total` change from `int` to `numeric(8,2)`. `total` is the sum of the
  points of the attempt's items; `score` the sum of `earned`.
- `grade_parts(q jsonb, given jsonb) returns jsonb` → `{"right", "outOf", "parts"}`, the SQL twin of
  `grade`. `grade_item(jsonb, text)` stays for old callers.
- `start_attempt`: `total` = sum of points of the sampled items.
- `get_attempt_items`: also returns `points`; the hidden shape also drops `key`.
- `record_practice_response_v2(p_attempt_id, p_pool_id, p_given jsonb, p_ms)` returns
  `{earned, possible, correct, parts}`. The old text function stays and calls the new one.
- `submit_test`: reads `given` as JSON (a string or an object, so old clients keep working), stores the
  new columns, returns `score`/`total` in points.
- `finish_practice`: score = sum of `earned`.
- `gradebook`: `best_score` and `total` become `numeric`.
- `item_analysis`: unchanged in shape; `top_wrong` skips responses whose `given` is empty, so grid and
  parse items show a percentage and no wrong-answer list.

Cloud sessions cannot reach the LatinIQ database, so the migration is written and tested against a local
Postgres with `npm run test:db`, and **the owner applies it locally before this branch is deployed**. The new
client calls `record_practice_response_v2`, which does not exist until then.

## Generators (`src/lib/formsItems.ts`)

Pure functions `(config, rng) → PoolItem[]` (with `points` on each item), run in the teacher's browser at
publish, like `buildVocabQuestions`. They use only the engine's public API.

| Kind | Config | Item |
|---|---|---|
| `synopsis` | verbs; person and number (fixed, or all six so each student draws one); parts: indicative, subjunctive, imperative, infinitives, participles; `giveFirst` | `grid`: one row per tense (and one per non-finite form), columns Active / Passive (only the voices the verb has) |
| `paradigm` | words (verb, noun, adjective or pronoun); for verbs the tense, mood and voice sets; for adjectives the degrees; include vocative or not; given cells: none, first, or *n* random | `grid`: verb tense = persons × Singular/Plural; noun = cases × Singular/Plural; adjective = cases × M/F/N per number; pronoun by its own cells |
| `principalParts` | verbs | `grid`: one row, a column per part, first part given |
| `parse` | a `FormsConfig` filter and optional word list; count | `parse`: the form, the dictionary entry, fields from the cell's features |
| `make` | the same | `typein` from `makeFormQuestion` |

Rules:

- Perfect passive finite forms and compound infinitives accept the feminine and neuter participle too, as
  `makeFormQuestion` already does.
- A parse item's `key` is every analysis of the form within the same word that has the same field set as
  the drawn cell. Verbs that have no passive get no Voice field. Parse items for verbs are drawn from finite
  cells (indicative, subjunctive, imperative).
- Item keys are stable and readable (`syn|moneo|3|plural`), so the pool's unique constraint also removes
  duplicates.
- `parse` and `make` generate up to three times the requested count (bounded by what exists), so students
  draw different items. Synopsis with "all six" persons does the same.

## Student side

1. **Renderer registry** (`src/features/items/`): one entry per item type with `Input` (controlled
   `value`/`onChange`, optional feedback state), `Review`, `PrintCopy`, `PrintKey`, plus `isAnswered` and
   `emptyGiven`. `DrillSession`, `TestRunner`, `AttemptReview` and `PrintAssignment` stop branching on
   `q.type`. This lands first with no behaviour change and the existing tests unchanged.
2. **Grid input**: a real table on wide screens; at ≤ 640px one card per row with the column name beside
   each input. Given cells are greyed text, `null` cells a dash. Tab order follows rows. Macron buttons are
   not needed (macrons are optional).
3. **Parse input**: one segmented button group per field; groups wrap on phones.
4. **Practice feedback** for grid and parse: the student fills the item and presses Check; each cell or
   field turns right or wrong and wrong ones show the correct value; the Feedback bar says "7/10 correct".
5. **Structured given everywhere**: `useDrill`, the offline queue, the test autosave and the API carry
   `Given`. Queue jobs saved by the old client (string `given`) still flush.
6. **Points**: the Results page shows "18.5/24 · 77%"; the Class page row and the teacher gradebook use the
   same numbers. Review shows the student's grid with right and wrong cells and the correct forms, and the
   parse with every valid reading when answers are revealed.

## Teacher side

- `AssignmentBuilder` gets a third content choice, **Forms**, with a panel for the five kinds. Word picker:
  search the built-in pool by dictionary entry or meaning, "add 5 random", remove. The panel shows the pool
  size and total points per attempt. `AssignmentSource` gains `{ kind: 'forms'; config }`.
- `publishAssignment` writes `points`.
- **Print**: grids print as bordered tables with blank cells (student copy) and filled cells (key); parse
  items print the form with a labelled blank per field, and the key lists every valid parse. A new option,
  "Different questions on each version", redraws from the pool per version when the pool is larger than the
  question count; otherwise versions differ by order, as now.
- Attempt detail and item analysis render the new types through the registry.

## Testing

- Vitest: `grade` cases (also listed in the SQL test so both graders are held to the same table), generator
  output checked against the engine for model words, registry components, the builder panel, print.
- `npm run test:db`: migration, `grade_parts`, points through `start_attempt` / `submit_test` /
  practice, no `key` before submit, old-client call shapes.
- `npx tsc -b`, `npm run build`, solo Playwright suite still green.

## Not verified in this phase

No cloud session can run the classroom flow against the real backend. The end-to-end path (publish a
synopsis, take it as a student, see the gradebook) has to be checked by the owner after the migration is
applied.
