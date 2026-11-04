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

### Website (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`, which tests, builds, and publishes the built
site to the `gh-pages` branch. One-time setup after the first run:

1. Settings → Pages → Source: **Deploy from a branch** → `gh-pages` / `(root)`.
2. The site is at `https://<user>.github.io/Latin-Trainer/`. Without step 3 it runs in solo mode.

### Classroom backend (Supabase)

1. Create a Supabase project. Link it and push the schema: `supabase link`, `supabase db push`,
   then run `supabase/seed.sql` in the SQL editor (or `psql`).
2. Deploy the edge functions: `supabase functions deploy student-join student-login reset-pin`.
3. In GitHub: Settings → Secrets and variables → Actions → **Variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (the anon key is meant to be public), then re-run the workflow.
4. In Supabase: Authentication → URL Configuration → Site URL = your Pages URL.

Netlify works too (`netlify.toml` included); set the same two variables there.

## Dictionary data

The dictionary is built from three vendored sources under `content/sources/` (see its README): D'Ooge's
Latin-English vocabulary, Whitaker's Words `DICTLINE.GEN`, and Lodge's 2,000-word core list. Run
`npm run seed` to regenerate `supabase/seed.sql` (modules and questions) and `supabase/seed-lexicon.sql`
(the lexicon), then apply both. Re-applying the lexicon seed keeps words that vocab lists use.

## Privacy and school use

This stores student display names, answers and scores. Before using it with a real class, get your
teacher's and, if required, the district's approval. Student data rules (FERPA and Texas state law) can
apply even to free tools. The design keeps data minimal on purpose: no student emails, nicknames allowed.
Student PINs are short, so keep Supabase's auth rate limits enabled. A whole class usually signs in from
one school IP address, though, so raise the sign-in limit (Authentication → Rate Limits, "sign-ins and
sign-ups", or `[auth.rate_limit] sign_in_sign_ups` in `supabase/config.toml`) to roughly
2 × class size per 5 minutes. That's enough for a class to join at once while still throttling PIN guessing.

Tests built from the built-in grammar modules are not secret: the same questions are in solo practice.
Use them for low-stakes quizzes, and use your own vocab lists for anything that counts.

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
