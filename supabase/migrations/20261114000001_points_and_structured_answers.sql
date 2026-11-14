-- Teacher tools phase 2: per-item points, structured (grid / parse) answers, fractional scores.
-- Additive: old clients keep working (text `given`, record_practice_response, submit_test with string given).

alter table public.assignment_pool add column points numeric(8,2) not null default 1 check (points > 0);

alter table public.responses
  add column given_json jsonb,
  add column earned numeric(8,2),
  add column possible numeric(8,2),
  add column parts jsonb;
update public.responses set given_json = to_jsonb(given), earned = correct::int, possible = 1;

alter table public.attempts
  alter column score type numeric(8,2),
  alter column total type numeric(8,2);

-- SQL twin of grade() in src/lib/grading.ts. Returns {"right", "outOf", "parts": [{"id", "ok"}]}.
create function public.grade_parts(q jsonb, given jsonb) returns jsonb
language plpgsql immutable as $$
declare
  t text := q ->> 'type';
  parts jsonb := '[]';
  g jsonb := coalesce(given, 'null'::jsonb);
  is_obj boolean := jsonb_typeof(coalesce(given, 'null'::jsonb)) = 'object';
  ok boolean;
  cell text;
  accepted jsonb;
  k jsonb;
  best int := -1;
  cand jsonb;
  n int;
  f jsonb;
  v jsonb;
begin
  if t = 'grid' then
    -- one part per key cell, in row order (key cells not found in the rows go last, by id)
    for cell in
      select ks.key
      from jsonb_object_keys(coalesce(q -> 'key', '{}')) ks(key)
      left join (
        select c.value ->> 'id' as id, min(r.ord * 10000 + c.ord) as pos
        from jsonb_array_elements(coalesce(q -> 'rows', '[]')) with ordinality r(value, ord),
             jsonb_array_elements(coalesce(r.value -> 'cells', '[]')) with ordinality c(value, ord)
        group by 1
      ) o on o.id = ks.key
      order by o.pos nulls last, ks.key
    loop
      accepted := q -> 'key' -> cell;
      ok := is_obj
        and jsonb_typeof(g -> cell) = 'string'
        and latin_normalize(g ->> cell) <> ''
        and jsonb_typeof(accepted) = 'array'
        and exists (select 1 from jsonb_array_elements_text(accepted) a
                    where jsonb_typeof(accepted) = 'array' and latin_normalize(a) = latin_normalize(g ->> cell));
      parts := parts || jsonb_build_object('id', cell, 'ok', coalesce(ok, false));
    end loop;
  elsif t = 'parse' then
    -- the valid parse that matches the most fields wins (first on ties)
    cand := (select coalesce(jsonb_agg(jsonb_build_object('id', fl.value ->> 'id', 'ok', false) order by fl.ord), '[]')
             from jsonb_array_elements(coalesce(q -> 'fields', '[]')) with ordinality fl(value, ord));
    parts := cand;
    if is_obj and jsonb_typeof(q -> 'key') = 'array' then
      for k in select value from jsonb_array_elements(q -> 'key') loop
        cand := (select coalesce(jsonb_agg(jsonb_build_object('id', fl.value ->> 'id', 'ok',
                   jsonb_typeof(g -> (fl.value ->> 'id')) = 'string'
                   and g ->> (fl.value ->> 'id') <> ''
                   and g ->> (fl.value ->> 'id') is not distinct from k ->> (fl.value ->> 'id')) order by fl.ord), '[]')
                 from jsonb_array_elements(coalesce(q -> 'fields', '[]')) with ordinality fl(value, ord));
        n := (select count(*) from jsonb_array_elements(cand) p where (p.value ->> 'ok')::boolean)::int;
        if n > best then best := n; parts := cand; end if;
      end loop;
    end if;
  else
    -- mc, typein and anything else: one part, as grade_item
    if jsonb_typeof(g) = 'string' and latin_normalize(g #>> '{}') <> '' then
      if t = 'mc' then
        ok := latin_normalize(g #>> '{}') = latin_normalize(q ->> 'correct');
      else
        ok := exists (select 1 from jsonb_array_elements_text(
                        case when jsonb_typeof(q -> 'answers') = 'array' then q -> 'answers' else '[]'::jsonb end) a
                      where latin_normalize(a) = latin_normalize(g #>> '{}'));
      end if;
    end if;
    parts := jsonb_build_array(jsonb_build_object('id', 'answer', 'ok', coalesce(ok, false)));
  end if;

  return jsonb_build_object(
    'right', (select count(*) from jsonb_array_elements(parts) p where (p.value ->> 'ok')::boolean)::int,
    'outOf', jsonb_array_length(parts),
    'parts', parts);
end $$;

create or replace function public.start_attempt(p_assignment_id uuid) returns uuid
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

  insert into attempts (assignment_id, student_id, total) values (a.id, auth.uid(), 0) returning id into att;
  insert into attempt_items (attempt_id, position, pool_id)
  select att, (row_number() over ()) - 1, s.id
  from (select id from assignment_pool where assignment_id = a.id order by random() limit n) s;
  update attempts set total = (select coalesce(sum(p.points), 0)
                               from attempt_items i join assignment_pool p on p.id = i.pool_id
                               where i.attempt_id = att)
  where id = att;
  return att;
end $$;

drop function public.get_attempt_items(uuid);
create function public.get_attempt_items(p_attempt_id uuid)
returns table (pool_id uuid, "position" int, question jsonb, points numeric)
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
           case when reveal then p.question
                else p.question - 'answers' - 'correct' - 'explanation' - 'key' end,
           p.points
    from attempt_items i join assignment_pool p on p.id = i.pool_id
    where i.attempt_id = p_attempt_id
    order by i.position;
end $$;

-- Practice: graded on the server; the first answer to an item counts.
create function public.record_practice_response_v2(p_attempt_id uuid, p_pool_id uuid, p_given jsonb, p_ms int)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  q jsonb;
  pts numeric;
  g jsonb;
  gj jsonb := coalesce(p_given, 'null'::jsonb);
  r responses;
begin
  perform own_open_attempt(p_attempt_id, 'practice');
  select p.question, p.points into q, pts
  from attempt_items i join assignment_pool p on p.id = i.pool_id
  where i.attempt_id = p_attempt_id and i.pool_id = p_pool_id;
  if q is null then raise exception 'item not in attempt' using errcode = 'P0001'; end if;
  g := grade_parts(q, gj);
  insert into responses (attempt_id, pool_id, given, given_json, correct, earned, possible, parts, ms)
  values (p_attempt_id, p_pool_id,
          case when jsonb_typeof(gj) = 'string' then left(gj #>> '{}', 500) else '' end,
          gj,
          (g ->> 'right')::int = (g ->> 'outOf')::int,
          case when (g ->> 'outOf')::int = 0 then 0
               else round(pts * (g ->> 'right')::int / (g ->> 'outOf')::int, 2) end,
          pts, g -> 'parts', p_ms)
  on conflict (attempt_id, pool_id) do nothing;
  select * into r from responses where attempt_id = p_attempt_id and pool_id = p_pool_id;
  return jsonb_build_object('earned', r.earned, 'possible', r.possible, 'correct', r.correct, 'parts', r.parts);
end $$;

create or replace function public.record_practice_response(p_attempt_id uuid, p_pool_id uuid, p_given text, p_ms int)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  return (record_practice_response_v2(p_attempt_id, p_pool_id, to_jsonb(p_given), p_ms) ->> 'correct')::boolean;
end $$;

create or replace function public.finish_practice(p_attempt_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t attempts;
  s numeric;
begin
  select * into t from attempts where id = p_attempt_id;
  if not found or t.student_id <> auth.uid() then
    raise exception 'not your attempt' using errcode = '42501';
  end if;
  if t.submitted_at is null then
    perform own_open_attempt(p_attempt_id, 'practice');
    select coalesce(sum(earned), 0) into s from responses where attempt_id = p_attempt_id;
    update attempts set submitted_at = now(), score = s,
      is_late = coalesce(now() > (select due_at from assignments where id = t.assignment_id), false)
    where id = p_attempt_id returning * into t;
  end if;
  return jsonb_build_object('score', t.score, 'total', t.total, 'is_late', t.is_late);
end $$;

-- Test: one submission, graded here. p_responses: [{pool_id, given (string or object), ms}]
create or replace function public.submit_test(p_attempt_id uuid, p_responses jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  t attempts;
  a assignments;
  s numeric;
begin
  t := own_open_attempt(p_attempt_id, 'test');
  select * into a from assignments where id = t.assignment_id;

  insert into responses (attempt_id, pool_id, given, given_json, correct, earned, possible, parts, ms)
  select p_attempt_id, i.pool_id,
         case when jsonb_typeof(r.given) = 'string' then left(r.given #>> '{}', 500) else '' end,
         coalesce(r.given, 'null'::jsonb),
         (gp ->> 'right')::int = (gp ->> 'outOf')::int,
         case when (gp ->> 'outOf')::int = 0 then 0
              else round(p.points * (gp ->> 'right')::int / (gp ->> 'outOf')::int, 2) end,
         p.points, gp -> 'parts', r.ms
  from attempt_items i
  join assignment_pool p on p.id = i.pool_id
  left join lateral (
    select coalesce(e -> 'given', 'null'::jsonb) as given, nullif(e ->> 'ms', '')::int as ms
    from jsonb_array_elements(coalesce(p_responses, '[]')) e
    where (e ->> 'pool_id')::uuid = i.pool_id
    limit 1
  ) r on true
  cross join lateral (select grade_parts(p.question, coalesce(r.given, 'null'::jsonb)) as gp) x
  where i.attempt_id = p_attempt_id;

  select coalesce(sum(earned), 0) into s from responses where attempt_id = p_attempt_id;
  update attempts set
    submitted_at = now(),
    score = s,
    is_late = coalesce(now() > a.due_at, false),
    over_time = a.time_limit_sec is not null
                and now() > t.started_at + make_interval(secs => a.time_limit_sec + 30)
  where id = p_attempt_id returning * into t;
  return jsonb_build_object('score', t.score, 'total', t.total, 'is_late', t.is_late, 'over_time', t.over_time);
end $$;

drop function public.gradebook(uuid);
create function public.gradebook(p_class_id uuid)
returns table (student_id uuid, display_name text, assignment_id uuid, best_score numeric, total numeric,
               attempts int, last_submitted_at timestamptz, any_late boolean, latest_attempt_id uuid,
               best_attempt_id uuid)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'not your class' using errcode = '42501';
  end if;
  return query
    select e.student_id, e.display_name, a.id,
           max(t.score), max(t.total), count(t.id)::int, max(t.submitted_at),
           coalesce(bool_or(t.is_late or t.over_time), false),
           (array_agg(t.id order by t.submitted_at desc) filter (where t.id is not null))[1],
           (array_agg(t.id order by t.score desc nulls last, t.submitted_at desc) filter (where t.id is not null))[1]
    from enrollments e
    cross join assignments a
    left join attempts t on t.assignment_id = a.id and t.student_id = e.student_id and t.submitted_at is not null
    where e.class_id = p_class_id and a.class_id = p_class_id
    group by e.student_id, e.display_name, a.id;
end $$;

-- Grants, as in the functions migration.
revoke execute on function
  public.grade_parts(jsonb, jsonb), public.get_attempt_items(uuid),
  public.record_practice_response_v2(uuid, uuid, jsonb, int), public.gradebook(uuid)
  from public, anon;
grant execute on function public.grade_parts(jsonb, jsonb) to anon, authenticated;
grant execute on function
  public.get_attempt_items(uuid), public.record_practice_response_v2(uuid, uuid, jsonb, int), public.gradebook(uuid)
  to authenticated;
