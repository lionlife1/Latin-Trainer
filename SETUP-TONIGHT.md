# LatinIQ: getting the classroom version live (tonight)

Total time: about 30-45 minutes. Do the steps in order.

## Step 1. Point GitHub Pages at the built site (2 min) — DO THIS FIRST

The live site is broken until you do this, because Pages still serves the raw source from `main`.

1. Check that the "Deploy to GitHub Pages" run finished with a green check:
   https://github.com/lionlife1/Latin-Trainer/actions
   (It creates the `gh-pages` branch. If it's red, stop and tell Claude.)
2. Go to https://github.com/lionlife1/Latin-Trainer/settings/pages
3. Source: **Deploy from a branch**. Branch: **gh-pages**, folder **/ (root)**. Save.
4. Wait 1-2 minutes, then open https://lionlife1.github.io/Latin-Trainer/
   You should see the new app in **solo mode** (no login yet). That's expected.

## Step 2. Create the Supabase project (5 min)

1. Sign in at https://supabase.com/dashboard and click **New project**.
2. Name: `latiniq`. Set a database password and **save it somewhere**. Region: a US one near Texas.
3. Wait until the project finishes setting up.
4. Go to Project Settings → General and copy the **Project ID** (the "reference ID", a string like `abcdefghijklmno`).

## Step 3. Push the database and functions from your computer (10-15 min)

You need Node.js installed (`node -v` should work) and Git.

```bash
git clone https://github.com/lionlife1/Latin-Trainer.git
```

```bash
cd Latin-Trainer
```

```bash
npx supabase login
```

```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```
(Paste the database password when asked.)

```bash
npx supabase db push --include-seed
```
(Creates the tables, security rules and grading functions, and loads the questions and dictionary.)

```bash
npx supabase functions deploy student-join student-login reset-pin --use-api
```

## Step 4. Supabase dashboard settings (5 min)

1. Authentication → **URL Configuration** → Site URL: `https://lionlife1.github.io/Latin-Trainer/`
   Also add it under Redirect URLs.
2. Authentication → **Sign In / Providers** → Email: for the demo, turn **Confirm email OFF**
   (otherwise teacher signup waits for an email, and Supabase's free email sending is slow and limited).
   You can turn it back on later.
3. Authentication → **Rate Limits**: raise "sign-ups and sign-ins" to about 60 per 5 minutes
   (a whole class signs in from one school IP).
4. Project Settings → **API**: copy the **Project URL** and the **anon / publishable key**.
   (The anon key is meant to be public. Never use the `service_role` key here.)

## Step 5. Tell GitHub about the backend and redeploy (3 min)

1. https://github.com/lionlife1/Latin-Trainer/settings/variables/actions
2. Under the **Variables** tab (not Secrets), add:
   - `VITE_SUPABASE_URL` = the Project URL
   - `VITE_SUPABASE_ANON_KEY` = the anon key
3. Go to Actions → "Deploy to GitHub Pages" → **Run workflow** (on `main`).
4. When it's green, reload the site. You should now see teacher sign-in and the student join option.

## Step 6. Rehearse the demo (10 min)

Use two browsers (or one normal window plus one private window):

1. **Teacher:** sign up, create a class, and note the class code.
2. **Teacher:** create a short assignment (e.g. Conditionals, practice mode) and a short vocab test.
3. **Student (other window):** join with the class code + a nickname + a 6-digit PIN, then do both assignments.
   Answer a few questions wrong on purpose.
4. **Teacher:** open the gradebook, a student's answers, and the **item analysis** (hardest questions plus the most common wrong answers).
   That's the most impressive screen to show.

Before the presentation, delete or rename the test student so the gradebook looks clean, or just keep it as demo data.

## Backup plan

If school Wi-Fi blocks github.io or Supabase, take screenshots or a screen recording of Step 6 tonight.

## Old version

The original version is still in history: commit `c9adcb9` ("Add claude suggested changes").
Browse it at https://github.com/lionlife1/Latin-Trainer/tree/c9adcb9
