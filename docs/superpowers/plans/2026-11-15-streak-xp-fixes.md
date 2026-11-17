# Streak, XP and progress fixes

Written 2026-11-15 after a review of the game-like parts of the student app: the day streak, XP, module
completion, the grammar path and the drill progress bar.

## What the review found

There is no separate animations or gamification feature on `main`, on any pushed branch or in any pull
request. What exists is the stat row from the student redesign (day streak, XP, modules done), module
completion on the grammar path, and three CSS transitions (buttons, multiple-choice buttons, the drill
progress bar). The redesign spec chose this on purpose: "calm, light", plain numbers, no emoji, no trophy.

Bugs, in order of how much they hurt a student:

1. **Streak days are UTC days.** `todayISO` uses `toISOString()`. In US Central time the UTC day rolls
   over at 6 pm (7 pm in summer). Practising Monday 5 pm and Tuesday 7 pm lands on UTC Monday and
   Wednesday, so the streak resets to 1. Practising Monday 7 pm and Tuesday 5 pm lands on one UTC day,
   so the streak does not grow. `relativeDay` on the same page already uses local days.
2. **Signed-in students lose completions and XP after about 200 sessions.** `rebuildFromSessions` runs on
   every sync and recomputes progress from the merged log only. The local log keeps 200 sessions and the
   pull fetches the newest 200 rows. Once a module's completing session is older than that, the next
   sync marks the module not complete and removes its XP.
3. **Mistakes from a first failed session are not kept.** `recordSession` stores `wrong_ids` only if the
   module already has a progress entry, so "To review" stays empty until the module has been completed.
4. **Wrong status line on a finished module.** After a short or failed session on a module that is
   already complete (including every "Review mistakes" run), the summary says "Score 70% or more on 10+
   questions to complete this module."
5. **The drill progress bar never fills.** Its width is `index / total`: 0% while question 1 is on screen
   and at most (n-1)/n, and it does not move when an answer is given.

## Tasks

### 1. Local calendar days for the streak (`src/features/solo/progressStore.ts`)

- `todayISO(d = new Date())` returns the local calendar day as `YYYY-MM-DD` (from `getFullYear`,
  `getMonth`, `getDate`).
- Add and export `prevDay(iso: string): string`, the calendar day before `iso`, built with
  `new Date(y, m - 1, d - 1)` so it is safe across DST.
- `updateStreak(today)`: return the stored streak unchanged when `lastDate >= today`. This covers the same
  day, and a `lastDate` written under the old UTC rule that is one day ahead of the local day. Otherwise
  `count + 1` when `lastDate === prevDay(today)`, else 1.
- `streakFrom` uses `prevDay`.
- Add and export `liveStreak(today = todayISO()): number`: the stored count when
  `lastDate >= prevDay(today)`, else 0. `PracticeHome` uses it in place of its own copy.
- Tests in `progressStore.test.ts`. Put the time-zone cases in their own file,
  `progressStore.tz.test.ts`, which sets `process.env.TZ = 'America/Chicago'` before building dates:
  7 pm Monday and 5 pm Tuesday local are different days; `rebuildFromSessions` with sessions finished at
  Monday 5 pm and Tuesday 7 pm Central gives a streak of 2; `updateStreak` does not reset a streak whose
  `lastDate` is tomorrow; `liveStreak` for today, yesterday, two days ago and a future date.

### 2. Keep progress when the log is long

- `saveSessions` in `src/features/practice/sessionLog.ts`: a session "carries progress" when
  `completed || xp > 0`. When over the cap, drop the oldest entry that is droppable today (synced or
  local-only) and carries no progress. If there is none, fall back to today's order (oldest droppable,
  then oldest).
- `syncSessions` in `src/features/practice/sync.ts`: after the existing pull of the newest 200 rows, pull
  the rows that carry progress as well:
  `.select(COLS).eq('user_id', userId).or('completed.eq.true,xp.gt.0').order('finished_at', { ascending: false }).limit(1000)`.
  Normalise `finished_at` the same way, merge both result sets with the local log, save, and rebuild from
  the full merged list (not the capped one).
- No migration: same table, same RLS, and the query is covered by `practice_sessions_user_finished`.
- Tests: `sessionLog.test.ts` (an old completed session survives 205 newer plain ones; existing cap tests
  still pass). `sync.test.ts`: make the fake client honour `order`, `limit` and the `or` filter, then a
  remote with one old completed module session and 200 newer endless sessions still gives
  `loadProgress().m0.completed === true` and the right XP on a fresh device.

### 3. `recordSession` details (`progressStore.ts`, `ModuleRoute.tsx`)

- Always store `wrong_ids` for the module, creating the entry if needed.
- Return `alreadyComplete: boolean` (the module was complete before this session) with the existing
  fields.
- `ModuleRoute` status line: unchanged when the session completes the module; when it does not and the
  module was already complete, "This module is already complete."; otherwise the existing 70% line.
- Tests in `progressStore.test.ts` and `practice.test.tsx` or the nearest existing ModuleRoute test.

### 4. Drill progress bar (`src/features/drill/DrillSession.tsx`)

- Width is `results.length / total` for a fixed-length session, so the bar moves when an answer is given
  and reaches 100% on the last one. Endless stays at 100%. The "3 / 10" label does not change.
- Test in `DrillSession.test.tsx`.

## Not done here: needs the owner's decision

These change the look or the rules, and the redesign spec settled both, so they are proposals only.

- **Motion.** The legacy app had a screen fade, an overlay fade and a feedback card slide-up; the redesign
  dropped all three. A quiet version (150 to 250 ms, off under `prefers-reduced-motion`) for the feedback
  card, the question change and the summary would make the drill feel less abrupt.
- **XP only comes from grammar modules.** Endless, Forms and Vocab sessions earn 0 XP, and a module pays
  its full XP every time it is repeated. Options: pay XP for all practice by questions answered right,
  and pay a module's completion XP once.
- **Best score counts any session.** A one-question "Review mistakes" run shows as "best 100%" on the
  path. Option: count only sessions of 10 or more questions (or the whole module).
- **Streaks differ between devices.** Forms and vocab sessions stay on the device, so a second device
  rebuilds a shorter streak. Fixing it means letting those kinds sync (a migration).
- **Nothing marks a milestone.** Completing a module or extending a streak shows one plain line. A short
  "day 5" note on the summary would fit the calm style without emoji.
