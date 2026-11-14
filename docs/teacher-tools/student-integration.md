# Teacher tools: what changes for students

Written 2026-11-05. A companion to [plan.md](plan.md): how each teacher-side feature shows up on the student
side (Class tab, assignment runner, results), and where it connects to independent Practice. It is based on
the current code (`src/features/student/*`, `src/features/drill/*`, `src/features/practice/*`) and the student
redesign spec (`docs/superpowers/archive/specs/2026-11-01-student-redesign-design.md`).

## Where the student side is today

- **Class** (`/s`, `MyAssignments.tsx`): assignments grouped Overdue / To do / Done, each with a
  Practice or Test tag, due date, best score `n/total`, and Start / Resume / Try again / Results.
- **Run** (`/s/a/:id`, `RunAssignment.tsx`): an intro card (question count, time limit, attempts), then
  - practice: `DrillSession`, one question at a time with instant feedback; answers are queued offline;
  - test: `TestRunner`, one question at a time, a question grid to jump around, autosave to
    `sessionStorage`, a server-derived timer, and a submit confirm.
- **Result** (`/s/attempt/:id`, `AttemptResult.tsx`): score and %, late or over-time pills, and a
  per-question Right/Wrong review with the correct answer when the teacher allows it.
- Everything assumes an item is `typein` or `mc`, the answer is one string, and credit is 1 or 0.
- **Practice** is separate and local-first. Its home page has a "Vocab: coming soon" card.

## Principles

1. **One renderer per item type, used everywhere.** The same component draws an item in practice, in a test,
   in the result review, in the teacher preview and on the printed page. Each item type exports
   `Render` (input), `Feedback` (practice), `Review` (results) and `Print`. Today `DrillSession` and
   `TestRunner` each branch on `q.type`. That has to become a registry before the new types arrive, or
   every new type gets written four times.
2. **Students see the teacher's structure.** Sections, instructions, points and passages show up as the
   teacher wrote them, so the screen matches the paper version the class may also get.
3. **Partial credit is visible.** "7/10 cells" beats a red "Wrong" on a synopsis.
4. **Waiting on the teacher is a state, not a mystery.** If a translation needs grading, the score says
   "so far" and the item says "Your teacher will grade this".
5. **Class feeds Practice.** Work assigned in class should become something students can study on their
   own: the vocab list before the quiz, their misses after it.
6. **Phones first** (the redesign spec's 375px rule). Grids and passages are the hard cases, and each
   one below has a narrow-screen layout.

## Class page (`/s`)

Per row, added to what exists:

- **Kind tag** from the assessment: Quiz, Test, Homework, Practice set (it falls back to today's
  Practice/Test tag). The mode still decides behaviour.
- **Score in points** with the % (e.g. "18.5/24 · 77%"), using `earned/possible` once the schema has them.
- **Status chips**: *Waiting for grading* (submitted, items still need the teacher), *Regraded* (the
  score changed after a key change, until the student opens the result), *On paper* (see below).
- **Study link** on upcoming quizzes and tests built from vocab lists or generated forms: "Study" opens a
  practice set for the same words (see "Practice tie-ins"). It is never the test itself.
- **Paper assignments**: once paper score entry exists (plan Phase 5), printed tests appear as rows with
  no Start button, just the entered score and per-section points. Students can see their grades in one
  place, and item analysis still works.

Accommodations are never shown as labels. A student with extra time just sees their own time limit.

## Before starting (intro card)

- The teacher's **instructions** (rich text, short).
- A **section outline**: "1. Vocabulary · 10 pts", "2. Synopsis of *moveō* · 12 pts",
  "3. Passage: Hercules · 15 pts". This replaces the single "Questions" stat for multi-section work.
- **Rules that change how to answer**: "Macrons optional" or "Macrons required"; "Answer 3 of 5" in
  section 4; "Meanings on the synopsis are graded by your teacher".
- Time limit (already accommodated), attempts left, due date, as today.

## The runner

### Navigation

The test runner moves from "one question per screen" to **one page per screen**. A page is a single item, or
a passage together with its questions. The question grid (`q-nav`) is grouped by section, with section
headings. Answered state per item becomes **partially answered** (some cells filled) vs answered.
Practice mode keeps the one-item-at-a-time flow with instant feedback.

### Item layouts

| Item | Wide screen | Phone (≤ 640px) | Input details |
|---|---|---|---|
| `mc`, `tf` | As today; T/F as two big buttons | Same | Keyboard 1–4 / T, F |
| `typein` | As today | Same | **Macron buttons** (ā ē ī ō ū ȳ) replace the "Macrons optional" hint text; the hint stays when macrons are optional |
| `grid` | A real table (rows × columns, given cells greyed); Tab/Enter moves cell to cell | **One row per card** ("Imperfect: active ___ passive ___"), so nothing scrolls sideways | Meaning rows are a smaller text field under each form |
| `parse` | Segmented button groups per field (Person 1 2 3 · Number sg pl · Tense … · Mood · Voice), plus optional lemma/meaning fields | Groups wrap to full width | Fields the teacher didn't ask for are hidden, not disabled |
| `match` | Two columns, **tap left then right** to pair (no drag, so it works on touch and keyboard) | Stacked: each left item gets a picker of right-column options | Extra distractors allowed |
| `cloze` | Text with inline blanks; a word bank as chips, **tap a chip then a blank** | Same, bank sticks to the bottom | Bank words grey out when used, unless reuse is allowed |
| `choice-inline` | The sentence with an inline two/three-way toggle at the blank | Same | |
| `short` | Text area | Same | Shows "Graded by your teacher" |
| `translate` | Latin above with line numbers and glosses; one text area below | Latin in a collapsible panel above the box | One box for the whole translation (as on the AP exam); the teacher grades it by segment |
| `passage` | **Split view**: passage left (sticky, line numbers, glosses on hover/tap, targets underlined), questions right | Passage on top, collapsible to a "Show passage" bar that stays visible while scrolling the questions | Tapping a question highlights its target words in the passage |

### Saving and integrity

- Answers become structured values (`given_json`: a string for typein/mc, cell maps for grids,
  field maps for parse, pairs for match). The `sessionStorage` autosave in `TestRunner` stores the same
  structure, and the offline queue for practice carries it too.
- Tests still receive only **public shapes** (no answers), now for every type: grid answer cells are
  removed while given cells stay, a passage keeps its glosses but loses the translation key, and so on.
- With per-student variants, each attempt gets its own generated words, so copying a neighbour's synopsis
  doesn't help.

## Feedback in practice mode

- **Grid and parse**: check the whole item at once; each cell or field turns right or wrong; wrong cells
  show the correct form on tap. "Try the wrong ones again" re-asks only those cells before moving on.
  This is where generated forms beat a static worksheet.
- **Match, cloze, choice-inline**: per pair or blank, like grids.
- **Teacher-graded items** (`short`, `translate`) in a practice assignment: the student submits, then sees
  the teacher's **model answer** to compare against ("Check yourself"), and the item goes to the To-grade
  queue only if the teacher set it to be graded.
- Explanations (exist today for module questions) show the same way for teacher-written items.

## Results page

- **Score in points**, plus a **per-section breakdown** ("Vocabulary 9/10 · Synopsis 10/12 ·
  Passage 11/15").
- **Pending**: "Score so far: 30/37. 1 item is waiting for your teacher." The final score fills in when
  grading is done, and the Class row's chip clears.
- **Review per item type** (when reveal is allowed, as today):
  - grid: the student's table with right/wrong cells and the correct forms in the wrong cells;
  - parse: each field marked, with the correct parse (all valid parses for ambiguous forms);
  - translate: the student's text with **segment results** and the teacher's reason codes, worded for
    students ("Segment 5: *Iovem* is accusative, the object of *ōrāsse*"), plus a teacher comment;
  - passage: the passage with the targets, then its child items.
- **Regrade notice**: "Your teacher accepted another answer for question 4. Your score went from 17
  to 18." Shown once.
- **Practice your misses** button (see below).

## Practice tie-ins (Class → Practice)

This is where the two halves of the student app connect.

1. **Study sets from assigned vocab.** Each vocab list used in a class assignment shows up under
   Practice → Vocab (today's "coming soon" card) as a study set: flashcards, L→E, E→L, matching. It is
   student-run and local-first like the rest of Practice, and synced through `practice_sessions` with a new
   `kind: 'vocab'`. The teacher sees nothing from it (the redesign spec says teachers don't see independent
   practice; keep that).
2. **Practice your misses.** After a result is revealed, the student can generate an ungraded practice set
   from what they missed: the same verbs in other persons and tenses, the same nouns in other cases, the
   missed words. The forms generators from plan Phase 2 make this nearly free. It runs as a normal Practice
   session.
3. **Forms in Practice.** The same generators power a new Practice subject, **Forms**: "Synopsis of
   any verb", "Decline any noun", "Parse random forms", with filters (conjugation, tense, voice). Today
   Endless Train covers the subjunctive only. This turns it into a general forms trainer and fixes the
   redesign's "coming soon" gap.
4. **Retakes as new versions.** When the teacher allows retakes on generated assessments, "Try again"
   draws new items (the standards-based "same reading, different questions" practice from the research).

## Server and API changes the student side needs

These come in on top of the data-model sketch in plan.md:

- `get_attempt_items` returns section metadata (heading, instructions, points, choose-N), passage
  containers, and per-student accommodations already applied (fewer MC choices are removed on the server,
  so the browser never sees the dropped choice).
- `start_attempt` applies the time-limit multiplier and, for per-student variants, picks or generates the
  attempt's items. Generation happens in the teacher's browser at publish time, so the server only *picks*
  among pre-generated variants. The pool stores N variants per generated section.
- `submit_test` and `record_practice_response` accept `given` as jsonb and return per-item
  `{earned, possible, parts}` (practice needs parts for cell-level feedback).
- `getResponses` returns `earned`, `possible`, `parts`, `needs_review`, `reason_codes`, `comment`.
- Attempt status gains *pending review* (submitted, some items ungraded), derived from responses.
- A small `attempt_notices` read (or a column) for "regraded" chips.

## Order of work, matched to plan phases

| Plan phase | Student-side work |
|---|---|
| 1. Print and import | Nothing required. (Optional: the macron buttons in `TypeInAnswer` and `TestRunner`, which reuse the teacher helper.) |
| 2. Morphology and grids | **Item renderer registry** (refactor `DrillSession`, `TestRunner`, `AttemptReview` onto it first, no behaviour change); `grid` and `parse` renderers and practice feedback; structured `given`; points on Class and Results; **Practice → Forms** subject. |
| 3. Builder and library | Section-aware intro card and question grid; `tf`, `match`, `cloze`, `choice-inline`, `short` renderers; kind tags on Class; Practice → Vocab study sets from assigned lists. |
| 4. Passages and grading | Passage split view; `translate` input; pending-review states; segment review with reason codes; regrade notices. |
| 5. Accommodations and analysis | Accommodations applied in `start_attempt`/`get_attempt_items`; Practice your misses; paper rows on Class; retakes as new versions. |

The registry refactor at the start of Phase 2 is the one piece of student work that blocks everything
else. It should be its own small change with the existing tests unchanged.

## Open questions

1. Should students see per-section points before they start (helps them plan time), or only after?
   Recommendation: before, as on printed tests.
2. A translation box per sentence, or one box for the whole passage? Recommendation: one box for AP-level
   passages, one per sentence for Latin I–II sentence sets (a section setting).
3. Should "Study" sets for an upcoming test be hidden once the test opens? Recommendation: yes, while the
   student has an open test attempt, to stop a study set in one tab being used against the test in
   another.
4. Should practice-your-misses sessions be visible to the teacher? Recommendation: no, keep independent
   practice private (as decided in the redesign spec), but let students opt in to share later.
