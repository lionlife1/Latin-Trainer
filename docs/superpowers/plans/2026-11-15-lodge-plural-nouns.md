# Lodge plural-only nouns in the core lexicon

Date: 2026-11-15. Depends on `2026-11-15-plural-only-nouns.md` (the `pluralOnly` noun path).

## Problem

Lodge lists some nouns by their plural (*insidiae, tenebrae*). Whitaker stores them as singular-stem
1st-declension (or 3rd-declension) entries whose definition says "(pl.)", and `headwordFor` writes
`insidia, insidiae, f.`. The lemma keys differ (`insidiae` against `insidia`), so these Lodge words are
in the 64 unmatched Lodge lemmas and are missing from the core lexicon, the starter vocab sets and Forms.

## Task 1. Alias table (`scripts/lexicon/compose.ts`)

Add `LODGE_PLURALS: Record<string, { from: string; headword: string; lemma: string; sense?: string }>`
keyed by the Lodge lemma key. `from` is the exact Whitaker headword as `headwordFor` writes it; `sense`,
when given, is a substring the Whitaker definition must contain (to pick the right one of several rows
with the same headword). In `composeLexicon`, for each entry whose Lodge key is present and unmatched,
find the Whitaker noun row with headword `from` (and `sense`), and emit it as a core row with the plural
`headword` and `lemma` instead of the singular ones. Remove the key from `unmatchedLodge`. The singular
Whitaker row itself is not emitted a second time (replace it, don't duplicate it).

| Lodge key | from | headword | lemma | sense |
|---|---|---|---|---|
| angustiae | angustia, angustiae, f. | angustiae, angustiarum, f. plur. | angustiae | |
| epulae | epula, epulae, f. | epulae, epularum, f. plur. | epulae | |
| exuviae | exuvia, exuviae, f. | exuviae, exuviarum, f. plur. | exuviae | |
| furiae | furia, furiae, f. | furiae, furiarum, f. plur. | furiae | |
| insidiae | insidia, insidiae, f. | insidiae, insidiarum, f. plur. | insidiae | |
| minae | mina, minae, f. | minae, minarum, f. plur. | minae | threats |
| reliquiae | reliquia, reliquiae, f. | reliquiae, reliquiarum, f. plur. | reliquiae | |
| tenebrae | tenebra, tenebrae, f. | tenebrae, tenebrarum, f. plur. | tenebrae | |
| altaria | altare, altaris, n. | altaria, altarium, n. plur. | altaria | |

Check every `from` string against the real `parseDictline` output before relying on it (print the
Whitaker rows for these stems); if one differs, use the real string, and if a row doesn't exist, leave
that entry out and report it.

Tests in `scripts/lexicon/compose.test.ts` with fixture rows: the alias produces one core row with the
plural headword, the singular row is gone, the Lodge key is no longer unmatched, and `sense` picks the
right row when two rows share a headword.

## Task 2. Regenerate and check

`npm run seed`. Expected: unmatched Lodge lemmas drop by up to nine; core rows rise by the same number;
`src/content/nouns.generated.ts` gains these nouns as `pluralOnly` (via the plural-only path; 1st
declension, *altaria* 3rd-declension neuter i-stem). Report the diff. `npm test`, `npx tsc -b`,
`npm run build`.
