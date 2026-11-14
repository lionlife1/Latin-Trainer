# Student Redesign and Practice Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the student side as a light Quizlet-style app with Class / Practice navigation, a grammar course path, recent sessions, and session sync to Supabase.

**Architecture:** A local session log (`latiniq_sessions`) becomes the source for recents, best scores and rebuilt progress. A sync module pushes and pulls it against a new `practice_sessions` table. New `StudentShell` and `src/features/practice/` pages replace `SoloHome`. The CSS tokens are rewritten in place, with old names aliased for teacher screens.

**Tech Stack:** React 18, TypeScript, Vite, react-router-dom 6 (HashRouter), supabase-js 2, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-01-student-redesign-design.md`

## Global Constraints

- No emoji and no decorative arrows (→ ← ⚡ 🔥 🏆 💡 🔒 ↺ ☀️ 🌙) in student-facing strings. Icons come from `src/components/icons.tsx`.
- Sentence case everywhere. No all-caps display text, except small 12px tracked labels.
- Font: Figtree 400/500/600/700, Google Fonts only.
- Light theme only. Tokens are on `:root`. Old token names stay as aliases.
- Tabs move to a bottom bar below 640px. No horizontal scroll at 375px.
- Session log cap is 200 entries. Server XP check is `0..1000`.
- localStorage keys: `latiniq_sessions` and `latiniq_imported` (new). `latiniq_progress`, `latiniq_streak` and `latiniq_xp` (existing) stay.
- Classroom routes and the Class tab exist only when `hasBackend`.

## Review Focus

- A drill finished while the network is down: the session stays `synced: false` and is pushed on the next sync (sync test "failed push leaves sessions unsynced").
- The same session pushed twice, from two tabs or a retry: no duplicate rows. Upsert by id with ignoreDuplicates (sync test "push is idempotent").
- A legacy learner with completed modules but no log: they keep completed status and XP after the rebuild (sync test "legacy import preserves progress").
- Endless Train exited before answering anything: no session is recorded (EndlessRoute test).
- A streak with a gap: the count resets, and a last session yesterday still counts (rebuild test "streak").

---

### Task 1: Session log

**Files:** Create `src/features/practice/sessionLog.ts` and `src/features/practice/sessionLog.test.ts`.

**Interfaces (produces):**
- `type PracticeSession` (spec shape)
- `loadSessions(): PracticeSession[]` (newest first)
- `saveSessions(s: PracticeSession[]): void` (sorts newest first, caps at 200, drops the oldest synced entries first)
- `appendSession(s: Omit<PracticeSession,'id'|'synced'|'finished_at'> & Partial<Pick<PracticeSession,'finished_at'>>): PracticeSession`
- `mergeSessions(local, remote): PracticeSession[]` (by id; a remote copy marks it synced)
- `recentSessions(n = 5)`
- `bestScores(sessions): Record<string, number>` (module_id → best %)

- [ ] Tests: append assigns an id and `synced:false`. Cap keeps 200, and unsynced entries survive over older synced ones. Merge dedupes by id. bestScores picks the max %. Corrupt JSON gives `[]`.
- [ ] Implement, run `npx vitest run src/features/practice/sessionLog.test.ts`, then commit.

### Task 2: Progress rebuild and recordSession logging

**Files:** Modify `src/features/solo/progressStore.ts` and its test.

**Interfaces:**
- `recordSession` also calls `appendSession({kind:'module', module_id, correct, total, xp: earnedXP, completed})`.
- `rebuildFromSessions(sessions: PracticeSession[], today = todayISO()): void` writes progress (completed flags; keeps existing `wrong_ids`), per-module XP, total XP and the streak.
- `streakFrom(dates: string[], today: string): Streak`
- `legacyImports(progress: Progress, sessions): PracticeSession-input[]` (one `import` entry per completed module that has no completed session)

- [ ] Tests: recordSession appends one log entry. Rebuild: completed if any completed session, XP sum, streak 3 for today/yesterday/day-before, a streak ending yesterday counts, a gap resets to the run ending last. legacyImports skips modules already covered.
- [ ] Implement, run the tests, commit.

### Task 3: Migration and RLS tests

**Files:** Create `supabase/migrations/20261101152412_practice_sessions.sql`. Modify `supabase/tests/rls.test.sql`.

- [ ] SQL exactly as in the spec, plus RLS enabled, `practice_sessions_select` / `practice_sessions_insert` policies `to authenticated` on `user_id = auth.uid()`, and `grant select, insert on public.practice_sessions to authenticated`.
- [ ] RLS tests: s1 inserts own row (ok), s1 inserts with user_id s2 (throws), s2 sees 0 of s1's rows, s1 update/delete affects 0 rows.
- [ ] Verify against the hosted project in Task 10 (no local Postgres here). Commit.

### Task 4: Sync

**Files:** Create `src/features/practice/sync.ts`, `sync.test.ts`, `useSessionSync.ts`.

**Interfaces:**
- `syncSessions(sb: SupabaseClient, userId: string): Promise<void>`. Runs the legacy import once (`latiniq_imported`), then push (upsert unsynced, `onConflict:'id', ignoreDuplicates:true`, then mark synced), pull (last 200 for the user), merge, and `rebuildFromSessions`. Errors are caught and warned.
- `useSessionSync()` calls `syncSessions` when `useAuth().session` user id changes. It exports `requestSync()` for after-drill triggers (a module-level listener).

- [ ] Tests with a fake client: push sends only unsynced rows without the `synced` field, a failed push leaves them unsynced, push is idempotent (a second run sends nothing), pull merges remote rows, legacy import preserves progress, the import runs once.
- [ ] Implement, test, commit.

### Task 5: Visual system and shell

**Files:** Rewrite `src/styles/global.css` and update `src/styles/classroom.css` and `index.html`. Create `src/components/icons.tsx` and `src/components/StudentShell.tsx` (+ test). Modify `src/components/AppHeader.tsx` (drop the theme toggle). Delete `src/features/solo/useTheme.ts`.

**Interfaces:** `StudentShell({children})`. `icons`: `Check, ChevronRight, Close, Flame, Book, Users, Bolt` as components taking `{size?: number}`.

- [ ] Shell test: logged out shows a "Sign in" link and a Practice tab, and Class only when hasBackend. Signed-in shows the display name, and Sign out calls `signOut`.
- [ ] Implement tokens per spec. Keep every class the drill/teacher components use. Commit.

### Task 6: Practice home and grammar path

**Files:** Create `PracticeHome.tsx`, `GrammarPath.tsx`, `relativeDay.ts` (+ tests) in `src/features/practice/`.

**Interfaces:** `relativeDay(iso: string, now = new Date()): string` returns "Today", "Yesterday", "N days ago", or a short date beyond 6 days. `nodeState(mod, progress, best): 'complete' | 'practiced' | 'new'`.

- [ ] Tests: relativeDay boundaries. Path renders 10 nodes, the complete node shows a check label, the practiced node shows the best %, the first incomplete node is marked "Up next". Home shows the empty recents text and 5 rows max, and Vocab/Translation show "Coming soon".
- [ ] Implement, commit.

### Task 7: Module and endless routes, drill restyle

**Files:** Create `ModuleRoute.tsx` and `EndlessRoute.tsx` (+ test). Modify `DrillSession.tsx` (`onExit(results)`), `SessionSummary.tsx`, `Feedback.tsx`, `QuestionCard.tsx`, `ModuleIntro.tsx` and `EndlessModal.tsx` (copy only). Delete `SoloHome.tsx` and `ModuleMap.tsx`.

**Interfaces:** `DrillSession.onExit: (results: DrillResult[]) => void`. ModuleRoute reads `:moduleId`, unknown ids redirect to `/practice/grammar`. On finish it calls `recordSession`, then `updateStreak`, then `requestSync()`.

- [ ] Tests: EndlessRoute exit with 0 answers records nothing, exit after 1 answer appends an endless session. Update existing drill tests for the new copy.
- [ ] Implement, run the full `npm test`, commit.

### Task 8: Class page, class gate, routes

**Files:** Rewrite `src/features/student/MyAssignments.tsx` (+ test). Create `ClassGate.tsx`. Modify `StudentRoutes.tsx`, `src/App.tsx`, and restyle the auth screens' copy.

**Interfaces:** `groupAssignments(rows, now): {overdue, todo, done}` exported from MyAssignments.

- [ ] Tests: grouping (overdue = past due and no best, done = has best, todo sorted by due with nulls last). `/` redirects per role. Logged-out `/s` renders ClassGate.
- [ ] Implement, commit.

### Task 9: E2E and build

- [ ] Rewrite `tests/e2e/solo.spec.ts` per spec (drill and recents, endless, 375px no horizontal scroll).
- [ ] `npm run build && npx playwright test solo`. Check the screenshots by eye. Commit.

### Task 10: Backend and deploy

- [ ] Create the Supabase project `latin-trainer` (us-east-1). Apply all migrations, load `seed.sql`, deploy the three edge functions, run the RLS checks for practice_sessions with `execute_sql` under `set local role authenticated` plus jwt claims.
- [ ] Set the GitHub Actions variables, push the branch, open a PR, and deploy a Vercel preview with the env vars.
