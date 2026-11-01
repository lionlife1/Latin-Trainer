-- Row level security. Writes to attempts/responses happen only through functions in 03.

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.modules enable row level security;
alter table public.questions enable row level security;
alter table public.lexicon enable row level security;
alter table public.vocab_lists enable row level security;
alter table public.vocab_list_items enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_pool enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_items enable row level security;
alter table public.responses enable row level security;

-- Helpers are security definer so policies don't recurse through each other's RLS.
create function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
$$;
create function public.is_class_teacher(p_class_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from classes where id = p_class_id and teacher_id = auth.uid())
$$;
create function public.is_enrolled(p_class_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from enrollments where class_id = p_class_id and student_id = auth.uid())
$$;
create function public.assignment_class(p_assignment_id uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select class_id from assignments where id = p_assignment_id
$$;
create function public.attempt_visible(p_attempt_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from attempts t join assignments a on a.id = t.assignment_id
    join classes c on c.id = a.class_id
    where t.id = p_attempt_id and (t.student_id = auth.uid() or c.teacher_id = auth.uid()))
$$;
create function public.teacher_owns_student(p_student_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from enrollments e join classes c on c.id = e.class_id
    where e.student_id = p_student_id and c.teacher_id = auth.uid())
$$;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.teacher_owns_student(id));

-- classes
create policy classes_select on public.classes for select to authenticated
  using (teacher_id = auth.uid() or public.is_enrolled(id));
create policy classes_insert on public.classes for insert to authenticated
  with check (teacher_id = auth.uid() and public.is_teacher());
create policy classes_update on public.classes for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy classes_delete on public.classes for delete to authenticated
  using (teacher_id = auth.uid());

-- enrollments (students are added by the student-join edge function via join_class_as)
create policy enrollments_select on public.enrollments for select to authenticated
  using (student_id = auth.uid() or public.is_class_teacher(class_id));
create policy enrollments_delete on public.enrollments for delete to authenticated
  using (public.is_class_teacher(class_id));

-- built-in content
create policy modules_read on public.modules for select to anon, authenticated using (true);
create policy questions_read on public.questions for select to anon, authenticated using (true);

-- lexicon: built-in rows public; teachers manage their own custom words
create policy lexicon_select on public.lexicon for select to anon, authenticated
  using (owner_id is null or owner_id = auth.uid());
create policy lexicon_insert on public.lexicon for insert to authenticated
  with check (owner_id = auth.uid() and public.is_teacher());
create policy lexicon_update on public.lexicon for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy lexicon_delete on public.lexicon for delete to authenticated
  using (owner_id = auth.uid());

-- vocab lists
create policy vocab_lists_all on public.vocab_lists for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and public.is_teacher());
create policy vocab_list_items_all on public.vocab_list_items for all to authenticated
  using (exists (select 1 from public.vocab_lists l where l.id = list_id and l.owner_id = auth.uid()))
  with check (exists (select 1 from public.vocab_lists l where l.id = list_id and l.owner_id = auth.uid()));

-- assignments
create policy assignments_select on public.assignments for select to authenticated
  using (public.is_class_teacher(class_id) or public.is_enrolled(class_id));
create policy assignments_write on public.assignments for all to authenticated
  using (public.is_class_teacher(class_id)) with check (public.is_class_teacher(class_id));

-- assignment pool: teachers only
create policy pool_teacher on public.assignment_pool for all to authenticated
  using (public.is_class_teacher(public.assignment_class(assignment_id)))
  with check (public.is_class_teacher(public.assignment_class(assignment_id)));

-- attempts / items / responses: read-only through RLS
create policy attempts_select on public.attempts for select to authenticated
  using (student_id = auth.uid() or public.is_class_teacher(public.assignment_class(assignment_id)));
create policy attempt_items_select on public.attempt_items for select to authenticated
  using (public.attempt_visible(attempt_id));
create policy responses_select on public.responses for select to authenticated
  using (public.attempt_visible(attempt_id));

-- Table privileges (explicit, so behaviour doesn't depend on platform defaults).
revoke all on all tables in schema public from anon, authenticated;
grant select on public.modules, public.questions, public.lexicon to anon;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on public.classes, public.lexicon, public.vocab_lists, public.vocab_list_items,
  public.assignments, public.assignment_pool to authenticated;
grant delete on public.enrollments to authenticated;
