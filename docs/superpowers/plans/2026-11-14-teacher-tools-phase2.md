# Teacher tools Phase 2: implementation plan

Spec: `docs/superpowers/specs/2026-11-14-teacher-tools-phase2-design.md`. Read its "Item types", "Schema"
and "Generators" sections before any task; the type definitions there are binding.

Rules for every task: TDD, tests beside the code, `npx tsc -b` and `npm test` green before reporting, no
commits (the main session reviews and commits), do not edit applied migrations, do not change
`src/lib/morph/` (the engine is finished; report anything that looks wrong in it instead).

Order: 1 → (2, 3, 4 in parallel) → (5, 6 in parallel) → (7, 8 in parallel) → 9.

## Task 1: Types and the TypeScript grader

- [x] Done

Files: `src/lib/types.ts`, `src/lib/grading.ts`, `src/lib/grading.test.ts`, `src/lib/vocab.ts` (PoolItem).

1. In `types.ts` add `GridCell`, `GridRow`, `GridQuestion`, `ParseField`, `ParseQuestion` exactly as in the
   spec, add both to `DrillQuestion`, and extend `PublicQuestion` with `Omit<GridQuestion, 'key' | 'explanation'>`
   and `Omit<ParseQuestion, 'key' | 'explanation'>`. Add `export type Given = string | Record<string, string>`.
2. In `grading.ts` add `PartResult`, `Grade`, `grade(q, given)`, `earnedPoints(grade, points)` per the spec.
   `grade` must tolerate a wrong-shaped `given` (a string for a grid, an object for a typein, undefined
   fields): missing or wrong-shaped answers are simply wrong, never a throw. An empty or whitespace answer
   is wrong. Change `isCorrect(q, given: Given)` to `grade(...).right === grade(...).outOf`.
3. `correctDisplay(q)` currently returns a string for mc/typein. Keep that behaviour, and for `grid`
   return the accepted first forms joined with `, ` in row order; for `parse` return each valid parse as
   its option labels joined by spaces, parses joined with ` / ` (e.g. `genitive singular / dative singular`).
4. `PoolItem` in `vocab.ts` gets an optional `points?: number` (absent means 1).
5. Existing callers that narrow on `q.type === 'mc' ? … : …` will stop compiling. Fix each one minimally so
   behaviour for mc/typein is unchanged and grid/parse fall into a safe branch (render nothing or the
   `correctDisplay` text). Do not build renderers here; that is Tasks 4 and 5.

Grade table to test (Task 2 tests the same rows in SQL):

| Item | Given | right/outOf |
|---|---|---|
| typein answers `["amem"]` | `" Amēm "` | 1/1 |
| typein | `""` | 0/1 |
| mc correct `"y"` | `"x"` | 0/1 |
| grid key `{a:["amo"], b:["amas"], c:["amatus est","amata est"]}` | `{a:"amo", b:"amat", c:"AMATA  est"}` | 2/3, parts a ok, b not, c ok |
| same grid | `{}` and `"amo"` | 0/3 |
| parse key `[{case:"genitive",number:"singular"},{case:"dative",number:"singular"},{case:"nominative",number:"plural"}]` | `{case:"dative",number:"singular"}` | 2/2 |
| same parse | `{case:"nominative",number:"singular"}` | 1/2 |
| same parse | `{case:"ablative",number:"plural"}` | 1/2 (matches nominative plural on number) |
| same parse | `{}` | 0/2 |

`earnedPoints({right:2,outOf:3}, 3)` is 2; `earnedPoints({right:1,outOf:3}, 1)` is 0.33.

## Task 2: Migration and SQL tests

- [x] Done

Files: new `supabase/migrations/20261114000001_points_and_structured_answers.sql`,
`supabase/tests/functions.test.sql` (extend), `supabase/tests/_helpers.sql` (add fixtures only if needed;
do not change existing fixture rows, other tests count them).

Read `supabase/migrations/20261031000003_functions.sql` and `20261106000001_gradebook_best_attempt.sql`
first. Run with `npm run test:db` (Postgres 16 is at `/usr/lib/postgresql/16/bin`).

Implement the spec's "Schema" section in one migration:

1. Columns: `assignment_pool.points`, `responses.given_json/earned/possible/parts`, with the backfill.
   `attempts.score` and `attempts.total` to `numeric(8,2)`.
2. `grade_parts(q jsonb, given jsonb) returns jsonb`, immutable, returning
   `{"right": int, "outOf": int, "parts": [{"id": text, "ok": bool}]}`:
   - `mc`/`typein` (and any unknown type): one part `answer`, using the existing normalize rules; `given`
     may be a JSON string or anything else (anything else is wrong).
   - `grid`: one part per key of `q->'key'`, ordered by the cell order in `q->'rows'`; right when
     `latin_normalize(given->>cell)` is non-empty and equals a normalized accepted form.
   - `parse`: one part per element of `q->'fields'` in order; pick the element of `q->'key'` with the most
     matching fields (first on ties); a field is ok when `given->>field = key->>field`.
   - A `given` that is not an object for grid/parse gives all parts wrong.
3. `start_attempt`: `total` = sum of `points` of the sampled items (insert the attempt, insert items, then
   update the total; or compute in one statement).
4. `get_attempt_items`: drop and recreate returning `(pool_id uuid, "position" int, question jsonb, points numeric)`;
   the hidden shape is `question - 'answers' - 'correct' - 'explanation' - 'key'`.
5. `record_practice_response_v2(p_attempt_id uuid, p_pool_id uuid, p_given jsonb, p_ms int) returns jsonb`
   → `{"earned","possible","correct","parts"}` of the stored row (first answer wins, as now). Stores
   `given` = the string for a JSON string given, else `''`; `given_json`; `earned = round(points * right / outOf, 2)`;
   `possible = points`; `correct = (right = outOf)`. Redefine the old
   `record_practice_response(uuid, uuid, text, int)` to call v2 with `to_jsonb(p_given)` and return the boolean.
6. `submit_test`: read `e -> 'given'` as jsonb (absent → JSON null), store the same columns for every
   attempt item, `score` = sum of earned. Return `score`, `total`, `is_late`, `over_time` as now.
7. `finish_practice`: score = `coalesce(sum(earned), 0)`.
8. `gradebook`: drop and recreate with `best_score numeric, total numeric` (keep every other column and the
   `best_attempt_id` logic).
9. `item_analysis`: no shape change needed; confirm it still works when `given = ''`.
10. Grants: follow the pattern at the end of the functions migration for every created or recreated
    function (`revoke … from public, anon`, `grant execute … to authenticated`; `grade_parts` to `anon, authenticated`).

Tests to add (keep all existing assertions passing; change an existing assertion only where the type
change from int to numeric forces it):

- The grade table from Task 1, row for row, against `grade_parts`.
- A new test assignment (create it inside the test file, not in `_helpers.sql`) with a grid item worth 3
  points, a parse item worth 1 and a typein worth 1: `start_attempt` total is 5; `get_attempt_items` shows
  no `key` before submit and returns `points`; `submit_test` with 2 of 3 cells right, a fully right parse and
  a wrong typein gives score 3; the response rows have `earned`, `possible`, `parts`, `given_json`, and
  `correct` is false for the grid.
- `submit_test` still accepts the old `{"pool_id","given":"text"}` shape (the existing tests cover this;
  keep them).
- Practice: `record_practice_response_v2` returns parts; a second call for the same item returns the first
  result; the old text function still returns a boolean; `finish_practice` sums earned.
- `gradebook` returns the fractional best score.

## Task 3: Generators

- [ ] Done

Files: new `src/lib/formsItems.ts`, `src/lib/formsItems.test.ts`; `src/lib/formsQuestions.ts` (export
`genderVariants`/`takesGender` helpers, or one `acceptedForms(word, cell)` that both files use).

Depends on Task 1's types. Use only the engine's public API from `src/lib/morph` (`cellsOf`, `formsOf`,
`entryOf`, `meaningOf`, `cellLabel`, `cellFeatures`, `cellKey`, `parse`, `verbCells`, `hasVerbCell`,
`principalParts`, …) and `candidateCells` / `FormsConfig` / `defaultFormsPools` from `formsQuestions.ts`.

```ts
export type PersonNumber = { person: 1 | 2 | 3; number: 'singular' | 'plural' };
export type SynopsisPart = 'indicative' | 'subjunctive' | 'imperative' | 'infinitive' | 'participle';
export type GivenCells = 'none' | 'first' | number;       // number = that many random cells given

export type FormsAssignmentConfig =
  | { kind: 'synopsis'; words: MorphWord[]; personNumber: PersonNumber | 'all'; parts: SynopsisPart[]; giveFirst: boolean }
  | { kind: 'paradigm'; words: MorphWord[]; tenses: VerbTense[]; moods: ('indicative' | 'subjunctive')[]; voices: Voice[];
      degrees: Degree[]; vocative: boolean; given: GivenCells }
  | { kind: 'principalParts'; words: MorphWord[] }
  | { kind: 'parse' | 'make'; filter: FormsConfig; words?: MorphWord[]; count: number };

export function buildFormsPool(config: FormsAssignmentConfig, rng: () => number, pools?: FormsPools): PoolItem[];
/** Stable id for a word, used in item keys: kind + normalized dictionary entry. */
export function wordKey(w: MorphWord): string;
```

Every returned item has `points` set (grid: number of key cells; others 1), an `item_key` unique within
the result, and `question.id === item_key`. Prompts are HTML built with `escapeHtml`, in the style of
`makeFormQuestion` (the dictionary entry in `latin-word`, the task in a smaller second line).

- **synopsis** (verbs only; skip other words): one grid per verb and person/number (`'all'` → six grids).
  Columns are `['Active', 'Passive']`, or just `['Active']` when the verb has no passive finite forms (deponents
  count as one column, headed `'Forms'`). Rows by part, in this order, only for parts selected:
  indicative ×6 tenses (`Present` … `Future perfect`), subjunctive ×4 (`Present subjunctive` …),
  imperative (`Imperative`, present, 2nd person, in the grid's number), infinitives ×3
  (`Present infinitive`, `Perfect infinitive`, `Future infinitive`), participles ×3. A cell the verb does
  not have (check with `hasVerbCell`/`verbCells`) is `null`; a row whose cells are all null is dropped.
  Cell ids are the `cellKey` of the cell. `giveFirst` moves the first non-null cell from `key` to `given`.
  Badge `SYNOPSIS`. Prompt: entry, then e.g. `Synopsis: 3rd person plural`. Hint: the meaning.
- **paradigm**: per word.
  Verb: one grid per (mood, tense, voice) in the config that the verb has: rows `1st`, `2nd`, `3rd`, columns
  `Singular`, `Plural`. Prompt second line is the tense/mood/voice (reuse `cellLabel` wording minus person
  and number, or build it: `Imperfect active subjunctive`).
  Noun: rows are the cases (vocative only when `config.vocative`), columns `Singular`, `Plural`.
  Adjective: one grid per degree in the config; rows cases; columns `M sg.`, `F sg.`, `N sg.`, `M pl.`, `F pl.`, `N pl.`.
  Pronoun: rows cases; columns from its own cells (number, or gender × number), using the same heading style.
  `given`: `'first'` gives the first cell, a number gives that many random cells (never all of them).
  Badge `DECLENSION` or `CONJUGATION`.
- **principalParts** (verbs): split `principalParts(verb)` on `', '`; one row labelled `Principal parts`,
  columns `1st`, `2nd`, `3rd`, `4th` (as many as there are parts); the first is given; cell ids `pp1`…;
  each key is the single string for that part. Skip verbs with fewer than two parts. Badge `PRINCIPAL PARTS`.
- **parse**: draw `(word, cell)` pairs without repeating a form, from `words` if given (cells still filtered
  by `candidateCells(word, filter)`), otherwise from the pools by `filter.kinds` like `generateFormsQuestion`.
  Verb cells are limited to indicative, subjunctive and imperative. Fields are the cell's features in this
  order with these labels and options (only the features the cell has; no `voice` field when the verb has
  no passive):
  `person` Person: 1st, 2nd, 3rd · `number` Number: singular, plural · `tense` Tense: present, imperfect,
  future, perfect, pluperfect, future perfect · `mood` Mood: indicative, subjunctive, imperative ·
  `voice` Voice: active, passive · `case` Case: nominative, genitive, dative, accusative, ablative, vocative ·
  `gender` Gender: masculine, feminine, neuter · `degree` Degree: positive, comparative, superlative.
  Option values are the raw feature values (`'3'`, `'futurePerfect'`, `'m'`). `key` = for every analysis
  from `parse(form, [word])` whose cell has exactly the same field ids, its feature map restricted to the
  fields; de-duplicated; the drawn cell's own map first. Prompt: the form large, `from <entry>` below.
  Badge `PARSE`. Produce up to `count * 3` items, at least `count` when that many distinct forms exist.
- **make**: the same draw; items from `makeFormQuestion`, with `id` and `item_key` replaced by a stable key
  (`make|<wordKey>|<cellKey>`). Up to `count * 3`.

Tests (use real pool words, e.g. find *moneo*, *puella*, *bonus* in the default pools): a *moneo* 3rd
plural synopsis with indicative + subjunctive has 10 rows × 2 columns, 20 key cells, points 20, and
`key[<pluperfect passive indicative>]` contains `moniti erant` and `monitae erant`; a deponent has one
column; `giveFirst` removes exactly one key cell; a *puella* paradigm without vocative is 5 × 2 and
`key` for the genitive singular is `['puellae']`; an adjective grid has 6 columns; principal parts of
*moneo* has 4 cells, first given; a parse item for *puellae* has fields case and number and three key
entries; every parse key entry grades 100% through `grade`; every grid's `key` ids equal the ids of its
non-given, non-null cells; item keys are unique; the same seed gives the same pool.

## Task 4: Item renderer registry (no behaviour change)

- [ ] Done

Files: new `src/features/items/registry.tsx` (plus one file per type if it reads better),
`src/features/drill/DrillSession.tsx`, `src/features/student/TestRunner.tsx`,
`src/features/student/AttemptResult.tsx` (`AttemptReview`), `src/features/teacher/PrintAssignment.tsx`,
`src/features/teacher/ItemAnalysis.tsx`.

Move the per-type branches out of those five screens into a registry keyed by `q.type`:

```ts
export interface ItemRenderer {
  /** Practice: collects one answer and calls onSubmit; once `result` is set it shows the outcome. */
  Practice: React.FC<{ q: DrillQuestion; result?: { given: Given; grade: Grade }; onSubmit: (given: Given) => void }>;
  /** Test: controlled; the question has no answers. */
  Test: React.FC<{ q: PublicQuestion; value: Given | undefined; onChange: (given: Given) => void; onEnter?: () => void }>;
  /** Result review. `revealed` is false when the server withheld the key. */
  Review: React.FC<{ q: DrillQuestion | PublicQuestion; given: Given | undefined; parts?: PartResult[]; correct?: boolean; revealed: boolean }>;
  PrintCopy: React.FC<{ pq: PrintQuestion }>;
  PrintKey: React.FC<{ pq: PrintQuestion }>;
  /** For the test runner's progress and question grid. */
  answered: (q: PublicQuestion, given: Given | undefined) => 'none' | 'partial' | 'full';
}
export const ITEM_RENDERERS: Record<DrillQuestion['type'], ItemRenderer>;
export const rendererFor: (q: { type: DrillQuestion['type'] }) => ItemRenderer;
```

Adjust the prop shapes if the existing components need something else, but keep one registry and no
`q.type ===` branches in the five screens. Register `mc` and `typein` with the existing markup and class
names moved as they are. For `grid` and `parse` register a placeholder that renders
`<p className="muted">This question type is not supported yet.</p>` (Task 5 replaces it).

The existing tests for these screens (`DrillSession.test.tsx`, `TestRunner.test.tsx`,
`RunAssignment.test.tsx`, `PrintAssignment.test.tsx`, `practice.test.tsx`, `forms.test.tsx`, …) must pass
**without edits**. If one cannot, stop and report why. Add a small registry test (each type has an entry;
mc and typein render).

## Task 5: Grid and parse renderers

- [ ] Done

Files: `src/features/items/GridItem.tsx`, `src/features/items/ParseItem.tsx`, tests beside them,
`src/features/items/registry.tsx`, `src/styles/classroom.css` (or the stylesheet the drill screens use; put
shared item styles where both solo and classroom screens load them).

Replace the Task 4 placeholders. Spec sections "Student side" 2 to 4 and "Teacher side" (print) apply.

- **Grid, Practice/Test input**: `<table className="grid-item">` with a header row from `columns` and a row
  header from `row.label`. Given cells are plain greyed text, `null` cells an en dash, answer cells an
  `<input>` with `aria-label="<row label>, <column>"`, autocomplete/autocorrect/capitalize/spellcheck off.
  At ≤ 640px the table restyles so each row is a card and each cell shows its column name before the input
  (CSS only, e.g. `data-col` + `::before`); nothing scrolls sideways at 375px.
  Practice: a Check button (enabled once any cell has text) calls `onSubmit(values)`. With `result`, inputs
  are read-only, each has class `correct` or `wrong`, and a wrong cell shows the first accepted form beside
  it. Test: controlled, `onChange` with the whole cell map.
- **Parse, input**: the prompt already shows the form. One `role="radiogroup"` per field with
  `aria-label` = field label and a button per option (`aria-pressed`). Practice: Check enabled when every
  field has a choice. With `result`: each group marked right or wrong; below, "Also correct:" listing the
  other valid parses when the key has more than one.
- **answered()**: grid: none/partial/full by filled answer cells; parse: by fields chosen.
- **Review**: grid as a read-only table with the student's text, right/wrong classes from `parts`, and the
  accepted form in wrong cells when `revealed`. Parse: each field as `Label: chosen` with a right/wrong tag,
  and when `revealed` every valid parse listed. Show "x/y correct" from `parts`.
- **PrintCopy / PrintKey**: grid as a bordered table (`print-grid`) with empty cells tall enough to write in
  (given cells printed, null cells shaded); key = same table filled with the first accepted form (all
  accepted forms separated by ` / ` when there are several). Parse copy: the prompt, then one labelled
  blank per field; key: `correctDisplay(q)`.
- The practice Feedback bar for these types says `7/10 correct` instead of "Correct answer: …"; change
  `DrillSession`/`Feedback` only as far as that needs (e.g. an optional `summary` prop).

List every label or message a student reads in your report.

## Task 6: Builder panel for forms assignments

- [ ] Done

Files: new `src/features/teacher/FormsSource.tsx` + test, `src/features/teacher/AssignmentBuilder.tsx`,
`src/features/teacher/api.ts` (`AssignmentSource`, `publishAssignment` writes `points: p.points ?? 1`),
existing builder tests stay green.

- `AssignmentSource` gains `{ kind: 'forms'; config: StoredFormsConfig }` where the stored config is the
  `FormsAssignmentConfig` with each word replaced by `{ key: wordKey(w), entry: entryOf(w) }` (small, readable).
- The builder's Content radio gets a third option, **Forms**. Selecting it shows `FormsSource`, a controlled
  component: `({ value, onChange })` over `FormsAssignmentConfig`, defaulting to a synopsis with no words.
  - Kind: Synopsis · Chart (declension or conjugation) · Principal parts · Parse the form · Make the form.
  - Word picker for synopsis, chart and principal parts: a search input over the built-in pools
    (match the normalized text against the entry and the meaning; verbs only for synopsis and principal
    parts), results as buttons (max 8), chosen words as removable chips, and an "Add 5 random" button.
  - Synopsis: person/number select with "Different for each student" (= `'all'`) first, checkboxes for the
    parts (indicative and subjunctive on by default), "Give the first form".
  - Chart: tense/mood/voice checkboxes (shown when a verb is chosen), degree checkboxes (when an adjective
    is chosen), "Include the vocative", and given cells: None · First form · 2 random forms.
  - Parse / make: reuse the filter groups from `src/features/practice/forms/FormsSetup.tsx` (extract its
    option tables and group renderer into a shared component instead of copying them; `FormsSetup` keeps
    working and its tests stay unchanged), minus the Styles group, plus "Number of questions".
- The builder builds the pool with `buildFormsPool(config, Math.random)` when the config changes (memoised)
  and shows `Pool: N questions`; "Questions per attempt" defaults to 1 for synopsis, chart and principal
  parts, to `config.count` for parse and make, and is capped by the pool as now. Show the points one attempt
  is worth when all items have the same points, otherwise the range.
- Publish passes the pool (with points) and the `forms` source to `publishAssignment`.
- The module-question warning for tests does not apply to forms.

Tests: choosing Forms → Synopsis, adding a verb and publishing calls `publishAssignment` with a `forms`
source and a pool of six grid items with points; parse with count 5 gives a pool of at least 5 parse items;
the modules and vocab paths behave as before.

## Task 7: Structured answers and points through the student and teacher screens

- [ ] Done

Files: `src/features/drill/useDrill.ts`, `DrillSession.tsx`, `SessionSummary.tsx` if needed,
`src/lib/offlineQueue.ts`, `src/features/student/api.ts`, `RunAssignment.tsx`, `TestRunner.tsx`,
`AttemptResult.tsx`, `MyAssignments.tsx`, `src/features/teacher/AttemptDetail.tsx`, `Gradebook.tsx`,
`api.ts` (types only), and their tests.

- `useDrill`: `answer(given: Given)`; `DrillResult` gains `grade: Grade` (practice) and keeps
  `correct` (= full credit). `onAnswer(q, given, correct, ms)` keeps its position arguments with `given: Given`.
  Solo callers (modules, endless, forms, vocab) only ever see strings; keep them compiling without casts
  where possible. `score` (the "n correct" counter) still counts fully correct items.
- `QueueJob.given: Given`. Jobs written by the old client have a string and must still flush. The duplicate
  check in `flush` compares `given` structurally (`JSON.stringify`).
- `student/api.ts`: `AttemptItem` gains `points: number`; `ResponseRow` becomes
  `{ pool_id, given, given_json, correct, earned, possible, parts }`; `recordPractice` calls
  `record_practice_response_v2` with `p_given: job.given`; `submitTest` sends `given: Given`.
  `AttemptRow.score`/`total` are already numbers; make no assumption that they are integers.
- `TestRunner`: answers are `Record<string, Given>` in state and in `sessionStorage` (old saved strings
  still load). Uses `rendererFor(q).Test` and `answered()`: the counter and submit confirm count items that
  are not `'none'`; the question grid marks `'partial'` items with class `partial` (add a style) and
  `'full'` with `answered`.
- `AttemptReview`: passes `given_json ?? given`, `parts`, `correct` to `Review`; shows each item's
  `earned/possible` when `possible` is not 1.
- Scores: a helper `fmtPoints(n)` (integers as they are, otherwise up to 2 decimals without trailing
  zeros) used in `AttemptResult` ("18.5/24" and the %), `MyAssignments`, `AttemptDetail`, `Gradebook`.
- `RunAssignment`: the intro card shows the points when the attempt's total differs from the question
  count is not known before start, so leave the intro as it is; only wire the new types through.

Tests: a grid item in `TestRunner` saves a cell map to `sessionStorage` and submits it; a practice run with
a parse item calls `recordPractice` with an object; an old string job in the queue flushes; results show
fractional scores; all existing tests pass (edit an existing test only where a prop type changed, and say
which).

## Task 8: Print

- [ ] Done

Files: `src/lib/print.ts`, `src/lib/print.test.ts`, `src/features/teacher/PrintAssignment.tsx`,
`PrintAssignment.test.tsx`, CSS for `print-grid`.

- `toPrint` passes `grid` and `parse` questions through unchanged (no shuffling inside a grid); `keyText`
  for them is `correctDisplay(q)`.
- `buildPrintVersions(pool, count, versions, seed, redraw = false)`: with `redraw` and a pool larger than
  `count`, each version draws its own `count` items with its own seeded rng (deterministic per seed and
  version); otherwise unchanged. Existing tests pass unedited.
- `PrintAssignment`: a checkbox "Different questions on each version", shown only when the pool is larger
  than the question count and more than one version is selected. Student copies and keys render through
  the registry's `PrintCopy`/`PrintKey` (Task 4 did mc/typein; Task 5 did grid/parse). The key for a grid
  is a block, so the key list must not use two columns when the version contains grids. Show total points
  on the student copy title line when any item is worth more than 1 point (`___ / 20`).

Tests: a pool with one grid prints a table with blank cells in the copy and the forms in the key;
`redraw` gives versions with different item sets from a 6-item pool with count 1, and the same sets again
for the same seed.

## Task 9: Verify and close

- [ ] Done

- [ ] Verifier: `npm test`, `npx tsc -b`, `npm run build`, `npm run test:db`, solo Playwright suite.
- [ ] Review every diff, including each label students read.
- [ ] `docs/teacher-tools/plan.md` progress log entry; README if it lists features or migrations.
- [ ] Move this plan and its spec to `docs/superpowers/archive/`, add the row to the archive README.
- [ ] Update `docs/OPEN-WORK.md`: what Phase 2 left open, and the local steps the owner must run.
