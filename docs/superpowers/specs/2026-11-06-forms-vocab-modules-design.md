# Forms engine, Practice Vocab and new grammar modules

Written 2026-11-06. Branch `claude/forms-vocab-modules` (cut from `claude/trainer-core-verbs`, which holds the
unmerged teacher tools Phase 1). Background: `docs/teacher-tools/plan.md` (Phase 2 "Morphology engine"),
`docs/teacher-tools/student-integration.md` ("Practice tie-ins"), `docs/trainer-core-verbs-followups.md`,
and the README roadmap.

Three independent sub-projects, each with its own plan, executed in this order:

| | Plan file | What a student gets |
|---|---|---|
| A | `docs/superpowers/plans/2026-11-06-morphology-forms.md` | Practice → **Forms**: make or identify any verb, noun, adjective or pronoun form |
| B | `docs/superpowers/plans/2026-11-06-practice-vocab-srs.md` | Practice → **Vocab**: own study sets with spaced-repetition review |
| C | `docs/superpowers/plans/2026-11-06-grammar-modules.md` | Four new modules on the Grammar path |

## Global constraints (all three)

- **No database schema changes and no new migrations.** Nothing here needs the Supabase backend; everything
  works in solo mode, logged out, offline. (Plan C changes `supabase/seed.sql` through `npm run seed`, which
  is content, not schema.)
- **Reuse the existing question types and UI.** Every generated or authored question is a `DrillQuestion`
  (`typein` or `mc`, `src/lib/types.ts`) and runs in the existing `DrillSession` (`src/features/drill/`).
  No new item types, no grid UI, no renderer registry (those are teacher-tools Phase 2).
- **Match the redesign's visual style**: light, Quizlet-calm, sans-serif, no emoji, phones first (375px, no
  horizontal scroll). Reuse existing CSS classes and tokens.
- **Practice is local-first**: progress lives in `localStorage` through the existing session log
  (`src/features/practice/sessionLog.ts`) and syncs through `practice_sessions` only where that already
  happens. Every storage read/write tolerates missing or corrupt data.
- **Generated data is built by scripts, never edited by hand.** Data fixes go in `scripts/lexicon/*`, and
  `npm run seed` regenerates `src/content/*.generated.ts`.
- **Macrons**: generated forms have no macrons (the Whitaker stems have none), and grading already ignores
  macrons and case (`src/lib/grading.ts`). Hand-written text for students (Plan C) uses macrons as the
  existing modules do.
- **Tests**: Vitest for logic and components, written test-first. Keep `npm test`, `npx tsc -b` and
  `npx playwright test` (solo) green. Update tests whose copy or counts legitimately change; never delete a
  test to make a change pass.
- **Student-facing prose** (module descriptions, explanations, hints, UI copy longer than a label) is
  written by the most capable model, in plain direct English, with few em dashes.

## A. Morphology engine and Practice → Forms

**Engine** (`src/lib/morph/`, one module used everywhere; `src/lib/conjugator.ts` keeps its current exports
working, re-implemented on top of the engine or left as a thin wrapper, so Endless Train is unchanged):

- **Verbs**: indicative (6 tenses) and subjunctive (4 tenses), active and passive; present and future
  imperatives; infinitives (present/perfect/future, active/passive); participles (present active, perfect
  passive, future active, gerundive) as nominative masculine singular; gerund. Deponents, and the
  irregulars the conjugator already has (*sum, possum, eō, ferō, volō, nōlō, mālō, fīō* and compounds).
  `noPassive` / intransitive rules honoured.
- **Follow-ups folded in** (`docs/trainer-core-verbs-followups.md`): semi-deponents (*audeō, gaudeō,
  soleō, fīdō, cōnfīdō*) with a `semiDeponent` flag, covered by the Deponents checkbox in Endless; passive of
  transitive *īre* compounds (*trānseō, adeō, circumeō, ineō*); a gloss override map keyed by `pp1` for the
  listed bad glosses; exclude *fārī*; drop the duplicate *sonere*; hide the 4th principal part in hints when
  the verb is `noPassive`; replace the *īre*-compound pluperfect `iv` only after the prefix; the README's
  *effugere*, *fieri* perfect and *ire* perfect-variant issues.
- **Nouns**: five declensions, i-stems (parisyllabic and the neuter -e/-al/-ar type), neuters, *domus*,
  *vīs*, locative not required. Core nouns are generated from the lexicon into
  `src/content/nouns.generated.ts` (headword carries the genitive and gender).
- **Adjectives**: 1st/2nd (including -er types), 3rd declension of one, two and three terminations;
  regular and irregular comparison (*bonus, malus, magnus, parvus, multus*, -er and -lis superlatives);
  adverbs from adjectives. Core adjectives generated into `src/content/adjectives.generated.ts`.
- **Pronouns**: hand-written tables for *ego, tū, nōs, vōs, suī, is, hic, ille, iste, ipse, īdem, quī,
  quis*.
- **Golden tests** against Allen & Greenough paradigms for model words (*amō, moneō, regō, capiō, audiō,
  sum, eō, ferō, volō, hortor*, a semi-deponent; *puella, servus, bellum, puer, ager, rēx, nōmen, cīvis,
  mare, animal, manus, cornū, diēs, domus, vīs*; *bonus, miser, pulcher, ācer, fortis, ingēns*), plus a
  whole-pool smoke test (every generated word produces a non-empty string for every cell it claims).
- **Parsing**: `parse(form)` over a chosen word set returns *all* valid analyses (ambiguous forms like
  *puellae* list every one), so identify questions accept any valid parse.

**Practice → Forms** (`/practice/forms`): a subject card on Practice home (between Grammar and Vocab), a
setup screen and a drill that reuses `DrillSession`:

- Kinds: **Verbs**, **Nouns**, **Adjectives**, **Pronouns**; filters per kind (verbs: conjugation, mood,
  tense, voice; nouns: declension; adjectives: declension type, degree).
- Question styles: **Make the form** (`typein`: "*moneō*, 3rd pl. pluperfect passive indicative") and
  **Identify the form** (`mc`: four parse choices, all valid parses accepted, distractors that differ in one
  feature). The student can pick one or both.
- Sessions of 10/20/endless, logged to the session log with `kind: 'forms'` so they appear in recents.
  Recents and progress code must tolerate the new kind.

## B. Practice → Vocab with spaced repetition

- Replaces the "Coming soon" Vocab card. Route `/practice/vocab`.
- **Own study sets**, stored locally: create, rename, delete; add/edit/remove cards (Latin, English);
  **paste import** reusing the Phase 1 parser (`src/lib/vocabImport.ts` line parsing, tab/dash/CSV); no
  lexicon lookup (the lexicon is server-only).
- **Built-in starter sets** only if a core word list can be bundled from data already generated locally
  (e.g. the generated verbs/nouns/adjectives from Plan A, grouped by part of speech). If Plan A has not
  landed, ship without starter sets.
- **Class lists** (a signed-in student's teacher lists) are **out of scope**: students cannot read
  `vocab_lists` under the current RLS, and this project adds no migrations.
- **Scheduling**: FSRS via the `ts-fsrs` package (pin an exact version), one card state per (set, card,
  direction). Directions L→E and E→L, chosen per set. Review session = due cards first, then up to N new
  cards per day (setting, default 10).
- **Study modes**, all built on `DrillSession` questions: **Review** (typein, graded with
  `src/lib/grading.ts`; a wrong answer is FSRS "Again", right is "Good"; an optional "That was easy" after a
  right answer maps to "Easy"), **Learn** (mc with distractors from the same set via `pickDistractors`),
  and **Flashcards** (flip card, self-rated Again/Hard/Good/Easy; a small new component, the only new UI
  pattern in this project).
- Set page shows counts: new, due today, learned. Sessions log with `kind: 'vocab'` for recents.
- Export a set as Quizlet text (reuse `src/lib/vocabExport.ts`).

## C. Four new grammar modules

Topics from the NLE syllabus and JCL grammar tests named in `docs/teacher-tools/research.md` §7:

1. **Participles and the Ablative Absolute**
2. **Indirect Statement** (accusative + infinitive, tense of the infinitive, sequence with *dīcō, putō,
   sciō, spērō, negō*, reflexive *sē*)
3. **Gerund and Gerundive** (gerund cases, gerundive of obligation / passive periphrastic with dative of
   agent, *ad* + gerundive and *causā* for purpose)
4. **Noun Case Uses** (ablative of means, manner, accompaniment, time when/within, agent, comparison,
   separation, cause, description; dative of possession, purpose, reference, indirect object with special
   verbs; genitive partitive and description; accusative of extent and place to which)

- Same shape as the existing modules in `src/content/modules.ts` (`ModuleContent`: id, badge, title,
  tagline, description, concepts, prerequisites, xp_reward, questions), 30–35 questions each, mixing `mc`
  and `typein` in the existing style, each with an explanation. Latin sentences are classical-style and
  checked for grammar; English is plain.
- Appended after the 10 subjunctive modules on the Grammar path (prerequisites set sensibly). Path and
  counts in UI, tests and the README update to 14 modules.
- `npm run seed` regenerates `supabase/seed.sql` so teachers can assign them; existing tests in
  `src/content/modules.test.ts` (ids unique, answers valid) cover the new content.
- Deploy note for the README: re-run `seed.sql` on an existing backend to get the new modules.

## Out of scope

Teacher grid/parse item types and the schema change for points; class vocab lists as study sets;
translation; merging to `main` or deploying (the user decides that at the end).
