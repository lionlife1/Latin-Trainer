# Noun data fixes

Date: 2026-11-15. Source: a review of every generated 3rd-declension noun's genitive plural, nominative
plural and ablative singular against Allen & Greenough §§65-78.

Fix data in `scripts/lexicon/nouns.ts` or the engine (`src/lib/morph/nouns.ts`), never in
`src/content/nouns.generated.ts`. TDD. Don't commit.

## Task 1. i-stem flags (`scripts/lexicon/nouns.ts`)

- `imber, imbris` is an i-stem (A&G 78: *imber, linter, uter, venter* have *-ium*): gen. pl. *imbrium*.
  Today *imbrum*. Add an `I_STEMS` set (lemma keys) that sets `iStem: true`: `imber`, `caro` (*carnium*).
- `vates` has gen. pl. *vatum* (A&G 78.1, with *canis, iuvenis*). Add `vates` to `CONSONANT_STEMS`.
- Leave every other gen. pl. as it is.

## Task 2. Defective nouns out of Forms

`fors` (only *fors, forte*) and `vicis` (no nominative singular; *vicis, vicem, vice, vices, vicibus*) are
drilled in cells that don't exist. Add both to `EXCLUDED` in `scripts/lexicon/nouns.ts`.

## Task 3. Accusative in -im and ablative in -ī (engine)

Type-in answers are matched against `nounForms`, so a student who writes *nāvī* or *turrim* is marked
wrong. Add an optional `Noun.iForms?: 'pure' | 'mixed' | 'abl'` (generated data sets it from a table in
`scripts/lexicon/nouns.ts`, by lemma key) and use it in `nounForms` for the singular accusative and
ablative only:

| value | acc. sg. | abl. sg. | nouns (core only) |
|---|---|---|---|
| `pure` | *-im* only | *-ī* only | sitis |
| `mixed` | *-em*, also *-im* | *-e*, also *-ī* | turris, securis, puppis |
| `abl` | *-em* | *-e*, also *-ī* | navis, ignis, civis, avis, classis, finis, amnis, imber |

The first form in each list stays the main form (shown in explanations and in identify questions);
variants come after it. Check that `parse` (`src/lib/morph/parse.ts`) and the identify-question
distractor picker in `src/lib/formsQuestions.ts` still behave: a variant form must parse to the right
cell, and must not make an identify question ambiguous (e.g. *navi* is also dative singular, which is
already its own cell; that is fine because identify questions only use `formsOf(...)[0]`).

Tests in `src/lib/morph/nouns.test.ts`: *sitim, siti*; *turrem/turrim, turre/turri*; *navem*,
*nave/navi*; *imbre/imbri* and gen. pl. *imbrium*; dative singular unchanged (*navi*, *siti*).

## Task 4. Adjective fixes (`scripts/lexicon/adjectives.ts`)

- `vetus`: the comparative is *vetustior* (A&G 125), not *veterior*. Add
  `vetus: { comp: 'vetusti', sup: 'veterri' }` to `COMPARISON_FIXES` (keep *veterrimus*). Check the
  generated entry still has `consonantStem: true`.
- `polus, pola, polum` is Whitaker's spurious adjective entry for the noun *polus* (pole, sky). Add
  `polus` to `EXCLUDED`.
- Test both in `scripts/lexicon/adjectives.test.ts`.

## Task 5. Regenerate and check

`npm run seed`. The diff of `src/content/nouns.generated.ts` should touch only *imber, caro, vates,
fors, vicis* and the twelve nouns given `iForms`; the diff of `src/content/adjectives.generated.ts` only
*vetus* and *polus*. Then `npm test`, `npx tsc -b`, `npm run build`.
