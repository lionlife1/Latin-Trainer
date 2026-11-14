# Student app redesign and navigation (project #1)

Status: design written 2026-11-01. The user delegated every remaining decision ("make all the decisions urself"), so decisions marked **(decided)** were made by Claude and are open to change on review.

## Goal

The student side of LatinIQ should look and work like a real student app: a calm, light, Quizlet-style interface with a Brilliant-style course path, and real navigation built on the split between **Class** (teacher's work) and **Independent** practice. The grading, drill engine and classroom backend stay as they are.

Success means:
- No dark/gold/Cinzel styling, italic serif subtitles or emoji anywhere on student screens.
- On a 375px phone, nothing wraps awkwardly or squashes. The header holds only the logo, nav and account.
- A student can reach their assignments, the grammar course path, Endless Train and their recent sessions in one or two taps.
- Practice done while logged out isn't lost when the student signs in.

## Decisions

| Topic | Decision | Source |
| --- | --- | --- |
| Visual direction | Quizlet-like: light, minimal, clean sans-serif. Brilliant-like course path. No illustrations. | User |
| Logged-out use | Independent practice works logged out. Class shows "join a class / sign in". | User |
| Sync | Logged-out progress and sessions sync to the account on sign-in. Kept inside project #1. | User |
| Recents | Recent practice sessions with scores. | User |
| Course path | All modules open, progress shown. Same single-column vertical path on every screen size. | User |
| Theme | Light only. Toggle removed. Colors are CSS tokens so dark mode can come back later. | User |
| Nav labels | **Class** and **Practice**. "Practice" is the student-facing name for Independent. | (decided) |
| Streak and XP | Kept, shown as a small stat row on the Practice page, not in the header. | (decided) |
| Teacher screens | Not redesigned. They share `global.css`, so they pick up the new tokens (light colors, new font) with no layout changes. | (decided) |
| Font | Figtree from Google Fonts (one family, weights 400/500/600/700). It covers Latin Extended-A, so macrons (ā ē ī ō ū) render. | (decided) |
| Mobile nav | Top bar on wide screens. Below 640px the Class/Practice tabs move to a fixed bottom tab bar. | (decided) |
| Unlocking | Prerequisite locks removed from the solo path (`isUnlocked` no longer gates anything). | Follows from "all open" |

## Information architecture and routes

```
/                       -> redirect: student -> /s, teacher -> /t, else -> /practice
/practice               -> Practice home: stats row, recents, subject cards
/practice/grammar       -> Grammar course path + Endless Train
/practice/grammar/:id   -> module intro -> drill -> summary
/practice/endless       -> Endless Train setup -> drill
/s                      -> Class: assignments (signed-in students)
/s/a/:assignmentId      -> run assignment (unchanged logic)
/s/attempt/:attemptId   -> attempt result (unchanged logic)
/join, /student/login, /teacher/login   -> auth screens, restyled
/t/*                    -> teacher, unchanged apart from inherited tokens
```

- Without a backend (`hasBackend` false) the Class tab is hidden and `/s` routes don't exist, as today.
- With a backend, a logged-out visitor on `/s` sees a **Class gate** ("Join your class" with code entry, plus a "Student sign in" link) instead of being bounced to the login page. A signed-in teacher on `/s` still goes to `/t`.
- Module intro, drill and summary get their own URLs so the browser back button works and the drill is linkable. Drill state stays in component state (reloading mid-drill returns to the intro, which is fine).

## Screens

**App shell (`StudentShell`)**, used by Practice and Class pages:
- Top bar: "LatinIQ" wordmark (sans, weight 700), nav tabs (Class, Practice), and on the right either the student's name with a menu holding "Sign out", or "Sign in" when logged out.
- Below 640px: the top bar keeps the wordmark and account. Tabs move to a bottom bar with text labels and simple inline SVG icons.
- Drill screens hide the shell entirely (full-screen focus mode with a close button), as today.

**Practice home (`/practice`)**
- Heading "Practice" and a stat row: day streak, total XP, modules completed (n/10). Plain numbers with labels, no emoji.
- **Recent sessions**: the last 5 sessions, newest first. Each row shows what was practiced (module title or "Endless Train"), when (relative: "Today", "Yesterday", "3 days ago"), and the score (correct/total and %). Tapping a module session opens that module's intro. Empty state: "Your practice sessions will show up here."
- **Subjects**: cards for Grammar (n/10 complete, opens the path), Vocab ("Coming soon", not clickable) and Translation ("Coming soon").

**Grammar path (`/practice/grammar`)**
- Header row: "Grammar", a one-line description, and an "Endless Train" button.
- A vertical line joins circular nodes, one per module in `MODULES` order. Each node is a 44px circle with the module badge, plus the title, tagline and status to its right.
- Node states: **not started** (outline), **practiced** (filled ring, shows best score %), **complete** (solid fill with a check).
- The first module that isn't complete is marked as "Up next" (a subtle label, not a lock).
- Every node is clickable.

**Module intro, drill, summary**: same content and logic, restyled. The summary drops the trophy and the "Points" stat. It shows correct, wrong and accuracy, plus a plain status line ("Module complete, +X XP" / "Score 70% or more on 10+ questions to complete this module").

**Class (`/s`)**
- Heading "Class" and a summary row: assignments done, average score of done work.
- Grouped lists: **Overdue**, **To do** (in progress and not started, sorted by due date), **Done** (score, "late" tag). Each assignment is a card row with title, mode tag (Practice/Test), due date and a primary action (Start/Resume/Try again) plus a Results link where relevant.
- Same data and action rules as today's `MyAssignments` (best attempt, out-of-attempts logic).

**Auth screens**: centered card on the light background, restyled. Their logic stays the same.

## Visual system

Tokens on `:root` in `global.css`, replacing the old dark set. Old token names that teacher CSS uses (`--gold`, `--bg-card`, `--text-secondary` etc.) are kept as aliases pointing at the new values, so teacher screens don't break.

- Background `#f6f7fb`, surface `#ffffff`, subtle surface `#eef0f6`, border `#dfe3ec`.
- Text `#1c2033`, secondary `#586079`, muted `#8a91a6`.
- Primary `#3b5bdb` (hover `#2f4bc0`, tint `#e8edff`).
- Success `#1f9d55` / tint `#e3f6eb`. Error `#d6404a` / tint `#fdecee`. Warning `#b7791f` / tint `#fdf3e1`.
- Radius 8px (controls), 12px (cards). Shadow `0 1px 2px rgba(16,24,40,.06)`, no glow effects.
- Type scale: 28/22/18/16/14/13px, sentence case everywhere (no all-caps display text, apart from small 12px tracked labels).
- Latin answers and prompts use the same font. Monospace is dropped.
- Emoji and decorative arrows are removed from all student-facing strings. Icons are small inline SVGs in `src/components/icons.tsx`.

## Data: session log and sync

### Local session log (all users)

New module `src/features/practice/sessionLog.ts`, stored under localStorage key `latiniq_sessions`:

```ts
interface PracticeSession {
  id: string;            // crypto.randomUUID(), doubles as the sync key
  kind: 'module' | 'endless' | 'import';
  module_id: string | null;
  correct: number;
  total: number;
  xp: number;            // XP earned by this session (0 if it didn't qualify)
  completed: boolean;    // did this session mark the module complete
  finished_at: string;   // ISO timestamp
  synced: boolean;       // false until the server has it
}
```

- `recordSession` in `progressStore.ts` keeps its completion and XP rules and also appends a `PracticeSession`. Endless Train appends a session when the student exits after answering at least one question (`kind: 'endless'`, xp 0).
- The log is capped at 200 entries locally (oldest synced ones dropped first).
- Recents and best-score-per-module come from this log.

### Server table

Migration `20261101152412_practice_sessions.sql`:

```sql
create table public.practice_sessions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('module', 'endless', 'import')),
  module_id text references public.modules (id) on delete set null,
  correct int not null check (correct >= 0),
  total int not null check (total >= 0 and correct <= total),
  xp int not null default 0 check (xp >= 0 and xp <= 1000),
  completed boolean not null default false,
  finished_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index practice_sessions_user_finished on public.practice_sessions (user_id, finished_at desc);
```

RLS: authenticated users can `select` and `insert` only rows where `user_id = auth.uid()`. No update or delete policies. Teachers get no access to students' independent practice in this project.

### Sync rules

`src/features/practice/sync.ts`, run when a session with a profile appears (sign-in or page load while signed in) and after each recorded session while signed in:

1. **Push**: upsert every local session with `synced: false` (`onConflict: id`, `ignoreDuplicates`), then mark them synced. Failures leave them unsynced for next time. Nothing blocks the UI.
2. **Legacy import**: if local `latiniq_progress` has completed modules with no matching `completed` session in the log, create one `kind: 'import'` session per such module carrying that module's stored XP, before pushing. This runs once per device (flag `latiniq_imported`).
3. **Pull**: fetch the user's last 200 sessions and merge them into the local log by `id`.
4. **Rebuild**: recompute local progress from the merged log. A module is complete if any session for it has `completed: true`. Total XP is the sum of session XP. Streak counts consecutive days ending today or yesterday that have at least one session. `wrong_ids` stay local and untouched.

Effect: practice done logged out appears in the account after sign-in, and a student signing in on a new device sees their history and progress. Signing out leaves the local log in place (it's the device's own practice), matching how solo progress already works.

XP is capped per row (1000) as a basic sanity check. The client is trusted for practice scores, as solo mode already is. Independent practice doesn't affect grades.

## Code structure

- `src/components/StudentShell.tsx` (new): top bar, tabs, bottom bar, account menu. `AppHeader` loses the theme toggle and becomes the teacher header only.
- `src/components/icons.tsx` (new): inline SVG icons.
- `src/features/practice/` (new): `PracticeHome.tsx`, `GrammarPath.tsx`, `ModuleRoute.tsx` (intro, drill, summary for one module), `EndlessRoute.tsx`, `sessionLog.ts`, `sync.ts`, `useSessionSync.ts`, `relativeDay.ts`.
- `src/features/solo/`: `progressStore.ts` stays (gains log writes and a rebuild function). `ModuleIntro.tsx` and `EndlessModal.tsx` are restyled and reused. `SoloHome.tsx`, `ModuleMap.tsx` and `useTheme.ts` are deleted.
- `src/features/student/MyAssignments.tsx`: rewritten as the grouped Class page. `ClassGate.tsx` (new).
- `src/App.tsx`: new routes and the `/` redirect.
- `src/styles/global.css`: rewritten for the new system. `classroom.css` updated to the new tokens.
- `index.html`: load Figtree only. Title "LatinIQ".

## Error handling

- Sync failures are silent apart from a console warning. Sessions stay `synced: false` and retry on the next trigger.
- Corrupt localStorage JSON falls back to empty, as `readJSON` already does.
- Class page load errors show the existing inline error text, restyled.

## Testing

- Unit (Vitest): `sessionLog` (append, cap, recents, best score), `sync` (push/pull/merge/import/rebuild with a fake Supabase client), streak rebuild, `relativeDay`, `GrammarPath` node states, `PracticeHome` recents and empty state, Class grouping, `StudentShell` signed-in vs signed-out, route redirects.
- Existing tests are updated where copy changes.
- E2E (Playwright, solo): rewritten `solo.spec.ts`: open Grammar from Practice, run a 5-question drill, return to the path, see the session in recents; Endless Train runs; a 375px viewport has no horizontal scroll.
- SQL: add `practice_sessions` RLS cases to `supabase/tests/rls.test.sql` (own rows only, can't insert for another user, no update/delete).

## Out of scope

Teacher screen redesign, vocab sets (project #2), library, translation, dark mode, teachers seeing independent practice.
