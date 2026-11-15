# Plural-only nouns in Forms

Date: 2026-11-15. Source: `docs/trainer-core-verbs-followups.md`, known limits ("Plural-only nouns
(*arma, castra*) ... are not in Forms").

## Scope

The core lexicon has eight plural-only nouns, all from D'Ooge:

| headword | decl | gender | stem | i-stem |
|---|---|---|---|---|
| arma, -ōrum, n. plur. | 2 | n | arm | |
| cibāria, -ōrum, n. plur. | 2 | n | cibari | |
| līberī, -ōrum, m. | 2 | m | liber | |
| sertae, -ārum, f. plur. | 1 | f | sert | |
| thermae, -ārum, f. plur. | 1 | f | therm | |
| faucēs, -ium, f. plur. | 3 | f | fauc | yes |
| maiōrēs, -um, m. plur. | 3 | m | maior | |
| moenia, -ium, n. plur. | 3 | n | moen | yes |

*Castra* is not one of them: the core row is *castrum, -ī* "fort". Leave it.

`scripts/lexicon/nouns.ts` skips every row whose headword contains `plur.`, and *līberī* fails to match a
Whitaker line. Generated data stays macron-free like the rest of `nouns.generated.ts`.

## Task 1. Engine (`src/lib/morph/nouns.ts`)

1. `Noun` gets `pluralOnly?: boolean`. For such a noun `nom` holds the nominative plural.
2. `nounForms`: a `pluralOnly` noun has no singular forms (return `[]`). Plural forms come from the
   existing paradigms (the plural slots never use `NOM`, so `stem + ending` already works).
3. `paradigmKey`: for a `pluralOnly` 2nd-declension noun, use `secondUm` when neuter, else `secondUs`
   (the plural endings are what matter).
4. `nounEntry`: for a `pluralOnly` noun, `${nom}, ${genitive plural}, ${gender} pl.`, e.g.
   `arma, armorum, n. pl.`; an i-stem gives `fauces, faucium, f. pl.`.

Tests (`src/lib/morph/nouns.test.ts`): all six plural cells for `arma`, `thermae`, `liberi`, `fauces`,
`maiores`, `moenia` (*moenia, moenium, moenibus, moenia, moenibus, moenia*; *fauces, faucium, faucibus,
fauces/faucis, faucibus, fauces*; *maiores, maiorum, maioribus, maiores, maioribus, maiores*); no singular
cells (`nounCells` has six entries); the entries above.

## Task 2. Generator (`scripts/lexicon/nouns.ts`)

In `coreNouns`, before Whitaker matching: a core noun row is plural-only when its genitive part (the
second comma-separated part, macrons removed, leading `-` removed) ends in `orum`, `arum` or `um` /
`ium` **and** the headword is one of: contains `plur.`, or the nominative ends in `i`, `ae`, `a`, `es`.
Build the noun from the headword instead of Whitaker:

- declension: `arum` -> 1, `orum` -> 2, `um`/`ium` -> 3 (`ium` sets `iStem`)
- stem: the nominative (macrons removed) minus `ae` (1st), `i` or `a` (2nd), `ia` or `a` or `es` (3rd)
- gender: from the headword (`m.`, `f.`, `n.`), using the existing `headwordGenders` helper
- `trans`: as for other nouns
- `pluralOnly: true`

Test in `scripts/lexicon/nouns.test.ts` with the eight headwords above as fixture rows: each produces the
row in the table. Also test that a singular row such as `castrum, -ī, n.` is unaffected.

## Task 3. Forms and starter sets

- Forms already drops cells with no form (`nounCells`), so plural-only nouns only get plural questions.
  Check `src/lib/formsQuestions.ts` for anything that assumes a noun has a nominative singular (e.g. the
  distractor-cell picker or identify questions) and add a test that 200 noun questions drawn from a pool
  of just `arma` and `fauces` are all well-formed (non-empty answers, plural cells only).
- `src/features/vocab/starterSets.ts` lists nouns with `nounEntry`; the new entries appear there. Check
  the starter-set test still passes (it counts distinct entries).

## Task 4. Regenerate and check

`npm run seed`; the diff of `src/content/nouns.generated.ts` should add exactly the eight nouns. Then
`npm test`, `npx tsc -b`, `npm run build`. Update the known-limits line in
`docs/trainer-core-verbs-followups.md` to say plural-only nouns are in.
