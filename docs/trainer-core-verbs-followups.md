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

## Done (2026-11-15)

See `docs/superpowers/plans/2026-11-15-verb-data-audit.md` and `2026-11-15-noun-data-fixes.md`.

- Intransitive list reviewed: *ambulō, certō, cōnflīgō, doleō, dormiō, ignōscō, labōrō, persuādeō, pugnō* added; the hand-written `VERBS` (*venīre, stāre, currere, cadere, ...*) now follow it, checked by a test.
- Transitive verbs with no supine (*poscō, timeō, metuō, urgeō, ...*) keep a present-system passive; the perfect passive needs a 4th principal part.
- Endless accepts feminine and neuter perfect passives.
- Future participles: *ruitūrus, paritūrus, iuvātūrus, nascitūrus, secātūrus, fruitūrus*.
- The 14 missing core *ferō* and *eō* compounds are in; *efferō* is *efferre*; *ēdō, ēdere* is 3rd conjugation; stem fixes for *ēiciō, dēpōnō, āvellō, pertineō, discō*.
- Nouns: *imber, carō* are i-stems; *vātēs* has *vātum*; *fors, vicis* dropped; acc. *-im* and abl. *-ī* accepted where A&G allow them (*turrim, nāvī, sitim*). Plural-only nouns (*arma, faucēs, moenia, līberī, fascēs, ...*) are in Forms.
- Adjectives: *vetus* compares *vetustior*; the spurious adjective *polus* is gone.

## Still open

1. **Verbs with no perfect** (*quatiō, feriō, vergō, attollō, distō, furō, immineō, impendeō, revīsō, excellō*) are excluded. Task 1 of the verb audit makes a passive without a 4th part work; these still need a per-verb tense list for the active.
2. **Lodge plural-only nouns** (*insidiae, tenebrae, angustiae, reliquiae, minae, furiae, epulae, exuviae, altāria*) are missing from the core lexicon. Plan: `docs/superpowers/plans/2026-11-15-lodge-plural-nouns.md`.
3. **Strict / exceptions mode** (requested 2026-11-15). Students who apply the regular rule to an exception (*vatium* for *vātum*, *rutūrus* for *ruitūrus*, *sitem* for *sitim*) are marked wrong, and not everyone has learned every exception. Separate the exceptions from the normal drills: normal Forms and Endless runs draw only regular forms, and a separate strict mode, which a student or teacher switches on, forces the exceptions in and grades them strictly. This needs an `exception` flag on the words and cells that come from the override tables (`FUT_PART_STEM`, `CONSONANT_STEMS`, `I_STEMS`, `iForms`, irregular comparison, *-ius* genitives and similar), a filter in the Forms and Endless question pickers, and a setting in the UI. Needs its own spec.

## Known limits

- Plural-only nouns are in Forms. Numerals, *nēmō, nihil* and *bōs* are not.
- Locatives are not generated.
- *memor* takes abl. *memorī*; the engine gives *memore* (it is flagged as a consonant stem).
- Two verbs share the unmarked infinitive *venire* (*veniō* "come" and *vēneō* "be sold"); Endless labels both by their 1st principal part.
