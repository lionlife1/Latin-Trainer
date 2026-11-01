-- LatinIQ classroom schema.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  display_name text not null default '',
  created_at timestamptz not null default now()
);

-- Every new auth user gets a profile. Only an explicit 'teacher' role in sign-up metadata makes a teacher.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id,
          case when new.raw_user_meta_data ->> 'role' = 'teacher' then 'teacher' else 'student' end,
          coalesce(left(btrim(new.raw_user_meta_data ->> 'display_name'), 80), ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6 chars, no ambiguous I/L/O/0/1.
create function public.gen_join_code() returns text language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '')
  from generate_series(1, 6)
$$;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  join_code text not null unique check (join_code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$'),
  created_at timestamptz not null default now()
);
create index classes_teacher_idx on public.classes (teacher_id);

create function public.classes_set_join_code() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.join_code is null then
    loop
      new.join_code := public.gen_join_code();
      exit when not exists (select 1 from public.classes where join_code = new.join_code);
    end loop;
  end if;
  return new;
end $$;
create trigger classes_join_code before insert on public.classes
  for each row execute function public.classes_set_join_code();

create table public.enrollments (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  name_key text generated always as (lower(display_name)) stored,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id),
  unique (class_id, name_key)
);
create index enrollments_student_idx on public.enrollments (student_id);

create table public.modules (
  id text primary key,
  badge text not null,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  concepts jsonb not null default '[]',
  sort int not null default 0
);

create table public.questions (
  id text primary key,
  module_id text not null references public.modules (id) on delete cascade,
  position int not null default 0,
  type text not null check (type in ('typein', 'mc')),
  badge text not null,
  prompt text not null,
  hint text,
  answers jsonb,
  choices jsonb,
  correct text,
  explanation text,
  check ((type = 'typein' and answers is not null) or (type = 'mc' and choices is not null and correct is not null))
);
create index questions_module_idx on public.questions (module_id, position);

create table public.lexicon (
  id bigint generated always as identity primary key,
  owner_id uuid references public.profiles (id) on delete cascade, -- null = built-in
  headword text not null check (char_length(headword) between 1 and 120),
  lemma text not null,
  definition text not null check (char_length(definition) between 1 and 200),
  pos text not null default '',
  frequency int
);
create index lexicon_owner_idx on public.lexicon (owner_id);
create index lexicon_lemma_idx on public.lexicon (lower(lemma));

create table public.vocab_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
create index vocab_lists_owner_idx on public.vocab_lists (owner_id);

create table public.vocab_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.vocab_lists (id) on delete cascade,
  lexicon_id bigint not null references public.lexicon (id) on delete cascade,
  definition_override text check (definition_override is null or char_length(definition_override) between 1 and 200),
  position int not null default 0,
  unique (list_id, lexicon_id)
);
create index vocab_list_items_lexicon_idx on public.vocab_list_items (lexicon_id);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  mode text not null check (mode in ('practice', 'test')),
  source jsonb not null,
  question_count int not null check (question_count > 0),
  due_at timestamptz,
  time_limit_sec int check (time_limit_sec is null or time_limit_sec > 0),
  max_attempts int check (max_attempts is null or max_attempts > 0),
  reveal_answers boolean not null default true,
  created_at timestamptz not null default now()
);
create index assignments_class_idx on public.assignments (class_id);

-- Snapshot of every candidate question, answers included. Never readable by students.
create table public.assignment_pool (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  item_key text not null,
  question jsonb not null,
  unique (assignment_id, item_key)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score int,
  total int not null,
  is_late boolean not null default false,
  over_time boolean not null default false
);
create index attempts_assignment_student_idx on public.attempts (assignment_id, student_id);
create index attempts_student_idx on public.attempts (student_id);

create table public.attempt_items (
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  position int not null,
  pool_id uuid not null references public.assignment_pool (id) on delete cascade,
  primary key (attempt_id, position),
  unique (attempt_id, pool_id)
);
create index attempt_items_pool_idx on public.attempt_items (pool_id);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  pool_id uuid not null references public.assignment_pool (id) on delete cascade,
  given text not null default '',
  correct boolean not null,
  ms int,
  created_at timestamptz not null default now(),
  unique (attempt_id, pool_id)
);
create index responses_pool_idx on public.responses (pool_id);
