# Core verbs and the morphology engine: follow-ups

The Endless trainer draws about 870 verbs: the 130 hand-written `VERBS` in `src/lib/conjugator.ts` plus 778 core lexicon verbs generated into `src/content/verbs.generated.ts` (see `docs/superpowers/archive/plans/2026-11-04-trainer-core-verbs.md`). The same data feeds the morphology engine in `src/lib/morph/`, which powers Forms. This page lists what is still left out and the limits we know about.

`npm run seed` regenerates the verb file. Fixes to the data belong in `scripts/lexicon/verbs.ts`, never in the generated file.

## Done (2026-11-06)

- Semi-deponents (*audeō, gaudeō, soleō, fīdō, cōnfīdō*).
- Passives of transitive *īre* compounds (*trānseātur*).
- Gloss overrides for the worst Whitaker first senses.
- *fārī* is handled as a defective verb.
- *sonere* no longer shows up next to *sonāre*.
- The 4th principal part is hidden where it is only a future-participle stem.
- *īre* pluperfect variants are replaced only after the prefix.
- *effugere* no longer gets a passive participle.
- *fruor* is handled.

## Still open

1. **Review the intransitive list.** `INTRANSITIVE` in `scripts/lexicon/verbs.ts` was put together by hand from the generated list. Whitaker's `X` kind (unspecified) still allows the passive. Spot-check the verbs that still allow it for any more intransitives.
2. **Verbs with no perfect** (*quatiō, feriō, vergō, attollō, distō, furō, immineō, impendeō, revīsō, excellō*) are excluded. They could be drilled in the present and imperfect only, if the trainer ever supports a per-verb tense list.
3. ***poscere*** is `noPassive` because Whitaker has no participle stem, though the verb is transitive. Allow the present and imperfect passive, or leave it (no wrong form is drilled).

## Known limits

- Endless accepts only masculine perfect passives (*amātus est*). Forms accepts the feminine and neuter too.
- Future participles of *iuvō, ruō, pariō* and similar verbs come from the 4th principal part. *adiūtūrus* is right, *ruitūrus* is not.
- Plural-only nouns (*arma, castra*), numerals, *nēmō, nihil* and *bōs* are not in Forms.
- Locatives are not generated.
