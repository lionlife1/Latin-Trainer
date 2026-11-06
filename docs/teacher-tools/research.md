# Teacher tools research: what Latin teachers need to make tests, quizzes and practice

Started 2026-11-05. This is a working log. Findings are added as the research goes on; the plan built from it is in
[plan.md](plan.md).

**Summary.** Latin assessments are built from a small, stable set of section types: vocabulary, forms grids
(synopsis, declension, conjugation, participles, infinitives), parse/identify, sentence MC and
choose-the-form, passage comprehension, translation, derivatives, and culture. Most of the forms work is
mechanical, so a morphology engine can generate it along with its answer key. That is LatinIQ's biggest
opportunity. Teachers' biggest pains are hand-making grids, grading typed answers fairly (macrons,
synonyms), and printing versions. Translation is graded by segment (AP), which software can support with a
teacher in the loop rather than by AI grading.

## Method

- Read what is already in LatinIQ (teacher routes, assignment builder, schema, grading, vocab, conjugator).
- Looked at real tests and practice sheets that teachers and professors have posted (Wheelock exams, synopsis
  quizzes, Regents scoring keys, NLE format, Pomona and Baylor sheets).
- Read teacher blogs and forum threads on how they write and grade assessments.
- Looked at the tools teachers say they use (Quizlet, Quia, Gimkit, Blooket, latindictionary.io, Wizer, Google
  Forms) and what they complain about.

## Log

### 1. What is already in LatinIQ (baseline)

- Teacher routes: classes, class detail, new assignment, gradebook, attempt detail, item analysis, vocab lists.
- One assignment builder. Content is either built-in grammar modules (filter by badge and type) or one vocab list
  (Latin→English MC, English→Latin type-in). Modes: practice (instant feedback) or test (server graded, time
  limit, attempts, reveal answers).
- Only two question types exist: `typein` (list of accepted answers, normalized: lowercase, macrons stripped)
  and `mc`. There is no way for a teacher to write a question.
- A subjunctive conjugator (`src/lib/conjugator.ts`) over ~870 verbs, and a 32k-word lexicon with ~2,300 core
  words. No noun/adjective decliner, no indicative, no participles or infinitives.
- Nothing prints. Everything is online and per-student.

### 2. Real tests and review sheets

**UNCW Latin 102, review for Test 3 (Wheelock 23–27).** Five-page test. Sections:

1. Vocabulary, Latin→English.
2. Forms, as fill-in grids built from a verb or adjective given in full dictionary form:
   - all 5 infinitives with meanings (grid: present active / passive, perfect active / passive, future active);
   - comparative and superlative of regular and irregular adjectives, with meanings;
   - all four participles with meanings;
   - declension of a participle (*dūcēns*), with masc/fem and neuter columns, sing. and pl.;
   - a verb synopsis: one verb, one person/number, six tenses × active/passive, each with a meaning row.
3. Multiple choice on sentences: "Which is NOT an appropriate translation of *hīs rēbus dictīs…*", "Which is the
   best translation of …", fill the blank with the right Latin form. Distractors are near misses (wrong tense of
   the infinitive, wrong case after *quam*).
4. Verb identification **from a reading passage**: verbs are underlined in a ~10-line passage, and a chart has
   circle-one options for person/number, tense, voice, plus a free meaning column.
5. Gender/number/case from the same passage: 11 underlined words, circle m/f/n, s/pl, case.

**UCSC Latin 2 sample final (Cambridge Latin Course stages 28–34).** Two hours.

1. Vocabulary.
2. "Fill in the missing forms" for five verbs of five conjugations (*portō, doceō, trahō, capiō, audiō*):
   person × number grids for every indicative tense active and passive, plus imperfect and pluperfect
   subjunctive active.
3. Noun declension grids with only the nominative singular filled in (*servus, leō, rēs*). Students are told
   in advance the set the grid can come from (*puella, servus, templum, leō, nōmen, portus, rēs*).
4. "Circle the form that completes the sentence, then translate": a sentence with a two-way choice in
   parentheses (*ut inimīcōs (superat, superāret)*). Tests sequence, agreement and mood in context.
5. Multiple choice (stages 28–34).
6. A passage for translation.

**UNCW Latin 102 final review (Wheelock 23–29).** Vocabulary (10 Latin→English, plus give the dictionary form of
5 of 7 words), verb analysis, GNC, synopsis with passives, multiple choice (passive and deponent meanings,
participles, *ferō*, numbers, agreement, ablative absolute, infinitives, matching principal parts), and a
passage to translate.

**Patterns so far.**

- Almost every grammar test is a fixed set of **section types**: vocab, forms grids (synopsis, declension,
  infinitives, participles, comparison), identify-the-form (parse / GNC), sentence MC, choose-the-form-in-context,
  translation passage.
- Forms grids are **generated from one dictionary entry**. The teacher picks the word and the cells; the answer
  key is mechanical. This is the most repetitive work a teacher does by hand and the easiest to automate.
- Students are often told the **candidate set** in advance ("be able to do this for *puella, servus…*").
  A generator that picks one word from a teacher's list per student gives each student a different but
  equivalent grid.
- Parsing questions are anchored to a **passage**: underline words, then ask about them. Questions about a
  shared passage are a structure the app cannot express today.
- Circle-one options (m/f/n, s/pl, cases) are a multi-part question: each part is graded on its own, and
  partial credit is normal.

### 3. How Latin is graded (official keys and teacher practice)

**AP Latin 2024, FRQ 1 (Vergil translation), scoring guidelines.** The passage is cut into **15 segments**, one
point each. A segment scores only if **every word in it** is right. For each word the key lists:

- the accepted English renderings, separated by slashes (*amens*: frenzied/mad/deranged/crazed/crazy/insane);
- optional words in parentheses (*(his) mind*, *(as a) suppliant*);
- a **grammatical constraint** in brackets: [must be nominative], [must modify *rumore*], [must be object of
  *orasse*], [scored for vocabulary only].

The commentary then lists, for each sample, which segment was lost and why ("Segment 12: *Maurusia* should
agree with *gens*"; "wrong case for *Iovem*"; "*nunc* omitted"). The error types are a closed set: omitted,
wrong meaning, wrong case, wrong number, wrong tense/voice/verb form, wrong part of speech, agreement.

This is very close to something software can support. Not auto-grading free English (too risky), but:
a teacher pastes a passage, splits it into segments, lists accepted meanings and constraints, then grades each
student's translation by **ticking segments** with a one-click reason. Score = segments earned. The reason codes
feed the same item analysis the app already has.

**NY Regents Comprehensive Latin, 2008 scoring key.** Parts: oral reading (I), dictation of 10 words, ½ credit
each, "do not penalize for improper use of macrons, punctuation, or capitalization" (II), MC reading
comprehension (IIIA, IIIC, IIID), short English answers with listed acceptable answers, "Not all of the
acceptable answers have been included", "allow no partial credit" (IIIB), language skills MC (IVA, IVB),
**derivatives**: give a Latin word related to an English one, any correctly spelled form accepted, prefixes and
suffixes not accepted, ½ credit per column (IVC), culture MC, "answer 20 of 30" (V).

Lessons:

- **Macrons are usually not graded** in dictation or derivatives. LatinIQ already strips macrons when grading.
  Some teachers do grade macrons in forms work, so this should be a per-question or per-assignment setting.
- **"Answer N of M"** (choice sections) is a real exam feature.
- **Fractional credit** (½ per word) and per-section totals are standard.
- **Accepted-answer lists are never complete**. The grader must be able to override by hand, and the override
  should be offered for the other students who gave the same answer.

**Teacher practice (blogs and forums).**

- Per-word points (1 per Latin word) are common but "cumbersome". Some count a phrase like *in templō* as one
  point. Others grade the main clause first and give subordinate clauses credit only if the main clause is
  right. *(Well-Trained Mind forum thread, via search summary; the page itself returned 403.)*
- Deduction grading (minus a point per error in tense, number, case, participle, ablative absolute, sequence)
  versus a holistic proficiency rubric that "shows what students can do". *(Todally Comprehensible Latin, Feb 2025.)*
- Standards-based grading: each assessment is tagged with standards, each marked formative or summative.
  Unlimited retakes with **a different version over the same reading**. Short (10–15 min), frequent (every
  5–7 days), built on a story the class already read. *(Todally Comprehensible Latin, Sept 2017.)*
- Daily vocab or paradigm quizzes, easy to grade, retake as often as you like; a full test every third lesson.
  Tests mix sentence translation and **English derivatives**. *(Classical Conversations.)*
- More frequent, lower-stakes assessment, flipped classroom, tests "to show where progress has been made".
  Students also sit the NLE, a Classical Literacy exam and State JCL contests. *(CAMWS 2017 panel paper.)*

### 4. Weekly quizzes in a grammar-first program (Latin Primer 1, teacher's edition, weeks 1–27)

Each weekly quiz is 2–4 pages built from the same small set of sections, in varying order:

| Section | Item formats seen |
|---|---|
| **Chant** | A conjugation/declension grid with **some cells pre-filled** as anchors (*amās* given, or *-īs* in dat. pl., or *he/she/it loves* in the English column). Latin and English side by side. Endings-only grids (*-bō, -bam, -istī, -erit*) as well as full-word grids. Then short questions about the chant (which conjugation? what is the stem? noun or verb endings?). |
| **Vocabulary** | Latin→English list, English→Latin list, mixed direction in one list; **word-bank cloze in an English story** ("Finish the story using Latin words… one word will be left over"); **matching** columns; label a picture with given words; translate short phrases and 2–3 word sentences. |
| **Derivatives** | Give a derivative; give the Latin root of an English word; MC "circle the Latin word this derivative comes from" with the English word **in a sentence**; MC on the meaning of an English word using its Latin root; match derivatives to roots; numbers → derivatives (*tricycle → 3*). |
| **Quotation / motto** | Recall the week's quotation, fill in a missing word, translate, answer a culture question about it (who said it, which state motto). |
| **Form recognition** | "Underline the noun that goes with the verb" (*Puella / Puellae docent*), then translate; give genitive singular and declension number; change singular to plural and translate. |
| **Review / extra credit** | A short chart from an earlier week; one open-ended question. |

Takeaways:

- The **chant grid with given anchor cells** is the single most common item in early Latin. It is the same
  thing as the college synopsis and declension grids, smaller. One grid component with "which cells are
  given" covers chants, synopses, declensions, participles and infinitives.
- **Word-bank cloze** with one extra word, and matching, are the main formats for vocabulary at this level.
- **Derivatives** are on nearly every quiz and on the NLE and Regents. LatinIQ has no derivative data. A
  teacher-entered list (English word, Latin root, optional sentence) is enough to start.
- Quizzes are **cumulative**: a review section pulls from earlier weeks. A builder should make "mostly this
  week, a few from earlier lists" easy.

### 5. Tools teachers use today, and where they fall short

| Tool | What teachers use it for | Gaps for Latin |
|---|---|---|
| **Quizlet** | Vocab sets, flashcards, Learn/Test modes; sets are shared and imported into other tools | Not Latin-aware (no principal parts, no forms); exact-match typing; teachers must type every set |
| **Gimkit, Blooket, Kahoot, Quizizz/Wayground** | Live review games, mostly vocab; Gimkit imports from Quizlet or a spreadsheet, Blooket imports Quizlet terms | MC only or exact match; one school reports vocab test scores rising after two 5-minute Blooket rounds (St Edward's), but teachers on Reddit report cheating and game fatigue |
| **Quia** | Teacher-made activities: matching, concentration, cloze, jumbled words, hangman, ordered list, plus a 10-type quiz tool; a shared bank made by Latin teachers | Old interface, paid; content quality varies |
| **Google Forms / Classroom** | Self-grading quizzes | Exact-match short answer, so teachers list every variant by hand; one teacher reports "two hours per quiz manually fixing 'wrong' answers that were actually right" (synonyms). Macrons make this worse. |
| **Wizer, TES, TpT worksheets** | Editable worksheets: blank synopsis and declension charts, noun reviews | Static; no answer checking; each one is hand-made |
| **Pomona, Baylor, UNCG, Ben Crowder sheets** | Free blank or fillable PDF synopsis and declension charts | Blank only: no generated answer key, no choice of verb |
| **The Bridge (Haverford)** | Vocab lists by textbook range (Wheelock, LLPSI, Oxford Latin Course…) or by text; filter by part of speech; print or export | Lists only; no assessment |
| **latindictionary.io** | Word lists, flashcards, quizzes, a text analyzer, Latin Wordle, teacher classes | Vocab-centred; grammar assessment is thin |
| **Dickinson College Commentaries** | Core vocabulary lists by level, glossed texts | Reference, not assessment |
| **Textbook test banks** (Cambridge stage tests, Ecce Romani, LNM workbooks) | Ready tests per stage/chapter: reading passage, comprehension, grammar, culture | Fixed, paid, and the answers circulate online |

**What keeps coming up.**

1. **Grading type-in answers is the bottleneck.** Exact-match tools mark right answers wrong (macrons,
   synonyms, word order, "the"/"a"). LatinIQ already normalizes macrons and case. It needs accepted-answer
   lists that are easy to write, plus a teacher override that applies to everyone who gave the same answer.
2. **Everything starts from a vocab list.** Quizlet sets get imported into Gimkit and Blooket; Bridge
   lists are printed. Import (paste, CSV, Quizlet export) and export matter more than building lists
   one word at a time.
3. **Paper is still everywhere.** Synopsis and declension charts, chant quizzes, passage tests are
   printed. A tool that only works on screen covers half the job.
4. **Cheating and leaks.** Teachers make 2–4 versions of a test, shuffle questions and choices, and worry about
   Google Translate. One Georgia teacher (not Latin) made four versions of an exam; students photograph tests
   and send them to friends. Generated items (a different verb per student, same structure) are a strong
   answer that Latin, with its regular paradigms, is well suited to.

### 6. Comprehension-based (CI) practice

Not every Latin teacher teaches grammar-first. Assessments from comprehension-based classrooms:

- **Comprehension questions in English** about a story the class has read; "find the Latin sentence that
  supports this statement"; translate 3 sentences into good English. *(Todally Comprehensible Latin.)*
- **True/false statements in Latin** summarising a text. *(Walters, Haileybury, Cambridge Papers in Classics Education.)*
- **Listen and draw** (drawing dictation): the teacher reads Latin aloud, students draw what they hear.
- **Dictatio**: 10 sentences from an upcoming story, dictated. Some students say it did not help them.
  *(Bob Patrick's class survey.)*
- **Embedded (tiered) readings**: the same story in 2–3 versions, simplest first. Teachers say the main cost is
  the time it takes to write the tiers. *(Gall, Cambridge, A Level study.)*
- **Picture prompts with a rubric**: write 1–2 Latin sentences per picture.

Needs this adds: a **passage** as the anchor for a set of questions; **true/false**; questions in English
*about* Latin text; audio optional; tiered versions of one text; rubrics that are not right/wrong.

### 7. Standardized exams teachers prepare for

**National Latin Exam, 2025–26 syllabus.** 36- or 40-question MC exams, 45 minutes. Levels: Introduction,
Beginning, Beginning Reading Comprehension, Intermediate, Intermediate RC, Advanced Prose, Advanced Poetry,
Advanced RC. Typical split is ~30 language + ~10 culture, or ~33 reading comprehension + 3 "extension" on RC
exams. The Introduction exam tells **a short story across its sentences**, then continues it in a passage.
The syllabus says the exam "emphasize[s] the understanding and comprehension of Latin rather than the
production of forms".

The syllabus is a ready-made **topic taxonomy** per level: noun uses by case (ablative of means, time when,
agent, comparison, absolute…), pronouns, adjective degrees, verb tenses/voices/moods, subjunctive clause
types, participles, infinitives, indirect statement, gerunds and gerundives, idioms, oral Latin, derivatives,
mottoes and abbreviations, and culture (geography, history, mythology, Roman life; authors, meter and
rhetorical figures at the advanced levels). Teachers already think in these categories. LatinIQ's module
`badge`s are a partial version of the same idea.

**AP Latin.** Translation FRQs scored by segment (see §3). The syllabus is fixed passages of Vergil and Caesar,
so teachers need sight-reading and syllabus-passage practice.

**State JCL contests (TSJCL, FJCL, GJCL, CAJCL…).** Separate written tests by subject (Grammar I/II/III,
Vocabulary, Derivatives, Reading Comprehension, Mythology, Roman History, Daily Life, Mottoes/Quotes/
Abbreviations, Ancient Geography…), MC, with past tests and keys as the main study material, plus certamen
(buzzer quiz bowl). I could not find TSJCL's current test format online; FJCL says at least half of each
regional test comes from its study guides. LatinIQ was built for TSJCL advanced grammar prep, so this audience
matters.

Implications:

- A **tag set** shared by questions, modules and vocab (NLE-style topics, plus the teacher's own chapter tags)
  makes "build a 40-question NLE-style practice test, 30 language / 10 culture" possible, and lets item
  analysis report by topic as well as by question.
- **Timed MC practice tests** with a fixed number of questions per section are a straightforward extension
  of the current test mode.
- **Culture** questions are a whole category LatinIQ has none of. They have to be teacher-written (or come
  from an open bank later); no generator helps here.

### 8. Practical constraints

- **Typing macrons.** Chromebooks need a Māori or US-International layout, Google Input Tools, or
  copy-paste from an on-screen keyboard. LatinIQ already ignores macrons when grading. Any page where
  teachers *write* Latin needs a macron helper (e.g. type `a-` or `a_` to get ā, or a button row).
- **Accommodations.** IEP/504 plans commonly ask for extended time, a word bank, fewer MC choices
  (3 instead of 4), shortened tests, white space or larger print, and oral testing. The Texas Education Agency
  notes that extra time on a *fluency* quiz can count as a modification. So these must be **per-student
  overrides** on an assignment, not separate assignments. *(BHPRSD, TEA, Smart Kids with LD, CAMWS 2019.)*
- **Privacy.** The app already keeps student data minimal. Printed tests and uploaded passages hold no student
  data, so they add no new privacy risk. Anything that sends student answers to an outside AI grader would.
- **Copyright.** Teachers will want to paste textbook passages and vocab. Those must stay private to the
  teacher, not go into a shared bank. Classical Latin texts themselves are public domain.
- **Formats of the tools teachers already use.** Quizlet: term and definition separated by a tab, one per
  line. Gimkit and Blooket: their own CSV templates (Blooket gives the correct answer as a number 1–4).
  Kahoot: an .xlsx template with time limits of 5/10/20/30/60/120 s. Each template should be checked against
  the platform's own download before building the exporter.

### 9. Gap analysis: what LatinIQ has vs. what teachers make

| What teachers make (from §2–§7) | LatinIQ today | Gap |
|---|---|---|
| Vocab quiz (L→E, E→L, mixed, matching, word-bank cloze) | L→E MC, E→L type-in from a vocab list | Mixed direction in one list, matching, cloze, **import** from paste/CSV/Quizlet |
| Forms grids: synopsis, conjugation, declension, participles, infinitives, comparison | Subjunctive conjugator only | **Morphology engine** for indicative, imperative, infinitives, participles, nouns, adjectives, pronouns; a **grid item type** with given cells |
| Parse / identify (person-number-tense-mood-voice; GNC) | Some module questions as MC | **Multi-part select** item with per-part credit |
| Choose-the-form-in-context, sentence MC | Module MC (fixed bank) | Teacher-written MC and inline choice |
| Passage + comprehension + parsing of underlined words | None | **Passage** container item, underlined targets, T/F, English questions |
| Translation (sentence or passage) | None | **Segmented translation** item, teacher grading queue, reason codes |
| Derivatives | None | Derivative item types plus teacher-entered derivative data |
| Culture, mottoes, mythology | None | Teacher-written MC and short answer; tags |
| Printed test, answer key, versions A/B | None | **Print view**, key, versions, generated variants |
| Partial credit, points per section, "answer N of M" | 1 point per question, boolean `correct` | **Points** and partial credit in the schema and in SQL grading |
| Accommodations | None | Per-student extra time, fewer choices, word bank |
| Accepted-answer lists and teacher overrides | Fixed `answers[]` per item | Override after the fact that regrades everyone with the same answer |
| Topic tags, NLE-style practice tests | Module badges | Shared **tag set**, section-by-tag builder, item analysis by tag |
| Export to Gimkit, Blooket, Kahoot, Quizlet | CSV gradebook only | Question export |

Constraints in the current code that shape the plan:

- Server grading lives in SQL (`grade_item(q jsonb, given text) returns boolean` in
  `supabase/migrations/20261031000003_functions.sql`), and `responses.given` is text with a boolean `correct`.
  Grid, multi-part and translation items need a structured `given` (jsonb) and **points earned** (numeric).
  This is the main schema change, and the reason the plan starts with it.
- `assignment_pool` already snapshots each question as jsonb at publish time. That design works for new item
  types and for per-student generated variants. Keep it.
- Answers never reach the student before submit in test mode. Every new item type has to have a "public"
  shape with the answers removed, like `PublicQuestion`.

## Sources

- UNCW Latin 102, Test 3 review: https://people.uncw.edu/deagona/LAT102/Lat%20102%20Test%203%20rev%20s-12%20d5.pdf
- UNCW Latin 102 final review: https://people.uncw.edu/deagona/disce102/final%20rev%20F13.htm
- UCSC Latin 2 sample final (Winter 2015): https://humwp.ucsc.edu/jklynn/Latin2Winter2015/Latin2Winter2015SampleFinal.pdf
- Latin Primer 1 teacher's edition quizzes (Canon Press): https://cdn.shopify.com/s/files/1/2773/2624/files/9781947644092-latin-primer-1-teachers-edition-martha-wilson-quizzes.pdf
- AP Latin 2024 FRQ 1 scoring guidelines and commentary: https://apcentral.collegeboard.org/media/pdf/ap24-apc-latin-q1.pdf
- NY Regents Comprehensive Latin scoring key, June 2008: https://www.nysedregents.org/Latin/20080624scoringkey.pdf
- National Latin Exam syllabus 2025–26: https://www.nle.org/_files/ugd/aac38e_4671eef0c33748dab4cc40fc1aa9b47e.pdf
- Todally Comprehensible Latin, "Assessing students" (2017): https://todallycomprehensiblelatin.blogspot.com/2017/09/assessing-students.html
- Todally Comprehensible Latin, translation rubric (2025): https://todallycomprehensiblelatin.blogspot.com/2025/02/translation-rubric.html
- CAMWS 2017, "Testing as a Part of Genuine Assessment": https://camws.org/sites/default/files/meeting2017/panels/Testing.01.pdf
- Classical Conversations, assessing Latin work: https://classicalconversations.com/blog/how-to-assess-your-students-latin-work/
- Well-Trained Mind forum, translation rubrics (search summary only, page returned 403): https://forums.welltrainedmind.com/topic/203366-does-anyone-have-a-rubric-for-grading-latin-translations/
- latindictionary.io, free resources for teachers: https://www.latindictionary.io/blog/free-latin-resources-for-teachers
- St Edward's, using tech in Latin (Blooket): https://www.stedwards.co.uk/news/2021-05-26/using-tech-in-latin
- The Bridge (Haverford): https://bridge.haverford.edu/about
- Ben Crowder, Latin conjugation charts: https://bencrowder.net/latin-conjugations/
- Pomona fillable declension and synopsis sheets: https://pages.pomona.edu/~cmc24747/wheelock_resources.htm
- Cambridge Latin Course graded tests: https://www.exams.cambridgescp.com/Array/graded-test-scheme
- Gall, embedded readings at A Level (Cambridge): https://www.cambridge.org/core/services/aop-cambridge-core/content/view/AFEF69C347DCF749D3E8C66A92B67920/S2058631020000045a.pdf
- Walters, Haileybury case study (CPICE vol. 1): https://www.classics.cam.ac.uk/files/cpice_volume_1_-_walters.pdf
- Bob Patrick's students' evaluation: https://www.benslavic.com/?p=18566
- Quia brochure (activity types): https://mail.qualitymatters.org/sites/default/files/presentations/quia-web-brochure.pdf
- Texas Education Agency, accommodations vs. modifications: https://spedsupport.tea.texas.gov/sites/default/files/2026-04/understanding-accommodations-and-modifications.pdf
- NZQA, typing macrons on a Chromebook: https://www2.nzqa.govt.nz/assets/Maori/Maori-keyboard/How-to-use-reo-Maori-keyboard-Chromebook.pdf
- Kahoot spreadsheet import: https://support.kahoot.com/hc/articles/115002812547
- AJC, students cheating on online exams: https://www.ajc.com/news/local-education/student-cheating-appears-increasing/7apdWDsU9mV7m0B5TbKycK
