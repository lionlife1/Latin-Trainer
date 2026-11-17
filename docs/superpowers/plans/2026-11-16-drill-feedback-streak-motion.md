# Drill feedback, mistakes, streak safety and quiet motion

Written 2026-11-16 after a second review of the game-like parts of the student app. It builds on
`2026-11-15-streak-xp-fixes.md`, whose four tasks are implemented on this branch and were re-checked
(code read, tests run, drill exercised in a browser).

## What the review found

Bugs:

1. **Holding Enter skips the feedback.** After typing an answer, a held Enter auto-repeats. The repeated
   keydown reaches the feedback card's document listener and moves to the next question before the student
   can see whether the answer was right. Reproduced in Chromium: "1 / 41" to "2 / 41" with no card shown.
2. **Enter on a focused button does two things.** With the exit button or "That was easy" focused, Enter
   activates the button and also advances through the document listener.
3. **"To review" forgets mistakes.** Each session overwrites the module's `wrong_ids` with its own
   mistakes, so a clean five-question session clears mistakes from an earlier session on other questions.
   The intro shows the count but has no way to practise those questions.
4. **A sync can shorten or wipe a streak.** `rebuildFromSessions` derives the streak from the session log
   only. The log holds about 200 sessions, so a student with many sessions a day sees the streak cut to
   the days the log covers. A learner from the legacy app has a stored streak and no log, so the first
   sign-in sets the streak to 0.

Thin spots, not bugs:

5. **No motion at all** apart from three colour and width transitions, and nothing honours
   `prefers-reduced-motion`. The feedback card, each new question and the summary appear abruptly.
6. **Nothing marks a streak day.** The streak only shows as a number on the Practice page.

## Tasks

### 1. Feedback Enter shortcut (`src/features/drill/Feedback.tsx`)

The document listener ignores `e.repeat`, and ignores Enter when the target is inside a button, link or
form control, so a focused control does only its own action.

### 2. Mistakes accumulate and can be reviewed

- `recordSession`: new `wrong_ids` = previous ids, minus those answered right in this session and those
  no longer in the module, plus this session's mistakes. No duplicates.
- `ModuleIntro`: "Review N mistakes" button above "Start session" when there are any.
- `ModuleRoute`: the button starts a drill of exactly those questions.

### 3. A sync keeps a real streak (`rebuildFromSessions`)

When the stored streak is live (last day today or yesterday):

- empty log: keep the stored streak;
- the rebuilt run is cut off by the start of the log and the stored run reaches back past it: keep the
  stored start, so the count is the days from the stored start to the rebuilt last day.

A gap inside the range the log covers still resets the streak.

### 4. Streak line on the summary

`streakMilestone(log)` in `progressStore.ts` returns the streak count when the session just logged made
today a new streak day of two or more. Module, Forms and Vocab summaries show "Day N of your streak."
once, on the first session of the day.

### 5. Quiet motion (`src/styles/global.css`)

- Feedback card rises in (200 ms), each question fades in (180 ms), intro and summary cards rise in
  (250 ms). The progress bar eases out.
- A `prefers-reduced-motion: reduce` block switches every animation and transition off.

This keeps the redesign's "calm, light" rule: no emoji, no confetti, nothing longer than a quarter second.

## Not done here: needs the owner's decision

Carried over from the 2026-11-15 plan, still open:

- **XP only comes from grammar modules, and a module pays again every time it is repeated.**
- **Best score counts any session**, including a one-question review run.
- **Streaks differ between devices**, because Forms and Vocab sessions stay on the device.

New:

- **Signing out leaves the last student's progress on the device.** The session log, XP and streak stay in
  local storage. If another student signs in on the same browser, the first student's synced sessions are
  merged into what the second student sees, and any unsynced ones are pushed to the second student's
  account. Fine for a personal device; wrong for a shared classroom computer. Options: clear synced
  practice data on sign-out, or tag the local log with its account and discard it when a different
  account signs in.
