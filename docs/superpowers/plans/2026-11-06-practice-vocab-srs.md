# Practice → Vocab with Spaced Repetition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Coming soon" Vocab card with `/practice/vocab`: students make their own study sets (typed or pasted), study them with Review (type-in, FSRS-scheduled), Learn (multiple choice) and Flashcards (flip and self-rate), and export a set to Quizlet. Everything is stored locally.

**Architecture:** A versioned, self-repairing localStorage store (`src/features/vocab/storage.ts`) holds sets and one FSRS record per (set, card, direction). A thin wrapper (`scheduler.ts`) is the only file that imports `ts-fsrs`; it turns ratings into new records and builds the review queue. Question builders (`questions.ts`) turn queue items into ordinary `DrillQuestion`s, which run in the existing `DrillSession` (Review, Learn) or in one new component, `FlashcardSession`. Sessions are logged to the existing session log as `kind: 'vocab'`, kept local because the server's `practice_sessions.kind` check only allows `module | endless | import` and this project adds no migrations.

**Tech Stack:** React 18 + TypeScript + Vite, react-router-dom 6 (HashRouter), Vitest + Testing Library, Playwright, `ts-fsrs@5.4.2` (exact pin).

**Spec:** `docs/superpowers/specs/2026-11-06-forms-vocab-modules-design.md`, section "B. Practice → Vocab with spaced repetition". Plan A (`docs/superpowers/plans/2026-11-06-morphology-forms.md`) is executed before this one; only Task 10 depends on it.

## Global Constraints

Copied from the spec's "Global constraints (all three)". Every task's requirements include these.

- **No database schema changes and no new migrations.** Nothing here needs the Supabase backend; everything works in solo mode, logged out, offline. (Plan C changes `supabase/seed.sql` through `npm run seed`, which is content, not schema.)
- **Reuse the existing question types and UI.** Every generated or authored question is a `DrillQuestion` (`typein` or `mc`, `src/lib/types.ts`) and runs in the existing `DrillSession` (`src/features/drill/`). No new item types, no grid UI, no renderer registry (those are teacher-tools Phase 2).
- **Match the redesign's visual style**: light, Quizlet-calm, sans-serif, no emoji, phones first (375px, no horizontal scroll). Reuse existing CSS classes and tokens.
- **Practice is local-first**: progress lives in `localStorage` through the existing session log (`src/features/practice/sessionLog.ts`) and syncs through `practice_sessions` only where that already happens. Every storage read/write tolerates missing or corrupt data.
- **Generated data is built by scripts, never edited by hand.** Data fixes go in `scripts/lexicon/*`, and `npm run seed` regenerates `src/content/*.generated.ts`.
- **Macrons**: generated forms have no macrons (the Whitaker stems have none), and grading already ignores macrons and case (`src/lib/grading.ts`). Hand-written text for students (Plan C) uses macrons as the existing modules do.
- **Tests**: Vitest for logic and components, written test-first. Keep `npm test`, `npx tsc -b` and `npx playwright test` (solo) green. Update tests whose copy or counts legitimately change; never delete a test to make a change pass.
- **Student-facing prose** (module descriptions, explanations, hints, UI copy longer than a label) is written by the most capable model, in plain direct English, with few em dashes.

Plan-specific rule that follows from the last constraint: **all student-facing copy for this plan is fixed in the Copy deck below** (written by the most capable model). Use those strings verbatim. If a task seems to need a sentence that is not in the deck, use a label-length string and note it in the commit message for review. That is why no task below carries "Model: opus".

## Review Focus

1. **Browser storage full or blocked** (`setItem` throws, e.g. Safari private mode or a 1000-card set plus history): saving must return `false`, the editor must show the "Couldn't save" message, and nothing may crash. Tests: Task 1 (`saveSets` returns false), Task 4 (editor shows the message).
2. **Local midnight, not UTC midnight**: a US student studying at 9pm must not see tomorrow's cards as "due today" or get a fresh batch of new cards early. "Due today" and the new-cards-per-day count use the device's local day. Tests: Task 3 (23:30 vs 00:30 cases).
3. **Editing or removing cards after studying them**: fixing a typo keeps the card's schedule; removing a card or deleting a set removes its review history, so counts never include ghosts. Tests: Task 1.
4. **Same word twice in a set** (homographs like *malum* / *mālum*, or two Latin words glossed "to carry"): type-in accepts any Latin in the set with that English (and any English for that Latin); multiple choice never shows two identical choices. Tests: Task 6.
5. **A recents row whose set was deleted**: the row shows "Vocab set" and opening it lands on the Vocab page instead of a blank screen. Tests: Task 2 (title), Task 8 (redirect).

---

## Decisions (made here; implementers do not revisit)

- **ts-fsrs version: `5.4.2`** (published 2026-09-01; Node >= 20). `6.0.0` (2026-10-28) is under two weeks old, needs Node >= 24 and has a different API, so it is not used. API used: `fsrs(params)`, `createEmptyCard(now)`, `scheduler.next(card, now, grade)` returning `{ card, log }`, `Rating`, `State`, types `Card`, `CardInput`, `Grade`. `next()` accepts `CardInput`, whose `due`/`last_review` may be ISO strings, so stored JSON can be fed back directly. The package's `exports` puts `types` last; this was checked to resolve under the repo's `moduleResolution: "bundler"`.
- **Scheduler parameters:** `fsrs({ enable_short_term: false, enable_fuzz: false })`, other params default (retention 0.9). With short-term steps off every interval is at least one day, so every item rated in a session is not due again until a later day. That keeps the queue a fixed list that `DrillSession` can run. Wrong answers get extra practice through the summary's "Review N mistakes" retry, which is not rated and not logged.
- **One SRS item per (set, card, direction)**, key `${setId}:${cardId}:${dir}` (ids are UUIDs, so `:` is safe). Directions reuse `VocabDirection = 'l2e' | 'e2l'` from `src/lib/vocab.ts`, stored per set, canonical order `['l2e', 'e2l']`, never empty (default `['l2e']`).
- **Counts per item:** *new* = no record; *due* = record with `due <= end of local today`; *learned* = record not due. The three sum to the item count.
- **Review queue:** due items (oldest `due` first), then new items in card order, at most `newPerDay - (items introduced today)`; capped at `REVIEW_MAX = 50` items. An `e2l` item is only offered as new once its card's `l2e` item was introduced on an earlier day (recognise before produce). `newPerDay` is per set, default 10, range 1 to 100.
- **Ratings:** Review: wrong = `again`, right = `good`, "That was easy" (only after a right answer) re-rates the same item from its pre-answer record as `easy`. Flashcards: the student's Again/Hard/Good/Easy. Learn changes no schedule. Every rating is saved the moment it is given, so leaving mid-session keeps it.
- **Type-in grading:** L→E accepts the whole English, each comma/semicolon/slash part, parts without a leading "to/a/an/the" and without parentheticals. E→L accepts the whole Latin and its lemma (`lemmaOf`, the text before the first comma). Both also accept the answers of any other card in the set with the same prompt.
- **Session log:** `kind: 'vocab'`, `module_id: null`, new optional `set_id`. Vocab sessions are never pushed (server check constraint), stay in the local log through sync, count towards the streak (`updateStreak`), earn 0 XP. Exiting after at least one answer logs the partial session (like Endless).
- **Limits:** set name 1 to 80 chars; Latin 1 to 120, English 1 to 200 (same limits as the teacher import, exported from `vocabImport.ts`); 1000 cards per set. A card is a duplicate when both its normalized Latin and normalized English match an existing card.
- **Storage keys:** `latiniq_vocab_sets` = `{ v: 1, sets: StudySet[] }`; `latiniq_vocab_srs` = `{ v: 1, items: Record<string, SrsRecord> }`. Bad entries are dropped one by one on load; a stored `v` higher than 1 (data from a newer build) loads as empty and is never overwritten.
- **Routes** (all in `src/App.tsx`, outside the `hasBackend` block):
  - `/practice/vocab` → `StudentShell` + `VocabHome` (Task 9)
  - `/practice/vocab/:setId` → `StudentShell` + `SetPage` (Task 9)
  - `/practice/vocab/:setId/edit` → `StudentShell` + `SetEditor` (Task 4)
  - `/practice/vocab/:setId/:mode` → `StudyRoute`, no shell (focus mode), `mode` in `review | learn | flashcards` (Task 8). React Router ranks the static `edit` above `:mode`.
- **Starter sets** are copies: "Add" creates an ordinary set (with `source` set to the starter id) that the student can edit. They exist only if Plan A's `nouns.generated.ts` and `adjectives.generated.ts` exist (Task 10).

## File map

| File | Task | Responsibility |
|---|---|---|
| `src/features/vocab/storage.ts` (+ `.test.ts`) | 1 | Types, versioned load/save, set and card CRUD, SRS record storage |
| `src/lib/vocabImport.ts` | 1 | Export `MAX_HEADWORD`, `MAX_DEFINITION` (no behaviour change) |
| `src/features/practice/sessionLog.ts`, `sync.ts`, `PracticeHome.tsx` (+ tests) | 2 | `vocab` kind, local-only kinds, recents row |
| `src/features/vocab/scheduler.ts` (+ `.test.ts`), `package.json` | 3 | ts-fsrs wrapper, local day helpers, counts, review queue |
| `src/features/vocab/SetEditor.tsx` (+ `.test.tsx`), `src/styles/app.css`, `src/App.tsx` | 4 | Edit name, directions, new per day, cards; delete set |
| `src/features/vocab/PasteImport.tsx` (+ `.test.tsx`) | 5 | Paste import panel inside the editor |
| `src/features/vocab/questions.ts` (+ `.test.ts`) | 6 | Review / Learn / flashcard `DrillQuestion` builders |
| `src/features/vocab/Flashcard.tsx`, `FlashcardSession.tsx` (+ `.test.tsx`), `app.css` | 7 | Flip card and its session loop |
| `src/features/drill/Feedback.tsx`, `DrillSession.tsx` (+ test), `src/features/vocab/StudyRoute.tsx` (+ `.test.tsx`), `App.tsx` | 8 | "That was easy", the three study modes, logging, summary |
| `src/features/vocab/VocabHome.tsx`, `SetPage.tsx` (+ `.test.tsx`), `PracticeHome.tsx`, `App.tsx` | 9 | Vocab subject card, set list, set overview |
| `src/features/vocab/starterSets.ts` (+ `.test.ts`), `VocabHome.tsx` | 10 | Built-in starter sets (skippable) |
| `src/features/vocab/QuizletExport.tsx` (+ `.test.tsx`), `SetPage.tsx` | 11 | Quizlet text export |
| `tests/e2e/vocab.spec.ts`, `README.md` | 12 | End-to-end flow, phone widths, docs |

## Copy deck

Strings in `code` are exact. `${...}` are interpolations. Plurals: use "card"/"cards", "set"/"sets" correctly for 1.

**Practice home, Vocab subject card:** title `Vocab`; subtitle with no sets `Make your own study sets`, otherwise `${n} sets · ${due} due today`.

**Recents row** (kind `vocab`): title = the set's name, or `Vocab set` if the set no longer exists.

**Vocab home** (`/practice/vocab`):
- `h1` `Vocab`; intro `Your own study sets. Reviews are spaced out so words stick.`
- Button `New set`; then a field labelled `Set name` with buttons `Create` and `Cancel`.
- Section `h2` `Your sets`. Empty: `No study sets yet. Make your first one with New set.`
- Row subtitle `${cards} cards · ${due} due today`; tag `${due} due` when due > 0.
- Footnote: `Sets are saved in this browser only. They don't sync to your account or other devices.`

**Set page** (`/practice/vocab/:setId`):
- Back link `All sets`; `h1` = set name; line `${n} cards · ${directions}` where directions is `Latin to English`, `English to Latin` or `Both directions`; link-button `Edit set`.
- Stats labels `New`, `Due today`, `Learned`.
- Section `h2` `Study`; line under it: `Review and Flashcards decide when each word comes back. Learn is extra practice and changes nothing.`
- Study cards: `Review` with subtitle `${due} due · ${newToday} new` or, when both are 0, `All caught up for today`; `Learn` with `Multiple choice practice`; `Flashcards` with `Flip each card and rate yourself`.
- No cards: `This set has no cards yet.` and a link `Add cards`.
- Section `h2` `Cards`; button `Show all ${n} cards` when over 50.

**Set editor** (`/practice/vocab/:setId/edit`):
- Back link `Back to set`; `h1` `Edit set`.
- `Set name`; `Study directions` with checkboxes `Latin to English`, `English to Latin`; `New cards per day` with help `How many new words Review adds each day. Words you have already started don't count.`
- Section `h2` `Cards (${n})`; fields `Latin`, `English`; button `Add card`; row buttons `Edit`, `Remove`; while editing `Save`, `Cancel`.
- Errors: `Give the set a name.` / `Fill in both Latin and English.` / `That card is already in the set.` / `This set is full (1000 cards).` / `Couldn't save. Your browser's storage may be full.`
- Button `Delete set`; confirm `Delete "${name}"? Its cards and review history will be gone for good.`

**Paste import** (inside the editor):
- Toggle button `Import cards`; `h3` `Import cards`.
- Help: `Paste one card per line: the Latin, then the English. Separate them with a tab (as Quizlet exports), a spaced dash ( - ), an equals sign ( = ) or a comma. If the Latin has commas in it, use a tab or a dash, or put the Latin in quotes.`
- Textarea label `Cards to import`; buttons `Preview`, `Cancel`.
- Preview lines: `${n} cards ready to add`, `${k} already in the set`, then one line per skipped row `Line ${line}: ${reason}`; button `Add ${n} cards`. Done: `Added ${n} cards.`

**Study route:**
- Nothing to review: `h1` `All caught up`; `Nothing in this set is due right now. Come back tomorrow, or use Learn for extra practice.`; button `Back to set`.
- Learn with fewer than 2 cards: `h1` `Not enough cards`; `Learn needs at least two cards in the set.`; button `Back to set`.
- Exit confirm: `Stop now? What you've answered so far is saved.`
- Feedback button after a right Review answer: `That was easy`.
- Summary note, Review and Flashcards: `${due} still due today · ${learned} learned`. Learn: `Learn is extra practice. It doesn't change when words come back for review.` Summary back button `Back to set`.

**Flashcards:** card `aria-label` `Flashcard. Tap to flip.`; under the unflipped card `Tap the card to see the answer`; rating buttons `Again`, `Hard`, `Good`, `Easy`; small hint `Space flips the card. Keys 1 to 4 rate it.`

**Quizlet export** (set page): button `Export to Quizlet`; textarea label `Quizlet import text`; buttons `Copy`, `Download .txt`; note `In Quizlet, make a new set, choose Import, and paste this. Leave the settings on Tab and New line.`; after copying `Copied.`

**Starter sets** (Task 10): `h2` `Starter sets`; line `Core words from the LatinIQ dictionary, grouped for study. Adding one gives you your own copy to edit.`; row subtitle `${n} cards`; button `Add`; once added, tag `Added` and the row links to the copy. Set names: `Verbs: 1st conjugation`, `Verbs: 2nd conjugation`, `Verbs: 3rd conjugation`, `Verbs: 3rd conjugation -iō`, `Verbs: 4th conjugation`, `Verbs: deponent`, `Verbs: irregular`, `Nouns: ${k} declension` (k = `1st` … `5th`), `Adjectives: 1st and 2nd declension`, `Adjectives: 3rd declension`.

---

### Task 1: Study set storage

**Files:**
- Create: `src/features/vocab/storage.ts`, `src/features/vocab/storage.test.ts`
- Modify: `src/lib/vocabImport.ts` (change `const MAX_HEADWORD` / `const MAX_DEFINITION` to `export const`)

**Interfaces:**
- Consumes: `VocabDirection` from `src/lib/vocab.ts`; `normalize` from `src/lib/grading.ts`; `MAX_HEADWORD`, `MAX_DEFINITION` from `src/lib/vocabImport.ts`.
- Produces (all exported from `storage.ts`):
  ```ts
  export const SETS_KEY = 'latiniq_vocab_sets';
  export const SRS_KEY = 'latiniq_vocab_srs';
  export const STORE_VERSION = 1;
  export const MAX_CARDS = 1000;
  export const MAX_NAME = 80;
  export const DEFAULT_NEW_PER_DAY = 10;
  export interface StudyCard { id: string; latin: string; english: string }
  export interface StudySet {
    id: string; name: string; cards: StudyCard[];
    directions: VocabDirection[];   // canonical order, non-empty
    newPerDay: number;              // integer 1..100
    createdAt: string; updatedAt: string; // ISO
    source?: string;                // starter set id it was copied from
  }
  export interface SrsRecord {      // a serialized ts-fsrs Card plus `introduced`
    due: string; stability: number; difficulty: number; elapsed_days: number; scheduled_days: number;
    learning_steps: number; reps: number; lapses: number; state: 0 | 1 | 2 | 3; last_review?: string;
    introduced: string;             // local YYYY-MM-DD of the first rating
  }
  export interface CardInput { latin: string; english: string }
  export interface AddResult { added: number; duplicates: number; invalid: number; overflow: number; ok: boolean }
  export function itemKey(setId: string, cardId: string, dir: VocabDirection): string; // `${setId}:${cardId}:${dir}`
  export function loadSets(): StudySet[];
  export function saveSets(sets: StudySet[]): boolean;
  export function getSet(id: string): StudySet | undefined;
  export function createSet(name: string, cards?: CardInput[], source?: string): StudySet | null; // null = save failed
  export function updateSet(id: string, patch: Partial<Pick<StudySet, 'name' | 'directions' | 'newPerDay'>>): boolean;
  export function deleteSet(id: string): boolean;          // also deletes its SRS records
  export function addCards(setId: string, cards: CardInput[]): AddResult;
  export function updateCard(setId: string, cardId: string, card: CardInput): 'ok' | 'duplicate' | 'invalid' | 'failed';
  export function removeCard(setId: string, cardId: string): boolean; // also deletes its SRS records
  export function loadSrs(): Record<string, SrsRecord>;
  export function saveSrsRecord(key: string, rec: SrsRecord): boolean;
  ```

- [ ] **Step 1: Write the failing tests** in `src/features/vocab/storage.test.ts` (`beforeEach(() => localStorage.clear())`; restore spies in `afterEach`):
  - `creates a set with defaults`: `createSet('  Ch 1 ')` → name `'Ch 1'`, `directions` `['l2e']`, `newPerDay` 10, `cards` `[]`, ISO `createdAt`; `loadSets()` has length 1; raw `localStorage.getItem(SETS_KEY)` parses to `{ v: 1, sets: [...] }`.
  - `blank name becomes Untitled set and long names are cut`: `createSet('')!.name === 'Untitled set'`; `createSet('x'.repeat(100))!.name.length === 80`.
  - `adds cards, trimming and skipping blanks, over-long text and duplicates`: `addCards(id, [{latin:' puella ', english:'girl'}, {latin:'Puella', english:'GIRL'}, {latin:'', english:'x'}, {latin:'a'.repeat(121), english:'x'}, {latin:'aqua', english:'water'}])` → `{ added: 2, duplicates: 1, invalid: 2, overflow: 0, ok: true }`; stored latin is `'puella'`.
  - `stops at 1000 cards`: a set with 999 cards, `addCards` with 3 new → `added 1, overflow 2`.
  - `updateCard keeps the schedule and rejects duplicates`: save an SRS record under `itemKey(set, card1, 'l2e')`; `updateCard(set, card1, {latin:'puela', english:'girl'})` → `'ok'` and the record is still there; updating card2 to card1's text → `'duplicate'`; empty English → `'invalid'`.
  - `removeCard and deleteSet delete review history`: records for both directions of card1 and for card2; `removeCard(card1)` leaves only card2's; `deleteSet` leaves `loadSrs()` empty and `getSet` undefined.
  - `updateSet sanitizes directions and new per day`: `updateSet(id, { directions: ['e2l','l2e','e2l'] })` → `['l2e','e2l']`; `{ directions: [] }` → `['l2e']`; `{ newPerDay: 0 }` → 1; `{ newPerDay: 500 }` → 100; `{ newPerDay: 7.6 }` → 8; `{ name: '  ' }` returns `false` and keeps the old name.
  - `treats corrupt storage as empty`: for each raw value `'not json'`, `'[]'`, `'{"v":1,"sets":"x"}'`, `'null'` → `loadSets()` is `[]` and `loadSrs()` is `{}` (same raws under `SRS_KEY`).
  - `drops only the broken entries`: stored `{ v:1, sets: [validSet, { id: 5 }, {...validSet2, cards: [goodCard, { id:'c', latin: 3 }], directions: ['bogus'], newPerDay: 'x'}] }` → 2 sets; second has 1 card, `directions` `['l2e']`, `newPerDay` 10. Stored SRS `{ v:1, items: { k1: goodRecord, k2: { ...goodRecord, stability: 'NaN' }, k3: { ...goodRecord, due: 'yesterday' } } }` → only `k1`.
  - `never overwrites data from a newer version`: raw `{ v: 2, sets: [...] }` → `loadSets()` is `[]`, `createSet('x')` is `null`, raw value unchanged.
  - `returns false when storage is full`: `vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full', 'QuotaExceededError'); })` → `saveSets([])` is `false`, `createSet('x')` is `null`, `saveSrsRecord('k', rec)` is `false`; nothing throws.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/storage.test.ts`
  Expected: FAIL, cannot resolve `./storage`.

- [ ] **Step 3: Implement `storage.ts` and the two exports in `vocabImport.ts`**
  One private `read(key)` returning the parsed object or `null` (try/catch), one private `write(key, value): boolean` (try/catch). Sanitizers `sanitizeSet(x: unknown): StudySet | null`, `sanitizeCard`, `sanitizeRecord` validate types (`typeof`, `Number.isFinite`, `!isNaN(Date.parse(due))`, `state` in 0..3, `introduced` matching `/^\d{4}-\d{2}-\d{2}$/` else `''`, `elapsed_days`/`learning_steps` default 0); duplicate set ids keep the first. Saving first re-reads the raw value and refuses if its `v` is a number above `STORE_VERSION`. Ids from `crypto.randomUUID()`. Every mutation bumps `updatedAt`. SRS deletions filter keys by prefix `${setId}:` or `${setId}:${cardId}:`.

- [ ] **Step 4: Run to verify pass**
  Run: `npx vitest run src/features/vocab/storage.test.ts src/lib/vocabImport.test.ts && npx tsc -b`
  Expected: PASS, no type errors.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/storage.ts src/features/vocab/storage.test.ts src/lib/vocabImport.ts
  git commit -m "feat(vocab): local study set storage with versioned, self-repairing keys"
  ```

---

### Task 2: Session log kind `vocab` (local only)

**Files:**
- Modify: `src/features/practice/sessionLog.ts`, `src/features/practice/sync.ts`, `src/features/practice/PracticeHome.tsx`
- Test: `src/features/practice/sessionLog.test.ts`, `src/features/practice/sync.test.ts`, `src/features/practice/practice.test.tsx`

Plan A may already have added `'forms'` to the kind union and possibly a server-kind filter. If `sessionLog.ts` already exports something equivalent to `SERVER_KINDS` / `needsPush`, reuse it and only add `'vocab'` and the tests.

**Interfaces:**
- Consumes: `getSet` from `src/features/vocab/storage.ts` (Task 1).
- Produces:
  ```ts
  // sessionLog.ts
  kind: 'module' | 'endless' | 'import' | 'vocab'   // plus 'forms' if Plan A added it
  set_id?: string                                    // new optional field on PracticeSession, vocab only
  export const SERVER_KINDS: readonly string[] = ['module', 'endless', 'import']; // the DB check constraint
  export const needsPush = (s: PracticeSession) => !s.synced && SERVER_KINDS.includes(s.kind);
  ```

- [ ] **Step 1: Write the failing tests**
  - `sessionLog.test.ts` › `keeps set_id on vocab sessions`: `appendSession({ kind: 'vocab', module_id: null, set_id: 's1', correct: 3, total: 4, xp: 0, completed: false })` → `loadSessions()[0]` has `kind 'vocab'`, `set_id 's1'`, `synced false`.
  - `sessionLog.test.ts` › `when capping, drops local-only sessions before unsynced server ones`: 199 unsynced `module` sessions (newer) plus 2 unsynced `vocab` sessions (older) → after `saveSessions`, length 200, all 199 module sessions kept, the older vocab session gone.
  - `sync.test.ts` › `never pushes vocab sessions and keeps them locally`: append one `module` and one `vocab` session; `syncSessions(sb, 'u1')` → one push containing only the module row (no `set_id` key in any pushed row); after sync, `loadSessions()` still contains the vocab session (still `synced: false`).
  - `sync.test.ts` › `sends nothing when only vocab sessions are unsynced`: append one vocab session → `pushes` has length 0.
  - `practice.test.tsx` › `shows vocab sessions under the set name, or Vocab set when it is gone`: `createSet('Chapter 1')` → session with its `set_id`, plus a session with `set_id: 'gone'` → buttons named `/Chapter 1/` and `/Vocab set/` exist.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/practice`
  Expected: the five new tests FAIL (type errors on `'vocab'` / `set_id`, wrong push contents, missing titles).

- [ ] **Step 3: Implement**
  - `sessionLog.ts`: widen `kind`, add `set_id?`, `SERVER_KINDS`, `needsPush`; in `saveSessions` the drop loop prefers the oldest entry with `!needsPush(s)` (replaces the `synced` check).
  - `sync.ts`: `const unsynced = loadSessions().filter(needsPush)`; build rows as `({ synced: _s, set_id: _id, ...row }) => ({ ...row, user_id: userId })`.
  - `PracticeHome.tsx`: in `titleOf`, `s.kind === 'vocab'` → `getSet(s.set_id ?? '')?.name ?? 'Vocab set'`; in the row's `open`, vocab → `` `/practice/vocab/${s.set_id}` ``.

- [ ] **Step 4: Run to verify pass**
  Run: `npx vitest run src/features/practice && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/practice
  git commit -m "feat(practice): log vocab sessions locally; never push kinds the server rejects"
  ```

---

### Task 3: FSRS scheduler wrapper

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)
- Create: `src/features/vocab/scheduler.ts`, `src/features/vocab/scheduler.test.ts`

**Interfaces:**
- Consumes: `StudySet`, `StudyCard`, `SrsRecord`, `itemKey` (Task 1); `VocabDirection` from `src/lib/vocab.ts`.
- Produces:
  ```ts
  export type Rate = 'again' | 'hard' | 'good' | 'easy';
  export const REVIEW_MAX = 50;
  export interface StudyItem { key: string; card: StudyCard; dir: VocabDirection }
  export interface SetCounts { new: number; due: number; learned: number; newToday: number }
  export function localDay(d: Date): string;          // local 'YYYY-MM-DD'
  export function endOfLocalDay(d: Date): Date;       // local 23:59:59.999
  export function rate(prev: SrsRecord | undefined, r: Rate, now: Date): SrsRecord;
  export function isDue(rec: SrsRecord, now: Date): boolean;
  export function setItems(set: StudySet): StudyItem[];   // cards in order × directions in canonical order
  export function reviewQueue(set: StudySet, srs: Record<string, SrsRecord>, now: Date, max?: number): StudyItem[];
  export function setCounts(set: StudySet, srs: Record<string, SrsRecord>, now: Date): SetCounts;
  ```
  `scheduler.ts` is the only file in the app that imports `ts-fsrs`.

- [ ] **Step 1: Install the pinned package**
  Run: `npm install --save-exact ts-fsrs@5.4.2`
  Expected: `package.json` dependencies contain `"ts-fsrs": "5.4.2"` (no caret).

- [ ] **Step 2: Write the failing tests** (all dates built with the local-time constructor, e.g. `const now = new Date(2026, 10, 6, 12)`; helper `mkSet(n, over?)` builds a `StudySet` in memory with cards `c0..c(n-1)`):
  - `localDay and endOfLocalDay use local time`: `localDay(new Date(2026, 10, 6, 23, 30)) === '2026-11-06'`; `endOfLocalDay(now).getTime() === new Date(2026, 10, 6, 23, 59, 59, 999).getTime()`.
  - `a first rating creates a serializable record that is not due again today`: for each of the four rates, `const r = rate(undefined, x, now)`: `typeof r.due === 'string'`, `r.reps === 1`, `r.introduced === '2026-11-06'`, `isDue(r, now) === false`, `JSON.parse(JSON.stringify(r))` deep-equals `r`.
  - `easier ratings give longer first intervals`: `again.scheduled_days >= 1`, `again <= hard <= good < easy` on `scheduled_days`.
  - `a stored record can be rated again`: `r1 = rate(undefined, 'good', now)`; `r2 = rate(JSON.parse(JSON.stringify(r1)), 'good', new Date(r1.due))` → `r2.reps === 2`, `r2.scheduled_days > r1.scheduled_days`, `r2.introduced === r1.introduced`; `rate(r2, 'again', new Date(r2.due)).lapses === 1`.
  - `is deterministic`: `rate(undefined, 'good', now)` deep-equals a second call with the same args.
  - `isDue counts the rest of the local day`: record with `due` = today 23:00 local → due at 09:00; `due` = tomorrow 00:30 local → not due at 23:30 today.
  - `setItems orders by card then l2e before e2l`: set with 2 cards, `directions ['l2e','e2l']` → keys `[c0:l2e, c0:e2l, c1:l2e, c1:e2l]` (via `itemKey`).
  - `review queue: due first, oldest first, then new up to the daily limit`: 5 cards l2e, `newPerDay 2`; records: c3 due 3 days ago, c4 due yesterday, c0 introduced today and due next week → queue keys `[c3, c4, c1]` (only one new left today).
  - `review queue caps at max`: 60 new cards, `newPerDay 100` → `reviewQueue(...).length === 50`; with `max 5` → 5.
  - `e2l waits until l2e was introduced on an earlier day`: 1 card, both directions, no records → queue is `[c0:l2e]`; with `c0:l2e` introduced today (due tomorrow) → `[]`; with `c0:l2e` introduced yesterday (due next week) → `[c0:e2l]`.
  - `the new-card allowance resets at local midnight`: `newPerDay 1`, c0 introduced `'2026-11-06'` → at `new Date(2026, 10, 6, 23, 30)` no new items; at `new Date(2026, 10, 7, 0, 30)` one new item.
  - `counts new, due and learned`: 3 cards l2e; c0 due yesterday, c1 due next week, c2 no record, `newPerDay 10` → `{ new: 1, due: 1, learned: 1, newToday: 1 }`; and `newToday` always equals the number of new (record-less) items in `reviewQueue(set, srs, now, Infinity)`.

- [ ] **Step 3: Run to verify failure**
  Run: `npx vitest run src/features/vocab/scheduler.test.ts`
  Expected: FAIL, cannot resolve `./scheduler`.

- [ ] **Step 4: Implement `scheduler.ts`**
  Module-level `const scheduler = fsrs({ enable_short_term: false, enable_fuzz: false })`. `rate`: `card = prev ? { ...prev, due: prev.due, last_review: prev.last_review } as CardInput : createEmptyCard(now)`; `const { card: next } = scheduler.next(card, now, GRADE[r])` with `GRADE = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy }`; copy the Card fields into an `SrsRecord` with `due`/`last_review` as ISO strings and `introduced: prev?.introduced || localDay(now)`. Queue per the Decisions section: due items sorted by `due` then `key`; new items need no record, and `e2l` additionally needs the card's `l2e` record to exist with `introduced < localDay(now)` when the set includes `l2e`; allowance `max(0, newPerDay - #records of this set with introduced === localDay(now))`.

- [ ] **Step 5: Run to verify pass**
  Run: `npx vitest run src/features/vocab && npx tsc -b`
  Expected: PASS.

- [ ] **Step 6: Commit**
  ```bash
  git add package.json package-lock.json src/features/vocab/scheduler.ts src/features/vocab/scheduler.test.ts
  git commit -m "feat(vocab): FSRS scheduling via ts-fsrs 5.4.2, local-day counts and review queue"
  ```

---

### Task 4: Set editor

**Files:**
- Create: `src/features/vocab/SetEditor.tsx`, `src/features/vocab/SetEditor.test.tsx`
- Modify: `src/App.tsx` (route `/practice/vocab/:setId/edit` → `<StudentShell><SetEditor /></StudentShell>`), `src/styles/app.css`

**Interfaces:**
- Consumes: Task 1 storage functions and constants; `LatinField` from `src/features/teacher/LatinField.tsx` (macron buttons; `block` prop); `ChevronLeft` icon.
- Produces: `export function SetEditor()` (reads `:setId`; unknown id → `<Navigate to="/practice/vocab" replace />`). A slot for Task 5: render `<PasteImport set={set} onAdded={refresh} />` where marked. Until Task 5 lands, leave a `{/* PasteImport (Task 5) */}` comment there.

UI (copy from the deck): back link to `/practice/vocab/:setId`; `.field` blocks with `.input` for name (saved on blur; blank shows `Give the set a name.` and keeps the stored name), two checkboxes (the last checked one is `disabled` so directions never become empty), number input `min 1 max 100` (saved on blur through `updateSet`, which clamps). Cards section: an add row (`LatinField` for Latin, `.input` for English, `Add card`; Enter in English adds; on success both fields clear and focus returns to Latin), then `.panel > ul.rows` with one `li > div.row-item` per card: Latin in `.row-title`, English in `.row-sub`, buttons `Edit` / `Remove` (`btn-ghost btn-small`). Edit swaps the row for two inputs plus `Save` / `Cancel`. `Delete set` (`btn-secondary`, red text via existing `--error` token) asks `window.confirm` and then navigates to `/practice/vocab`. Any storage call that returns false / `'failed'` / `ok: false` shows the "Couldn't save" error in `.form-error`. Add to `app.css`: `.vocab-add { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: start; }` and under `@media (max-width: 480px)` a single column.

- [ ] **Step 1: Write the failing tests** (render inside `MemoryRouter initialEntries={[`/practice/vocab/${id}/edit`]}` with `<Routes>` holding the editor route plus stub routes `/practice/vocab` → `<p>vocab home</p>` and `/practice/vocab/:setId` → `<p>set page</p>`; use `userEvent`):
  - `adds a card and clears the fields`: type Latin `puella`, English `girl`, click `Add card` → row with `puella` and `girl`; `getSet(id)!.cards` length 1; fields empty.
  - `rejects blanks and duplicates`: add with English empty → `Fill in both Latin and English.`; add `puella`/`girl` twice → `That card is already in the set.`
  - `edits and removes a card`: Edit → change English to `young girl` → Save → stored english is `young girl`; Remove → card gone.
  - `renames on blur and refuses a blank name`: clear name, blur → `Give the set a name.` and stored name unchanged; type `Ch 2`, blur → stored name `Ch 2`.
  - `keeps at least one direction`: with only Latin to English checked, that checkbox is disabled; check English to Latin → stored `['l2e','e2l']`, and now both are enabled.
  - `saves new cards per day`: set `25`, blur → stored 25.
  - `deletes the set after confirming`: `vi.spyOn(window, 'confirm').mockReturnValue(true)` → click `Delete set` → `vocab home` shown, `getSet(id)` undefined; with `false` nothing changes.
  - `shows a storage error instead of crashing`: `setItem` throws (as in Task 1) → adding a card shows `Couldn't save. Your browser's storage may be full.`
  - `unknown set redirects`: route `/practice/vocab/nope/edit` → `vocab home`.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/SetEditor.test.tsx`
  Expected: FAIL, cannot resolve `./SetEditor`.

- [ ] **Step 3: Implement `SetEditor.tsx`, the route and the CSS.** Keep the set in component state, refreshed from `getSet(id)` after each successful write.

- [ ] **Step 4: Run to verify pass**
  Run: `npx vitest run src/features/vocab src/App.test.tsx && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/SetEditor.tsx src/features/vocab/SetEditor.test.tsx src/App.tsx src/styles/app.css
  git commit -m "feat(vocab): set editor for name, directions, daily new cards and cards"
  ```

---

### Task 5: Paste import

**Files:**
- Create: `src/features/vocab/PasteImport.tsx`, `src/features/vocab/PasteImport.test.tsx`
- Modify: `src/features/vocab/SetEditor.tsx` (render it in the Task 4 slot)

**Interfaces:**
- Consumes: `parseVocabImport` (`src/lib/vocabImport.ts`: returns `{ rows: {line, latin, english}[], skipped: {line, text, reason}[] }`), `addCards` / `AddResult` / `MAX_CARDS` (Task 1), `normalize`, `LatinField` with `multiline` and `shortcut={false}` ("=" is a separator).
- Produces: `export function PasteImport({ set, onAdded }: { set: StudySet; onAdded: () => void })`.

Behaviour: collapsed to an `Import cards` button; open shows the help text, the textarea, `Preview` and `Cancel`. Preview computes, without saving: rows to add (dropping rows whose normalized Latin and English both match a card already in the set; count those as "already in the set"), and lists skipped lines. `Add ${n} cards` calls `addCards(set.id, rows)`; on `ok`, shows `Added ${added} cards.`, clears and collapses, calls `onAdded`. If `overflow > 0`, also show `This set is full (1000 cards).`; if `!ok`, the storage error. Over 1000 pasted lines: only the first `MAX_CARDS - set.cards.length` rows are offered (the rest count as overflow in the message).

- [ ] **Step 1: Write the failing tests**
  - `previews tab, dash, equals and comma lines`: paste `puella\tgirl\nagricola - farmer\naqua = water\nnauta, sailor` → `4 cards ready to add`; click `Add 4 cards` → `Added 4 cards.`, `getSet(id)!.cards.map(c => c.latin)` equals `['puella','agricola','aqua','nauta']`, `onAdded` called once.
  - `reports skipped lines and cards already in the set`: set already has `puella`/`girl`; paste `puella - girl\njust words\nvia - road` → `1 card ready to add` (singular), `1 already in the set`, and `Line 2: No separator (tab, " - ", " = " or comma)`.
  - `ignores a Quizlet header row`: `Term\tDefinition\nrosa\trose` → `1 card ready to add`.
  - `does not turn a= into a macron`: typing `a=b` into the textarea keeps the literal `a=b` (the `shortcut={false}` case).
  - `Cancel closes without saving`.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/PasteImport.test.tsx`
  Expected: FAIL, cannot resolve `./PasteImport`.

- [ ] **Step 3: Implement `PasteImport.tsx` and render it in `SetEditor`** below the add row.

- [ ] **Step 4: Run to verify pass**
  Run: `npx vitest run src/features/vocab && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/PasteImport.tsx src/features/vocab/PasteImport.test.tsx src/features/vocab/SetEditor.tsx
  git commit -m "feat(vocab): paste import into study sets, reusing the teacher import parser"
  ```

---

### Task 6: Review, Learn and flashcard question builders

**Files:**
- Create: `src/features/vocab/questions.ts`, `src/features/vocab/questions.test.ts`

**Interfaces:**
- Consumes: `StudyItem`, `setItems` (Task 3); `StudySet`, `SrsRecord` (Task 1); `pickDistractors`, `VocabItem` (`src/lib/vocab.ts`); `guessPos` (`src/lib/vocabImport.ts`); `lemmaOf` (`src/lib/lexicon.ts`); `escapeHtml` (`src/lib/html.ts`); `normalize`; `shuffle`; `TypeInQuestion`, `MCQuestion`.
- Produces:
  ```ts
  export const LEARN_MAX = 20;
  export function englishAnswers(english: string): string[]; // [0] is the trimmed full text
  export function latinAnswers(latin: string): string[];     // [full, lemmaOf(full)] deduped by normalize
  export function reviewQuestion(item: StudyItem, set: StudySet): TypeInQuestion;     // id = item.key
  export function flashcardQuestion(item: StudyItem): TypeInQuestion;                 // id = item.key
  export function learnQuestion(item: StudyItem, set: StudySet, rng?: () => number): MCQuestion; // id = item.key
  export function learnSession(set: StudySet, srs: Record<string, SrsRecord>, rng?: () => number, max?: number): MCQuestion[];
  ```

Question shapes (escape all card text inserted into HTML):
- `reviewQuestion` l2e: badge `VOCAB · MEANING`, prompt `` `What does <span class='latin-word'>${latin}</span> mean?` ``, answers = `englishAnswers` of this card's English, then of every other card in the set with the same normalized Latin; explanation `` `${latin}: ${english}` ``.
- `reviewQuestion` e2l: badge `VOCAB · LATIN`, prompt `` `Give the Latin for: <strong>${english}</strong>` ``, answers = `latinAnswers` of this card, then of every card with the same normalized English; hint `` `Starts with <strong>${first letter of latin}</strong>` ``; same explanation.
- `flashcardQuestion`: badge `LATIN` (l2e) or `ENGLISH` (e2l); prompt is the bare front (`<span class='latin-word'>latin</span>` or the escaped English); `answers: [back]` (English or Latin, plain).
- `learnQuestion`: same prompts as review (e2l prompt `` `Which Latin word means <strong>${english}</strong>?` ``), choices = escaped correct + `pickDistractors(target, list, [], rng)` escaped, shuffled; for l2e the `VocabItem`s carry `definition = english`, for e2l `definition = latin`; `pos = guessPos(latin)`; `itemId = card.id`.
- `learnSession`: `[]` if the set has fewer than 2 cards; else items from `setItems`, record-less items first, each group shuffled with `rng`, cut to `max` (default `LEARN_MAX`), mapped through `learnQuestion`.

- [ ] **Step 1: Write the failing tests**
  - `englishAnswers splits glosses`: `englishAnswers('to love, like')` has `[0] === 'to love, like'` and contains `'to love'`, `'love'` and `'like'`, with no two entries equal after `normalize`; `englishAnswers('(of a ship) to sail')` contains `'to sail'` and `'sail'`; `englishAnswers('girl')` equals `['girl']`; `englishAnswers('the road; way')` contains `'road'` and `'way'`.
  - `latinAnswers accepts the lemma`: `latinAnswers('amo, amare, amavi, amatum')` equals `['amo, amare, amavi, amatum', 'amo']`; `latinAnswers('puella')` equals `['puella']`.
  - `review l2e grades with grading.ts`: `isCorrect(q, 'Love')`, `isCorrect(q, 'like')` true for card `amo, amare` / `to love, like`; `isCorrect(q, 'hate')` false; `correctDisplay(q) === 'to love, like'`.
  - `review e2l accepts every Latin word with the same meaning`: cards `fero`/`to carry` and `porto`/`to carry` → the e2l question for `fero` accepts `porto` and `fero`; hint is `Starts with <strong>f</strong>`.
  - `review l2e accepts every meaning of a repeated Latin word`: cards `malum`/`apple` and `malum`/`evil` → the question for the first accepts `evil`.
  - `escapes card text`: card English `<b>x</b>` → prompt contains `&lt;b&gt;`.
  - `learn choices come from the set with no duplicates`: 5-card set with two cards sharing English → every learn question's `choices` are unique after `normalize`, include `correct`, and have length `min(4, distinct meanings)`.
  - `learn works with two cards`: 2-card set → each question has 2 choices.
  - `learn session puts unseen items first and stops at the max`: 30-card set, records for c0..c24 → `learnSession(set, srs, seededRng(1))` has length 20 and its first 5 ids are the keys of c25..c29 (any order).
  - `learn needs two cards`: 1-card set → `[]`.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/questions.test.ts`
  Expected: FAIL, cannot resolve `./questions`.

- [ ] **Step 3: Implement `questions.ts`.** `englishAnswers`: candidates = full, then each part of `full.split(/[;,/]/)`; for every candidate also add its `replace(/\([^)]*\)/g, '')` version and, if it starts with `to |a |an |the ` (case-insensitive), the version without that word; trim, drop empties, dedupe by `normalize` keeping first.

- [ ] **Step 4: Run to verify pass**
  Run: `npx vitest run src/features/vocab && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/questions.ts src/features/vocab/questions.test.ts
  git commit -m "feat(vocab): build review, learn and flashcard questions from study sets"
  ```

---

### Task 7: Flashcard component and session

**Files:**
- Create: `src/features/vocab/Flashcard.tsx`, `src/features/vocab/FlashcardSession.tsx`, `src/features/vocab/FlashcardSession.test.tsx`
- Modify: `src/styles/app.css`

**Interfaces:**
- Consumes: `Rate` (Task 3); `TypeInQuestion`; `DrillResult` from `src/features/drill/useDrill.ts`; `Close` icon.
- Produces:
  ```ts
  export function Flashcard(props: { front: string /* HTML */; back: string /* plain */; flipped: boolean; onFlip: () => void }): JSX.Element;
  export function FlashcardSession(props: {
    questions: TypeInQuestion[];
    onRate: (q: TypeInQuestion, r: Rate) => void;
    onFinish: (results: DrillResult[]) => void;
    onExit: (results: DrillResult[]) => void;
    exitWarning?: string;
  }): JSX.Element;
  ```
  Each rating appends `{ q, given: r, correct: r !== 'again' }`.

Layout: the same `.screen.active` + `.drill-topbar` markup as `DrillSession` (exit button `aria-label="Exit session"` that asks `window.confirm(exitWarning)`, progress fill, label `${index + 1} / ${total}`, `.drill-score` showing `${known} known` where known = non-again ratings). Body: `Flashcard` with `front = q.prompt`, `back = q.answers[0]`, `key` per question so it resets unflipped. `Flashcard` is a `<button className="flashcard" aria-label="Flashcard. Tap to flip." aria-pressed={flipped}>` whose face shows the front (via `dangerouslySetInnerHTML`, prompts are escaped by Task 6) or the back (plain text). Below: unflipped, the `Tap the card to see the answer` line; flipped, `.rate-row` with four `btn-secondary` buttons `Again` `Hard` `Good` `Easy`; then the key hint in `.muted.small`. Keys (document listener): Space flips (preventDefault), `1`–`4` rate only when flipped. After the last rating call `onFinish(results)`.

CSS in `app.css`: `.flashcard { width: 100%; min-height: 220px; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); box-shadow: var(--shadow); font-size: 1.35rem; text-align: center; cursor: pointer; overflow-wrap: anywhere; }`, `.flashcard[aria-pressed="true"] { border-color: var(--primary); }`, `.rate-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 16px; }`. No animation.

- [ ] **Step 1: Write the failing tests** (three questions built inline as `TypeInQuestion`s):
  - `shows the front first, then the back and rating buttons`: front text visible, back text absent, no `Good` button; click the card → back visible and four rating buttons.
  - `rating saves and moves on`: flip, click `Good` → `onRate` called with `(q1, 'good')`; label `2 / 3`; card unflipped again.
  - `keyboard flips and rates`: `user.keyboard(' ')` flips; `user.keyboard('1')` rates `again`; pressing `3` before flipping does nothing.
  - `finishes with results`: rate `again`, `good`, `easy` → `onFinish` called once with results whose `correct` values are `[false, true, true]`.
  - `exit asks first and passes results so far`: confirm mocked `true`; after one rating click `Exit session` → `onExit` called with 1 result; with confirm `false`, `onExit` not called.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/FlashcardSession.test.tsx`
  Expected: FAIL, cannot resolve `./FlashcardSession`.

- [ ] **Step 3: Implement both components and the CSS.**

- [ ] **Step 4: Run to verify pass**
  Run: `npx vitest run src/features/vocab && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/Flashcard.tsx src/features/vocab/FlashcardSession.tsx src/features/vocab/FlashcardSession.test.tsx src/styles/app.css
  git commit -m "feat(vocab): flip-and-rate flashcard session"
  ```

---

### Task 8: Study route (Review, Learn, Flashcards) and "That was easy"

**Files:**
- Modify: `src/features/drill/Feedback.tsx`, `src/features/drill/DrillSession.tsx`, `src/features/drill/DrillSession.test.tsx`, `src/App.tsx`, `src/styles/app.css`
- Create: `src/features/vocab/StudyRoute.tsx`, `src/features/vocab/StudyRoute.test.tsx`

**Interfaces:**
- Consumes: `getSet`, `loadSrs`, `saveSrsRecord` (Task 1); `rate`, `reviewQueue`, `setCounts`, `REVIEW_MAX`, `Rate` (Task 3); `reviewQuestion`, `flashcardQuestion`, `learnSession` (Task 6); `FlashcardSession` (Task 7); `DrillSession`, `SessionSummary`; `appendSession` (Task 2 shape); `updateStreak`, `todayISO` (`src/features/solo/progressStore.ts`).
- Produces:
  ```ts
  // Feedback.tsx: new optional prop
  onEasy?: () => void;   // renders `That was easy` (btn-secondary) beside Continue, both in a `.feedback-actions` row
  // DrillSession.tsx: new optional prop
  onEasy?: (q: DrillQuestion) => void; // passed to Feedback only when lastResult.correct; click = onEasy(current) then drill.next()
  // StudyRoute.tsx
  export type StudyMode = 'review' | 'learn' | 'flashcards';
  export function logVocab(setId: string, results: DrillResult[]): boolean; // false and no write when results is empty
  export function StudyRoute(): JSX.Element; // route /practice/vocab/:setId/:mode
  ```
  CSS: `.feedback-actions { display: flex; gap: 10px; margin-top: 16px; } .feedback-actions > button { flex: 1; margin-top: 0; }`. Without `onEasy`, Feedback renders exactly as today.

StudyRoute behaviour:
- Unknown set → `<Navigate to="/practice/vocab" replace />`; unknown mode → `<Navigate to={`/practice/vocab/${id}`} replace />`.
- Questions are built once (`useState` initializer) with `now = new Date()`: review → `reviewQueue(set, loadSrs(), now, REVIEW_MAX).map(i => reviewQuestion(i, set))`; flashcards → same queue through `flashcardQuestion`; learn → `learnSession(set, loadSrs())`.
- Empty review/flashcards → the "All caught up" screen; empty learn → "Not enough cards". Both are a `.screen.active` with a `.complete-card` and a `btn-secondary` `Back to set`.
- Review: `onAnswer(q, _given, correct)` → `prev = loadSrs()[q.id]`, remember it in a `useRef(new Map())`, `saveSrsRecord(q.id, rate(prev, correct ? 'good' : 'again', new Date()))`. `onEasy(q)` → `saveSrsRecord(q.id, rate(prevRef.get(q.id), 'easy', new Date()))`.
- Flashcards: `onRate(q, r)` → `saveSrsRecord(q.id, rate(loadSrs()[q.id], r, new Date()))`.
- Learn: no `onAnswer`, no `onEasy`.
- `exitWarning` = the deck's exit confirm. `onExit(results)` → `logVocab(set.id, results)` then navigate to the set page. `onFinish(results)` → `logVocab` and show `SessionSummary` (`backLabel="Back to set"`, note from the deck using `setCounts(set, loadSrs(), new Date())`). Review and Learn pass `onRetryWrong`, which runs a fresh `DrillSession` over the wrong questions with no `onAnswer`, no `onEasy` and no logging, then shows the summary again. Flashcards pass no retry.
- `logVocab` appends `{ kind: 'vocab', module_id: null, set_id, correct, total, xp: 0, completed: false }` and calls `updateStreak(todayISO())`. It does not call `requestSync` (nothing to push).
- Route in `App.tsx`: `<Route path="/practice/vocab/:setId/:mode" element={<StudyRoute />} />`.

- [ ] **Step 1: Write the failing tests**
  - `DrillSession.test.tsx` › `offers That was easy only after a right answer`: one typein question with `onEasy` spy → answer wrong → no `That was easy`; new render, answer right → click `That was easy` → spy called with the question and `onFinish` fires (session advanced past the last question). Without the prop the button never appears.
  - `StudyRoute.test.tsx` (seed with `createSet` + `addCards`; render `MemoryRouter` + `Routes` with the study route and stub routes `/practice/vocab` → `vocab home`, `/practice/vocab/:setId` → `set page`):
    - `review rates each answer and logs the session`: cards `puella`/`girl`, `aqua`/`water` → prompt mentions `puella`; type `girl`, Enter, Continue; type `fire`, Enter, Continue → `Session complete`; `loadSrs()` has 2 records, both with `reps 1`, and the `aqua` one's `scheduled_days` ≤ the `puella` one's; `loadSessions()[0]` matches `{ kind: 'vocab', set_id: id, correct: 1, total: 2 }`.
    - `That was easy schedules further out than Good`: answer both right, click `That was easy` on the first and Continue on the second → first record's `scheduled_days` > second's.
    - `nothing due shows All caught up`: rate every item ahead of time with `rate(undefined, 'good', new Date())` → `All caught up`; `Back to set` → `set page`.
    - `flashcards save the chosen rating`: flip, `Easy` → record exists with `reps 1`.
    - `learn changes no schedule`: 4-card set, learn mode, answer every question by clicking the first choice → `loadSrs()` is `{}` and a vocab session is logged with `total` equal to the number of questions.
    - `learn needs two cards`: 1-card set → `Not enough cards`.
    - `exiting after one answer logs it`: confirm mocked `true`, answer one review question, Continue, click `Exit session` → `set page`, a vocab session with `total 1`.
    - `exiting before answering logs nothing` (confirm `true`) → `loadSessions()` empty.
    - `unknown set goes to the Vocab page` and `unknown mode goes to the set page`.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/drill src/features/vocab/StudyRoute.test.tsx`
  Expected: the new tests FAIL; existing drill tests still pass.

- [ ] **Step 3: Implement the Feedback / DrillSession props, `StudyRoute.tsx`, the route and the CSS.**

- [ ] **Step 4: Run to verify pass**
  Run: `npm test && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/drill src/features/vocab/StudyRoute.tsx src/features/vocab/StudyRoute.test.tsx src/App.tsx src/styles/app.css
  git commit -m "feat(vocab): review, learn and flashcard sessions with FSRS ratings and session log"
  ```

---

### Task 9: Vocab subject card, set list and set page

**Files:**
- Create: `src/features/vocab/VocabHome.tsx`, `src/features/vocab/SetPage.tsx`, `src/features/vocab/pages.test.tsx`
- Modify: `src/features/practice/PracticeHome.tsx`, `src/features/practice/practice.test.tsx`, `src/App.tsx`

**Interfaces:**
- Consumes: `loadSets`, `createSet`, `getSet`, `loadSrs` (Task 1); `setCounts` (Task 3); `useSyncVersion` (re-render after sync, as other pages do); icons `Cards`, `ChevronLeft`, `ChevronRight`, `Repeat`, `Layers`.
- Produces: `export function VocabHome()`, `export function SetPage()`; routes `/practice/vocab` and `/practice/vocab/:setId`, both wrapped in `StudentShell`. `SetPage` leaves a slot `{/* QuizletExport (Task 11) */}` under the page head.

UI (copy from the deck):
- **PracticeHome:** the Vocab `div.subject.soon` becomes `<Link className="subject" to="/practice/vocab">` with the `Cards` icon; subtitle from `loadSets()` and the summed `setCounts(...).due`.
- **VocabHome:** `.page-head` with `h1`, intro and a `btn-primary` `New set`. Clicking it shows an inline form (`.field` labelled `Set name`, `Create`, `Cancel`); Create (or Enter) calls `createSet(name)` and navigates to `/practice/vocab/${id}/edit`; a `null` result shows the storage error. Section `Your sets`: `.panel > ul.rows` of `Link.row-item` to each set page, newest `updatedAt` first, with the subtitle and the `.tag.info` due tag, `ChevronRight` on the side. Empty state uses `.empty`. Footnote `.muted.small` at the bottom.
- **SetPage:** unknown id → `<Navigate to="/practice/vocab" replace />`. Back link, `.page-head` (h1, card count and directions line, `Link.btn-secondary` `Edit set` to `/edit`), `.stats` with New / Due today / Learned, section `Study` with the explanatory line and a `.subjects` grid of three `Link.subject` cards to `/review`, `/learn`, `/flashcards`. With no cards, the Study section is replaced by the no-cards panel with an `Add cards` link to `/edit`. Section `Cards`: `.panel > ul.rows`, each `li > div.row-item` with Latin (`.row-title`) and English (`.row-sub`), first 50 then a `btn-ghost` `Show all ${n} cards`.

- [ ] **Step 1: Write the failing tests**
  - `practice.test.tsx`: update `shows an empty state with no sessions` to expect `getAllByText('Coming soon')` length 1 (only Translation), and add `links to Vocab with set and due counts`: no sets → link `Vocab` with `Make your own study sets` and `href` `/practice/vocab`; after creating 2 sets with one due item (via `saveSrsRecord` with a past `due`) → `2 sets · 1 due today`.
  - `pages.test.tsx` › `VocabHome lists sets with due counts`: 2 sets, one with 3 cards and 1 due → rows show `3 cards · 1 due today` and tag `1 due`; empty → the empty-state line and the footnote.
  - `New set creates a set and opens the editor`: click `New set`, type `Ch 3`, Enter → stub `/practice/vocab/:setId/edit` route shown; `loadSets()[0].name === 'Ch 3'`.
  - `SetPage shows counts and study links`: 3 cards, `newPerDay 2`, one due (its record `introduced` yesterday) → stats `New 2`, `Due today 1`, `Learned 0`; Review subtitle `1 due · 2 new`; links to `.../review`, `.../learn`, `.../flashcards`.
  - `SetPage with nothing to review says so`: every item rated today (not due) → `All caught up for today`.
  - `SetPage with no cards points to the editor`: → `This set has no cards yet.` and `Add cards` linking to `/edit`; no `Review` link.
  - `SetPage shows 50 cards then all`: 60 cards → 50 rows, then `Show all 60 cards` → 60 rows.
  - `unknown set redirects to the Vocab page`.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/pages.test.tsx src/features/practice/practice.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Implement both pages, the routes and the PracticeHome card.**

- [ ] **Step 4: Run to verify pass**
  Run: `npm test && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/VocabHome.tsx src/features/vocab/SetPage.tsx src/features/vocab/pages.test.tsx src/features/practice src/App.tsx
  git commit -m "feat(vocab): Vocab card on Practice, set list and set overview pages"
  ```

---

### Task 10: Built-in starter sets (skippable)

**Skip condition — check first:** run `ls src/content/nouns.generated.ts src/content/adjectives.generated.ts`. If either file is missing, Plan A has not landed: skip this whole task (the spec says to ship without starter sets) and note "Task 10 skipped: Plan A data absent" in the final report. Do not create these files.

**Files:**
- Create: `src/features/vocab/starterSets.ts`, `src/features/vocab/starterSets.test.ts`
- Modify: `src/features/vocab/VocabHome.tsx`, `src/features/vocab/pages.test.tsx`

**Interfaces:**
- Consumes: `CORE_VERBS: Verb[]` from `src/content/verbs.generated.ts` (fields `inf`, `conj?`, `perf`, `ppp?`, `pp1?`, `trans`, `irregular?`, `deponent?`, and Plan A's `semiDeponent?`); Plan A's generated noun and adjective arrays. Before writing code, open `src/content/nouns.generated.ts`, `src/content/adjectives.generated.ts` and their types in `src/lib/morph/` and note: the exported array names, the dictionary-form field (the spec says the noun headword carries the genitive and gender), the English gloss field, and the declension / adjective-type field. Use those exact names.
- Produces:
  ```ts
  export interface StarterSet { id: string; name: string; cards: CardInput[] }
  export function verbDictionaryForm(v: Verb): string;
  export function starterSets(): StarterSet[]; // computed once and memoized; sets with 0 cards are omitted
  ```
  Ids: `verbs-1`, `verbs-2`, `verbs-3`, `verbs-3io`, `verbs-4`, `verbs-dep`, `verbs-irr`, `nouns-1` … `nouns-5`, `adj-12`, `adj-3`; names from the deck.

Rules:
- Verbs: `irregular` → `verbs-irr`; else `deponent || semiDeponent` → `verbs-dep`; else by `conj` (1, 2, 3, 3.5 → `verbs-3io`, 4). Latin = `verbDictionaryForm(v)`: deponent or semi-deponent → `${pp1}, ${inf}, ${perf}us sum`; otherwise `${pp1}, ${inf}, ${perf}i` plus `, ${ppp}um` when `ppp` is set; no `pp1` → `inf`. English = `trans`.
- Nouns: one set per declension (1 to 5), Latin = the headword field, English = the gloss field. Adjectives: 1st/2nd vs 3rd declension by the type field. If a type has no declension field, put all of that part of speech in one set named `Nouns: core` / `Adjectives: core` instead.
- Each set is ordered alphabetically by Latin, deduped by `normalize(latin)` + `normalize(english)`, cut to `MAX_CARDS`.
- **VocabHome:** a `Starter sets` section after `Your sets` (copy from the deck): `.panel > ul.rows`, each row with the name, `${n} cards`, and either `Add` (`btn-secondary btn-small`: `createSet(name, cards, id)` then navigate to the new set page) or, if a set with `source === id` exists, the `Added` tag and a link to it.

- [ ] **Step 1: Write the failing tests**
  - `verbDictionaryForm`: `{ inf:'amare', conj:1, pres:'am', perf:'amav', ppp:'amat', pp1:'amo', trans:'to love' }` → `amo, amare, amavi, amatum`; `{ inf:'admirari', conj:1, perf:'admirat', deponent:true, pp1:'admiror', trans:'to admire' }` → `admiror, admirari, admiratus sum`; `{ inf:'abesse', irregular:true, perf:'afu', pp1:'absum', trans:'to be away' }` → `absum, abesse, afui`.
  - `every starter set is non-empty, within the cap, and has no blank or duplicate cards`.
  - `every generated verb lands in exactly one verb set` (sum of verb set sizes equals the deduped `CORE_VERBS` count).
  - `ids are unique and names match the deck`.
  - `pages.test.tsx` › `adding a starter set makes an editable copy once`: click `Add` on `Verbs: 1st conjugation` → set page for a new set with `source 'verbs-1'`; back on VocabHome that row shows `Added`.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/starterSets.test.ts src/features/vocab/pages.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Implement `starterSets.ts` and the VocabHome section.**

- [ ] **Step 4: Run to verify pass**
  Run: `npm test && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/starterSets.ts src/features/vocab/starterSets.test.ts src/features/vocab/VocabHome.tsx src/features/vocab/pages.test.tsx
  git commit -m "feat(vocab): starter sets from the generated core verbs, nouns and adjectives"
  ```

---

### Task 11: Quizlet export

**Files:**
- Create: `src/features/vocab/QuizletExport.tsx`, `src/features/vocab/QuizletExport.test.tsx`
- Modify: `src/features/vocab/SetPage.tsx` (render it in the Task 9 slot, only when the set has cards)

**Interfaces:**
- Consumes: `quizletText(items: VocabItem[])` from `src/lib/vocabExport.ts` (term TAB definition per line, flattens tabs/newlines); `downloadText` from `src/lib/csv.ts`; `lemmaOf`; `StudySet`.
- Produces: `export function QuizletExport({ set }: { set: StudySet })` and `export function setToQuizlet(set: StudySet): string` (maps each card to `{ itemId: card.id, headword: card.latin, lemma: lemmaOf(card.latin), definition: card.english, pos: '' }` and calls `quizletText`).

Behaviour: a `btn-secondary` `Export to Quizlet` toggles a `.panel` with the note, a read-only `textarea.input` (label `Quizlet import text`, 6 rows, full width) holding `setToQuizlet(set)`, and buttons `Copy` (`navigator.clipboard.writeText`, then `Copied.`; on rejection select the textarea text instead) and `Download .txt` (`downloadText(`${slug}-quizlet.txt`, text)` where slug is the lowercased name with runs of non-letters replaced by `-`, falling back to `vocab`).

- [ ] **Step 1: Write the failing tests**
  - `setToQuizlet writes one tab-separated card per line`: cards `puella`/`girl` and `amo, amare`/`to love\tlike` → `'puella\tgirl\namo, amare\tto love like\n'`.
  - `shows the text and copies it`: stub `navigator.clipboard.writeText` (`Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })`) → click `Export to Quizlet`, the textarea has the text, click `Copy` → `writeText` called with it and `Copied.` appears.
  - `downloads a .txt named after the set`: `vi.mock('../../lib/csv', ...)` or spy → `downloadText` called with `'chapter-1-quizlet.txt'` for set name `Chapter 1`.

- [ ] **Step 2: Run to verify failure**
  Run: `npx vitest run src/features/vocab/QuizletExport.test.tsx`
  Expected: FAIL, cannot resolve `./QuizletExport`.

- [ ] **Step 3: Implement and render in `SetPage`.**

- [ ] **Step 4: Run to verify pass**
  Run: `npm test && npx tsc -b`
  Expected: PASS.

- [ ] **Step 5: Commit**
  ```bash
  git add src/features/vocab/QuizletExport.tsx src/features/vocab/QuizletExport.test.tsx src/features/vocab/SetPage.tsx
  git commit -m "feat(vocab): export a study set as Quizlet import text"
  ```

---

### Task 12: End-to-end test and README

**Files:**
- Create: `tests/e2e/vocab.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: every route and string above. The seeded-set helper writes `latiniq_vocab_sets` in the Task 1 format through `page.addInitScript`, guarded by `if (!localStorage.getItem('latiniq_vocab_sets'))` so it runs once.

- [ ] **Step 1: Write the e2e tests** (collect `pageerror`s and assert none at the end of each test, as `solo.spec.ts` does):
  - `make a set, import cards, review them, see it in recents`: `/` → link `/^vocab/i` → `New set` → `Set name` `Chapter 1` → Enter → editor. `Import cards` → fill `Cards to import` with `puella\tgirl\nagricola - farmer\naqua = water\nnauta, sailor` → `Preview` → `4 cards ready to add` → `Add 4 cards` → `Back to set` → stat `New` shows 4 → `Review`. Four times: read `.q-prompt .latin-word`, type the matching English from a map, Enter, `Continue`. Expect `Session complete` and `4` correct; `Back to set` → `Due today` 0 and `Learned` 4. Go to Practice → button `/Chapter 1/` contains `4/4 correct`.
  - `flashcards and learn on a seeded set`: seed 4 cards → `/#/practice/vocab/<id>/flashcards` → click the card, `Good`, four times → `Session complete`. Then `/#/practice/vocab/<id>/learn` → answer by clicking the first `.mc-btn` and `Continue` until `Session complete`.
  - `phone width` (`viewport 375×812`): for `/#/practice/vocab`, `/#/practice/vocab/<id>`, `/#/practice/vocab/<id>/edit` and `/#/practice/vocab/<id>/flashcards` with a seeded set whose longest card is `circumdo, circumdare, circumdedi, circumdatum` / `to put around, surround, enclose` → `document.documentElement.scrollWidth - window.innerWidth <= 0`.

- [ ] **Step 2: Run e2e**
  Run: `npx playwright test tests/e2e/vocab.spec.ts` (use `PW_CHANNEL=chrome` if Playwright's browser isn't installed)
  Expected: PASS. Fix any layout overflow in `app.css`, not by loosening the test.

- [ ] **Step 3: Update `README.md`**
  - "What's in it" › Solo practice: add a bullet `- Vocab: make your own study sets (type them in or paste from Quizlet), then study with Review (spaced repetition with FSRS), Learn (multiple choice) or Flashcards. Sets can be exported to Quizlet. Sets live in this browser only.` If Task 10 shipped, append `Starter sets of core verbs, nouns and adjectives are built in.`
  - Change the line `XP, streaks and progress are stored in this browser only.` to `XP, streaks, progress and vocab sets are stored in this browser only.`
  - Project layout: add `src/features/vocab  study sets, FSRS scheduling, flashcards`.
  - Roadmap: replace `per-student spaced repetition` with `spaced repetition for class vocab lists`.

- [ ] **Step 4: Full verification**
  Run: `npm test && npx tsc -b && npx playwright test`
  Expected: all PASS (the classroom spec may skip without a backend, as it does today).

- [ ] **Step 5: Commit**
  ```bash
  git add tests/e2e/vocab.spec.ts README.md src/styles/app.css
  git commit -m "test(vocab): end-to-end study set flow and phone widths; document Practice Vocab"
  ```
