# Handoff: student app redesign (project #1)

Paste this into a new chat, or point the new chat at this file. It sums up an earlier session so the new one doesn't need its history.

## Task

Redesign the **student side** of LatinIQ (this repo). Follow the brainstorming process: the user has approved the scope below. Next steps are to finish the open questions, propose approaches, present the design in sections, write a spec in `docs/superpowers/specs/`, then write an implementation plan. Teacher screens are **out of scope** for now.

## Why

The user's verdict on the current UI: it looks "vibe coded" and nothing like a real student app. Specific problems seen in screenshots of the current home page:

- Dark background with gold accents, all-caps Cinzel "Roman" display font, italic serif subtitles, monospace XP numbers.
- Emoji in the controls (⚡ Endless Train, 🔥 streak, ☀️ theme toggle).
- Everything crammed into one header (logo, tagline, theme, Endless Train, streak, XP). On mobile, "Endless Train" wraps onto two lines and the streak badge squashes.
- No real navigation, just one long list of module cards.

The page layout is fine. The problem is the visual style and the lack of structure. The underlying code (grading, drill engine, Supabase classroom backend, tests) is solid and stays.

## Decisions the user made

**Visual direction**
- Somewhere between Quizlet and Brilliant.
- From **Quizlet**: minimal, calm, light pages. A nav that doesn't overwhelm. Clean sans-serif text with clear hierarchy. The user leans slightly toward Brilliant's typography but chose Quizlet-style text for this app.
- From **Brilliant**: the **course path** (lessons shown as a visual path with visible progress).
- **No illustrations** (the user likes Brilliant's but thinks they don't fit Latin).
- Drop the dark, gold, Cinzel and emoji look entirely. (Assumed, not explicitly confirmed: streak and XP stay but get quieter, e.g. in a profile or progress area rather than the header.)

**Navigation: real, layered nav, built on one distinction**

```
Student
├── Class          -> teacher's assignments: list (due / done / late), open and do them,
│                     see how you're doing (scores, progress per assignment)
└── Independent
    ├── Grammar    -> course path of the 10 existing modules, plus Endless Train
    ├── Vocab      -> "coming soon" in project #1 (see project #2)
    ├── Translation-> "coming soon"
    └── (more later)
```

Independent should also have **recents** (recently practiced items). Nothing like this exists yet, so it needs designing.

## Projects, in agreed order

1. **Student redesign and navigation (this task).** New visual style, Class / Independent structure, Class page, Independent > Grammar as a course path. Restyles and reorganizes existing features only. Vocab and Translation appear in the nav as "coming soon".
2. **Independent vocab.** Class sets (practice your teacher's lists on your own), your own sets, and import from Quizlet. New tables, RLS and a set editor. Quizlet has no public API, so import is **paste-based**: the user pastes Quizlet's Export text (`term<TAB>definition` per line), the way Anki does it.
3. **Library** of ready-made vocab sets. Later.
4. **Translation.** Later.

## Open questions for project #1 (ask one at a time)

- Can a logged-out visitor use Independent (as today's solo mode allows), with Class showing "join a class / sign in"? Or does the app now assume an account?
- What goes in "recents", and where is it stored? (Solo progress is in localStorage today; class data is in Supabase.)
- Course path details: is it a linear path with unlocking, or are all modules open with progress shown? Does it look the same on mobile?
- Does the light theme replace the theme toggle, or does dark mode stay as an option?

## Repo pointers

- React + TypeScript + Vite. `HashRouter` in `src/App.tsx`. Classroom routes only exist when `hasBackend` is true (`src/lib/supabase.ts`).
- Solo home: `src/features/solo/` (`SoloHome.tsx`, `ModuleMap.tsx`, `ModuleIntro.tsx`, `EndlessModal.tsx`, `progressStore.ts`, `useTheme.ts`).
- Drill and question UI: `src/features/drill/`.
- Student screens: `src/features/student/` (`MyAssignments.tsx`, `RunAssignment.tsx`, `TestRunner.tsx`, `AttemptResult.tsx`).
- Auth screens: `src/features/auth/`.
- CSS: about 1,100 lines total under `src/`.
- Tests: `npm test` (Vitest), `npx playwright test` (e2e, solo).

## Deployment status (separate from the redesign, still pending)

- GitHub Pages works: `main` builds to the `gh-pages` branch. The live site is the new React app, but in **solo mode** because no Supabase backend is configured. That's why it looks like the old 10-module site.
- [lionlife1/Latin-Trainer#1](https://github.com/lionlife1/Latin-Trainer/pull/1) is merged into `main`. The branch `claude/peaceful-cerf-0q8ink` has one unmerged docs commit (a setup guide) with no PR.
- Classroom backend still to do: create a **new** Supabase project (don't reuse "Competition Productivity": it holds another app's tables, including a clashing `attempts` table; the free plan allows one more project). Then apply the migrations, load `seed.sql`, deploy the `student-join`, `student-login` and `reset-pin` edge functions, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the Pages build. The Supabase connector can do all of that except setting the GitHub Actions Variables, the Auth Site URL and the rate limits, which the user does in the dashboards.
- Unanswered: the new project's name and region (suggested `latin-trainer`, `us-east-1`), and whether to put the keys in GitHub Variables or hardcode them in `.github/workflows/pages.yml`.

## User preferences

- Ask clarifying questions rather than assume. Be direct and push back when something seems off.
- Use few em dashes in writing meant for the user to reuse.
- Suggest a new chat when it would save a lot of tokens.
