# Verb data audit fixes

Date: 2026-11-15. Source: an audit of every trainer verb's principal parts and future active participle,
and of the core verbs that still allow a passive (`docs/trainer-core-verbs-followups.md`, items 1 and 3
and the future-participle known limit).

Rules that apply to every task: fix data in `scripts/lexicon/*` or the engine, never in
`src/content/*.generated.ts` or `supabase/seed*.sql`; regenerate those with `npm run seed`. TDD: write the
failing test first. Leave changes uncommitted.

## Task 1. Engine: a passive without a 4th principal part

`src/lib/morph/verbs.ts`, `hasVerbCell`: for a regular (non-irregular) verb that is not deponent or
semi-deponent, the perfect-system passive cells (indicative perfect, pluperfect, future perfect passive;
subjunctive perfect and pluperfect passive) exist only when `verb.ppp` is set. Today they fall back to
`verb.perf` and would produce `didicus est`. Present-system passives and the gerundive do not need `ppp`.

Tests: a verb `{ inf: 'timere', conj: 2, pres: 'tim', perf: 'timu', pp1: 'timeo', trans: 'to fear' }`
(no `ppp`, no `noPassive`) has `timetur` (indicative present passive 3sg), `timeretur` (subjunctive
imperfect passive 3sg) and `timendus`, and no indicative perfect passive, subjunctive perfect passive,
perfect passive infinitive or perfect passive participle.

## Task 2. Endless: only ask cells the verb has

`src/lib/conjugator.ts`, `generateRandomQuestion`: after the tense is picked, drop any voice the verb has
no form for in that tense (check with `hasVerbCell` on the subjunctive cell, 3rd singular), falling back
to `['active']`. Keep the order of `rng` calls the same for verbs where nothing is dropped, so existing
seeded tests are unaffected. Test: a custom pool holding only the `timere` verb above, with
`stdPass: true` only, never yields an empty answer over 200 draws and never asks a perfect or pluperfect
passive.

## Task 3. Endless accepts feminine and neuter perfect passives

`src/lib/formsQuestions.ts` has a private `genderVariants` (`amatus est` -> `amata est`, `amatum est`;
`amati sunt` -> `amatae sunt`, `amata sunt`). Move it to `src/lib/morph/verbs.ts` as an exported
function, re-export it from `src/lib/morph/index.ts` if that file re-exports verb helpers, and use it in
both places. In `generateRandomQuestion`, the `answers` array becomes the forms followed by the gender
variants of each form (no duplicates). `answers[0]` and the explanation stay masculine.

Tests: a perfect passive Endless question for `amare` accepts `amata sit` style answers (use a custom
pool of one verb and loop the seeded rng until a perfect or pluperfect passive comes up, or call a small
exported helper if you add one); a deponent perfect (`secutus sim`) accepts `secuta sim` and
`secutum sim`; a single-word form gets no variants.

## Task 4. Principal parts of the hand-written deponents

`principalParts` in `src/lib/morph/verbs.ts` builds a deponent's first part as `pres + 'or'` when there
is no `pp1`. That gives `veror, moror, pator, egredor, oror` for the hand-written `vereri, mori, pati,
egredi, oriri`. The first part is `pres + 'eor'` for conj 2, `pres + 'ior'` for conj 3.5 and 4, and
`pres + 'or'` for conj 1 and 3. Test all five plus `sequi` (`sequor`) and `hortari` (`hortor`).

## Task 5. Future active participles

Add to `FUT_PART_STEM` in `src/lib/morph/verbs.ts` (keyed by infinitive; `parere` covers both *pāreō*
and *pariō*, whose future participle is the same *paritūrus*):

| inf | stem | participle |
|---|---|---|
| ruere | ruitur | ruitūrus |
| parere | paritur | paritūrus |
| iuvare | iuvatur | iuvātūrus |
| nasci | nascitur | nascitūrus |
| secare | secatur | secātūrus |
| frui | fruitur | fruitūrus |

`adiuvare` keeps `adiuturus`. Test each row plus `adiuvare`.

## Task 6. Lexicon verb data (`scripts/lexicon/verbs.ts`)

1. `INTRANSITIVE`: add `ambulo, certo, confligo, doleo, dormio, ignosco, laboro, persuadeo, pugno`.
2. New `TRANSITIVE_NO_SUPINE` set (by 1st principal part): `arceo, deposco, horreo, incolo, metuo,
   pertimesco, posco, timeo, urgeo`. These transitive verbs have no 4th principal part in Whitaker, so
   today they get `noPassive`. In `coreTrainerVerbs`, delete `noPassive` for them (Task 1 makes the
   present-system passive work without `ppp`).
3. New `STEM_OVERRIDES` (by 1st principal part), applied in `coreTrainerVerbs` after matching, for rows
   where Whitaker's chosen line is wrong:
   - `eicio`: `perf: 'eiec'`, `ppp: 'eiect'` (Whitaker's first line `eici eic eic eict` is a bogus entry)
   - `depono`: `ppp: 'deposit'` (Whitaker's best-frequency line has the syncopated `depost`)
   - `avello`: `ppp: 'avuls'` (not the archaic `avols`)
   - `pertineo`: remove `ppp` (Whitaker's `pertent` is not a real supine; it only produced `pertenturus`)
   - `disco`: remove `ppp` (`discitus` is not classical; D'Ooge gives `discō, -ere, didicī`). With Task 1
     *discitur* stays and the perfect passive goes.
4. Add a test in `scripts/lexicon/verbs.test.ts` for each of the above against a small hand-made
   DICTLINE fixture, following the existing tests' style.

## Task 7. Whitaker data fixes (`scripts/lexicon/whitaker.ts`, `scripts/build-seed.ts`)

DICTLINE lines 18733-18739 (`ed ed edid edit V 1 1 TRANS ...`, *ēdō, ēdere* "give out, publish") are
coded 1st conjugation, which produces the core headword `edo, edare, edidi, editus` and the trainer verb
`edare`. Add an exported `applyDictlineFixes(text: string): string` in `whitaker.ts` that rewrites the
code of lines whose stems are exactly `ed ed edid edit` from `V      1 1` to `V      3 1` (keep column
widths), and call it once on the DICTLINE text in `build-seed.ts` before every parser sees it. Test it on
a fixture line.

## Task 8. Core-row overrides for ambiguous Lodge lemmas (`scripts/lexicon/compose.ts`)

Lodge marks lemmas, not entries, so `composeLexicon` marks every best-frequency Whitaker row of a Lodge
lemma as core. Two picks are wrong:

- Lodge 559 `ef-fero` is *efferō, efferre, extulī, ēlātus* (carry out), but the 1st-conjugation
  *efferō, efferāre* (make wild, frequency B) beats it (frequency D).
- Lodge 1389 `praedo` (between *praedico* and *praedor*) is the noun *praedō, praedōnis* (robber), but the
  verb *praedo, praedare* is also marked core.

Add a `CORE_OVERRIDES: Record<string, string[]>` keyed by lemma key, listing the exact headwords that are
core for that lemma; when a key is present, only those rows are core (any row with that exact headword,
whatever its frequency). Use the headwords exactly as the Whitaker parser writes them (run the composer
and check). Entries: `effero` -> the `efferre, extuli, elatus` row; `praedo` -> the noun row. Test with a
fixture in `scripts/lexicon/compose.test.ts`. After this, `effero` should come out of
`coreTrainerVerbs` as a `ferre` compound (`efferre`, prefix `ef`, perf `extul`, ppp `elat`).

## Task 9. Hand-written verbs follow the intransitive list

`VERBS` in `src/lib/conjugator.ts` shadows the generated verb with the same key, so the generated
`noPassive` never applies to hand-written *venire, stare, currere, ...*. Endless can ask for *veniar*.

1. Set `noPassive: true` on the hand-written `ambulare, laborare, pugnare, errare, stare, manere, sedere,
   cedere, currere, discedere, procedere, dormire, venire, pervenire`.
2. Add a test in `src/lib/conjugator.test.ts`: every hand-written, non-deponent, non-irregular verb whose
   generated counterpart (same `verbKey` in `CORE_VERBS`) is `noPassive` is itself `noPassive`, except an
   explicit allow-list containing `convenire` (transitive "meet"). Run it after `npm run seed`.

## Task 10. Regenerate and check

Run `npm run seed`. Inspect the diff of `src/content/verbs.generated.ts` and report every changed verb
line. Expected changes: `edere` replaces `edare`; `efferre` replaces `efferare`; `praedare` is gone;
`eicere`, `deponere`, `avellere`, `pertinere`, `discere` change as in Task 6; the intransitive additions
gain `noPassive`; the `TRANSITIVE_NO_SUPINE` verbs lose it. Anything else changing is a surprise to report.
Then `npm test`, `npx tsc -b`, `npm run build`.
