-- Grading and classroom RPCs. All security definer: they enforce their own access checks.

-- Must match normalize() in src/lib/grading.ts (fixture: tests/fixtures/normalize.json).
create function public.latin_normalize(t text) returns text
language sql immutable parallel safe as $$
  select btrim(regexp_replace(
    lower(translate(normalize(coalesce(t, ''), NFC), 'ĀĒĪŌŪȲāēīōūȳ', 'aeiouyaeiouy')),
    '[\s ]+', ' ', 'g'))
$$;

create function public.grade_item(q jsonb, given text) returns boolean
language sql immutable as $$
  select case q ->> 'type'
    when 'mc' then public.latin_normalize(given) = public.latin_normalize(q ->> 'correct')
    else exists (select 1 from jsonb_array_elements_text(coalesce(q -> 'answers', '[]')) a
                 where public.latin_normalize(a) = public.latin_normalize(given))
  end and public.latin_normalize(given) <> ''
$$;

-- Starts (or resumes the open) attempt and samples its questions.
create function public.start_attempt(p_assignment_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  a assignments;
  open_id uuid;
  used int;
  pool_n int;
  n int;
  att uuid;
begin
  select * into a from assignments where id = p_assignment_id;
  if not found or not is_enrolled(a.class_id) then
    raise exception 'not enrolled in this class' using errcode = '42501';
  end if;

  select id into open_id from attempts
  where assignment_id = a.id and student_id = auth.uid() and submitted_at is null
  order by started_at desc limit 1;
  if open_id is not null then return open_id; end if;

  if a.max_attempts is not null then
    select count(*) into used from attempts where assignment_id = a.id and student_id = auth.uid();
    if used >= a.max_attempts then
      raise exception 'no attempts left' using errcode = 'P0001';
    end if;
  end if;

  select count(*) into pool_n from assignment_pool where assignment_id = a.id;
  if pool_n = 0 then raise exception 'assignment has no questions' using errcode = 'P0001'; end if;
  n := least(a.question_count, pool_n);

  insert into attempts (assignment_id, student_id, total) values (a.id, auth.uid(), n) returning id into att;
  insert into attempt_items (attempt_id, position, pool_id)
  select att, (row_number() over ()) - 1, s.id
  from (select id from assignment_pool where assignment_id = a.id order by random() limit n) s;
  return att;
end $$;

-- Questions for an attempt. Test answers are stripped unless reveal_answers and the student can't retake.
create function public.get_attempt_items(p_attempt_id uuid)
returns table (pool_id uuid, "position" int, question jsonb)
language plpgsql stable security definer set search_path = public as $$
declare
  t attempts;
  a assignments;
  reveal boolean;
begin
  select * into t from attempts where id = p_attempt_id;
  if not found then raise exception 'attempt not found' using errcode = '42501'; end if;
  select * into a from assignments where id = t.assignment_id;
  if t.student_id <> auth.uid() and not is_class_teacher(a.class_id) then
    raise exception 'not your attempt' using errcode = '42501';
  end if;
  -- Test answers are revealed only when the student can no longer retake (attempts used up or due date
  -- passed); otherwise a student could submit blank, read the answers and retake.
  reveal := a.mode = 'practice' or is_class_teacher(a.class_id) or (
    t.submitted_at is not null and a.reveal_answers and (
      coalesce(now() > a.due_at, false)
      or (a.max_attempts is not null and
          (select count(*) from attempts x where x.assignment_id = a.id and x.student_id = t.student_id) >= a.max_attempts)));
  return query
    select i.pool_id, i.position,
           case when reveal then p.question else p.question - 'answers' - 'correct' - 'explanation' end
    from attempt_items i join assignment_pool p on p.id = i.pool_id
    where i.attempt_id = p_attempt_id
    order by i.position;
end $$;

create function public.own_open_attempt(p_attempt_id uuid, p_mode text) returns attempts
language plpgsql stable security definer set search_path = public as $$
declare
  t attempts;
begin
  select * into t from attempts where id = p_attempt_id;
  if not found or t.student_id <> auth.uid() then
    raise exception 'not your attempt' using errcode = '42501';
  end if;
  if (select mode from assignments where id = t.assignment_id) <> p_mode then
    raise exception 'attempt is not a % attempt', p_mode using errcode = 'P0001';
  end if;
  if t.submitted_at is not null then
    raise exception 'attempt already submitted' using errcode = 'P0001';
  end if;
  return t;
end $$;

-- Practice: graded on the server too; the first answer to an item counts.
create function public.record_practice_response(p_attempt_id uuid, p_pool_id uuid, p_given text, p_ms int)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  q jsonb;
  ok boolean;
begin
  perform own_open_attempt(p_attempt_id, 'practice');
  select p.question into q from attempt_items i join assignment_pool p on p.id = i.pool_id
  where i.attempt_id = p_attempt_id and i.pool_id = p_pool_id;
  if q is null then raise exception 'item not in attempt' using errcode = 'P0001'; end if;
  ok := grade_item(q, p_given);
  insert into responses (attempt_id, pool_id, given, correct, ms)
  values (p_attempt_id, p_pool_id, left(coalesce(p_given, ''), 500), ok, p_ms)
  on conflict (attempt_id, pool_id) do nothing;
  return (select correct from responses where attempt_id = p_attempt_id and pool_id = p_pool_id);
end $$;

create function public.finish_practice(p_attempt_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t attempts;
  s int;
begin
  select * into t from attempts where id = p_attempt_id;
  if not found or t.student_id <> auth.uid() then
    raise exception 'not your attempt' using errcode = '42501';
  end if;
  if t.submitted_at is null then
    perform own_open_attempt(p_attempt_id, 'practice');
    select count(*) into s from responses where attempt_id = p_attempt_id and correct;
    update attempts set submitted_at = now(), score = s,
      is_late = coalesce(now() > (select due_at from assignments where id = t.assignment_id), false)
    where id = p_attempt_id returning * into t;
  end if;
  return jsonb_build_object('score', t.score, 'total', t.total, 'is_late', t.is_late);
end $$;

-- Test: one submission, graded here. p_responses: [{pool_id, given, ms}]
create function public.submit_test(p_attempt_id uuid, p_responses jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t attempts;
  a assignments;
  s int;
begin
  t := own_open_attempt(p_attempt_id, 'test');
  select * into a from assignments where id = t.assignment_id;

  insert into responses (attempt_id, pool_id, given, correct, ms)
  select p_attempt_id, i.pool_id, left(coalesce(r.given, ''), 500), grade_item(p.question, r.given), r.ms
  from attempt_items i
  join assignment_pool p on p.id = i.pool_id
  left join lateral (
    select e ->> 'given' as given, nullif(e ->> 'ms', '')::int as ms
    from jsonb_array_elements(coalesce(p_responses, '[]')) e
    where (e ->> 'pool_id')::uuid = i.pool_id
    limit 1
  ) r on true
  where i.attempt_id = p_attempt_id;

  select count(*) into s from responses where attempt_id = p_attempt_id and correct;
  update attempts set
    submitted_at = now(),
    score = s,
    is_late = coalesce(now() > a.due_at, false),
    over_time = a.time_limit_sec is not null
                and now() > t.started_at + make_interval(secs => a.time_limit_sec + 30)
  where id = p_attempt_id returning * into t;
  return jsonb_build_object('score', t.score, 'total', t.total, 'is_late', t.is_late, 'over_time', t.over_time);
end $$;

create function public.gradebook(p_class_id uuid)
returns table (student_id uuid, display_name text, assignment_id uuid, best_score int, total int,
               attempts int, last_submitted_at timestamptz, any_late boolean, latest_attempt_id uuid)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'not your class' using errcode = '42501';
  end if;
  return query
    select e.student_id, e.display_name, a.id,
           max(t.score)::int, max(t.total)::int, count(t.id)::int, max(t.submitted_at),
           coalesce(bool_or(t.is_late or t.over_time), false),
           (array_agg(t.id order by t.submitted_at desc) filter (where t.id is not null))[1]
    from enrollments e
    cross join assignments a
    left join attempts t on t.assignment_id = a.id and t.student_id = e.student_id and t.submitted_at is not null
    where e.class_id = p_class_id and a.class_id = p_class_id
    group by e.student_id, e.display_name, a.id;
end $$;

create function public.item_analysis(p_assignment_id uuid)
returns table (pool_id uuid, item_key text, question jsonb, n int, pct_correct int, top_wrong jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_class_teacher(assignment_class(p_assignment_id)) then
    raise exception 'not your assignment' using errcode = '42501';
  end if;
  return query
    select p.id, p.item_key, p.question,
           count(r.id)::int,
           case when count(r.id) = 0 then null
                else round(100.0 * count(r.id) filter (where r.correct) / count(r.id))::int end,
           coalesce((
             select jsonb_agg(jsonb_build_object('answer', w.g, 'count', w.c) order by w.c desc, w.g)
             from (select latin_normalize(r2.given) g, count(*)::int c
                   from responses r2 join attempts t2 on t2.id = r2.attempt_id and t2.submitted_at is not null
                   where r2.pool_id = p.id and not r2.correct and latin_normalize(r2.given) <> ''
                   group by 1 order by 2 desc, 1 limit 3) w), '[]'::jsonb)
    from assignment_pool p
    left join (responses r join attempts t on t.id = r.attempt_id and t.submitted_at is not null) on r.pool_id = p.id
    where p.assignment_id = p_assignment_id
    group by p.id;
end $$;

-- Service-role only: used by the student-join / student-login edge functions.
create function public.join_class_as(p_student_id uuid, p_join_code text, p_display_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  c uuid;
  nm text := btrim(p_display_name);
begin
  select id into c from classes where join_code = upper(btrim(p_join_code));
  if c is null then raise exception 'unknown class code' using errcode = 'P0002'; end if;
  insert into profiles (id, role, display_name) values (p_student_id, 'student', nm)
    on conflict (id) do update set display_name = excluded.display_name where profiles.role = 'student';
  insert into enrollments (class_id, student_id, display_name) values (c, p_student_id, nm);
  return c;
end $$;

create function public.student_email_for(p_join_code text, p_display_name text) returns text
language sql stable security definer set search_path = public as $$
  select u.email from enrollments e
  join classes c on c.id = e.class_id
  join auth.users u on u.id = e.student_id
  where c.join_code = upper(btrim(p_join_code)) and e.name_key = lower(btrim(p_display_name))
$$;

-- Function privileges: revoke platform defaults, then grant deliberately.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.latin_normalize(text), public.grade_item(jsonb, text) to anon, authenticated;
grant execute on function
  public.is_teacher(), public.is_class_teacher(uuid), public.is_enrolled(uuid), public.assignment_class(uuid),
  public.attempt_visible(uuid), public.teacher_owns_student(uuid),
  public.start_attempt(uuid), public.get_attempt_items(uuid), public.record_practice_response(uuid, uuid, text, int),
  public.finish_practice(uuid), public.submit_test(uuid, jsonb), public.gradebook(uuid), public.item_analysis(uuid)
  to authenticated;
grant execute on function public.join_class_as(uuid, text, text), public.student_email_for(text, text) to service_role;
revoke execute on function public.own_open_attempt(uuid, text), public.handle_new_user(),
  public.gen_join_code(), public.classes_set_join_code() from public, anon, authenticated;
