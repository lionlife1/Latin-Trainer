# Four New Grammar Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four modules (M10 to M13: Participles and the Ablative Absolute, Indirect Statement, Gerund and Gerundive, Noun Case Uses) to the end of the Grammar path, with 134 new questions, and update the path copy, tests, seed and README for 14 modules.

**Architecture:** Content only, plus small test and copy changes. Each module is a `ModuleContent` object appended to `MODULES` in `src/content/modules.ts`, in the same JSON style as the existing ten. Everything that lists modules (Grammar path, Practice home, teacher Assignment Builder, seed script) already iterates `MODULES`, so no component logic changes. New content-integrity tests guard the grading pitfalls of hand-written questions.

**Tech Stack:** React 18 + TypeScript + Vite, Vitest + Testing Library, Playwright (solo), `tsx scripts/build-seed.ts`.

**Spec:** `docs/superpowers/specs/2026-11-06-forms-vocab-modules-design.md` (section C). Plans A (`2026-11-06-morphology-forms.md`) and B (`2026-11-06-practice-vocab-srs.md`) run first and touch different files; by the time this runs, Practice home has Grammar, Forms, Vocab and Translation cards. If B changed the `PracticeHome` "Coming soon" assertion in `src/features/practice/practice.test.tsx`, leave it; this plan only edits the `GrammarPath` block of that file.

## Global Constraints

Copied from the spec's "Global constraints (all three)":

- **No database schema changes and no new migrations.** Nothing here needs the Supabase backend; everything works in solo mode, logged out, offline. (Plan C changes `supabase/seed.sql` through `npm run seed`, which is content, not schema.)
- **Reuse the existing question types and UI.** Every generated or authored question is a `DrillQuestion` (`typein` or `mc`, `src/lib/types.ts`) and runs in the existing `DrillSession` (`src/features/drill/`). No new item types, no grid UI, no renderer registry (those are teacher-tools Phase 2).
- **Match the redesign's visual style**: light, Quizlet-calm, sans-serif, no emoji, phones first (375px, no horizontal scroll). Reuse existing CSS classes and tokens.
- **Practice is local-first**: progress lives in `localStorage` through the existing session log (`src/features/practice/sessionLog.ts`) and syncs through `practice_sessions` only where that already happens. Every storage read/write tolerates missing or corrupt data.
- **Generated data is built by scripts, never edited by hand.** Data fixes go in `scripts/lexicon/*`, and `npm run seed` regenerates `src/content/*.generated.ts`.
- **Macrons**: generated forms have no macrons (the Whitaker stems have none), and grading already ignores macrons and case (`src/lib/grading.ts`). Hand-written text for students (Plan C) uses macrons as the existing modules do.
- **Tests**: Vitest for logic and components, written test-first. Keep `npm test`, `npx tsc -b` and `npx playwright test` (solo) green. Update tests whose copy or counts legitimately change; never delete a test to make a change pass.
- **Student-facing prose** (module descriptions, explanations, hints, UI copy longer than a label) is written by the most capable model, in plain direct English, with few em dashes.

## Content conventions (apply to Tasks 2 to 5)

Learned from the existing modules; every content task follows them.

- **Shape.** One object per module, appended to the `MODULES` array after `relative_subjunctive`, in the file's existing style: double-quoted keys, 2-space indent, key order `id, badge, title, tagline, description, concepts, prerequisites, xp_reward, questions`. Question key order: `id, type, badge, prompt, hint, explanation, answers` (typein) or `id, type, badge, prompt, hint, explanation, choices, correct` (mc).
- **Question ids** are `m<N>-<G><NN>`: module number, then a group digit (1, 2, 3 ... one per question group, in the order listed in the task), then a two-digit index. Example: `m10-101`, `m10-102`, `m10-201`. The test checks the `m<N>-` prefix.
- **Badge** (the teacher's "question kind" filter in the Assignment Builder) is an uppercase label per question group, given in each task. Reuse existing labels (`FORM`, `IDENTIFY`, `TRANSLATE`, `TRIGGER`, `EXAM TRAP`, `RULE`) where they fit.
- **Every question has a `hint` and an `explanation`.**
- **Prompts** are HTML: `<strong>` for the bit being asked about, `<span class='latin-word'>` for a cited dictionary word, `<br>` between the Latin and the English, `<em>` for the English gloss. Typein fill-ins use `______` (six underscores) with the dictionary form in parentheses, as in `m3-503`.
- **Explanations are plain text** (rendered as text by `Feedback.tsx`): no HTML. Short: one to three sentences, rule first, then the translation in quotes.
- **Macrons** in prompts, hints, explanations and mc `choices` (Latin choices carry macrons, e.g. `"persuādeō"`). **Typein `answers` carry no macrons**, lowercase, letters and single spaces only (`"cepisse"`, `"quam caesar"`), exactly like the existing modules; `answers[0]` is the one shown as "the answer".
- **MC**: four choices (choices are shuffled at render), exactly one defensible answer, distractors that are real student mistakes (wrong tense, wrong case use, English backshift error), not nonsense.
- **Grading collapses macrons and case, but not punctuation.** So (a) no two choices in one mc question may differ only by macrons or capitals; (b) a typein blank must not have a correct answer whose macron-free spelling is also a wrong form the question tests (e.g. never ask for 1st-declension ablative singular `terrā`, because `terra` nominative would be graded right; use 2nd/3rd-declension nouns or plural forms); (c) answers contain no commas; where a phrase could be typed with a comma, rephrase the blank.
- **Level**: advanced high school, TSJCL Advanced Grammar and NLE Intermediate/Advanced. Sentences are classical in style (Caesar, Cicero, Livy register: soldiers, envoys, consuls, cities, the senate), short, one grammatical point each.

### Quality checklist (each content task, before committing)

- [ ] Every Latin sentence is grammatically correct and classical in style; agreement, case, tense and macrons checked word by word.
- [ ] Each mc has exactly one defensible answer; overlapping categories (e.g. dative of reference vs. possession) never both appear as choices for the same item.
- [ ] Each typein lists every acceptable variant in `answers` (e.g. compound infinitive with and without `esse`; `quam` alternative for comparison), and no wrong form collapses onto an answer once macrons are stripped.
- [ ] Explanations and hints are short, plain and direct; few em dashes (aim for none); no HTML in explanations.
- [ ] Macrons used as in the existing modules (prompts, hints, explanations, Latin choices yes; typein answers no).
- [ ] Every concept in the task's concept list is tested by at least two questions.
- [ ] `npm test -- src/content` passes.

## Review Focus

- **MC choices that differ only by macrons or capitals** (e.g. `regentī` / `regenti`): grading treats both as correct. Pinned by `mc choices are distinct after grading normalization` (Task 1).
- **Typein answers stored with macrons, capitals, commas or double spaces** never match what a student types, because `normalize` strips macrons and case but not punctuation. Pinned by `typein answers are stored normalized` (Task 1).
- **HTML in an explanation** shows up as literal `<strong>` text in the feedback card. Pinned by `every question has a plain-text explanation` (Task 1).
- **A returning student who finished all ten subjunctive modules** should see M10 marked "Up next" and "10 of 14 complete", not a finished path. Pinned by the `GrammarPath` returning-student test (Task 2, count asserted dynamically).
- **Long new titles on a phone** ("Participles and the Ablative Absolute") must not cause horizontal scroll on the path or the module intro at 375px. Pinned by the phone-width e2e additions (Task 6).

---

### Task 1: Content-integrity tests and path copy for a 14-module path

**Files:**
- Modify: `src/content/modules.test.ts`
- Modify: `src/features/practice/GrammarPath.tsx:29`
- Test: `src/features/practice/practice.test.tsx` (GrammarPath block only)

**Interfaces:**
- Consumes: `normalize(s: string): string` from `src/lib/grading.ts`.
- Produces: `SUBJUNCTIVE_IDS: string[]` constant in `modules.test.ts` (reused in Task 6); the four generic content tests below, which Tasks 2 to 5 rely on to catch bad content.

- [ ] **Step 1: Replace the length-10 test and add the integrity tests in `src/content/modules.test.ts`**

The old `has the 10 legacy modules in order` asserts `toHaveLength(10)`, which Task 2 legitimately breaks. Replace it (the count assertion returns, as 14, in Task 6):

```ts
import { normalize } from '../lib/grading';

const SUBJUNCTIVE_IDS = [
  'forms_bootcamp', 'sequence_of_tenses', 'independent_uses', 'purpose_result_indirect', 'cum_clauses',
  'indirect_question', 'fear_clauses', 'conditionals', 'quin_clauses', 'relative_subjunctive',
];
const ALL = MODULES.flatMap(m => m.questions);

it('starts with the 10 subjunctive modules in order', () => {
  expect(MODULES.slice(0, 10).map(m => m.id)).toEqual(SUBJUNCTIVE_IDS);
});
it('every question has a plain-text explanation', () => {
  for (const q of ALL) {
    expect(q.explanation?.trim(), q.id).toBeTruthy();
    expect(q.explanation, q.id).not.toMatch(/</);
  }
});
it('mc choices are distinct after grading normalization', () => {
  for (const q of ALL) if (q.type === 'mc') {
    expect(q.choices.length, q.id).toBeGreaterThanOrEqual(2);
    expect(new Set(q.choices.map(normalize)).size, q.id).toBe(q.choices.length);
  }
});
it('typein answers are stored normalized (lowercase, no macrons, letters and single spaces)', () => {
  for (const q of ALL) if (q.type === 'typein') for (const a of q.answers) {
    expect(a, q.id).toBe(normalize(a));
    expect(a, q.id).toMatch(/^[a-z]+( [a-z]+)*$/);
  }
});
```

Keep the three existing tests (unique ids, mc correct among choices, typein has an answer).

- [ ] **Step 2: Run the content tests**

Run: `npx vitest run src/content/modules.test.ts`
Expected: PASS (all 7). The new tests are guards: the current 335 questions already satisfy them (checked while writing this plan), and Tasks 2 to 5 must keep them green.

- [ ] **Step 3: Write the failing path-copy assertion**

In the existing `GrammarPath` test in `practice.test.tsx` (one module complete), add:

```ts
expect(screen.getByText(`From subjunctive forms to case uses. 1 of ${MODULES.length} complete.`)).toBeInTheDocument();
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx vitest run src/features/practice/practice.test.tsx -t GrammarPath`
Expected: FAIL, unable to find the text (the page still says "The subjunctive, from forms to clauses.").

- [ ] **Step 5: Change the subtitle in `GrammarPath.tsx`**

`<p>From subjunctive forms to case uses. {done} of {MODULES.length} complete.</p>` (exact copy).

- [ ] **Step 6: Run the practice and content tests**

Run: `npx vitest run src/features/practice src/content`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/content/modules.test.ts src/features/practice/GrammarPath.tsx src/features/practice/practice.test.tsx
git commit -m "test(content): guard module questions against grading pitfalls; path copy beyond the subjunctive"
```

---

### Task 2: Module M10, Participles and the Ablative Absolute (Model: opus)

**Files:**
- Modify: `src/content/modules.ts` (append after `relative_subjunctive`)
- Test: `src/content/modules.test.ts`, `src/features/practice/practice.test.tsx`

**Interfaces:**
- Consumes: Task 1's integrity tests and `SUBJUNCTIVE_IDS`.
- Produces: `expectNewModule(index, spec)` helper in `modules.test.ts`, used by Tasks 3 to 5:

```ts
interface NewModuleSpec {
  id: string; badge: string; title: string; concepts: string[];
  prerequisites: string[]; xp_reward: number; mc: number; typein: number;
}
function expectNewModule(index: number, s: NewModuleSpec): void
```

It asserts: `MODULES[index]` exists with `id`, `badge`, `title`, `prerequisites`, `xp_reward` equal to `s`; `concepts` `toEqual(s.concepts)`; non-empty `tagline` and `description`; question count of each type equals `s.mc` / `s.typein` and the total is 30 to 35; every question id starts with `` `${s.badge.toLowerCase()}-` ``; every question has a non-empty `hint`; every prerequisite is the id of a module at a lower index.

- Module id `participles_ablative_absolute` (later tasks use it as a prerequisite).

**Module spec:**

| Field | Value |
|---|---|
| id | `participles_ablative_absolute` |
| badge | `M10` |
| title | `Participles and the Ablative Absolute` |
| prerequisites | `[]` |
| xp_reward | `110` |
| questions | 33: 21 mc, 12 typein |
| tagline, description | Implementer writes, in the style of the existing ones (tagline under 50 characters; description two or three plain sentences saying what the student will be able to do) |

Concepts (exact, in order):
`"Present Active Participle"`, `"Perfect Passive Participle"`, `"Future Active Participle"`, `"Participles of Deponent Verbs"`, `"Agreement and Relative Time"`, `"Ablative Absolute"`, `"Ablative Absolute without a Participle"`

Question groups (ids `m10-1NN` ... `m10-5NN`):

| Group | Badge | Type × count | Covers |
|---|---|---|---|
| 1 | `FORM` | typein × 9 | Make participles from principal parts: present active (1st, 2nd, 3rd, 3rd -iō, 4th), present active genitive singular/plural (`-ntis`, `-ntium`), perfect passive (incl. irregular 4th parts like *ferō → lātus*), future active (incl. *futūrus*), deponent perfect participle (*hortātus*, *secūtus*) |
| 2 | `IDENTIFY` | mc × 5 | Name a participle's tense and voice; which participle shows time before / same time / time after the main verb |
| 3 | `TRANSLATE` | mc × 5 | Sentences with circumstantial participles: find the noun it agrees with, translate *-ns* as "while ...ing", PPP as "having been ...ed", FAP as "about to", deponent PPP as active ("having encouraged") |
| 4 | `ABLATIVE ABSOLUTE` | mc × 6, typein × 3 | Spot the ablative absolute; translate as when/after/since/although depending on context; nominal type (*Cicerōne cōnsule*, *Caesare duce*); typein: put a phrase into the ablative absolute (*urbs capta → urbe capta*) |
| 5 | `EXAM TRAP` | mc × 5 | Present participle ablative `-e` in the ablative absolute vs `-ī` as adjective; the noun of an ablative absolute is not the subject or object of the main clause; deponent perfect participles are active; participle time is relative to the main verb (past main verb: "while he was ..."); which of four phrases is *not* an ablative absolute |

Sample questions (target level):

```json
{"id": "m10-104", "type": "typein", "badge": "FORM",
 "prompt": "Give the <strong>present active participle</strong> (nominative masculine singular) of <span class='latin-word'>capiō, capere, cēpī, captum</span>.",
 "hint": "3rd conjugation -iō verbs keep the i: capi- + -ēns.",
 "explanation": "3rd -iō and 4th conjugation verbs form the present participle with -iēns: capiēns, capientis, 'taking'.",
 "answers": ["capiens"]}
{"id": "m10-401", "type": "mc", "badge": "ABLATIVE ABSOLUTE",
 "prompt": "<strong>Urbe captā</strong>, mīlitēs praedam rapuērunt.<br>How is the bolded phrase best translated?",
 "hint": "captā is a perfect passive participle in the ablative.",
 "explanation": "A noun and participle in the ablative, loosely attached to the sentence, form an ablative absolute. The perfect participle shows time before the main verb: 'After the city had been captured, the soldiers seized the loot.'",
 "choices": ["After the city had been captured", "While the city was capturing", "Before the city was captured", "In order to capture the city"],
 "correct": "After the city had been captured"}
{"id": "m10-501", "type": "mc", "badge": "EXAM TRAP",
 "prompt": "Choose the participle that completes the ablative absolute:<br>Rēge ______, cīvēs fēlīcēs erant.<br><em>While the king was ruling, the citizens were happy.</em>",
 "hint": "Present participles have two ablative singular endings.",
 "explanation": "In an ablative absolute the present participle ends in -e: regente. The -ī ending is used when the participle acts as a plain adjective.",
 "choices": ["regente", "regentī", "rēctō", "rēctūrō"],
 "correct": "regente"}
```

- [ ] **Step 1: Write the failing tests**

In `modules.test.ts`, add the `NewModuleSpec` interface, the `expectNewModule` helper, and:

```ts
it('M10 Participles and the Ablative Absolute follows the path', () => expectNewModule(10, {
  id: 'participles_ablative_absolute', badge: 'M10', title: 'Participles and the Ablative Absolute',
  concepts: ['Present Active Participle', 'Perfect Passive Participle', 'Future Active Participle',
    'Participles of Deponent Verbs', 'Agreement and Relative Time', 'Ablative Absolute',
    'Ablative Absolute without a Participle'],
  prerequisites: [], xp_reward: 110, mc: 21, typein: 12,
}));
```

In `practice.test.tsx` `GrammarPath` block, add:

```ts
it('sends a student who finished the subjunctive modules on to M10', () => {
  localStorage.setItem('latiniq_progress', JSON.stringify(
    Object.fromEntries(MODULES.slice(0, 10).map(m => [m.id, { completed: true }]))));
  at(<GrammarPath />);
  const steps = screen.getAllByRole('listitem');
  expect(steps[10]).toHaveAttribute('data-state', 'new');
  expect(within(steps[10]).getByText('Up next')).toBeInTheDocument();
  expect(within(steps[10]).getByRole('link')).toHaveAttribute('href', '/practice/grammar/participles_ablative_absolute');
  expect(screen.getByText(`From subjunctive forms to case uses. 10 of ${MODULES.length} complete.`)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/content src/features/practice`
Expected: FAIL; `MODULES[10]` is undefined (`expected undefined to be 'participles_ablative_absolute'`) and `steps[10]` is undefined.

- [ ] **Step 3: Write the module in `src/content/modules.ts`** following the spec table, groups, Content conventions and samples above (samples may be used as-is or improved).

- [ ] **Step 4: Run the tests and type-check**

Run: `npx vitest run src/content src/features/practice && npx tsc -b`
Expected: PASS, no type errors.

- [ ] **Step 5: Run the Quality checklist** (above). Fix anything it finds and re-run Step 4.

- [ ] **Step 6: Commit**

```bash
git add src/content/modules.ts src/content/modules.test.ts src/features/practice/practice.test.tsx
git commit -m "feat(content): add M10 Participles and the Ablative Absolute"
```

---

### Task 3: Module M11, Indirect Statement (Model: opus)

**Files:**
- Modify: `src/content/modules.ts` (append after M10)
- Test: `src/content/modules.test.ts`

**Interfaces:**
- Consumes: `expectNewModule` (Task 2); module id `participles_ablative_absolute`.
- Produces: module id `indirect_statement`.

**Module spec:**

| Field | Value |
|---|---|
| id | `indirect_statement` |
| badge | `M11` |
| title | `Indirect Statement` |
| prerequisites | `["participles_ablative_absolute"]` (the perfect passive and future active infinitives are built on participles) |
| xp_reward | `110` |
| questions | 33: 20 mc, 13 typein |
| tagline, description | Implementer writes (as Task 2) |

Concepts (exact, in order):
`"Verbs of Saying, Thinking, Knowing and Perceiving"`, `"Accusative Subject + Infinitive"`, `"Present Infinitive: Same Time"`, `"Perfect Infinitive: Time Before"`, `"Future Infinitive: Time After"`, `"Reflexive sē and suus"`, `"negō: Say That ... Not"`

Each of *dīcō, putō, sciō, spērō, negō* appears as the head verb in at least one question.

| Group | Badge | Type × count | Covers |
|---|---|---|---|
| 1 | `TRIGGER` | mc × 4 | Which verb introduces an indirect statement (*dīcō, putō, sciō, spērō, negō, crēdō, audiō, videō, nūntiō, intellegō*) vs. one that takes an indirect command (*imperō, rogō*) or indirect question (*quaerō*) |
| 2 | `FORM` | typein × 8 | Make infinitives: present active/passive (incl. 3rd conj. *-ī*: *dūcī*), perfect active, perfect passive and future active with the participle agreeing with the accusative subject (*captam esse*, *ventūrōs esse*), a deponent's infinitives. For compound infinitives, `answers` list the form with and without `esse` (`["captam esse", "captam"]`) |
| 3 | `TENSE` | mc × 5, typein × 1 | Choose the infinitive from the relative time, with primary and secondary head verbs; *spērō* takes a future infinitive |
| 4 | `TRANSLATE` | mc × 5 | Whole sentences, primary and secondary head verbs; English backshift after a past verb ("said that he was / had / would") |
| 5 | `REFLEXIVE` | mc × 3, typein × 2 | *sē* (subject of the head verb) vs. *eum/eam/eōs*; *suus* vs. *eius*; typein: supply *sē* or *suam* |
| 6 | `NEGATIVE` | mc × 1, typein × 2 | *negō* = "say that ... not" instead of *dīcō ... nōn* |
| 7 | `EXAM TRAP` | mc × 2 | English "that" has no Latin word here (no *ut*, no *quod*); *spērō* + present infinitive is wrong for a future hope |

Sample questions:

```json
{"id": "m11-201", "type": "typein", "badge": "FORM",
 "prompt": "Complete the indirect statement:<br>Nūntius dīxit hostēs urbem ______ (capere).<br><em>The messenger said that the enemy had captured the city.</em>",
 "hint": "The capturing happened before the saying: perfect active infinitive.",
 "explanation": "The perfect active infinitive is the perfect stem + -isse: cēpisse. It shows time before the main verb.",
 "answers": ["cepisse"]}
{"id": "m11-401", "type": "mc", "badge": "TRANSLATE",
 "prompt": "Translate: <strong>Puella putābat sē fēlīcem esse.</strong>",
 "hint": "putābat is past; esse shows the same time as the thinking.",
 "explanation": "The present infinitive shows the same time as the main verb. After a past verb, English says 'was'. sē points back to the girl.",
 "choices": ["The girl thought that she was happy.", "The girl thinks that she is happy.", "The girl thought that she had been happy.", "The girl thought that she would be happy."],
 "correct": "The girl thought that she was happy."}
{"id": "m11-501", "type": "mc", "badge": "REFLEXIVE",
 "prompt": "Mārcus dīcit <strong>eum</strong> aegrum esse.<br>Who is sick?",
 "hint": "Compare sē, which points back to the subject of dīcit.",
 "explanation": "eum refers to someone else. If Marcus meant himself, the Latin would be: Mārcus dīcit sē aegrum esse.",
 "choices": ["Someone other than Marcus", "Marcus himself", "Marcus and his friend together", "Nobody: eum is the object of dīcit"],
 "correct": "Someone other than Marcus"}
{"id": "m11-602", "type": "typein", "badge": "NEGATIVE",
 "prompt": "Complete with one verb in the perfect tense:<br>______ sē ventūrum esse.<br><em>He said that he would not come.</em>",
 "hint": "Latin avoids dīxit ... nōn here. Use the verb that means 'say that ... not'.",
 "explanation": "negō means 'say that ... not' or 'deny': Negāvit sē ventūrum esse.",
 "answers": ["negavit"]}
```

- [ ] **Step 1: Write the failing test**

```ts
it('M11 Indirect Statement follows M10', () => expectNewModule(11, {
  id: 'indirect_statement', badge: 'M11', title: 'Indirect Statement',
  concepts: ['Verbs of Saying, Thinking, Knowing and Perceiving', 'Accusative Subject + Infinitive',
    'Present Infinitive: Same Time', 'Perfect Infinitive: Time Before', 'Future Infinitive: Time After',
    'Reflexive sē and suus', 'negō: Say That ... Not'],
  prerequisites: ['participles_ablative_absolute'], xp_reward: 110, mc: 20, typein: 13,
}));
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/content`
Expected: FAIL, `expected undefined to be 'indirect_statement'`.

- [ ] **Step 3: Write the module in `src/content/modules.ts`** following the spec, groups, Content conventions and samples.

- [ ] **Step 4: Run the tests and type-check**

Run: `npx vitest run src/content src/features/practice && npx tsc -b`
Expected: PASS.

- [ ] **Step 5: Run the Quality checklist.** Fix and re-run Step 4.

- [ ] **Step 6: Commit**

```bash
git add src/content/modules.ts src/content/modules.test.ts
git commit -m "feat(content): add M11 Indirect Statement"
```

---

### Task 4: Module M12, Gerund and Gerundive (Model: opus)

**Files:**
- Modify: `src/content/modules.ts` (append after M11)
- Test: `src/content/modules.test.ts`

**Interfaces:**
- Consumes: `expectNewModule` (Task 2); module id `participles_ablative_absolute`.
- Produces: module id `gerund_gerundive`.

**Module spec:**

| Field | Value |
|---|---|
| id | `gerund_gerundive` |
| badge | `M12` |
| title | `Gerund and Gerundive` |
| prerequisites | `["participles_ablative_absolute"]` (the gerundive is a verbal adjective declined like a participle) |
| xp_reward | `110` |
| questions | 33: 20 mc, 13 typein |
| tagline, description | Implementer writes (as Task 2) |

Concepts (exact, in order):
`"Gerund: a Verbal Noun"`, `"Gerundive: a Verbal Adjective"`, `"Gerundive in Place of Gerund + Object"`, `"Passive Periphrastic (Obligation)"`, `"Dative of Agent"`, `"Impersonal Passive Periphrastic"`, `"Purpose: ad + Gerund or Gerundive"`, `"Purpose: causā or grātiā + Genitive"`

| Group | Badge | Type × count | Covers |
|---|---|---|---|
| 1 | `FORM` | typein × 6 | Gerund in genitive, dative, accusative (after *ad*), ablative, across conjugations incl. 3rd -iō (*capiendī*), 4th (*audiendō*), a deponent (*hortandī*); gerundive agreeing with a noun |
| 2 | `IDENTIFY` | mc × 5 | Gerund vs. gerundive vs. present participle vs. infinitive; case of a gerund; why there is no nominative gerund (the infinitive is used as subject) |
| 3 | `PURPOSE` | mc × 4, typein × 3 | *ad* + accusative gerund/gerundive; genitive gerund/gerundive + *causā* or *grātiā* (which follows); gerundive phrase replacing gerund + direct object (*ad urbem capiendam*, not *ad capiendum urbem*) |
| 4 | `OBLIGATION` | mc × 5, typein × 3 | Passive periphrastic with each tense of *sum* ("must", "had to", "will have to"); dative of agent; impersonal type (*Nōbīs pugnandum est*); *Carthāgō dēlenda est* |
| 5 | `TRANSLATE` | mc × 4, typein × 1 | *ars scrībendī*, *cupidus videndī*, *legendō discimus*, *tempus abeundī*; typein: supply the gerund in a set phrase |
| 6 | `EXAM TRAP` | mc × 2 | Dative of agent (periphrastic) vs. *ā/ab* + ablative (ordinary passive); "-ndus" means "to be ...ed / must be", not "being ...ed" |

Sample questions:

```json
{"id": "m12-301", "type": "typein", "badge": "PURPOSE",
 "prompt": "Complete with a gerundive:<br>Lēgātī vēnērunt ad pācem ______ (petere).<br><em>The envoys came to seek peace.</em>",
 "hint": "After ad, the gerundive agrees with its noun. pācem is feminine accusative singular.",
 "explanation": "ad + noun + gerundive shows purpose. The gerundive takes the noun's gender, number and case: pācem petendam.",
 "answers": ["petendam"]}
{"id": "m12-401", "type": "mc", "badge": "OBLIGATION",
 "prompt": "Translate: <strong>Hostēs nōbīs vincendī sunt.</strong>",
 "hint": "Gerundive + sum shows obligation. Who does the conquering?",
 "explanation": "This is a passive periphrastic: the enemy are 'to be conquered'. nōbīs is a dative of agent, 'by us'.",
 "choices": ["The enemy must be conquered by us.", "The enemy must conquer us.", "The enemy were conquered by us.", "We must be conquered by the enemy."],
 "correct": "The enemy must be conquered by us."}
{"id": "m12-201", "type": "mc", "badge": "IDENTIFY",
 "prompt": "In the phrase <strong>ars bene dīcendī</strong>, what is dīcendī?",
 "hint": "Is there a noun for it to agree with?",
 "explanation": "dīcendī does not agree with ars (feminine nominative), so it is a gerund, a verbal noun, in the genitive: 'the art of speaking well'.",
 "choices": ["A gerund in the genitive", "A gerundive agreeing with ars", "A present participle", "A present passive infinitive"],
 "correct": "A gerund in the genitive"}
```

- [ ] **Step 1: Write the failing test**

```ts
it('M12 Gerund and Gerundive follows M11', () => expectNewModule(12, {
  id: 'gerund_gerundive', badge: 'M12', title: 'Gerund and Gerundive',
  concepts: ['Gerund: a Verbal Noun', 'Gerundive: a Verbal Adjective', 'Gerundive in Place of Gerund + Object',
    'Passive Periphrastic (Obligation)', 'Dative of Agent', 'Impersonal Passive Periphrastic',
    'Purpose: ad + Gerund or Gerundive', 'Purpose: causā or grātiā + Genitive'],
  prerequisites: ['participles_ablative_absolute'], xp_reward: 110, mc: 20, typein: 13,
}));
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/content`
Expected: FAIL, `expected undefined to be 'gerund_gerundive'`.

- [ ] **Step 3: Write the module in `src/content/modules.ts`** following the spec, groups, Content conventions and samples.

- [ ] **Step 4: Run the tests and type-check**

Run: `npx vitest run src/content src/features/practice && npx tsc -b`
Expected: PASS.

- [ ] **Step 5: Run the Quality checklist.** Fix and re-run Step 4.

- [ ] **Step 6: Commit**

```bash
git add src/content/modules.ts src/content/modules.test.ts
git commit -m "feat(content): add M12 Gerund and Gerundive"
```

---

### Task 5: Module M13, Noun Case Uses (Model: opus)

**Files:**
- Modify: `src/content/modules.ts` (append after M12)
- Test: `src/content/modules.test.ts`

**Interfaces:**
- Consumes: `expectNewModule` (Task 2).
- Produces: module id `case_uses`.

**Module spec:**

| Field | Value |
|---|---|
| id | `case_uses` |
| badge | `M13` |
| title | `Noun Case Uses` |
| prerequisites | `[]` (independent of the verb modules) |
| xp_reward | `120` (largest topic) |
| questions | 35: 22 mc, 13 typein |
| tagline, description | Implementer writes (as Task 2) |

Concepts (exact, in order):
`"Ablative: Means, Manner, Accompaniment"`, `"Ablative: Time When and Time Within Which"`, `"Ablative: Agent, Comparison, Separation, Cause"`, `"Ablative of Description"`, `"Dative: Indirect Object and Special Verbs"`, `"Dative: Possession, Purpose and Reference"`, `"Genitive: Partitive and Description"`, `"Accusative: Extent and Place to Which"`

Every use named in the spec appears in at least one mc *and* (where a form can be asked) at least one typein: ablative of means, manner, accompaniment, time when, time within which, agent, comparison, separation, cause, description; dative of possession, purpose, reference, indirect object, with special verbs; genitive partitive and description; accusative of extent (time and space) and place to which.

| Group | Badge | Type × count | Covers |
|---|---|---|---|
| 1 | `ABLATIVE` | mc × 10 | One sentence per ablative use (the ten above), bolded word, choices are four ablative uses |
| 2 | `DATIVE` | mc × 5 | Possession, purpose (double dative, bold only the purpose word), reference, indirect object, special verbs (*crēdō, persuādeō, parcō, noceō, faveō, imperō*) |
| 3 | `GENITIVE` | mc × 2 | Partitive (*pars mīlitum*, *satis cibī*, *nēmō nostrum*), description (*vir magnae virtūtis*) |
| 4 | `ACCUSATIVE` | mc × 2 | Extent of time and space (*trēs hōrās*, *decem pedēs*), place to which (*in urbem*, *Rōmam*, *domum*) |
| 5 | `FORM` | typein × 13 | Supply the right form or short phrase for one use each: *cum amīcō*, *gladiō*, *magnō cum clāmōre* (accept `"magno cum clamore"` and `"magno clamore"`), *ā rēge*, *Caesare* / *quam Caesar*, *metū* (cause), *paucīs diēbus* (time within which), *mihi* with a special verb, *auxiliō* (double dative), *mīlitum* (partitive), *trēs hōrās*, *Rōmam*, *domum* |
| 6 | `EXAM TRAP` | mc × 3 | *cum* optional in manner when there is an adjective; *ā/ab* + person (agent) vs. bare ablative thing (means); no preposition with city names and *domus* for place to which; time when (ablative) vs. extent of time (accusative) |

Because overlapping dative labels are a known dispute (reference vs. possession vs. advantage), never put two of them in the same choice set unless the sentence rules one out; use clearly different labels (e.g. Agent, Indirect object) as distractors.

Sample questions:

```json
{"id": "m13-101", "type": "mc", "badge": "ABLATIVE",
 "prompt": "Mīlitēs hostēs <strong>gladiīs</strong> necāvērunt.<br>What use of the ablative is bolded?",
 "hint": "Is it a person or a tool? Is there a preposition?",
 "explanation": "A tool, with no preposition: ablative of means. 'The soldiers killed the enemy with swords.'",
 "choices": ["Means", "Manner", "Accompaniment", "Agent"],
 "correct": "Means"}
{"id": "m13-505", "type": "typein", "badge": "FORM",
 "prompt": "Complete with the right form:<br>Nēmō fortior est ______ (Caesar).<br><em>No one is braver than Caesar.</em>",
 "hint": "After a comparative, use the ablative of comparison, or quam + the same case as the other noun.",
 "explanation": "Ablative of comparison: Caesare. Latin can also say quam Caesar, with Caesar in the same case as nēmō.",
 "answers": ["caesare", "quam caesar"]}
{"id": "m13-201", "type": "mc", "badge": "DATIVE",
 "prompt": "<strong>Mihi</strong> est fīlia.<br>What use of the dative is bolded?",
 "hint": "Dative + a form of sum.",
 "explanation": "Dative with sum names the owner: 'I have a daughter' (literally 'there is a daughter to me').",
 "choices": ["Possession", "Indirect object", "Purpose", "Agent"],
 "correct": "Possession"}
```

- [ ] **Step 1: Write the failing test**

```ts
it('M13 Noun Case Uses ends the path', () => expectNewModule(13, {
  id: 'case_uses', badge: 'M13', title: 'Noun Case Uses',
  concepts: ['Ablative: Means, Manner, Accompaniment', 'Ablative: Time When and Time Within Which',
    'Ablative: Agent, Comparison, Separation, Cause', 'Ablative of Description',
    'Dative: Indirect Object and Special Verbs', 'Dative: Possession, Purpose and Reference',
    'Genitive: Partitive and Description', 'Accusative: Extent and Place to Which'],
  prerequisites: [], xp_reward: 120, mc: 22, typein: 13,
}));
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/content`
Expected: FAIL, `expected undefined to be 'case_uses'`.

- [ ] **Step 3: Write the module in `src/content/modules.ts`** following the spec, groups, Content conventions and samples. Watch rule (b) of the grading conventions closely here: 1st-declension ablative singulars (*-ā*) collapse onto the nominative, so prefer 2nd/3rd-declension nouns or plurals for single-word typein blanks.

- [ ] **Step 4: Run the tests and type-check**

Run: `npx vitest run src/content src/features/practice && npx tsc -b`
Expected: PASS.

- [ ] **Step 5: Run the Quality checklist.** Fix and re-run Step 4.

- [ ] **Step 6: Commit**

```bash
git add src/content/modules.ts src/content/modules.test.ts
git commit -m "feat(content): add M13 Noun Case Uses"
```

---

### Task 6: Pin the 14-module path, regenerate the seed, update README

**Files:**
- Modify: `src/content/modules.test.ts`
- Modify: `tests/e2e/solo.spec.ts` (phone-width loop)
- Modify: `supabase/seed.sql` (regenerated by `npm run seed`, never by hand)
- Modify: `README.md`

**Interfaces:**
- Consumes: `SUBJUNCTIVE_IDS` (Task 1); module ids from Tasks 2 to 5.

- [ ] **Step 1: Add the full-path test to `modules.test.ts`**

```ts
it('has 14 modules: the subjunctive path, then the four new modules', () => {
  expect(MODULES.map(m => m.id)).toEqual([
    ...SUBJUNCTIVE_IDS, 'participles_ablative_absolute', 'indirect_statement', 'gerund_gerundive', 'case_uses',
  ]);
  expect(MODULES.flatMap(m => m.questions)).toHaveLength(469);
});
```

469 = 335 existing + 33 + 33 + 33 + 35. If a content task changed its count (with its test), use the real total here and in the README.

- [ ] **Step 2: Run it**

Run: `npx vitest run src/content`
Expected: PASS (all content exists after Tasks 2 to 5; this test locks the order and total).

- [ ] **Step 3: Add the new module intros to the phone-width e2e loop**

In `tests/e2e/solo.spec.ts`, extend the `phone width` path list with `'/#/practice/grammar/participles_ablative_absolute'` (longest title) and `'/#/practice/grammar/case_uses'`.

- [ ] **Step 4: Run e2e**

Run: `npx playwright test` (use `PW_CHANNEL=chrome` if Playwright's browser is not installed)
Expected: all solo tests PASS, including `no horizontal scroll on /#/practice/grammar/participles_ablative_absolute`. If it fails, the fix is CSS wrapping using existing classes in `src/styles/`, not a shorter title.

- [ ] **Step 5: Regenerate the seed**

Run: `npm run seed`
Expected first line: `seed.sql: 14 modules, 469 questions`. Then `git status --short` should show `supabase/seed.sql` changed; `supabase/seed-lexicon.sql` and `src/content/*.generated.ts` should be unchanged. If any generated file changes, stop and find out why (it means Plans A/B left the generators out of sync) rather than committing it here.

Check: `grep -c "insert into public.modules" supabase/seed.sql` prints `14`.

- [ ] **Step 6: Update `README.md`**

- Replace the "10 subjunctive modules ... 335 questions." bullet (lines 9 to 10) with: `- 14 grammar modules, 469 questions: 10 on the subjunctive (forms, sequence of tenses, independent uses, purpose/result/indirect command, cum clauses, indirect questions, fear clauses, conditionals, quin, relative clauses), then participles and the ablative absolute, indirect statement, gerunds and gerundives, and noun case uses.`
- Under "Upgrading an existing deployment", add a step before "Then push or merge the frontend": `Re-run \`supabase/seed.sql\` (\`psql -v ON_ERROR_STOP=1 "$DATABASE_URL" -f supabase/seed.sql\`) to add new grammar modules and questions. It upserts, so existing assignments and results are kept.`

- [ ] **Step 7: Full verification**

Run: `npm test && npx tsc -b && npx playwright test`
Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add src/content/modules.test.ts tests/e2e/solo.spec.ts supabase/seed.sql README.md
git commit -m "chore: pin the 14-module path, regenerate seed, document new modules"
```
