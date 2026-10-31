# LatinIQ

A Latin grammar and vocabulary trainer built for TSJCL advanced exam prep, now with a classroom mode:
teachers create classes, assign practice or tests, and see a gradebook and per-question analysis.

## What's in it

**Solo practice (no account, works offline)**
- 10 subjunctive modules (forms, sequence of tenses, independent uses, purpose/result/indirect command,
  cum clauses, indirect questions, fear clauses, conditionals, quin, relative clauses), 335 questions.
- Endless Train: unlimited generated subjunctive conjugation drills.
- XP, streaks and progress are stored in this browser only.

**Classroom (needs a Supabase backend)**
- Teachers sign up with email. Students join with a **class code + first name/nickname + 6-digit PIN**.
  No student email or real name is required, and the teacher can reset a forgotten PIN.
- Assignments from grammar modules (filter by question kind) or **vocab lists**. Teachers build lists by
  searching a built-in Latin dictionary (macrons optional), can override a definition to match their
  textbook, and can add their own words.
- Two modes:
  - **Practice**: instant feedback after each answer.
  - **Test**: no feedback until submit, optional time limit and attempt limit, graded on the server.
    Answers are never sent to the student's browser before they submit.
- Due dates (late work is flagged, not blocked), refresh-safe tests, and offline retry for practice answers.
- Gradebook (best score per student per assignment, CSV export), each student's answers, and
  **item analysis**: questions sorted hardest first with the most common wrong answers, so you can see
  *which* mistake the class is making.

## Local development

```bash
npm install
npm run dev          # solo mode at http://localhost:5173
npm test             # unit + component tests (Vitest)
npm run test:db      # SQL/RLS tests on a throwaway Postgres 16 (or set DATABASE_URL)
npx playwright test  # end-to-end (solo); classroom e2e needs E2E_SUPABASE=1 + a local stack
```

### Classroom mode locally

Requires the [Supabase CLI](https://supabase.com/docs/guides/local-development) and Docker.

```bash
npm run seed                 # regenerate supabase/seed.sql from src/content + lexicon
supabase start               # applies supabase/migrations and seed.sql
supabase functions serve     # student-join, student-login, reset-pin
cp .env.example .env         # fill VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from `supabase status`
npm run dev
```

## Deploying

1. Create a Supabase project. Link it and push the schema: `supabase link`, `supabase db push`,
   then run `supabase/seed.sql` in the SQL editor (or `psql`).
2. Deploy the edge functions: `supabase functions deploy student-join student-login reset-pin`.
3. Build the site with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set and host `dist/` anywhere
   static (Netlify config included; GitHub Pages also works since the app uses hash routing).

## Dictionary data

`content/starter-lexicon.json` is a small (226-word) starter dictionary of common words. To use the
Dickinson College Commentaries Latin Core Vocabulary (~1000 words, CC BY-SA 3.0) instead, download its
CSV to `content/raw/dcc-core.csv`, run `npm run seed`, apply `supabase/seed.sql` again, and set
`VITE_LEXICON_ATTRIBUTION` as shown in `.env.example` so the required attribution is displayed.

## Privacy and school use

This stores student display names, answers and scores. Before using it with a real class, get your
teacher's and, if required, the district's approval. Student data rules (FERPA and Texas state law) can
apply even to free tools. The design keeps data minimal on purpose: no student emails, nicknames allowed.
Student PINs are short, so keep Supabase's auth rate limits enabled.

## Project layout

```
src/lib/            grading, conjugator, vocab question generator, CSV, offline queue
src/content/        built-in modules and questions
src/features/       solo, drill engine, auth, student, teacher screens
supabase/migrations schema, row level security, grading functions
supabase/functions  student account edge functions (logic in _shared/handlers.ts)
supabase/tests      SQL tests (scripts/test-db.sh)
docs/superpowers    design spec and implementation plan
```

## Roadmap

Video lessons with checkpoint questions, paradigm-chart mode, parse/identify mode, per-student spaced
repetition, Microsoft school sign-in, teacher-authored grammar questions, a live class game mode, and a
content audit of the conjugation engine (known issues: `effugere` is given a passive participle,
`fieri` perfect forms, `ire` perfect variants).
