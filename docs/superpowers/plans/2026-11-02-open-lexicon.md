# Open Lexicon (Whitaker + Lodge + D'Ooge) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 226-word starter lexicon (and the optional CC BY-SA DCC import) with a ~35,000-entry built-in dictionary built only from public-domain or "any use" sources. About 2,500 of those entries are flagged `core`. Teachers searching the dictionary see the full list, with core words first. The trainers draw built-in words from the core list only.

**Architecture:** Commit the three raw sources under `content/sources/`. `npm run seed` parses them (`scripts/lexicon/*`), merges them into `LexiconRow[]` with a `core` flag, and writes a separate `supabase/seed-lexicon.sql` of batched upserts. A migration adds `lexicon.core` and a unique key on built-in `(headword, pos)`. The app changes are two query tweaks and a credit line.

**Tech Stack:** TypeScript scripts run with `tsx`, Vitest, Postgres/Supabase migrations, psql SQL tests (`npm run test:db`).

**Spec:** None separate. The decisions below come from the 2026-11-02 conversation: the user asked for sources from Lodge, Whitaker and D'Ooge only, no CC BY-SA, a full list for teacher search and lookup, and a short list as the trainer default.

## Decisions

- **D'Ooge** (*Latin for Beginners*, 1909/1911, Project Gutenberg #18251) supplies about 1,280 core entries. They have macrons and school-style definitions. It's the best definition source, so a D'Ooge row wins over a Whitaker row for the same word.
- **Lodge** (*The Vocabulary of High School Latin*, 1909) supplies only *which* words are core and their rank (1–2000). Its OCR text is too noisy to use for definitions.
- **Whitaker's Words** (`DICTLINE.GEN`) supplies every other entry. It has no macrons, which is fine because search already ignores macrons. A Whitaker row becomes core only when Lodge lists its lemma.
- `frequency` holds the Lodge rank (lower means more common), or null.
- **Core** = every D'Ooge row, plus, for each Lodge lemma that has no D'Ooge row, the Whitaker row or rows with the best Whitaker frequency letter for that lemma.
- **YAGNI non-goals:**
  - No translator UI. `searchLexicon` already covers the full list, so a future lookup page just calls it.
  - No student Vocab trainer. It stays "Coming soon".
  - No core/full toggle in teacher search. Core-first ordering is enough.
  - No pg_trgm index. A 35k-row scan is fast enough.
  - No Whitaker irregular verbs (conj. 5–8) or Greek declensions. D'Ooge covers the common irregulars.
  - No downloading sources at build time.
  - No macrons added to Whitaker-only words.

## Global Constraints

- Allowed sources only:
  - `DICTLINE.GEN` + `LICENCE.txt` from `github.com/mk270/whitakers-words` at commit `a21505c180e1d6ce49263e5185fde3326e1e59c8`
  - the Lodge 1909 scan, archive.org item `vocabularyofhigh00lodguoft`
  - the LATIN-ENGLISH VOCABULARY section of Gutenberg #18251
- Nothing from DCC, Perseus, Wiktionary/kaikki or LiLa (all CC BY-SA). Delete the DCC code path.
- The D'Ooge file keeps only the glossary text, with no Gutenberg header, footer or license. The app never uses the name "Project Gutenberg".
- `pos` is one of: `noun verb adjective adverb pronoun preposition conjunction other` (matches `POS` in `VocabListEditor.tsx`).
- DB checks: `headword` 1–120 chars, `definition` 1–200 chars. Every generated row must satisfy both.
- Whitaker rows with age code `F`, `G` or `H` (medieval or modern) are excluded.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A teacher searches "amo".** The core `amō` row comes first, ahead of obscure Whitaker homographs (owned by Task 4's SQL test).
2. **Re-running the seed on a database where a teacher list already references a built-in word.** The seed must not fail and must keep that row (Task 4, `lexicon.test.sql`).
3. **A Whitaker meaning longer than 200 chars, or a long headword.** It must be clamped, not abort the whole seed (Task 4, `clampRow` test).
4. **The same `(headword, pos)` appearing twice in generated rows.** Postgres raises "ON CONFLICT DO UPDATE command cannot affect row a second time". `composeLexicon` must dedupe (Task 4 test).
5. **Definitions containing apostrophes** (`fireman's bucket`). SQL quoting must hold (Task 4, `lexiconSql` test).

---

### Task 1: Vendor the sources

**Files:**
- Create: `content/sources/whitaker/DICTLINE.GEN`, `content/sources/whitaker/LICENCE.txt`
- Create: `content/sources/dooge-latin-english.txt`
- Create: `content/sources/lodge-core.tsv`
- Create: `content/sources/README.md`
- Test: `scripts/lexicon/sources.test.ts`

**Interfaces:**
- Produces: the three files that Tasks 2–4 read. `lodge-core.tsv` is UTF-8, one `rank<TAB>lemma` per line, ranks 1–2000, no header. The lemma is Lodge's first word as printed: lowercase, hyphens allowed, no macrons (e.g. `98\tamo`, `96\ta-mitto`).

- [ ] **Step 1: Write the failing test** `scripts/lexicon/sources.test.ts`

```ts
import { readFileSync } from 'node:fs';
const read = (p: string) => readFileSync(`content/sources/${p}`, 'utf8');

describe('vendored lexicon sources', () => {
  it('has all 2000 Lodge ranks exactly once', () => {
    const rows = read('lodge-core.tsv').trim().split('\n').map(l => l.split('\t'));
    expect(rows.map(r => Number(r[0])).sort((a, b) => a - b)).toEqual(Array.from({ length: 2000 }, (_, i) => i + 1));
    for (const [, lemma] of rows) expect(lemma).toMatch(/^[a-z][a-z-]*$/);
  });
  it('has the pinned Whitaker DICTLINE', () => {
    expect(read('whitaker/DICTLINE.GEN').split('\n').filter(Boolean)).toHaveLength(39335);
  });
  it('has only the D\'Ooge glossary, no Gutenberg boilerplate', () => {
    const t = read('dooge-latin-english.txt');
    expect(t.startsWith('LATIN-ENGLISH VOCABULARY')).toBe(true);
    expect(t).toContain('«ab-dō, -ere, -didī, -ditus», _hide, conceal_');
    expect(t).not.toMatch(/Gutenberg|ENGLISH-LATIN VOCABULARY/);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run scripts/lexicon/sources.test.ts`
Expected: FAIL with ENOENT.

- [ ] **Step 3: Download Whitaker and D'Ooge**

```bash
mkdir -p content/sources/whitaker
curl -sL -o content/sources/whitaker/DICTLINE.GEN https://raw.githubusercontent.com/mk270/whitakers-words/a21505c180e1d6ce49263e5185fde3326e1e59c8/DICTLINE.GEN
curl -sL -o content/sources/whitaker/LICENCE.txt https://raw.githubusercontent.com/mk270/whitakers-words/a21505c180e1d6ce49263e5185fde3326e1e59c8/LICENCE.txt
curl -sL https://www.gutenberg.org/cache/epub/18251/pg18251.txt | awk '/^LATIN-ENGLISH VOCABULARY$/{on=1} /^ENGLISH-LATIN VOCABULARY$/{on=0} on' > content/sources/dooge-latin-english.txt
```

Keep CRLF in DICTLINE as-is; the parser strips `\r`. Delete the Transcriber's Note block about brackets from the D'Ooge file only if the test's boilerplate check flags it. It is the transcriber's text, not Gutenberg's license.

- [ ] **Step 4: Build `lodge-core.tsv`.** Make a draft from the OCR, then fix the gaps by hand from the scan.

```bash
curl -sL -o /tmp/lodge.txt https://archive.org/download/vocabularyofhigh00lodguoft/vocabularyofhigh00lodguoft_djvu.txt
```

The vocabulary's numbering restarts at 1 after the introduction's numbered paragraphs. Find the line of vocabulary entry 1 (`grep -n '^1\.  ' /tmp/lodge.txt`, then pick the one followed by a Latin word, `a`/`ab`). Take matches of `^([0-9]{1,4})\.  +([A-Za-z-]+)` only after that line. Lowercase the lemma and keep the first occurrence of each rank. The draft has about 1,906 of 2,000 ranks. Fill each missing rank by reading that page of the scan at `https://archive.org/details/vocabularyofhigh00lodguoft`. Fix obvious OCR letter swaps now; Task 4 Step 6 catches the rest.

- [ ] **Step 5: Write `content/sources/README.md`.** For each file give:
  - the source URL (the Whitaker commit SHA, the archive.org item, and Gutenberg #18251 by URL only)
  - the license basis:
    - Whitaker: "Permission is hereby freely given for any and all use of program and data" (LICENCE.txt).
    - Lodge and D'Ooge: published 1909/1911, public domain in the US.
  - how the file was produced (the commands above).

  State that no CC BY-SA source may be added to `content/sources/`.

- [ ] **Step 6: Run the test**

Run: `npx vitest run scripts/lexicon/sources.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add content/sources scripts/lexicon/sources.test.ts
git commit -m "chore(content): vendor Whitaker, Lodge and D'Ooge lexicon sources"
```

---

### Task 2: D'Ooge glossary parser

**Files:**
- Create: `scripts/lexicon/dooge.ts`
- Test: `scripts/lexicon/dooge.test.ts`

**Interfaces:**
- Consumes: `lemmaOf` from `src/lib/lexicon.ts`.
- Produces: `export interface SourceRow { headword: string; lemma: string; definition: string; pos: string }` (exported from `dooge.ts`, reused by Task 3). Also `export function parseDooge(text: string): SourceRow[]`.

Parsing rules the tests pin:
- An entry starts at a line beginning `«`. Lines indented 4 spaces continue it. Lines indented 2 spaces are sub-phrases and are ignored. A blank line or a single capital letter line ends it.
- **Headword:** the text of the first `«…»`, with `´` and `-` removed. If the entry starts `«x» or «y»`, the headword is `x or y` and the lemma is `lemmaOf(x)`. For nouns, append `, ` plus the gender text between `»,` and the next `[[`, `(` or `_` (`f.`, `m. and f.`).
- **Definition:** the `_…_` spans outside `[[…]]` and `(…)`, up to the first `. ` or `.` + newline that follows a span. Join them with `, `, collapse whitespace and drop `§` references. If there is no span (`«ac», conj., see «atque»`), skip the entry.
- **pos:** the first of these markers after the headword:
  - `prep.` → `preposition`
  - `conj.` → `conjunction`
  - `adv.` → `adverb`
  - `adj.` → `adjective`
  - `pron.` → `pronoun`
  - `interj.` → `other`
  - `dep. verb` → `verb`
  - gender `m.`/`f.`/`n.` → `noun`
  - otherwise, `verb` if the headword has ≥3 comma parts or ends in `sum`, else `other`.
- Skip proper nouns: the first headword character is uppercase, including `Ā`, `Ē`, `Ī`, `Ō`, `Ū`.

- [ ] **Step 1: Write the failing tests** in `scripts/lexicon/dooge.test.ts`, one `it` per case, using these real lines as input:

| input | expected |
|---|---|
| `«ab-dō, -ere, -didī, -ditus», _hide, conceal_` | `{ headword: 'abdō, -ere, -didī, -ditus', lemma: 'abdō', definition: 'hide, conceal', pos: 'verb' }` |
| `«ā» or «ab», prep. with abl. _from, by, off_.\n  Translated _on_ in «ā dextrō cornū», _on the right wing_;` | `{ headword: 'ā or ab', lemma: 'ā', definition: 'from, by, off', pos: 'preposition' }` |
| `«aciēs, -ēī», f. [[«ācer», _sharp_]], _edge; line of battle_` | `{ headword: 'aciēs, -ēī, f.', lemma: 'aciēs', definition: 'edge; line of battle', pos: 'noun' }` |
| `«circum-veniō, -īre, -vēnī, -ventus» (_come around_), _surround_` | definition `'surround'` |
| `«circum´-dō, -dare, -dedī, -datus», _place around, surround, inclose_` | headword `'circumdō, -dare, -dedī, -datus'` |
| `«ad-ferō, ad-ferre, at-tulī, ad-lātus», _bring, convey; report,\n    announce; render, give_ (§426)` | definition `'bring, convey; report, announce; render, give'` |
| `«aequālis, -e», adj. _equal, like_. As a noun, «aequālis, -is», m. or f.\n    _one of the same age_` | `{ definition: 'equal, like', pos: 'adjective' }` |
| `«ad-loquor, -loquī, -locūtus sum», dep. verb [[«ad», _to_, + «loquor»,\n    _speak_]], _speak to, address_, with acc.` | `{ definition: 'speak to, address', pos: 'verb' }` |
| `«ac», conj., see «atque»` | `[]` |
| `«Aesōpus, -ī», m. _Æsop_, a writer of fables` | `[]` |

Add one whole-file test. `parseDooge(readFileSync('content/sources/dooge-latin-english.txt','utf8'))` returns 1,200–1,350 rows. Every row has `definition.length` between 1 and 200, and its `pos` is in the allowed set.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run scripts/lexicon/dooge.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `parseDooge(text: string): SourceRow[]` in `scripts/lexicon/dooge.ts`** following the rules above. Group lines into entries first, then parse each entry string.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run scripts/lexicon/dooge.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lexicon/dooge.ts scripts/lexicon/dooge.test.ts
git commit -m "feat(seed): parse D'Ooge Latin-English glossary"
```

---

### Task 3: Whitaker DICTLINE parser

**Files:**
- Create: `scripts/lexicon/whitaker.ts`
- Test: `scripts/lexicon/whitaker.test.ts`

**Interfaces:**
- Consumes: `SourceRow` from `scripts/lexicon/dooge.ts`.
- Produces: `export interface WhitakerRow extends SourceRow { freq: string }` (a single letter, `A` = most frequent). Also `export function parseDictlineLine(line: string): WhitakerRow | null` and `export function parseDictline(text: string): WhitakerRow[]` (all non-null lines, in file order, no dedupe).

**Fixed columns** (0-based, after stripping `\r`):
- stems `s1..s4` = `slice(0,19)`, `slice(19,38)`, `slice(38,57)`, `slice(57,76)`, each trimmed; `zzz` means missing.
- part-of-speech fields = `slice(76,100)`, split on whitespace.
- age = `[100]`, freq = `[106]`.
- meaning = `slice(110)`, trimmed, trailing `;` removed.

Return `null` when any of these holds:
- the meaning starts with `|` (a continuation sense)
- the age is `F`, `G` or `H`
- the POS is not `N V ADJ ADV PREP CONJ INTERJ PRON NUM`
- the (POS, class) pair is not in the table below

**Headword table** (gender suffix `, m.`/`, f.`/`, n.`/`, c.` from the N gender field `M/F/N/C`; omit for `X`):

| POS, class | headword | pos |
|---|---|---|
| N 1 1 | `s1+a, s2+ae` | noun |
| N 2 1 / 2 4 | `s1+us, s2+i` | noun |
| N 2 2 | `s1+um, s2+i` | noun |
| N 2 3 | `s1, s2+i` | noun |
| N 3 1–4 | `s1, s2+is` | noun |
| N 4 1 | `s1+us, s2+us` | noun |
| N 4 2 | `s1+u, s2+us` | noun |
| N 5 1 | `s1+es, s2+ei` | noun |
| N 9 x | `s1` | noun |
| ADJ 1 1 | `s1+us, s2+a, s2+um` | adjective |
| ADJ 1 2 | `s1, s2+a, s2+um` | adjective |
| ADJ 3 1 | `s1, s2+is` | adjective |
| ADJ 3 2 | `s1+is, s1+e` | adjective |
| ADJ 3 3 | `s1, s2+is, s2+e` | adjective |
| V 1 / 2 / 3 1 / 3 4 | present `s1+o` (2: `s1+eo`), infinitive `s2+` `are`/`ere`/`ere`/`ire`, perfect `s3+i`, participle `s4+us` | verb |
| V same, `DEP` | `s1+or` (2: `s1+eor`), `s2+` `ari`/`eri`/`i`/`iri`, `s4+us sum` | verb |
| V same, `SEMIDEP` | active present + infinitive, then `s4+us sum` | verb |
| ADV, PREP, CONJ, INTERJ, PRON, NUM | `s1` | adverb / preposition / conjunction / other / pronoun / other |

Omit a principal part whose stem is `zzz` or empty. If `s2` is empty for an adjective, use `s1`. `lemma = lemmaOf(headword)`. `definition = meaning`.

- [ ] **Step 1: Write the failing tests** in `scripts/lexicon/whitaker.test.ts`. Build each input line with a helper `line(stems: string[], posFields: string, age = 'X', freq = 'A', meaning = 'x')`, which pads stems to 19 chars each, the POS fields to 24, then appends `age X X freq O meaning`. Add one assertion that a real line copied verbatim from DICTLINE.GEN parses (the `am am amav amat V 1 1 X … love, like; …` line).

| stems / pos | expected headword, pos |
|---|---|
| `am am amav amat` / `V 1 1 X` | `amo, amare, amavi, amatus`, verb |
| `mon mon monu monit` / `V 2 1 X` | `moneo, monere, monui, monitus` |
| `capi cap cep capt` / `V 3 1 TRANS` | `capio, capere, cepi, captus` |
| `audi aud audiv audit` / `V 3 4 X` | `audio, audire, audivi, auditus` |
| `hort hort zzz hortat` / `V 1 1 DEP` | `hortor, hortari, hortatus sum` |
| `aud aud aus aus` / `V 2 1 SEMIDEP` | `audeo, audere, ausus sum` |
| `miles milit` / `N 3 1 M P` | `miles, militis, m.`, noun |
| `puer puer` / `N 2 3 M P` | `puer, pueri, m.` |
| `bell bell` / `N 2 2 N T` | `bellum, belli, n.` |
| `corn corn` / `N 4 2 N T` | `cornu, cornus, n.` |
| `di di` / `N 5 1 C T` | `dies, diei, c.` |
| `bon bon meli opti` / `ADJ 1 1 X` | `bonus, bona, bonum`, adjective |
| `liber liber liberi liberri` / `ADJ 1 2 X` | `liber, libera, liberum` |
| `acer acr acri acerri` / `ADJ 3 3 X` | `acer, acris, acre` |
| `fort fort forti fortissi` / `ADJ 3 2 X` | `fortis, forte` |
| `ingens ingent` / `ADJ 3 1 X` | `ingens, ingentis` |
| `ex` / `PREP ABL` | `ex`, preposition |
| `fer fer tul lat` / `V 3 2 X` | `null` |
| `e i iv it` / `V 6 1 X` | `null` |
| meaning `\|act/take action` | `null` |
| age `F` | `null` |

Whole-file test: `parseDictline(DICTLINE.GEN)` returns 25,000–36,000 rows, and every headword is ≤120 chars.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run scripts/lexicon/whitaker.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `parseDictlineLine` and `parseDictline` in `scripts/lexicon/whitaker.ts`** using the table as a lookup keyed by `POS` plus class.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run scripts/lexicon/whitaker.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lexicon/whitaker.ts scripts/lexicon/whitaker.test.ts
git commit -m "feat(seed): parse Whitaker DICTLINE into dictionary forms"
```

---

### Task 4: Compose core + full lexicon, schema, and seed

**Files:**
- Create: `scripts/lexicon/compose.ts`, `scripts/lexicon/compose.test.ts`
- Create: `supabase/migrations/20261102000001_lexicon_core.sql`
- Create: `supabase/tests/lexicon.test.sql`
- Modify: `scripts/build-seed.ts`, which drops `parseCsv`/`dccToLexicon`/the starter/DCC branch, adds `core` and writes a second file
- Modify: `scripts/build-seed.test.ts`, which drops the CSV and DCC tests and keeps the `lemmaOf` tests
- Modify: `supabase/config.toml` (`sql_paths = ["./seed.sql", "./seed-lexicon.sql"]`), `scripts/test-db.sh` (apply `seed-lexicon.sql` after `seed.sql`)
- Delete: `content/starter-lexicon.json`
- Generated: `supabase/seed.sql`, `supabase/seed-lexicon.sql`

**Interfaces:**
- Consumes: `parseDooge`/`SourceRow` (Task 2), `parseDictline`/`WhitakerRow` (Task 3), `normalize` from `src/lib/grading.ts`.
- Produces:
  - `export interface LexiconRow { headword: string; lemma: string; definition: string; pos: string; frequency: number | null; core: boolean }` (in `build-seed.ts`, replacing the old one)
  - `export function lemmaKey(s: string): string`: `normalize(s)` with `-`, `´` and `'` removed, `j`→`i`
  - `export function parseLodge(tsv: string): Map<string, number>`: lemma key → rank, first rank wins
  - `export function clampRow(r: LexiconRow): LexiconRow`: headword ≤120; definition ≤200, cut at the last `;` or `,` before 200, else hard-cut at 199 + `…`
  - `export function composeLexicon(dooge: SourceRow[], whitaker: WhitakerRow[], lodge: Map<string, number>): { rows: LexiconRow[]; unmatchedLodge: string[] }`
  - `export function lexiconSql(rows: LexiconRow[], batch?: number): string` (in `build-seed.ts`, default batch 500)

**`composeLexicon` rules:**
1. Each D'Ooge row becomes `core: true`, with `frequency = lodge.get(lemmaKey(lemma)) ?? null`.
2. Drop any Whitaker row whose `lemmaKey(lemma)+pos` matches a D'Ooge row.
3. Group the remaining Whitaker rows by `(headword, pos)`. Keep the one with the best freq (`A` < `B` < … < `F` < anything else), using file order on ties.
4. For each Lodge key with no D'Ooge row, the surviving Whitaker rows with that key that share the best freq among them get `core: true` and `frequency = rank`. All other Whitaker rows get `core: false, frequency: null`.
5. Apply `clampRow` to every row.
6. `unmatchedLodge` = Lodge lemmas found in neither source.

**Migration:**

```sql
alter table public.lexicon add column core boolean not null default false;
create unique index lexicon_builtin_key on public.lexicon (headword, pos) where owner_id is null;
```

**`seed-lexicon.sql` shape:**
1. `begin;`
2. The existing `delete … where owner_id is null and id not in (select lexicon_id from public.vocab_list_items);`
3. `update public.lexicon set core = false where owner_id is null;`
4. One `insert into public.lexicon (headword, lemma, definition, pos, frequency, core) values (…),(…) on conflict (headword, pos) where owner_id is null do update set lemma = excluded.lemma, definition = excluded.definition, frequency = excluded.frequency, core = excluded.core;` per batch.
5. `commit;`

`seed.sql` keeps modules and questions only.

- [ ] **Step 1: Write the failing tests** in `scripts/lexicon/compose.test.ts`:
  - `lemmaKey('i-GNARUs') === 'ignarus'`, `lemmaKey('circum´dō') === 'circumdo'`, `lemmaKey('jaciō') === 'iacio'`.
  - `parseLodge('98\tamo\n96\ta-mitto\n')` → `Map { 'amo' => 98, 'amitto' => 96 }`.
  - `clampRow` cuts a 260-char `'a; '.repeat(…)` definition to ≤200 and ending before a `;`. A 130-char headword becomes 120.
  - `composeLexicon`:
    - The D'Ooge `amō` (verb) plus Whitaker `amo, amare, amavi, amatus` (verb) produce only the D'Ooge row, `core: true, frequency: 98`.
    - With Whitaker `bonus, bona, bonum` (adjective, A) and `bonus, boni, m.` (noun, C) and Lodge `bonus`, only the adjective is core.
    - Two Whitaker rows with the same `(headword, pos)` (freq B and A) produce one row, with A's definition.
    - A Lodge lemma in neither source appears in `unmatchedLodge`.

  Add to `scripts/build-seed.test.ts`:
  - `lexiconSql([{ headword: 'am', lemma: 'am', definition: "fireman's bucket", pos: 'noun', frequency: null, core: false }])` contains `'fireman''s bucket'` and `on conflict (headword, pos) where owner_id is null`.
  - 1,001 rows with batch 500 produce exactly 3 `insert into` statements.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run scripts/lexicon/compose.test.ts scripts/build-seed.test.ts`
Expected: FAIL, missing exports.

- [ ] **Step 3: Implement `compose.ts` and `lexiconSql`, and rewrite `main()` in `build-seed.ts`.** `main()` reads the three sources, calls `composeLexicon`, writes `supabase/seed.sql` (modules + questions) and `supabase/seed-lexicon.sql`, and logs `seed-lexicon.sql: N rows (C core), U unmatched Lodge lemmas`, followed by the unmatched list. Update the header comment to name the three sources. Delete `content/starter-lexicon.json`.

- [ ] **Step 4: Run the unit tests**

Run: `npx vitest run scripts`
Expected: PASS.

- [ ] **Step 5: Add the migration, update `config.toml` and `test-db.sh`, and write `supabase/tests/lexicon.test.sql`.** It uses the `tests.ok` helper as in `functions.test.sql` and does not wrap in a transaction, because it re-applies the seed:
  - `(select count(*) from lexicon where owner_id is null) > 25000`, labeled `'full lexicon loaded'`
  - `(select count(*) from lexicon where owner_id is null and core) between 1500 and 3500`, labeled `'core list size'`
  - The first row of `select core from lexicon where owner_id is null and search_text like '%amo%' order by core desc, frequency asc nulls last, lemma limit 1` is `true`, labeled `'core words rank first in search'`.
  - Insert a vocab list and an item referencing the core `amō` row. Record `count(*)`. Run `\ir ../seed-lexicon.sql`. Assert the item still exists and the built-in count is unchanged, labeled `'re-seed keeps referenced words and is idempotent'`. Then delete the test list.

- [ ] **Step 6: Generate the seed, then fix Lodge OCR typos**

Run: `npm run seed`
Expected: about 30,000–36,000 rows, about 1,500–3,500 core.

For each unmatched Lodge lemma, check the scan and correct `content/sources/lodge-core.tsv` where the OCR misread it (e.g. `ampli-faco` → `ampli-fico`). Re-run until fewer than 40 remain unmatched; those are genuine gaps in the two sources. Re-run `npx vitest run scripts/lexicon/sources.test.ts`.

- [ ] **Step 7: Run the DB tests**

Run: `npm run test:db`
Expected: every file prints `PASS`, including `supabase/tests/lexicon.test.sql`, and the existing `capio` search test.

- [ ] **Step 8: Commit**

```bash
git add scripts content supabase
git commit -m "feat(db): open lexicon with core flag from Whitaker, Lodge and D'Ooge"
```

---

### Task 5: App uses core by default, full for search; credits and docs

**Files:**
- Modify: `src/features/teacher/api.ts`, `searchLexicon` (around line 80) and `loadFallbackLexicon` (around line 138)
- Modify: `src/features/teacher/VocabLists.tsx:6-8`, `src/features/teacher/VocabListEditor.tsx:9,143`
- Modify: `.env.example` (remove the `VITE_LEXICON_ATTRIBUTION` lines), `.github/workflows/pages.yml:38` (remove that env line)
- Modify: `README.md` "Dictionary data" section and the seed step in "Classroom backend"
- Test: `src/features/teacher/VocabLists.test.tsx`

**Interfaces:**
- Consumes: the `lexicon.core` column (Task 4).
- Produces: `export const LEXICON_CREDIT = "Dictionary: William Whitaker's Words. Core list from G. Lodge, The Vocabulary of High School Latin (1909) and B. L. D'Ooge, Latin for Beginners (1911)."` in `VocabLists.tsx`, replacing `DCC_ATTRIBUTION`.

- [ ] **Step 1: Write the failing test** `src/features/teacher/VocabLists.test.tsx`: `expect(LEXICON_CREDIT).toMatch(/Whitaker/)` and `expect(LEXICON_CREDIT).not.toMatch(/DCC|Dickinson|CC BY/)`.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run src/features/teacher/VocabLists.test.tsx`
Expected: FAIL, `LEXICON_CREDIT` is not exported.

- [ ] **Step 3: Make the code changes**
  - `searchLexicon`: add `.order('core', { ascending: false })` before the existing `frequency` order.
  - `loadFallbackLexicon`: add `.eq('core', true)` after `.is('owner_id', null)`.
  - Replace `DCC_ATTRIBUTION` with `LEXICON_CREDIT` (a plain constant, no env var) and update the import and usage in `VocabListEditor.tsx`.
  - Remove `VITE_LEXICON_ATTRIBUTION` from `.env.example` and `pages.yml`.

- [ ] **Step 4: Update the README**
  - Rewrite "Dictionary data". Say the built-in dictionary has about 35,000 words from Whitaker's Words (free for any use), and that about 2,500 core words come from Lodge (1909) and D'Ooge (1911), both public domain. Say teacher search covers everything with core words first, and trainers use core words. Point to `content/sources/README.md` and say no CC BY-SA sources are used.
  - Classroom backend step 1: `seed-lexicon.sql` is several MB, too large for the SQL editor, so apply it with `psql "$DATABASE_URL" -f supabase/seed-lexicon.sql` after `seed.sql`.

- [ ] **Step 5: Run the full checks**

Run: `npm test && npm run build`
Expected: all Vitest suites pass, including `AssignmentBuilder.test.tsx`, and `tsc -b` + `vite build` succeed.

- [ ] **Step 6: Commit**

```bash
git add src .env.example .github README.md
git commit -m "feat: core-first dictionary search, core-only trainer words, open-source credits"
```
