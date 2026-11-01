-- Independent practice history, synced from each device's local session log.
-- id comes from the client so repeated pushes of the same session are no-ops.
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

alter table public.practice_sessions enable row level security;

-- Own rows only. No update or delete: the log is append-only.
create policy practice_sessions_select on public.practice_sessions for select to authenticated
  using (user_id = (select auth.uid()));
create policy practice_sessions_insert on public.practice_sessions for insert to authenticated
  with check (user_id = (select auth.uid()));

revoke all on public.practice_sessions from anon, authenticated;
grant select, insert on public.practice_sessions to authenticated;
