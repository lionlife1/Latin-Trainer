# Teacher tools: plan for tests, quizzes, assignments and practice sheets

Written 2026-11-05. Based on [research.md](research.md), which has the evidence, sources and gap analysis.
This is a product and architecture plan, not a step-by-step implementation plan. Each phase below should get
its own spec and plan in `docs/superpowers/` when it starts.

## The idea in one paragraph

A test, a quiz, a homework assignment and a practice sheet are **the same object**: an ordered list of
**sections**, each with instructions, points and items. They differ only in how they are **delivered**:
online practice (instant feedback), online test (graded on submit), or **printed** (student copy plus answer
key, optionally in versions A/B/C). So the teacher page gets one builder for all four, a library to fill it
from, and three ways to deliver the result. Most items don't have to be typed by hand. LatinIQ can
**generate** them from its lexicon and a full morphology engine: synopses, declension and conjugation charts,
parse-this-form, vocab in any direction. Generation is where LatinIQ can do what Quizlet, Google Forms and
Gimkit can't.

## What teachers need, ranked

From the research, by how often it appears and how much time it costs teachers:

1. **Forms grids with an answer key**: synopsis, conjugation, declension, participles, infinitives,
   comparison. They appear on every grammar test from Latin Primer to Wheelock to the Cambridge Latin Course.
   Today they are all hand-made.
2. **Vocab quizzes** in every direction and format (L→E, E→L, mixed, matching, word-bank cloze), built from a
   list the teacher already has somewhere else (Quizlet, Bridge, the textbook).
3. **Printing.** Paper quizzes are still the norm, and teachers keep A/B versions against copying.
4. **Fair grading of typed answers**: macrons, synonyms, and one-click "accept this answer for everyone".
5. **Parse / identify items** (person-number-tense-voice, gender-number-case), alone or tied to a passage.
6. **Passages** with comprehension questions, underlined words to parse, and translation graded by segment
   in the AP style.
7. **Teacher-written items** for everything a generator can't produce: sentence MC, choose-the-form, culture,
   mottoes, derivatives.
8. **Accommodations**, **tags** for NLE/JCL-style practice tests, and **export** to the review games students
   already like.

## Information architecture of the teacher page

Today the teacher nav has **Classes** and **Vocab lists**. Proposed:

```
Teacher
├── Classes            (unchanged entry point)
│   └── Class
│       ├── Assignments    list, due dates, "Assign…" button
│       ├── Gradebook      + points, sections, per-tag columns
│       ├── To grade       queue of answers that need a person (translations, short answers, flagged)
│       └── Students       PINs, accommodations
├── Create             the builder (new)
│   ├── Start from template   Vocab quiz · Synopsis quiz · Chapter test · NLE-style practice · Sight passage · Blank
│   ├── Sections editor
│   └── Preview            Student view · Answer key · Print
├── Library            everything a builder draws from (Vocab lists move here)
│   ├── Vocab lists        + import (paste / CSV / Quizlet)
│   ├── My questions       teacher-written items, tagged
│   ├── Passages           Latin text with glosses, segments and targets
│   └── Derivatives        English word → Latin root (teacher data, seeded later)
└── (existing) Item analysis, attempt detail
```

Key flows:

- **"I need a Friday vocab quiz"**: Create → *Vocab quiz* template → pick list(s) → choose formats (10
  L→E, 5 E→L, 5 matching) → Preview → **Assign** to a class or **Print** with key. Under two minutes.
- **"Synopsis quiz on Chapter 18 verbs"**: Create → *Synopsis quiz* → pick verbs (search the lexicon or
  a vocab list) → person/number "random per student" → tenses × voices × meanings → Print A/B or assign
  online. Each student gets a different verb from the set (fair, and hard to copy from).
- **"Chapter test"**: Create → *Chapter test* → sections: vocab (generated), forms grid (generated),
  parse 8 forms (generated), 5 sentence MC (my questions, tag *ch18*), passage with 6 questions and a
  10-segment translation → points per section → Print and assign online.
- **"NLE practice"**: Create → *NLE-style practice* → level → the template fills sections by tag
  (~30 language, ~10 culture) from built-in and teacher items → timed test, 45 min.
- **Grading**: Class → **To grade** → one item at a time, all students' answers to that item stacked
  together; tick segments or give points; "accept this answer" applies to identical answers.

## Building blocks

### 1. Item types

The current types (`typein`, `mc`) stay. New types extend `DrillQuestion`. Every type defines: an authoring
shape (with answers), a public shape (answers removed, for tests), a `given` shape, a grader
returning **points earned out of points possible**, and print rendering (student copy and key).

| Type | Covers | Grading |
|---|---|---|
| `mc` (exists) | Sentence MC, derivatives MC, culture | Auto |
| `typein` (exists, extended) | Vocab, give-the-form, short Latin answers | Auto; adds `strictMacrons`, more accepted answers, teacher override |
| `tf` | Latin true/false statements, CI checks | Auto |
| `match` | Vocab matching, derivative-root matching, extra distractors in the right column | Auto, per pair |
| `cloze` | Word-bank fill-in (English story or Latin sentence), optional extra bank words | Auto, per blank |
| `choice-inline` | "Circle the form that completes the sentence" (*ut inimīcōs (superat / superāret)*) | Auto, per blank |
| `grid` | Synopsis, conjugation, declension, participles, infinitives, comparison, principal parts; some cells given | Auto, per cell; meaning cells optional and teacher-graded |
| `parse` | Identify person/number/tense/mood/voice or gender/number/case, plus optional lemma and meaning | Auto, per part |
| `short` | English answers (comprehension, culture, derivative meaning) | Accepted list, then teacher queue |
| `translate` | Sentence or passage translation, split into segments with accepted renderings and constraints | Teacher (tick segments, reason codes); the key is shown beside each answer |
| `passage` | Container: Latin text with line numbers, glosses, underlined targets; holds child items of the types above | Sum of children |

Partial credit is native: every grader returns `{earned, possible, parts[]}`. "Answer N of M" is a section
setting.

### 2. Morphology engine (prerequisite for generation)

`src/lib/conjugator.ts` covers the subjunctive over ~870 verbs. It needs to become a full engine:

- **Verbs**: all six indicative tenses active and passive, imperatives, all infinitives, all participles,
  gerund and gerundive, plus deponents and the irregulars already handled (*sum, possum, eō, ferō, volō,
  nōlō, mālō, fīō*). Also fix the semi-deponents and other gaps from `docs/trainer-core-verbs-followups.md`.
- **Nouns**: five declensions with i-stems, neuters, *domus*, *vīs*, locatives. They can be parsed from the
  core headwords, which already carry the genitive and gender (*vectīgal, -ālis, n.*).
- **Adjectives**: 1st/2nd and 3rd declension (one, two and three terminations), comparison regular and
  irregular, adverbs from adjectives.
- **Pronouns**: tables for personal, demonstrative, relative, interrogative, *ipse/idem/iste*.
- **English meanings** for synopsis meaning rows: generated from a gloss plus tense/voice templates
  ("he was being moved"). Shown in the key only, as a guide. A person grades them, because acceptable
  English varies too much.

The engine must be **one module used everywhere**: solo trainers, item generators, the answer key and
server-side grading checks. It is tested the way `conjugator.test.ts` is, with golden tables for model verbs
and nouns from Allen & Greenough.

### 3. Generators

Generators are pure functions: `(config, words, rng) → items`. They run in the teacher's browser at publish
time, the same way `buildVocabQuestions` does now, and the results are snapshotted into `assignment_pool`.

- **Vocab**: L→E MC, E→L type-in, mixed, matching sets, cloze with distractor bank words.
- **Synopsis**: verb(s), person/number (fixed or random per student), tenses × voices × moods, give the
  first cell or not, include meaning rows or not.
- **Paradigm grid**: conjugate one tense, or decline a noun, an adjective or a noun-adjective pair
  (*vir bonus*), given cells chosen by the teacher ("give the nominative singular" or "give 2 random cells").
- **Principal parts**: give the 1st part, fill the rest.
- **Parse this form**: random forms of chosen words; the student picks person/number/tense/mood/voice or
  gender/number/case. Ambiguous forms (*puellae* is gen. sg., dat. sg. or nom. pl.) accept **any valid
  parse**, and the key lists them all.
- **Make this form**: "*moneō*, 3rd pl. pluperfect passive", type it in.
- **Per-student variants**: with "different words per student" on, each attempt draws its own items
  from the generator, with the same structure and points. In print, each version A/B/C gets its own draw.

### 4. Library

- **Vocab lists** (exist). Add bulk **import**: paste "Latin – English" lines, CSV, or a Quizlet export
  (tab-separated). Each line is matched to the lexicon (exact lemma first, as search already does),
  unmatched lines become custom words, and the teacher confirms ambiguous ones. Add **tags** (chapter,
  unit) and "combine lists" for cumulative quizzes.
- **My questions**: teacher-written items of any type, with tags and an optional explanation. Private to
  the teacher. Later, optionally shareable with other teachers in the school.
- **Passages**: Latin text, line numbers, glosses (word → note, shown in the margin or below), and
  optional target words and segments for translation. Passages pasted from textbooks stay private.
- **Derivatives**: (English word, Latin root lemma, optional example sentence). Teacher-entered first; a
  seed list from a public-domain source can come later.
- **Tags**: one shared vocabulary. Built-in tags follow the NLE syllabus (e.g. *abl-absolute*,
  *indirect-statement*, *purpose-clause*, *derivatives*, *mythology*). Teachers add their own (*ch18*,
  *stage-29*). Module badges map onto built-in tags.

### 5. Builder

- An **assessment** has a title, instructions, and ordered **sections**. A section has a heading,
  instructions, points per item (or total), "answer N of M", shuffle on/off, and a **source**: a
  generator config, a pick from My questions (by hand or "N random with tag X"), built-in module
  questions (the current builder), or a passage.
- **Preview** shows the student view, the key, and the printed page side by side.
- **Templates** are just saved assessments with empty sources. Teachers can save their own ("my weekly
  quiz").
- **Delivery settings** are chosen on assign or print, not in the builder: mode (practice/test), due date,
  time limit, attempts, reveal answers, different words per student, shuffle.
- The current `AssignmentBuilder` becomes the "Modules" and "Vocab" section sources. Existing assignments
  load as a one-section assessment, so nothing old breaks.

### 6. Delivery

- **Online practice and test**: the existing runners, extended with renderers for each new item type.
  Tests stay server-graded, and answers never reach the browser before submit.
- **Print**: a print route with `@media print` CSS, so no PDF library is needed. Options: name/date/class
  header, student copy, answer key, versions A/B/C (shuffle order and choices; re-draw generated items),
  white space for written answers, large print. The browser's "Save as PDF" covers teachers who need a file.
- **Hybrid**: print the test, then **enter scores** per section (or per item) into the gradebook, so paper
  tests still feed item analysis. The per-item entry can come later.
- **Export**: Quizlet (tab-separated), Gimkit and Blooket CSV, Kahoot xlsx (MC and vocab items only).
  Teachers keep their review games, and LatinIQ is where the list lives.

### 7. Grading

- **Auto-grading** for all objective types, returning partial credit per part.
- **Grading queue** (Class → To grade) for `short` and `translate` items and for typed answers the
  student flagged. Answers are grouped by item, and **identical answers are grouped** so one decision
  covers them all.
- **Accept for everyone**: on any auto-graded typed item, the teacher can add an accepted answer after the
  fact. Every response with that normalized answer is regraded, and the item's key is updated for future
  attempts.
- **Translation by segment** (AP style): the key lists, per segment, accepted renderings and constraints
  ([must be nominative], [must modify *gens*]). The teacher ticks segments and can pick a reason code
  (omitted, wrong meaning, wrong case, wrong number, wrong tense/voice/form, agreement, part of speech).
  Reason codes feed item analysis: "62% lost segment 4 to *wrong case*".
- **Macron policy** per item or assessment: ignore (default, matches the Regents rule), or require.
- **Regrade** after a key change, with a note in the gradebook.

### 8. Accommodations and fairness

- Per-student settings on the class roster: extra time (×1.5, ×2), 3 MC choices instead of 4, word bank
  on type-in vocab, shortened tests (a teacher-chosen subset of sections). These apply automatically to
  every assignment and are visible to the teacher only.
- Per-student generated variants and shuffles (above) reduce copying without four hand-made versions.
- Practice tests built from the built-in module bank keep the current warning that students can look the
  answers up in solo mode.

### 9. Analysis

- Gradebook columns in **points** with per-section subtotals.
- Item analysis (exists) extended to **parts**: which grid cells, which parse fields, which segments
  are missed most. For example: "the class misses the pluperfect passive 3rd plural", "confuses dative and
  ablative plural".
- **By tag** across assignments: a class's accuracy on *abl-absolute* over the term.

## Data model changes (sketch)

Additive, so existing data keeps working:

- `assessments(id, owner_id, title, instructions, sections jsonb, created_at, updated_at)`: the reusable
  document. `sections` holds section settings and **sources**, not frozen items.
- `assignments.assessment_id` (nullable; old rows keep `source`) and `assignments.settings jsonb` for the
  new delivery options.
- `assignment_pool.section`, `assignment_pool.points numeric`, and `assignment_pool.question` holding any
  item type.
- `responses.given_json jsonb`, `responses.earned numeric`, `responses.possible numeric`,
  `responses.needs_review bool`, `responses.graded_by uuid`, `responses.reason_codes text[]`. `correct`
  stays, derived as `earned = possible`, so the current gradebook and item analysis still work.
- `attempts.score numeric`, `attempts.total numeric` (or new columns, to avoid a type change).
- `teacher_items(id, owner_id, item jsonb, tags text[])`, `passages(id, owner_id, title, text, glosses jsonb,
  segments jsonb)`, `derivatives(id, owner_id, english, lexicon_id, sentence)`.
- `enrollments.accommodations jsonb`.
- `accepted_overrides(assignment_id, pool_id, normalized_answer, created_by)`, applied by the grader.
- SQL `grade_item` becomes a dispatcher over item types returning `(earned, possible, parts)`.
  Grid and parse grading compare normalized cell values, so they stay simple in SQL. The **answer key is
  computed in the browser at publish time and stored in the pool**, so the server never needs a
  morphology engine.
- RLS: the new tables are owned by `owner_id`, with the same rules as `vocab_lists`. Students only ever see
  public item shapes, through the existing security-definer functions.

## Phases

Each phase ships something a teacher can use on its own. The order puts the highest value with the lowest
risk first.

**Phase 1: Print and import (no schema change).**
Print view with answer key and A/B shuffle for the current assignment types (module questions, vocab).
Vocab list import (paste/CSV/Quizlet) and export (Quizlet, Gimkit, Blooket, Kahoot). Macron helper in
teacher text inputs. *Gets LatinIQ onto paper and into the games teachers already use.*

**Phase 2: Morphology engine and grids.**
Full verb, noun, adjective and pronoun engine with golden tests. `grid`, `parse` and give-the-form items.
The schema change for structured answers and points (`given_json`, `earned`, `possible`). Synopsis,
paradigm, principal-parts and parse generators, online and in print. Per-student variants. *Takes the most
repetitive job off teachers' hands.*

**Phase 3: Builder, library and teacher-written items.**
`assessments` with sections; templates; My questions with `mc`, `typein`, `tf`, `match`, `cloze`,
`choice-inline`, `short`; tags (NLE built-in plus custom). The current builder folds in as section sources.
*One place to make any test or worksheet.*

**Phase 4: Passages, translation and the grading queue.**
`passage` and `translate` items, glosses and line numbers in print, the To-grade queue, segment scoring with
reason codes, accept-for-everyone, regrade. *Covers reading and translation tests and AP prep.*

**Phase 5: Accommodations, analysis, exam prep.**
Per-student accommodations, item analysis by part and by tag, NLE-style and JCL-style practice templates,
paper score entry. A derivatives library.

## Out of scope (for now)

- **AI grading of free English translations.** Too risky for grades, and it would send student answers to
  an outside service, which raises the privacy problems the README warns about. Segment ticking with a
  visible key is fast enough. Revisit only as an opt-in "suggest a score" that the teacher confirms.
- **Audio** (dictation, listening). Useful in CI classrooms, but recording and storage are a separate
  project.
- **A shared public question bank.** It raises copyright and moderation questions. Start with private
  libraries and school-level sharing.
- **Certamen buzzer games.** Live multiplayer is its own product. Export to Kahoot/Gimkit covers live review.
- **LMS integration** (Google Classroom, Canvas, Microsoft Teams). Worth it later. The school uses
  Microsoft 365, so a Teams assignment link is the first candidate.

## Open questions for the teacher pilot

1. Which textbook does the class use (Wheelock, Cambridge, Ecce Romani, LNM, Oxford, Suburani)? This decides
   which vocab lists and chapter tags to seed first.
2. Paper or screens for tests? This decides whether Phase 1 (print) or Phase 2 (online grids) matters more.
3. Are meaning rows on synopses graded? How strict on macrons in forms work?
4. Which accommodations show up in the teacher's IEP/504 caseload?
5. Which JCL/NLE exams do the students sit, and at what levels?

## Progress log

- 2026-11-05: Research done (research.md §1–§9). First version of this plan.
