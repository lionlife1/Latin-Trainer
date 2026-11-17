# Motion and reasons to come back — design

Date: 2026-11-14. Status: approved for overnight build by the owner ("make a plan … hand it off"); the
owner has not read this text. Every decision below marked **Decision** was made without them and is
theirs to overrule.

## What the owner asked for

> add animations and other features to be interactive and have a reason to come back like
> brilliant/duolingo (non intrusive is key, so more like brilliant)

Three things, in their words: **animations**, **interactive**, **a reason to come back**. One hard
constraint: **non-intrusive**.

## Who it is for and what success looks like

A high-school student preparing for TSJCL who opens LatinIQ on their own. Success: the app feels alive
while they work, and when they open it there is always one obvious, short thing worth doing today.
Nothing ever interrupts them or makes them feel bad for being away.

## The non-intrusive charter

These hold for every feature. A feature that needs to break one is cut.

1. Nothing interrupts. No modal, toast or popup announces a reward, streak, milestone or rank. Rewards
   appear only where the student is already looking: the session summary and the Practice home page.
2. Nothing nags or guilts. No notifications, emails, badges on the tab, "you'll lose your streak" copy,
   countdown to a streak ending, or sad mascots. No sounds.
3. Nothing is taken away or locked. No hearts or lives, no leaderboards, no decaying or "cracked"
   modules, no paywalled retries.
4. Motion never costs time. No animation delays input: Enter still advances immediately, buttons are
   usable from their first frame. Feedback motion is 320 ms or shorter; the one celebration is 900 ms
   and purely decorative.
5. `prefers-reduced-motion: reduce` removes all movement (opacity fades of 120 ms or less may stay).
6. Tests (`/s` test mode, `TestRunner`) get no correctness animation and no celebration: tests give no
   feedback before submit. Teacher screens are untouched.

## Scope

In: solo practice (Practice home, grammar path, module intro, drill, session summary, lessons, vocab
flashcards and the shared drill used by class practice assignments).

Out: accounts, backend, notifications, social features, sound, a mascot, new grammar questions.

**Decision — everything is stored in this browser.** No migration, no edge function, no change to the
live Supabase project. This matches what the README already says about XP and streaks, and it means
the overnight build cannot break a class that is using the site. The cost: the new data (review queue,
daily goal, milestones) does not follow a signed-in student to another device. Completion, XP from
modules and streak still do, as today.

## Part A — Motion

One small CSS motion system, no animation library (**Decision**: the app has four runtime
dependencies and needs nothing a keyframe cannot do).

| Where | What moves |
|---|---|
| Everywhere | Buttons press in slightly. Page content fades up on arrival (160 ms). Cards lift 2 px on hover. |
| Drill | Each question fades up. Choices arrive 30 ms apart. The right choice pops and draws a check; a wrong pick shakes once (4 px). The progress bar fills when you answer, not when you press Continue. The feedback card slides up from the bottom. After three right in a row a small "3 in a row" chip appears in the top bar and counts up; it disappears quietly on a miss. |
| Session summary | An accuracy ring draws, the numbers count up, rows arrive in sequence. If the session completed a module or raised its mastery tier, a single laurel burst (12 CSS particles, 900 ms) plays once behind the card. |
| Grammar path | Steps arrive in sequence on first view. The "Up next" node has a soft halo that pulses twice and stops. A module you just completed fills and draws its check when you return to the path. |
| Practice home | Streak, XP and the daily ring count up from their last-seen values when they changed. |
| Flashcards | The card flips (rotateX) when turned. |
| Lessons | Revealed cells and translations fade in. |

## Part B — Reasons to come back

### B1. Today's practice (the main one)

A card at the top of Practice home with one button. It starts a mixed session of up to 10 questions,
built in this order:

1. grammar questions the student got wrong before and that are due for review (B3), up to 5;
2. vocab cards due today across all their sets (existing FSRS schedule), up to 5; answering rates the
   card (right = good, wrong = again), exactly as vocab Review does;
3. random questions from modules they have completed, to fill to 10.

If fewer than 5 questions are available (a new student), the card instead says "Start here" and links
to the next module on the path. Finishing today's practice shows the normal session summary.

### B2. Daily goal and a gentle streak

- **Daily goal**: questions answered today in any mode, against a goal of 10 (**Decision**; the student
  can choose 5, 10 or 20). Shown as a ring on the Today card. When met, the card becomes a quiet "Done
  for today" with a preview of tomorrow: "4 reviews come back tomorrow." That preview is the hook.
- **Week strip**: seven dots for the last seven days (practised, rest day, missed, today).
- **Rest days** (**Decision**): one missed day does not end a streak; two missed days in a row do. A
  rest day does not add to the count. The strip shows it as a rest day, not a failure.
- **Local days**: days are counted in the student's own time zone. Today they are counted in UTC, so a
  Texas student who practises at 7 pm gets credit for the wrong day and can lose a streak they kept.
  This is fixed as part of this work.

### B3. Review queue for missed grammar questions

A wrong answer on a built-in grammar question puts it in a review queue, due the next day. Each time
it is answered correctly when due, it moves out to 3, 7, 16 and 35 days, then leaves the queue. A wrong
answer sends it back to the next day. The queue feeds Today's practice; the student never manages it.

### B4. Mastery tiers

Each module has a tier from its best qualifying session (10+ questions, or the whole module):
Complete (70%), Strong (85%), Mastered (95%). The path node shows the tier as one, two or three ring
segments, and the module intro says what the next tier needs. A tier never goes down.

### B5. Rank

Total XP maps to a rank on the *cursus honorum*: Tīrō, Discipulus, Quaestor, Aedīlis, Praetor, Cōnsul.
Home shows the rank and a thin bar toward the next one. Thresholds are calibrated so that completing
every module once reaches Praetor. Today's practice earns 1 XP per correct answer so that returning
moves the bar.

### B6. Milestones

About twelve, earned silently: first session, first module, five modules, every module, 3-, 7- and
30-day streaks, 100/500/1,000 questions, first Mastered module, every lesson read. A new one is
mentioned in one line on the session summary and listed in a collapsed "Milestones" panel on home.

### B7. Sententia of the day

One short, genuinely attested Latin quotation per day on Practice home, with its author; the
translation is hidden until tapped. At least 31, chosen by the date, the same for everyone that day.

### B8. Exam countdown

The student can set an exam date. Home then shows "TSJCL in 42 days". No date is built in; nothing
shows until they set one.

## Part C — Interactive lessons

Uses content that already exists:

- **Quick check**: each lesson already lists `check` question ids that are never shown. Render them at
  the end of the lesson as inline questions with instant feedback.
- **Cover and recall**: a toggle on each paradigm table hides the body cells; tap a cell to reveal it,
  or "Reveal all".
- **Hide translations**: a toggle on example lists hides the English until each is tapped.

## Data (all `localStorage`, this browser)

| Key | Holds |
|---|---|
| `latiniq_days` | per local day: questions answered, correct, sessions. Kept 400 days. |
| `latiniq_review` | grammar review queue: question id → box and due day. Max 300. |
| `latiniq_mastery` | module id → tier. |
| `latiniq_xp_bonus` | XP earned by sessions that never sync (Today's practice). |
| `latiniq_milestones` | milestone id → day earned. |
| `latiniq_prefs` | daily goal, exam date. |
| `latiniq_streak` (existing) | gains `rest` (days forgiven). |

"Reset progress" clears all of them. A sync rebuild keeps them and adds the bonus XP to the total.

## Risks and how they are handled

- **Latin accuracy** of the sententiae: written by the content agent, each one checked against its
  source by the reviewer before commit; any that cannot be verified is dropped.
- **Streak change for existing students**: stored streaks were dated in UTC. The first local-day
  update can be off by one day once; with rest days this cannot end a live streak.
- **Another branch touches the drill prompt** (`claude/practice-ui-polish`, one commit). Expect a
  small merge conflict in the drill components and CSS; neither branch is merged by this work.
- **Size**: about twenty tasks. They are ordered so that each phase is shippable alone: motion, then
  daily practice and streak, then mastery/rank/milestones, then lessons and extras.
