# Core verbs in the Endless trainer: follow-ups

The Endless trainer draws about 870 verbs: the 130 hand-written `VERBS` in `src/lib/conjugator.ts` plus 778 core lexicon verbs generated into `src/content/verbs.generated.ts` (see `docs/superpowers/plans/2026-11-04-trainer-core-verbs.md`). This page lists what is still left out and the small errors we know about.

`npm run seed` regenerates the verb file. Fixes to the data belong in `scripts/lexicon/verbs.ts`, never in the generated file.

## Next steps

1. **Semi-deponents.** *audeō, gaudeō, soleō, fīdō, cōnfīdō* are excluded. Their present and imperfect are active, and their perfect and pluperfect are passive in form. This needs a `semiDeponent` flag in `generateSubjunctiveForm`, and a decision on which Endless checkbox covers them (probably Deponents).
2. **Passive of transitive *īre* compounds.** *trānseō, adeō, circumeō, ineō* have a passive (*trānseātur*). All *īre* compounds are `noPassive` for now.
3. **Better English meanings.** `shortGloss` takes the first sense of the definition. That works for D'Ooge rows, but Whitaker's first sense is often odd. A small override map keyed by `pp1` in `scripts/lexicon/verbs.ts` would fix the worst ones (see below).
4. **Review the intransitive list.** `INTRANSITIVE` in `scripts/lexicon/verbs.ts` was put together by hand from the generated list. Whitaker's `X` kind (unspecified) still allows the passive. Spot-check the verbs that still allow it for any more intransitives.
5. **Verbs with no perfect** (*quatiō, feriō, vergō, attollō, distō, furō, immineō, impendeō, revīsō, excellō*) are excluded. They could be drilled in the present and imperfect only, if the trainer ever supports a per-verb tense list.

## Small known errors

| Verb | Problem | Fix |
|---|---|---|
| *sonere* | The archaic 3rd-conjugation *sonō* is drilled next to *sonāre*, because the lexicon has two core *sonō* rows | Drop the duplicate core row, or skip `sonere` |
| *surgere* | Gloss reads "to from below" because the D'Ooge definition is broken | Gloss override |
| *mūtāre, peragere, lībāre, tuērī, cernere, fallere, differre, ruere* | Gloss is Whitaker's first sense ("to move", "to disturb", "to nibble", …) | Gloss override |
| *poscere* | `noPassive` because Whitaker has no participle stem, though the verb is transitive | Allow the present/imperfect passive, or leave as is (no wrong form is drilled) |
| *fārī* | Defective verb drilled in every person and tense | Exclude it |
| *cadere, iacēre*, … | Hints show Whitaker's future-participle stem as the 4th part (*cado, cadere, cecidi, casus*) | Hide the 4th part when the verb is `noPassive` |
| *īre* compounds | The alternate pluperfect answers replace the first `iv` anywhere in the form. That is safe for every current prefix, but fragile | Replace only after `prefix` |
