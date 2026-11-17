# Motion and Reasons to Come Back — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement
> this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make solo practice feel alive (a small CSS motion system) and give students a short,
obvious thing to do each day (Today's practice, daily goal, gentle streak, review queue, mastery,
rank, milestones, a daily sententia, an exam countdown, interactive lessons), without ever
interrupting or nagging them.

**Architecture:** A new `src/features/engage/` folder holds small pure stores (one `localStorage` key
each) and the home/summary components that read them. Motion is plain CSS in `src/styles/motion.css`
plus one hook and two tiny components. Existing screens change only where they call the new pieces.
Nothing touches Supabase.

**Tech Stack:** TypeScript, React 18, Vite, Vitest + Testing Library (jsdom), Playwright. No new
dependencies.

**Spec:** `docs/superpowers/specs/2026-11-14-engagement-motion-design.md`. Read it first; the
"non-intrusive charter" there overrides anything in this plan that seems to conflict with it.

**Worktree:** `/Users/aarav/dev/Latin-Trainer/.claude/worktrees/engagement`, branch
`claude/engagement-motion`, cut from `claude/forms-vocab-modules` at `4b478fd`. All paths below are
relative to that worktree. Every agent must be given the absolute worktree path and told to `cd`
there; agents start in the main checkout otherwise.

## Global Constraints

- No new npm dependencies. No animation library.
- No file under `supabase/` changes. No migration. No call to the live Supabase project or its tokens.
- No modal, toast, popup, sound, notification, or copy that mentions losing a streak.
- Durations: `--dur-1: 120ms`, `--dur-2: 200ms`, `--dur-3: 320ms`, `--dur-4: 500ms`. Nothing that
  responds to an answer runs longer than 320 ms. The laurel burst is 900 ms, plays once, and has
  `pointer-events: none`.
- Easing: `--ease-out: cubic-bezier(0.2, 0.8, 0.2, 1)`, `--ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Animate only `transform`, `opacity` and SVG `stroke-dashoffset`. Never animate layout properties
  (the one exception is the existing `width` transition on the drill progress bar).
- Under `@media (prefers-reduced-motion: reduce)` every animation and transition defined by this work
  is removed (`animation: none; transition: none`), and JS helpers return final values at once.
- `prefersReducedMotion()` returns `true` when `window.matchMedia` is missing (jsdom), so unit tests
  always see final values and never need fake timers for motion.
- Motion must not delay input: no `pointer-events: none`, `disabled` or timer gates on anything a
  student presses. Enter advances immediately, as it does now.
- `TestRunner` and teacher screens are not modified.
- Every store reads through a `try/catch` and falls back to its empty value on missing, corrupt or
  wrong-shaped data, and every write is wrapped so a full or disabled `localStorage` never throws.
  Follow `src/features/practice/lessonStore.ts`.
- Days are local calendar days as `YYYY-MM-DD` from `localDay()` in `src/features/vocab/scheduler.ts`.
  Day arithmetic uses date components (`new Date(y, m, d + n)`), never millisecond subtraction.
- Existing `localStorage` keys keep their names and shapes; new fields are optional.
- Colors come from the tokens in `src/styles/global.css`. No new color literals except `#fff`.
- Student-facing copy is plain and calm: sentence case, no exclamation marks, no emoji.
- `src/content/modules.ts` is ~6,500 lines: search it, never read it whole.
- Agents leave changes in the working tree. The orchestrator reviews the diff, runs the verifier, and
  commits. Commit messages follow the repo style (`feat(engage): …`, `feat(motion): …`) and end with
  `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`.

## Review Focus

Each of these has a test pinned in the task named.

1. **Broken or blocked storage.** A new key holding `"{"`, `null`, an array, or a throwing
   `localStorage` (private mode) → every store returns its empty value and the home page still renders.
   (Tasks 5, 6, 10, 12, 9.)
2. **Midnight and time zones.** Sessions at 23:30 and 00:30 local are two days; a streak walked back
   across a DST change or a month end still finds "yesterday". (Task 5.)
3. **A student with history but none of the new keys.** Streak number is preserved, the week strip is
   backfilled from the session log, and the first summary does not list a wall of milestones. (Tasks
   5, 13.)
4. **Stale ids.** A review-queue id whose question was edited out of `modules.ts`, or a vocab card
   whose set was deleted mid-session → skipped and pruned; Today's practice still builds and finishes.
   (Tasks 7, 8.)
5. **Fast hands.** Enter pressed twice, or Continue clicked during the feedback slide → exactly one
   answer recorded and one question advanced. (Task 2.)

## File map

| File | Responsibility |
|---|---|
| `src/styles/motion.css` | tokens, keyframes, utility classes, the reduced-motion block |
| `src/styles/engage.css` | layout for Today card, week strip, rank bar, milestones, sententia, lesson interactivity |
| `src/lib/motion.ts` | `prefersReducedMotion`, `useCountUp` |
| `src/components/ProgressRing.tsx` | SVG ring used by summary and Today card |
| `src/components/LaurelBurst.tsx` | the one celebration |
| `src/features/engage/days.ts` | per-day activity log, week strip |
| `src/features/engage/review.ts` | grammar review queue |
| `src/features/engage/daily.ts` | builds Today's practice |
| `src/features/engage/mastery.ts` | tiers |
| `src/features/engage/rank.ts` | XP → rank |
| `src/features/engage/milestones.ts` | milestone rules and store |
| `src/features/engage/prefs.ts` | daily goal, exam date |
| `src/features/engage/afterPractice.ts` | the one call every session makes when it ends |
| `src/features/engage/TodayRoute.tsx` | `/practice/today` |
| `src/features/engage/{TodayCard,WeekStrip,RankBar,MilestonesPanel,SententiaCard,ExamCountdown,SessionExtras}.tsx` | home and summary pieces |
| `src/features/practice/lesson/{LessonCheck,RecallTable,ExampleList}.tsx` | interactive lesson blocks |
| `src/content/sententiae.ts`, `src/content/milestoneCopy.ts` | student-facing content |

## How every task runs

Unless a task says otherwise: write the failing test named in the task → run
`npx vitest run <test file>` and see it fail for the stated reason → implement → run it green → run
`npx tsc -b`. The agent then stops with changes uncommitted. The orchestrator reads the diff, has the
`verifier` run `npm test` and `npx tsc -b`, and commits. Tasks are listed in dependency order; within
a phase, tasks that touch different files may run in parallel.

---

## Phase 0

### Task 0: Workspace

- [ ] `cd` to the worktree, run `npm ci`.
- [ ] Verifier: `npm test`, `npx tsc -b`, `npm run build`. Record the passing test count as the
  baseline. If the baseline is red, stop and diagnose before anything else.
- [ ] Confirm nothing is listening on port 5174 (`lsof -i :5174 -sTCP:LISTEN`). Playwright reuses an
  existing server on that port, which would test another worktree's code.

---

## Phase 1 — Motion

### Task 1: Motion foundation (implementer)

**Files:** Create `src/styles/motion.css`, `src/lib/motion.ts`, `src/lib/motion.test.tsx`,
`src/components/ProgressRing.tsx`, `src/components/ProgressRing.test.tsx`. Modify `src/main.tsx`
(import `motion.css` after the existing stylesheets).

**Produces:**
- `prefersReducedMotion(): boolean`
- `useCountUp(target: number, opts?: { from?: number; ms?: number }): number` — `from` defaults to
  `target` (no animation), `ms` to 500. Uses `requestAnimationFrame`, ease-out, integer output.
  Returns `target` immediately when reduced motion is on or `from === target`.
- `<ProgressRing value={0..1} size={64} stroke={6} label="7 of 10 today">{children}</ProgressRing>` —
  an SVG track and arc; `role="img"`, `aria-label={label}`; children centred inside. The arc's
  `stroke-dashoffset` transitions over `--dur-4`. `value` is clamped to 0..1.
- CSS: the tokens above on `:root`; keyframes `fade-up` (8 px, opacity), `pop` (scale 1 → 1.04 → 1),
  `shake` (±4 px, three swings), `slide-up` (16 px), `draw` (stroke-dashoffset to 0), `halo`
  (box-shadow ring fading out), `flip-in` (rotateX 80deg → 0); utilities `.m-fade-up`, `.m-stagger > *`
  (delay `calc(var(--i, 0) * 30ms)`, capped by only setting `--i` up to 12); the reduced-motion block
  that zeroes all of the above and everything later tasks add under `.m-` or the listed selectors.

**Tests:** `prefersReducedMotion()` is true in jsdom and false when `matchMedia` is stubbed to
`{ matches: false }`; `useCountUp(50, { from: 0 })` renders `50` at once in jsdom; with `matchMedia`
stubbed and fake rAF timers it starts at 0 and ends at exactly 50. `ProgressRing value={1.4}` has the
same dashoffset as `value={1}`; `value={0.5}` has half the circumference; label is exposed.

### Task 2: Drill motion (implementer)

**Files:** Modify `src/features/drill/useDrill.ts`, `useDrill.test.ts`, `DrillSession.tsx`,
`DrillSession.test.tsx`, `MCAnswer.tsx`, `src/styles/global.css` (drill section only) or
`motion.css`.

**Produces:** `useDrill(...)` additionally returns `run: number`, the count of consecutive correct
answers ending at the latest answer (0 after a miss or before any answer).

- [ ] Tests first (`useDrill.test.ts`): `run` is 0, 1, 2 after two right answers, 0 after a wrong
  one. Calling `answer` twice for one question records one result; calling `next` twice advances once
  (Review Focus 5 — these guards exist; pin them).
- [ ] Tests (`DrillSession.test.tsx`): after answering question 1 of 4 the fill's inline width is
  `25%` before Continue is pressed; after three right answers an element with text `3 in a row` is in
  the document and it is gone after a wrong answer; pressing Enter twice quickly after an answer lands
  on question 2, not 3.
- [ ] Progress fill width becomes `(results.length / total) * 100%` (endless stays `100%`).
- [ ] Add `<span className="drill-run" aria-hidden="true">{run} in a row</span>` in the top bar when
  `run >= 3`, keyed on `run` so it re-pops on each increment.
- [ ] `MCAnswer`: set `style={{ '--i': index }}` on each button; wrap the grid in `.m-stagger`. The
  correct choice shows a check drawn with `draw` (inline SVG, `aria-hidden`).
- [ ] CSS: `.drill-body` gets `fade-up` over `--dur-2`; `.mc-btn.correct-choice` → `pop` `--dur-3`
  `--ease-pop`; `.mc-btn.wrong-choice` → `shake` `--dur-3`; `.answer-input.wrong` → `shake`;
  `.feedback-card` → `slide-up` `--dur-2`; `.drill-progress-fill` transition uses `--dur-3`
  `--ease-out`; buttons `:active:not(:disabled) { transform: scale(0.98) }`.
  `selected-choice` (test mode) gets no animation.

### Task 3: Summary motion and the laurel burst (implementer)

**Files:** Create `src/components/LaurelBurst.tsx`. Modify `src/features/drill/SessionSummary.tsx`,
add `src/features/drill/SessionSummary.test.tsx`, CSS.

**Produces:**
- `<LaurelBurst />` — 12 absolutely positioned `<span>`s inside an `aria-hidden` wrapper with
  `pointer-events: none`; each flies outward on its own angle (`--a: index * 30deg`) and fades over
  900 ms, once. Colours alternate `var(--primary)` and `var(--success)`. Renders `null` when
  `prefersReducedMotion()`.
- `SessionSummary` gains optional props `celebrate?: boolean` and `extras?: ReactNode`. The three stat
  tiles become: a `ProgressRing` (size 96) showing accuracy with the percentage counted up inside,
  and Correct / Wrong counted up beside it. `extras` renders between the stats and the buttons, after
  `children`. The card's direct children get `.m-stagger` with `--i` 0..n. `celebrate` renders
  `<LaurelBurst />` behind the card.

**Tests:** 7 of 10 correct shows `7`, `3`, `70%` and a ring labelled `70% accuracy`; `celebrate` in
jsdom renders no burst (reduced) and with `matchMedia` stubbed renders 12 particles; `extras` content
appears; existing callers (no new props) render as before. Run the whole `src/features` suite: other
tests assert on summary text.

### Task 4: Path, home, global and flashcard motion (implementer)

**Files:** Modify `src/features/practice/GrammarPath.tsx`, `src/features/practice/ModuleRoute.tsx`,
`src/features/vocab/Flashcard.tsx`, CSS; tests beside each.

- [ ] `.shell-main > *` gets `fade-up` over 160 ms. `a.subject`, `.path-link` get a 2 px hover lift
  (`transform`, `--dur-1`), only under `@media (hover: hover)`.
- [ ] Path: `<ol className="path m-stagger">` with `--i` on each step (cap 12).
  `.path-step.next .node` gets `halo` with `animation-iteration-count: 2`.
- [ ] Just-completed node: when `ModuleRoute` records a session that newly completes a module (it was
  not complete before), it sets `sessionStorage['latiniq_just_completed'] = mod.id`. `GrammarPath`
  reads and removes it on mount and gives that step `data-just="true"`; CSS fills the node with `pop`
  and draws the check. Test: flag set → the step has `data-just`, and the flag is gone afterwards.
- [ ] Flashcard: keep the single-face DOM; put `key={flipped ? 'b' : 'f'}` on the face span and
  animate it with `flip-in` `--dur-3`. Existing flashcard tests must pass unchanged.

**Checkpoint (orchestrator):** verifier runs `npm test`, `tsc -b`, `npm run build`, and
`PW_CHANNEL=chrome npx playwright test`. Then do the visual pass described in Task 19 for the drill
and summary. Commit. Phase 1 is shippable alone.

---

## Phase 2 — Today's practice and the streak

### Task 5: Local days, rest-day streak, activity log (implementer)

**Files:** Create `src/features/engage/days.ts`, `days.test.ts`, `afterPractice.ts`. Modify
`src/features/solo/progressStore.ts`, `progressStore.test.ts`, and the callers of `updateStreak`:
`practice/ModuleRoute.tsx`, `practice/EndlessRoute.tsx`, `practice/forms/FormsRoute.tsx`,
`vocab/StudyRoute.tsx`, `practice/PracticeHome.tsx`.

**Produces:**
```ts
// progressStore.ts
export interface Streak { lastDate: string; count: number; rest?: number }
export function todayISO(d = new Date()): string            // now the LOCAL day (delegates to localDay)
export function addDays(day: string, n: number): string     // component arithmetic
export function updateStreak(today: string): Streak
export function streakFrom(dates: string[], today?: string): Streak
export function liveStreak(s?: Streak, today?: string): number   // moved from PracticeHome

// days.ts
export interface DayStat { answered: number; correct: number; sessions: number }
export function loadDays(): Record<string, DayStat>
export function recordActivity(answered: number, correct: number, day?: string): DayStat
export function backfillDays(sessions: PracticeSession[]): void   // per day, keep the larger of stored and derived
export function answeredOn(day?: string): number
export function totalAnswered(): number
export type DotState = 'done' | 'rest' | 'missed' | 'today' | 'before';
export function weekStrip(days: Record<string, DayStat>, today?: string): { day: string; state: DotState }[]

// afterPractice.ts
/** Every finished or exited session with at least one answer calls this once. */
export function afterPractice(answered: number, correct: number): { streak: Streak; newMilestones: string[] }
```

Rules:
- `updateStreak`: same day → unchanged. Last day was yesterday → `count + 1`. Last day was two days
  ago → `count + 1` and `rest + 1`. Otherwise `count = 1`, `rest = 0`.
- `streakFrom`: start at the latest practised day if it is today, yesterday or two days ago, else
  count 0. Walk back; a single missing day between two practised days is skipped and adds to `rest`;
  two missing days end the walk.
- `liveStreak`: `count` if `lastDate` is today, yesterday or two days ago, else 0.
- `weekStrip`: seven entries ending today. `done` = activity. Today without activity = `today`. A day
  without activity whose previous day is `done` and whose next day is `done` or is today = `rest`.
  Days before the earliest logged day = `before`. Otherwise `missed`.
- `loadDays` drops entries older than 400 days when it writes.
- `backfillDays` is called from `rebuildFromSessions` and once from `afterPractice`/home when
  `latiniq_days` does not exist yet (Review Focus 3).
- `afterPractice` calls `recordActivity`, `updateStreak(todayISO())`, and (from Task 12 on)
  `evaluateMilestones()`; until Task 12 it returns `newMilestones: []`.
- `resetAll` also removes `latiniq_days`, `latiniq_review`, `latiniq_mastery`, `latiniq_xp_bonus`,
  `latiniq_milestones`, `latiniq_prefs`.

**Tests (exact cases):**
```ts
// streak
store({ lastDate: '2026-03-07', count: 4 }); expect(updateStreak('2026-03-08')).toMatchObject({ count: 5 });
store({ lastDate: '2026-03-06', count: 4 }); expect(updateStreak('2026-03-08')).toMatchObject({ count: 5, rest: 1 });
store({ lastDate: '2026-03-05', count: 4 }); expect(updateStreak('2026-03-08')).toMatchObject({ count: 1 });
expect(streakFrom(['2026-03-08','2026-03-06','2026-03-05'], '2026-03-08')).toMatchObject({ count: 3, rest: 1 });
expect(streakFrom(['2026-03-08','2026-03-05'], '2026-03-08').count).toBe(1);
expect(streakFrom(['2026-03-06'], '2026-03-08').count).toBe(1);   // rest day still open
expect(streakFrom(['2026-03-05'], '2026-03-08').count).toBe(0);
expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
expect(addDays('2026-03-08', 1)).toBe('2026-03-09');              // US DST starts 2026-03-08
expect(addDays('2026-11-01', 1)).toBe('2026-11-02');              // US DST ends 2026-11-01
expect(todayISO(new Date(2026, 2, 8, 23, 30))).toBe('2026-03-08');
expect(todayISO(new Date(2026, 2, 9, 0, 30))).toBe('2026-03-09');
```
Plus: `weekStrip` for `done, (gap), done, today-empty` gives `done, rest, done, today`; corrupt
`latiniq_days` → `{}`; `backfillDays` on three sessions across two days yields two entries and never
lowers an existing count; `rebuildFromSessions` keeps a stored streak consistent with `streakFrom`.
Update existing `progressStore.test.ts` cases that assumed UTC days; do not weaken them.

Run the DST and midnight tests with `TZ=America/Chicago npx vitest run src/features/solo` as well.

### Task 6: Grammar review queue (implementer)

**Files:** Create `src/features/engage/review.ts`, `review.test.ts`. Modify
`src/features/practice/ModuleRoute.tsx` (pass `onAnswer` to `DrillSession`).

**Produces:**
```ts
export const INTERVALS = [1, 3, 7, 16, 35] as const;       // days
export interface ReviewItem { box: number; due: string }
export function loadReview(): Record<string, ReviewItem>
export function recordReviewAnswer(id: string, correct: boolean, today?: string): void
export function dueReviewIds(today?: string): string[]     // due <= today, oldest due first
export function dueCount(day: string): number              // items with due <= day
export function pruneReview(valid: (id: string) => boolean): void
```
Rules: wrong → `{ box: 0, due: today + 1 }` (also when already queued). Correct and queued and due →
`box + 1`; if that reaches `INTERVALS.length` the item is deleted, else `due = today +
INTERVALS[box + 1]`. Correct and queued but not yet due → unchanged. Correct and not queued →
nothing. More than 300 items → drop the highest box, latest due first.

**Tests:** wrong on `2026-03-08` → due `2026-03-09`, box 0; then correct on the 9th → box 1, due the
12th; correct on the 10th (not due) → unchanged; five due-correct answers in a row remove the item;
wrong at box 3 resets to box 0; 301 inserts leave 300; corrupt storage → `{}`. `ModuleRoute`: a wrong
answer in a module drill puts that question id in the queue.

### Task 7: Building Today's practice, bonus XP, the `daily` kind (implementer)

**Files:** Create `src/features/engage/daily.ts`, `daily.test.ts`. Modify
`src/features/practice/sessionLog.ts` (add `'daily'` to the `kind` union; it is not in
`SERVER_KINDS`), `src/features/solo/progressStore.ts`, `src/features/practice/PracticeHome.tsx`
(`RECENT.daily = { title: () => "Today's practice", path: () => '/practice/today' }`).

**Produces:**
```ts
// daily.ts
export const DAILY_SIZE = 10, MIN_DAILY = 5, MAX_REVIEW = 5, MAX_VOCAB = 5;
export interface DailyPlan {
  questions: DrillQuestion[];
  vocabIds: Set<string>;                 // question ids that are vocab SRS item keys
  counts: { review: number; vocab: number; refresh: number };
}
export function questionById(id: string): DrillQuestion | undefined   // across MODULES, memoised map
export function buildDaily(now?: Date, rng?: () => number): DailyPlan | null
// progressStore.ts
export function addBonusXP(n: number): void     // adds to latiniq_xp_bonus and latiniq_xp
```
Rules: (1) up to 5 `dueReviewIds()` resolved by `questionById`; unresolved ids are passed to
`pruneReview` and skipped. (2) up to 5 vocab items: for each set, `reviewQueue(set, srs, now)`
filtered to items that already have an SRS record (Today never introduces new words), turned into
questions with `reviewQuestion(item, set)`. (3) fill to 10 with random questions from completed
modules, no duplicates. Shuffle the result with `rng`. Fewer than 5 in total → `null`.
`rebuildFromSessions` writes `latiniq_xp = sum of session xp + bonus`.

**Tests:** nothing completed, nothing due → `null`; one completed module → 10 refresh questions, no
duplicates; 7 due reviews → exactly 5 used; a due id not in `MODULES` is skipped and pruned (Review
Focus 4); vocab items with no SRS record are excluded; `addBonusXP(7)` then `rebuildFromSessions`
with sessions worth 40 XP → total 47; a `daily` session is never sent by sync
(`syncsToServer({ kind: 'daily' })` is false).

### Task 8: `/practice/today` (implementer)

**Files:** Create `src/features/engage/TodayRoute.tsx`, `TodayRoute.test.tsx`. Modify `src/App.tsx`
(route `/practice/today`, no shell, like `ModuleRoute`).

- Build the plan once in a `useState` initialiser. `null` → `<Navigate to="/practice" replace />`.
- `DrillSession` with `exitWarning="Stop now? What you've answered so far is saved."` and `onAnswer`:
  a vocab id → `saveSrsRecord(q.id, rate(loadSrs()[q.id], correct ? 'good' : 'again', new Date()))`
  (mirror `vocab/StudyRoute.tsx` around line 127); any other id → `recordReviewAnswer(q.id, correct)`.
- On finish, and on exit with at least one answer: `appendSession({ kind: 'daily', module_id: null,
  correct, total, xp: 0, completed: false })`, `addBonusXP(correct)`, `afterPractice(total, correct)`.
- Finish shows `SessionSummary` with `backLabel="Back to practice"`, review-mistakes retry (the retry
  run records nothing further), and the note `You earned {correct} XP.`

**Tests:** seeded with one completed module, the route renders question `1 / 10`; answering all ten
shows the summary, logs one `daily` session, adds XP equal to the number correct, and records ten
answers for today in `loadDays()`; a wrong grammar answer lands in the review queue; a vocab answer
whose set was deleted mid-session does not throw (Review Focus 4); with nothing available it
redirects to `/practice`.

### Task 9: Home — Today card, goal ring, week strip, prefs (implementer)

**Files:** Create `src/features/engage/prefs.ts`, `prefs.test.ts`, `TodayCard.tsx`, `WeekStrip.tsx`,
`TodayCard.test.tsx`, `src/styles/engage.css`. Modify `src/features/practice/PracticeHome.tsx`,
`practice.test.tsx`, `src/main.tsx` (import `engage.css`).

**Produces:**
```ts
export interface Prefs { goal: 5 | 10 | 20; examDate?: string }
export function loadPrefs(): Prefs            // default { goal: 10 }; an invalid goal falls back to 10
export function savePrefs(patch: Partial<Prefs>): Prefs
```
`<TodayCard />` sits above the stats on Practice home and has exactly these states:

| State | Heading | Body | Action |
|---|---|---|---|
| plan available, goal not met | `Today's practice` | `{n} questions · about {ceil(n/2)} minutes` and, when non-zero, `{review} to review · {vocab} vocab due` | button `Start` → `/practice/today` |
| no plan (new student) | `Start here` | next module's title and tagline | link `Open {badge}` → that module |
| goal met | `Done for today` | `{k} reviews come back tomorrow.` when `dueCount(tomorrow) > 0`, else `Nothing is due tomorrow. Carry on whenever you like.` | text link `Keep going` → next module (omitted when every module is complete) |

On the right of the card: `ProgressRing` with `answeredOn()` / `goal`, label
`{answered} of {goal} questions today`, the number counted up inside. Below the ring a `<select>`
labelled `Daily goal` with 5, 10, 20. Under the card: `<WeekStrip />`, seven dots with weekday
initials; each dot has an accessible name such as `Tue: practised`, `Wed: rest day`, `Thu: missed`,
`Fri: today`. `before` dots are plain and unnamed beyond the weekday.

The three home stats stay, fed by `liveStreak()`; streak and XP use `useCountUp` from the value last
shown (`sessionStorage['latiniq_seen'] = { streak, xp }`, written after render).

**Tests:** each of the three states renders its heading, body and action from seeded storage;
changing the select to 20 persists and updates the ring label; home renders with every new key set to
`"{"` (Review Focus 1); the streak stat shows the stored count when the last day was two days ago.

**Checkpoint (orchestrator):** full verifier run including Playwright; visual pass on home at 390 px
and 1280 px. Commit. Phases 1–2 are shippable alone.

---

## Phase 3 — Mastery, rank, milestones

### Task 10: Mastery tiers (implementer)

**Files:** Create `src/features/engage/mastery.ts`, `mastery.test.ts`. Modify `ModuleRoute.tsx`,
`GrammarPath.tsx`, `src/features/solo/ModuleIntro.tsx`, CSS.

**Produces:**
```ts
export type Tier = 0 | 1 | 2 | 3;
export const TIER_LABEL = ['', 'Complete', 'Strong', 'Mastered'] as const;
export function tierFor(pct: number, total: number, moduleSize: number): Tier
export function loadMastery(): Record<string, Tier>
export function raiseMastery(moduleId: string, tier: Tier): boolean        // true only if it went up
export function masteryOf(moduleId: string, progress: Progress): Tier      // max(stored, completed ? 1 : 0)
export function nextTierHint(tier: Tier): string | null
```
`tierFor`: 0 when `total < Math.min(10, moduleSize)` or `pct < 70`; 1 from 70; 2 from 85; 3 from 95.
`nextTierHint`: `Score 70% on 10 or more questions to complete this module.` /
`Score 85% on 10 or more questions for Strong.` / `Score 95% on 10 or more questions for Mastered.` /
`null`.

- `ModuleRoute` on finish: `raised = raiseMastery(mod.id, tierFor(out.pct, results.length,
  mod.questions.length))`. `SessionSummary` gets `celebrate={out.completed && wasNotComplete ||
  (raised && tier > 1)}`; the note gains `Now {TIER_LABEL[tier]}.` when raised above 1.
- Path node: an SVG ring of three arc segments around `.node`; `tier` of them are `var(--primary)`,
  the rest `var(--line)`. Status text becomes `{TIER_LABEL[tier]} · best {n}%` for tier ≥ 1.
- `ModuleIntro` shows `nextTierHint(masteryOf(...))` under the stats when not null.

**Tests:** `tierFor(69,10,40)=0`, `(70,10,40)=1`, `(84,10,40)=1`, `(85,10,40)=2`, `(95,10,40)=3`,
`(100,9,40)=0`, `(100,6,6)=3`; `raiseMastery` never lowers; corrupt storage → `{}`; a completed
legacy module with no stored tier reads as 1; path renders the tier label.

### Task 11: Rank (implementer)

**Files:** Create `src/features/engage/rank.ts`, `rank.test.ts`, `RankBar.tsx`. Modify
`PracticeHome.tsx`.

**Produces:** `RANKS: { title: string; xp: number }[]` and
`rankFor(xp: number): { index: number; title: string; next?: { title: string; xp: number }; progress: number }`.
Titles in order: `Tīrō`, `Discipulus`, `Quaestor`, `Aedīlis`, `Praetor`, `Cōnsul`. Thresholds are
computed once from `S = sum of xp_reward over MODULES`: 0, 10% of S, 30%, 60%, 100%, 160%. The Praetor
threshold is exactly S; the others are rounded to the nearest 10; all strictly increasing. `progress` is 0..1 toward `next` (1 at the top
rank). `<RankBar />` renders under the stats: the title with `lang="la"`, a thin bar, and
`{xp to go} XP to {next.title}` (or `Highest rank reached` at the top).

**Tests:** `rankFor(0).title === 'Tīrō'`; `rankFor(S).title === 'Praetor'`; `rankFor(S - 1).title ===
'Aedīlis'`; thresholds strictly increase; negative or `NaN` XP is treated as 0; progress is 0.5 midway.

### Task 12: Milestone rules and store (implementer)

**Files:** Create `src/features/engage/milestones.ts`, `milestones.test.ts`. Modify
`afterPractice.ts`, `src/features/practice/lessonStore.ts` (export `readLessonCount(): number`).

**Produces:**
```ts
export interface Snapshot { sessions: number; questions: number; streak: number; modulesDone: number;
  modulesTotal: number; mastered: number; lessonsRead: number; lessonsTotal: number }
export const MILESTONE_IDS = ['first_session','first_module','five_modules','all_modules',
  'streak_3','streak_7','streak_30','questions_100','questions_500','questions_1000',
  'first_mastered','all_lessons'] as const;
export type MilestoneId = typeof MILESTONE_IDS[number];
export function snapshot(): Snapshot
export function earned(s: Snapshot): MilestoneId[]            // pure
export function loadMilestones(): Partial<Record<MilestoneId, string>>   // id → day earned
export function evaluateMilestones(today?: string): MilestoneId[]        // newly earned; persists
```
`sessions` and `questions` come from `loadDays()`; the rest from the existing stores. The first time
`latiniq_milestones` does not exist and the student already has history (`questions > 0` before this
session), everything currently earned is stored silently and `[]` is returned (Review Focus 3).

**Tests:** each id against a snapshot just below and at its threshold; `evaluateMilestones` returns an
id once and never again; the silent first run; corrupt storage → `{}`.

### Task 13: Milestone copy, panel, and summary extras (latin-content-writer, then implementer)

**Files:** Create `src/content/milestoneCopy.ts`, `src/features/engage/MilestonesPanel.tsx`,
`SessionExtras.tsx`, tests. Modify `PracticeHome.tsx`, `ModuleRoute.tsx`, `TodayRoute.tsx`,
`vocab/StudyRoute.tsx`.

- [ ] **Content writer:** `MILESTONE_COPY: Record<MilestoneId, { title: string; detail: string }>`.
  Titles are two to four plain English words (a Latin word only where it is the obvious name, with
  macrons); details are one sentence saying what was done, in the past tense, no exclamation marks.
  A test asserts every `MILESTONE_IDS` entry has copy and no title exceeds 28 characters.
- [ ] **Implementer:** `<MilestonesPanel />` is a `<details>` on home, summary
  `Milestones · {earned} of 12`, closed by default; earned ones list title, detail and relative day;
  unearned ones list the title only, muted. `<SessionExtras xp? tierLabel? newMilestones streak />`
  renders, in this order and only when present: `+{xp} XP` (counted up), the streak line
  (`{n}-day streak` or, when a rest day was just used, `{n}-day streak · rest day used`), and
  `New milestone: {title}` for up to two, then `and {k} more`. Wire it into the `extras` prop of the
  summary in `ModuleRoute`, `TodayRoute` and vocab `StudyRoute`.

**Tests:** panel counts; extras with three new milestones shows two titles and `and 1 more`; extras
with nothing renders nothing.

**Checkpoint (orchestrator):** review the copy yourself; full verifier run; commit.

---

## Phase 4 — Interactive lessons and extras

### Task 14: Lesson quick check (implementer)

**Files:** Create `src/features/practice/lesson/LessonCheck.tsx`, `LessonCheck.test.tsx`. Modify
`LessonRoute.tsx`, `LessonRoute.test.tsx`, CSS.

`<LessonCheck questions={DrillQuestion[]} />` renders under a heading `Quick check`, before the
"Practise this module" button, when the lesson's `check` ids resolve to at least one question (use
`questionById`). One question at a time, inline in the page: prompt, then `MCAnswer` or
`TypeInAnswer`; after answering, an inline panel (not the fixed overlay) shows `Correct` / `Not
quite`, the answer and the explanation, with a `Next` button; after the last, `{n} of {m} right.`
and `Try again`. Answers here are not logged, earn nothing and do not touch the review queue.
Unresolvable ids are skipped.

**Tests:** renders the first check question of a real lesson; a right answer shows `Correct` and the
explanation; finishing shows the tally; nothing is written to `latiniq_sessions` or `latiniq_review`.

### Task 15: Cover-and-recall tables and hidden translations (implementer)

**Files:** Create `src/features/practice/lesson/RecallTable.tsx`, `ExampleList.tsx`, tests. Modify
`LessonRoute.tsx` (the `table` and `examples` cases delegate to these).

- `RecallTable`: a `Cover and recall` toggle button above the table (`aria-pressed`). When on, every
  body cell except the first column becomes a button named `Reveal` that shows its content on press
  (fade, `--dur-1`); a `Reveal all` button appears. Toggling off restores the plain table. Tables
  with a single column get no toggle.
- `ExampleList`: a `Hide translations` toggle. When on, each English line is a button named
  `Show translation`; notes stay hidden with it. Default is off for both, so a lesson reads exactly
  as it does today until the student opts in.

**Tests:** off by default with identical text content to today; covering hides cell text from the
accessible tree; revealing one cell shows only that cell; `Reveal all` shows everything; the existing
`LessonRoute.test.tsx` passes unchanged.

### Task 16: Sententia of the day (latin-content-writer, then implementer)

**Files:** Create `src/content/sententiae.ts`, `sententiae.test.ts`,
`src/features/engage/SententiaCard.tsx`. Modify `PracticeHome.tsx`.

- [ ] **Content writer:** `SENTENTIAE: { la: string; en: string; author: string; work?: string }[]`,
  at least 31 entries. Each is a genuine, attested quotation of at most 12 Latin words from a
  classical or widely anthologised author, with macrons, quoted exactly, with the author and, where
  known, the work and reference. Prefer lines a JCL student may meet (mottoes and quotations lists).
  No invented, paraphrased or misattributed lines; when unsure of wording or source, leave it out.
  The English is a plain, close translation.
- [ ] **Orchestrator review:** check every entry's wording, macrons, attribution and translation
  yourself. Remove any you cannot stand behind; 31 verified is the floor, so ask for replacements if
  the count drops below it.
- [ ] **Implementer:** `sententiaFor(day: string)` picks by days since 2026-01-01 modulo the length
  (same for everyone on a given day). `<SententiaCard />` is the last section on home: the Latin
  (`lang="la"`), the author, and a `Show translation` button that reveals the English in place.

**Tests:** at least 31 entries, each `la` at most 12 words, no duplicates, every field non-empty;
`sententiaFor` is stable for a day and differs for the next; the translation is hidden until pressed.

### Task 17: Exam countdown (implementer)

**Files:** Create `src/features/engage/ExamCountdown.tsx`, test. Modify `PracticeHome.tsx`.

In the page head, right side. No date set: a ghost button `Set exam date` that reveals an
`<input type="date">` labelled `Exam date`. Date set and in the future: `Exam in {n} days` (`Exam
tomorrow`, `Exam today`) with an `Edit` button; clearing the input removes the date. A past date
shows nothing but the `Set exam date` button. `daysUntil(date: string, today?: string): number` lives
in `prefs.ts` and counts calendar days.

**Tests:** `daysUntil('2026-03-10','2026-03-08') === 2`; across a DST change; the four display states;
an invalid stored date behaves as none.

---

## Phase 5 — Proof

### Task 18: End-to-end (implementer)

**Files:** Create `tests/e2e/engagement.spec.ts`. Read `tests/e2e/solo.spec.ts` first for the
storage-seeding and selector conventions.

1. Fresh browser: home shows `Start here`; the week strip has seven dots.
2. Seeded with one completed module and three due review items: `Today's practice` → `Start`, answer
   ten questions, the summary appears, back on home the card reads `Done for today` and the ring's
   label is `10 of 10 questions today`.
3. Complete a module drill at 100% → summary mentions the tier; the path shows the tier label.
4. A lesson: quick check answers inline; cover-and-recall hides and reveals a cell.
5. `page.emulateMedia({ reducedMotion: 'reduce' })`: during a drill answer,
   `document.getAnimations().filter(a => a.playState === 'running').length` is 0.
6. With motion on: press Enter twice within 50 ms after an answer; the label reads `2 / N`.

Run with `PW_CHANNEL=chrome npx playwright test`. The existing three spec files must still pass.

### Task 19: Visual pass (orchestrator, not delegated)

Write a throwaway Playwright script in the scratch directory (not in the repo) that seeds storage,
then saves screenshots at 390×844 and 1280×800 of: home in each Today-card state, the path with mixed
tiers, a drill mid-question, feedback for a right and a wrong answer, the summary with a celebration
(capture at ~300 ms), a lesson with a covered table, the milestones panel open. Look at every image.
Fix what a careful designer would not ship: overflow at 390 px, cramped rings, a card that is taller
than the content it replaced, anything that reads as loud. The home page should still look calm: one
Today card, the stats, the strip; everything else is below the fold or collapsed.

### Task 20: Finish (orchestrator)

- [ ] `README.md`: under solo practice, describe Today's practice, daily goal and rest-day streak,
  review of missed questions, mastery tiers, rank, milestones, interactive lessons, and that all of it
  is stored in this browser only. Remove nothing.
- [ ] Final verifier run: `npm test`, `npx tsc -b`, `npm run build`,
  `PW_CHANNEL=chrome npx playwright test`. Record counts.
- [ ] Whole-branch review of `git diff 4b478fd...HEAD` against the charter in the spec: any modal,
  timer gate, guilt copy or un-gated animation is a defect, not a nit.
- [ ] Write `/Users/aarav/dev/Latin-Trainer/.claude/worktrees/engagement/morning-engagement.md`
  (untracked): what shipped, in plain words for a non-coder; what was cut or left; every decision the
  owner may want to overrule; how to try it (`npm run dev` in the worktree); test counts.
- [ ] Push the branch and open a **draft** pull request against `claude/forms-vocab-modules` using
  `GITHUB_TOKEN` from `/Users/aarav/dev/Latin-Trainer/.env` (there is no `gh`; use the REST API with
  `curl`, and never print the token or put it in a remote URL that gets saved). Do not merge. Do not
  push to `main`. `main` deploys the live site.
