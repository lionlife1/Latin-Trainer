# LatinIQ Classroom v1 — Spec + Implementation Plan

> On approval this file is split into `docs/superpowers/specs/2026-10-31-classroom-v1-design.md` (Part A) and `docs/superpowers/plans/2026-10-31-classroom-v1.md` (Part B), committed on branch `claude/dazzling-heisenberg-nnuy1t`.
>
> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (native, chosen below). Steps use `- [ ]`.

---

# PART A — DESIGN SPEC

## Context
LatinIQ is a static, localStorage-only TSJCL subjunctive trainer (vanilla JS: `app.js` UI, `trainer.js` conjugation engine, `data.js` with 10 modules / ~335 `typein`+`mc` questions). The author (a 10th-grade student) wants to pitch it to their Latin teacher as a classroom tool: teacher assigns work, students complete it in specific modes, teacher sees results. Teacher has not been asked yet, school uses Microsoft 365. So v1 is a **pitch-ready pilot that needs no district IT approval**: minimal student PII, no school SSO yet.

## Decisions (agreed)
- **Stack:** React 18 + TypeScript + Vite SPA, React Router, supabase-js v2. Static hosting (Netlify/GitHub Pages). Vitest + Testing Library; Playwright e2e; pgTAP for DB.
- **Backend:** Supabase (Postgres + Auth + RLS + 2 Edge Functions).
- **Teacher auth:** Supabase email + password.
- **Student auth:** join with **class code + display name + 6-digit PIN**. Backed by a Supabase auth user with synthetic email `<uuid>@students.invalid`, password = PIN, created server-side (email pre-confirmed). No real email/PII stored. Teacher can reset a PIN.
- **Modes in v1:** `practice` (instant feedback, answers client-side) and `test` (timed optional, no feedback until submit, **graded server-side**; answers never sent to client before submission).
- **Content in v1:** built-in grammar questions (seeded from `data.js`) + **vocab lists** built by searching a built-in lexicon (DCC Latin Core Vocabulary, ~1000 words, CC BY-SA, attribution shown) with per-item definition override and custom words.
- **Solo mode preserved:** existing module map, drills, Endless Train, XP/streak in localStorage work signed-out.
- Legacy `app.js`, `trainer.js`, `data.js`, `index.html`, `style.css`, `modules.json`, `module0.json` are replaced (history in git). Look-and-feel (Cinzel/Crimson Pro/Source Code Pro, gold theme, light/dark) is kept by porting `style.css`.

## Data model (Postgres, all tables RLS-enabled)
- `profiles(id uuid pk → auth.users, role text check in ('teacher','student'), display_name text)`
- `classes(id, teacher_id → profiles, name, join_code text unique (6 chars, A-Z2-9 no ambiguous), created_at)`
- `enrollments(class_id, student_id, pk(class_id, student_id))`; unique `(class_id, lower(display_name))` enforced via `student_names(class_id, name_key, student_id)`.
- `modules(id text pk, badge, title, tagline, description, concepts jsonb, sort int)`
- `questions(id text pk, module_id → modules, type ('typein'|'mc'), badge, prompt html, hint, answers jsonb (typein), choices jsonb + correct text (mc), explanation)`
- `lexicon(id bigserial, owner_id uuid null (null = built-in), headword text, lemma text, definition text, pos text, frequency int)`
- `vocab_lists(id, owner_id, name)`; `vocab_list_items(id, list_id, lexicon_id, definition_override text null, position)`
- `assignments(id, class_id, title, mode ('practice'|'test'), source jsonb, question_count int, due_at timestamptz null, time_limit_sec int null, max_attempts int null, reveal_answers bool default true, created_at)`
- `assignment_pool(id, assignment_id, item_key text, question jsonb)` — snapshot of every candidate question **including answers**, written by the teacher's client at publish time. `question` shape = `DrillQuestion` (below).
- `attempts(id, assignment_id, student_id, started_at, submitted_at null, score int null, total int, is_late bool, over_time bool)`
- `attempt_items(attempt_id, position, pool_id)`
- `responses(id, attempt_id, pool_id, given text, correct bool, ms int, created_at)`, unique `(attempt_id, pool_id)`

## Core shared type
```ts
type DrillQuestion =
  | { id: string; type: 'typein'; badge: string; prompt: string; hint?: string; answers: string[]; explanation?: string }
  | { id: string; type: 'mc'; badge: string; prompt: string; hint?: string; choices: string[]; correct: string; explanation?: string };
type PublicQuestion = Omit<DrillQuestion, 'answers'|'correct'|'explanation'>; // test mode before submit
```

## Server functions (SQL, `security definer`, check `auth.uid()`)
- `latin_normalize(text) returns text`: lower, trim, collapse internal whitespace, strip macrons (āēīōūȳ and uppercase) — **must match `lib/grading.ts normalize()` exactly** (shared fixture test).
- `start_attempt(assignment_id) returns uuid`: caller enrolled in class; enforce `max_attempts`; insert attempt; sample `min(question_count, pool size)` pool rows at random into `attempt_items`.
- `get_attempt_items(attempt_id) returns setof jsonb`: caller owns attempt. Returns full question if mode=practice, or if submitted and `reveal_answers`; else strips `answers/correct/explanation`.
- `record_practice_response(attempt_id, pool_id, given, correct, ms)` — upsert; practice only.
- `finish_practice(attempt_id)`: sets submitted_at, score = count correct, is_late.
- `submit_test(attempt_id, responses jsonb[{pool_id, given, ms}])`: only once; grades typein by `latin_normalize(given) = any(normalized answers)`, mc by `latin_normalize(given)=latin_normalize(correct)`; sets score/total/is_late/over_time (`now() > started_at + time_limit + 30s`). Late/over-time are **flagged, never rejected**.
- `gradebook(class_id)`: teacher-owner only; rows `(student_id, display_name, assignment_id, best_score, total, attempts, last_submitted_at, any_late)`.
- `item_analysis(assignment_id)`: teacher-owner only; per pool item: `n, pct_correct, top_wrong jsonb` (top 3 normalized wrong answers with counts).

## Edge Functions (Deno, service role)
- `student-join {join_code, display_name, pin}` → validates (name 1–24 chars, pin `^\d{6}$`), class exists, name free in class; creates auth user (synthetic email, `email_confirm: true`), profile(role student), enrollment; returns `{email}` so client calls `signInWithPassword`.
- `student-login {join_code, display_name}` → returns `{email}` for that enrolled student (404 otherwise); client then `signInWithPassword(email, pin)`. Generic error text on failure.
- `reset-pin {student_id, pin}` → caller JWT must be teacher owning a class the student is enrolled in; `auth.admin.updateUserById`.

## RLS summary
Students: read own profile, own enrollments, classes they're enrolled in, assignments of those classes (no direct `assignment_pool` select), own attempts/responses. Teachers: full CRUD on own classes and their assignments/pool, read enrollments/attempts/responses for own classes, CRUD own vocab lists + own lexicon rows. Everyone authenticated: read `modules`, `questions` (answers fine — practice content), built-in `lexicon`. Anonymous: read `modules`/`questions` for solo mode.

## Screens
- **Public:** Home (solo module map, Endless, sign-in links) — port of current UI. `/join`, `/student/login`, `/teacher/login`.
- **Student:** `/s` My Assignments (open/done/late, score); `/s/a/:assignmentId` intro → run (practice or test UI) → `/s/attempt/:id` result.
- **Teacher:** `/t` classes; `/t/c/:classId` roster (join code, reset PIN, remove) + assignment list; `/t/c/:classId/new` assignment builder; `/t/c/:classId/grades` gradebook (+ CSV export); `/t/attempt/:id` attempt detail; `/t/a/:assignmentId/analysis` item analysis; `/t/vocab` lists; `/t/vocab/:listId` editor (lexicon search, add, override, custom word).

## Vocab question generation (`lib/vocab.ts`)
For each list item: `l2e` MC — prompt = headword, correct = effective definition, 3 distractors = definitions of other list items preferring same `pos`; if list has <4 items, top up from built-in lexicon same `pos`; duplicates by normalized text removed. `e2l` typein — prompt = effective definition, answers = lemma of this item plus lemmas of any other list items with identical normalized definition. Item keys `vocab:<itemId>:l2e|e2l`.

## Error handling / integrity
- Practice responses saved via RPC as answered; failures queue in localStorage (`lib/offlineQueue.ts`) and flush on `online` / next load.
- Test answers held in memory + sessionStorage during attempt (survive refresh); auto-submit at time limit.
- Generic auth error messages (no "name exists vs wrong PIN" leak beyond join).

## Roadmap (out of v1 scope)
Video lessons + checkpoints; paradigm-chart mode; parse/identify mode; per-student spaced repetition; Microsoft Entra SSO; teacher-authored grammar questions; live class game; AI explanations; Latin content audit (noted bugs: `effugere` given PPP `effugit`; `fieri` perfect stem `fact` used for perfect active; inconsistent `ire` perfect forms).

---

