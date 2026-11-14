# Core Lexicon Verbs in the Endless Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the 812 core `verb` rows of the open lexicon into conjugator `Verb` records, so the Endless trainer drills ~700 verbs instead of the 130 hand-written ones in `VERBS`.

**Architecture:** We don't parse the lexicon headword strings. They come in two formats: D'Ooge's abbreviated `con-clūdō, -ere, -clūsī` and Whitaker's full forms. Instead, `npm run seed` reads the stems that Whitaker's `DICTLINE.GEN` already splits out:
- s1 present, s2 infinitive, s3 perfect, s4 participle
- plus the conjugation code and TRANS/INTRANS/DEP kind

It maps them straight onto the `Verb` shape. The core lexicon rows only decide *which* verbs to include and supply the English gloss. The seed writes `src/content/verbs.generated.ts`. The conjugator merges that file with the hand-written `VERBS`, and a hand-written entry wins on the same infinitive. We also extend the conjugator a little, so it covers compounds of *esse*, *ferre* and *īre* and drills no passive for verbs that have none.

**Tech Stack:** TypeScript, `tsx` scripts, Vitest.

**Spec:** None separate. Scope comes from the 2026-11-04 request ("regularize the new verbs we got, so that we can include them in the trainer") and from these numbers, measured on the current seed:

| Bucket (core verbs) | Count | Handling |
|---|---|---|
| Regular 1st / 2nd / 3rd / 3rd -iō / 4th | ~690 | generate |
| Deponents | ~80 | generate |
| Compounds of sum / ferō / eō | ~20 | generate with `base` + `prefix` |
| No perfect stem, no participle | ~60 | generate with `noPassive` (perfect stem required) |
| Semi-deponents (audeō, gaudeō, soleō, fīdō, cōnfīdō) | 5 | **excluded** |
| Defective / impersonal (ōdī, meminī, inquit, IMPERS) | ~5 | **excluded** |
| volō / nōlō / mālō / fīō / possum / sum / ferō / eō | — | already hand-written; the hand-written entry wins |

## Decisions

- **Source of forms:** Whitaker stems, not headwords. Forms stay macron-free, like the existing `VERBS`. `normalize()` strips macrons from student input, so answers still match.
- **`j` → `i`** in every generated stem (`subjec` → `subiec`), to match the existing `VERBS` and `lemmaKey`.
- **Matching a lexicon row to Whitaker lines:** a candidate matches when both hold:
  - `lemmaKey(present 1sg of candidate) === lemmaKey(row.lemma)`
  - `lemmaKey(candidate.inf)` ends with `lemmaKey` of the row's 2nd principal part, after stripping the leading `-`
  
  The second check separates homographs: *volō, -āre* (fly) from *volō, velle*, and *dīcō, -āre* from *dīcō, -ere*. When several candidates match, the best Whitaker frequency letter wins, and file order breaks ties.
- **Passive:** `noPassive` is true when the Whitaker kind is `INTRANS`, when s4 is `zzz`, or when `base` is `esse`/`ire`. `X` (unspecified) and `TRANS` allow the passive.
- **Gloss (`trans`):** take the row's definition, cut at the first `;`, then at the first `,`. Strip `(…)` and `[…]`, and trim. Add `to ` in front unless the gloss already starts with `to `. If it is longer than 40 chars, cut back to the last space before char 40.
- **Hand-written `VERBS` stay as they are,** and win over generated entries on `inf`. The generated file is committed, so the app never reads the lexicon at runtime.
- **YAGNI non-goals:** no semi-deponents, no passive of transitive *īre* compounds (*trānseō*), no macrons in trainer forms, no new Endless checkboxes, no runtime DB fetch, no change to the vocab trainer.

## Global Constraints

- The Whitaker conjugation code → `Verb` mapping is fixed (s1–s4 are the DICTLINE stem columns; `+` means string concat):

| Code | conj | pres | inf | perf | ppp |
|---|---|---|---|---|---|
| `1 1` | 1 | s1 | s2+`are` | s3 | s4 |
| `2 1` | 2 | s1 | s2+`ere` | s3 | s4 |
| `3 1`, s1 = s2+`i` | 3.5 | s2 | s2+`ere` | s3 | s4 |
| `3 1` otherwise | 3 | s1 | s2+`ere` | s3 | s4 |
| `3 4` | 4 | s1 | s2+`ire` | s3 | s4 |
| `5 1` | — | — | s2+`esse` | s3 | — |
| `6 1` | — | — | s2+`re` | s3 | — |
| `3 2` | — | — | s1+`re` | s3 | s4 |

  For the last three rows:
  - `5 1` uses `base:'esse'`, `prefix`: s1 minus its final `s`.
  - `6 1` uses `base:'ire'`, `prefix`: s1 minus its final `e`.
  - `3 2` uses `base:'ferre'`, `prefix`: s1 minus `fer`.
  - All three are `irregular: true`.
- **DEP rows:**
  - `inf` is s2 + `ari` / `eri` / `i` / `iri` for conj 1 / 2 / 3 or 3.5 / 4.
  - `impfBase` is s2 + `are` / `ere` / `ere` / `ire`.
  - `perf` is s4, matching the existing deponents (`conat`).
  - `deponent: true`.
- **`pp1`** (the 1st principal part, used in hints):

| Row | `pp1` |
|---|---|
| conj 1 | s1+`o` |
| conj 2 | s1+`eo` |
| conj 3 / 3.5 | s1+`o` |
| conj 4 | s1+`io` |
| DEP | same, with `r` added |
| `5 1` | s1+`um` |
| `6 1`, `3 2` | s1+`o` |

- **Skip a Whitaker line** if any of these hold:
  - its code is not in the table above
  - its kind is `SEMIDEP` or `IMPERS`
  - s3 is `zzz` (for non-deponents) or s4 is `zzz` (for deponents)
  - its meaning starts with `|` (continuation lines)
  - its age is `F`/`G`/`H`
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **An intransitive verb drawn with "Standard (Passive)" on.** *Cadō* must never be asked as `caderetur`. Today `generateRandomQuestion` ignores `noPassive` for standard verbs. Task 1 test.
2. **Homographs.** *volō, -āre* (fly) must generate `volare`/`volav`, not merge with *velle*. *dīcō* (3rd) must not pick up *dicare*'s stems. Task 3 real-data test.
3. **A generated verb with the same `inf` as a hand-written one** (`amare`, `ferre`, `ire`). The hand-written entry is kept, and the verb appears in the pool only once. Task 4 test.
4. **Duplicate and variant Whitaker lines** (*cōnferō* has both `collat` and `conlat`; *absum* has `abfu`, freq D, and `afu`, freq A). The result is one `Verb`, built from the best-frequency line. Task 2 test.
5. **Pluperfect of an *īre* compound** (*redeō*). Accept `redivissem`, `rediissem` and `redissem`, the same way bare `ire` does today. Task 1 test.

---

### Task 1: Conjugator handles compound irregulars and `noPassive`

**Files:**
- Modify: `src/lib/conjugator.ts`
- Test: `src/lib/conjugator.test.ts`

**Interfaces:**
- Produces: these new optional fields on `Verb`, which Tasks 2–4 fill in.
  ```ts
  base?: 'esse' | 'ferre' | 'ire';
  prefix?: string;
  pp1?: string;
  ```
  `generateSubjunctiveForm` and `generateRandomQuestion` keep their signatures. Also add `export function trainerPool(): Verb[]`. For now it returns `VERBS`; Task 4 adds the merge.

- [ ] **Step 1: Write the failing tests** in `conjugator.test.ts`, using inline `Verb` objects:

```ts
const absum: Verb = { inf: 'abesse', irregular: true, noPassive: true, base: 'esse', prefix: 'ab', perf: 'afu', pp1: 'absum', trans: 'to be away' };
const confero: Verb = { inf: 'conferre', irregular: true, base: 'ferre', prefix: 'con', perf: 'contul', ppp: 'collat', pp1: 'confero', trans: 'to bring together' };
const redeo: Verb = { inf: 'redire', irregular: true, noPassive: true, base: 'ire', prefix: 'red', perf: 'rediv', pp1: 'redeo', trans: 'to return' };
const cado: Verb = { inf: 'cadere', conj: 3, pres: 'cad', perf: 'cecid', noPassive: true, pp1: 'cado', trans: 'to fall' };

it('esse compound present', () => expect(generateSubjunctiveForm(absum, 'present', 'active', 1, 'singular')).toBe('absim'));
it('esse compound imperfect', () => expect(generateSubjunctiveForm(absum, 'imperfect', 'active', 3, 'plural')).toBe('abessent'));
it('ferre compound present passive', () => expect(generateSubjunctiveForm(confero, 'present', 'passive', 3, 'singular')).toBe('conferatur'));
it('ferre compound perfect passive', () => expect(generateSubjunctiveForm(confero, 'perfect', 'passive', 1, 'plural')).toBe('collati simus'));
it('ire compound present', () => expect(generateSubjunctiveForm(redeo, 'present', 'active', 2, 'singular')).toBe('redeas'));
```

  Plus a `generateRandomQuestion` test. It uses a pool hook (see Step 3) holding only `cado`, with `{stdAct:false, stdPass:true, dep:false, irr:false}`. Over 50 seeded draws, it asserts that every prompt contains `active` and none contains `passive`.

  Plus a test for a pool of only `redeo` with `irr: true`. Over seeded draws, every pluperfect 1sg question has `answers` containing `redivissem`, `rediissem` and `redissem`. The hint is `Principal parts: redeo, redire, redivi`.

- [ ] **Step 2: Run them to make sure they fail.** Run `npx vitest run src/lib/conjugator.test.ts`. Expected: the new tests FAIL. The compound verbs get bare endings (`m` instead of `absim`, because they have no `conj`), and `cado` is asked in the passive.

- [ ] **Step 3: Implement the changes in `src/lib/conjugator.ts`:**
  - Inside `generateSubjunctiveForm`, compute `const irr = verb.base ?? verb.inf` and `const pre = verb.prefix ?? ''`. Route the existing `esse`/`ferre`/`ire` branches through `irr` and put `pre` in front of the present forms (`pre + 'sim'…`, `pre + 'fera'`, `pre + 'ea'`). Imperfect already uses `verb.inf`, so leave it unchanged.
  - Give `generateRandomQuestion` an optional third parameter, `pool: Verb[] = trainerPool()`, and filter that pool instead of `VERBS`.
  - In the standard-verb voice branch, push `passive` only when `!verb.noPassive`. If no voice is left, fall back to `['active']`.
  - Run the `ire` alternate-answer rule when `(verb.base ?? verb.inf) === 'ire'`.
  - Hints: if `verb.pp1` is set, build a generic hint in two shapes:
    - `Principal parts: ${pp1}, ${inf}, ${perf}i` plus `, ${ppp}us` when there is a `ppp`
    - for deponents, `${pp1}, ${inf}, ${perf}us sum`
    
    Keep the hand-written irregular hint strings for `esse`, `posse` and the rest when `pp1` is absent.

- [ ] **Step 4: Run the tests.** Run `npx vitest run src/lib/conjugator.test.ts`. Expected: all PASS, including the existing ones.

- [ ] **Step 5: Commit.** `git commit -am "feat(conjugator): compound irregulars, honor noPassive for standard verbs"` (with the Co-Authored-By line).

---

### Task 2: Whitaker verb stems → `Verb`

**Files:**
- Create: `scripts/lexicon/verbs.ts`
- Test: `scripts/lexicon/verbs.test.ts`

**Interfaces:**
- Consumes: `Verb` (type only) from `src/lib/conjugator.ts`.
- Produces:
  ```ts
  export interface WhitakerVerb { verb: Omit<Verb, 'trans'>; freq: string; line: number }
  export function parseWhitakerVerbs(dictline: string): WhitakerVerb[]
  ```
  The result is deduplicated by `inf`. For each `inf` we keep the best freq letter (`A` best, missing worst), and file order breaks ties. `line` is the 0-based source line, kept for tie-breaks in Task 3.

- [ ] **Step 1: Write the failing tests.** Build fixture lines from the real DICTLINE. Copy the exact lines for `am`/`amav` (1 1), `adhib` (2 1), `capi`/`cap` (3 1 → 3.5), `ag`/`eg`, `aud…` (3 4), `hort` (DEP 1), `sequ` (DEP 3), `abs`/`afu` and `abs`/`abfu` (5 1), `rede` (6 1), the four `confer` lines (3 2), `aud`/`aus` (SEMIDEP), and an `IMPERS` line. Use `grep` to pull them. Assert:
  - `amare` → `{conj:1, pres:'am', perf:'amav', ppp:'amat', pp1:'amo'}`.
  - `capere` → `{conj:3.5, pres:'cap', perf:'cep', ppp:'capt', pp1:'capio'}`.
  - `hortari` → `{conj:1, pres:'hort', deponent:true, perf:'hortat', impfBase:'hortare', pp1:'hortor'}`.
  - `abesse` → `{irregular:true, base:'esse', prefix:'ab', perf:'afu', noPassive:true, pp1:'absum'}`. Only one `abesse` comes back, and its `perf` is `afu`, not `abfu`.
  - `conferre` → a single entry with `base:'ferre', prefix:'con', perf:'contul'`.
  - `redire` → `{base:'ire', prefix:'red', perf:'rediv', noPassive:true, pp1:'redeo'}`.
  - The SEMIDEP, IMPERS and `|`-continuation lines produce nothing.
  - A line with s3 `subjec` produces `perf:'subiec'`.
  - A `3 1 INTRANS` line has `noPassive: true`. A `3 1 X` line has no `noPassive`.

- [ ] **Step 2: Run them to make sure they fail.** Run `npx vitest run scripts/lexicon/verbs.test.ts`. Expected: FAIL, because the module is not found.

- [ ] **Step 3: Implement `parseWhitakerVerbs(dictline)`.** Use the Global Constraints tables. Reuse the column slicing that `parseDictlineLine` in `whitaker.ts` uses: stems at 0/19/38/57 (width 19), codes at 76–100, age at 100, freq at 106, meaning from 110. Extract that slicing into an exported `dictlineFields(line)` in `whitaker.ts` instead of duplicating it.

- [ ] **Step 4: Run the tests.** Run `npx vitest run scripts/lexicon`. Expected: PASS, and `whitaker.test.ts` still passes.

- [ ] **Step 5: Commit.** `feat(seed): derive conjugator verbs from Whitaker stems`

---

### Task 3: Match core lexicon verbs and write `verbs.generated.ts`

**Files:**
- Modify: `scripts/lexicon/verbs.ts`
- Modify: `scripts/build-seed.ts` (`main`)
- Create (generated, committed): `src/content/verbs.generated.ts`
- Test: `scripts/lexicon/verbs.test.ts`

**Interfaces:**
- Consumes: `parseWhitakerVerbs` (Task 2), `lemmaKey` from `compose.ts`, and `LexiconRow` from `build-seed.ts`.
- Produces:
  ```ts
  export function shortGloss(definition: string): string
  export function coreTrainerVerbs(rows: LexiconRow[], whitaker: WhitakerVerb[]): { verbs: Verb[]; unmatched: string[] }
  export function verbsModule(verbs: Verb[]): string
  ```
  - `coreTrainerVerbs` considers only `core && pos === 'verb'` rows. Its output is sorted by `inf` and unique by `inf`.
  - `verbsModule` returns the TS source: a header comment, `import type { Verb } from '../lib/conjugator';` and `export const CORE_VERBS: Verb[] = [...]`.
  - The generated file exports `CORE_VERBS: Verb[]`.

- [ ] **Step 1: Write the failing tests:**
  - `shortGloss`:
    - `'hide, conceal'` → `'to hide'`
    - `'say, declare, state; allege'` → `'to say'`
    - `'be away/absent/distant'` → `'to be away/absent/distant'`
    - `'to try (to)'` → `'to try'`
    - a 60-char gloss is cut back to ≤ 40 chars at a space
  - A real-data test reads the vendored sources the same way `build-seed.ts` `main` does (`composeLexicon(...)` → `coreTrainerVerbs(rows, parseWhitakerVerbs(dictline))`). It asserts:
    - `verbs.length` is between 600 and 800.
    - `inf` values are unique.
    - Contains `volare` with `perf:'volav'`.
    - Contains `dicere` with `perf:'dix'`, and does not contain `dicare`. Only `dīcō, -ere` is a core row.
    - Contains `abesse`, `conferre`, `redire`, `subigere` (`perf:'subeg'`), `conari`.
    - Does not contain `audere`, `gaudere`, `odisse`, or anything whose `pp1` is `inquio`.
    - Every verb has a non-empty `trans` starting with `to `.
    - `unmatched.length` < 40. Print the list so the reviewer can eyeball it.
  - A test that `verbsModule([...])` output parses as TS: run it through `esbuild.transformSync`, which Vite already ships, and check it doesn't throw.

- [ ] **Step 2: Run them to make sure they fail.** Run `npx vitest run scripts/lexicon/verbs.test.ts`. Expected: FAIL, because these are not exported.

- [ ] **Step 3: Implement the three functions** using the Matching and Gloss rules in Decisions. For a row, the "2nd principal part" is `row.headword.split(',')[1]` with macrons stripped and the leading `-` removed. A row with no 2nd part is unmatched. When several candidates tie on freq, the lower `line` wins.

- [ ] **Step 4: In `build-seed.ts` `main`,** after composing the lexicon:
  - run `coreTrainerVerbs`
  - write `src/content/verbs.generated.ts` with `verbsModule`
  - log `verbs.generated.ts: N verbs, M unmatched core verbs` and the unmatched lemmas, the same way `unmatchedLodge` is logged

- [ ] **Step 5: Run `npm run seed`.** Expected: the log line shows N in 600–800. `git diff --stat` shows the new generated file and no change to `seed-lexicon.sql`.

- [ ] **Step 6: Spot-check by hand 10 random generated verbs** against a grammar. In particular check one each of 2nd, 3rd -iō, 4th, deponent and a *ferō* compound. Fix any mapping error in Task 2's table, with a regression test, before committing.

- [ ] **Step 7: Run `npx vitest run scripts`.** Expected: PASS.

- [ ] **Step 8: Commit.** `feat(seed): generate core trainer verbs from the lexicon`

---

### Task 4: Trainer draws from the merged pool

**Files:**
- Modify: `src/lib/conjugator.ts` (`trainerPool`)
- Modify: `src/features/solo/EndlessModal.tsx` (copy only, if needed)
- Test: `src/lib/conjugator.test.ts`

**Interfaces:**
- Consumes: `CORE_VERBS` from `src/content/verbs.generated.ts`, and `trainerPool` from Task 1.
- Produces: `trainerPool(): Verb[]` = `VERBS`, followed by the `CORE_VERBS` whose `inf` is not already in `VERBS`. It is memoized in a module-level constant.

- [ ] **Step 1: Write the failing tests:**
  - `trainerPool().length > 600`.
  - `inf` values are unique.
  - `trainerPool().find(v => v.inf === 'amare')` is the hand-written object: same `trans` (`'to love'`), no `pp1`.
  - Same check for `ferre`: it is the hand-written one, with no `base`.
  - Smoke test: for 2,000 seeded `generateRandomQuestion` calls with every option on, every answer is non-empty and contains no `undefined`/`NaN`. Also, no answer contains `j` or a macron.

- [ ] **Step 2: Run them to make sure they fail.** Run `npx vitest run src/lib/conjugator.test.ts`. Expected: the pool-size test FAILS (130).

- [ ] **Step 3: Implement the merge in `trainerPool`.**

- [ ] **Step 4: Run everything.** Run `npm test`, then `npx tsc --noEmit`, then `npm run build`. Expected: all pass. Note how much the bundle grew in the commit message; it should be under 100 KB raw.

- [ ] **Step 5: Check it in the browser.** Use `preview_start` with the project's launch config and open Endless Train with every option on. Answer 10 questions and confirm prompts show varied, mostly unfamiliar verbs and that the hints read `Principal parts: …`. Save a screenshot.

- [ ] **Step 6: Commit.** `feat(trainer): drill core lexicon verbs in Endless Train`
