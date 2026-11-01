-- Shared helpers for *.test.sql. Each test file runs inside one transaction that is rolled back.
create schema tests;
grant usage on schema tests to anon, authenticated, service_role;
create table tests.users (name text primary key, id uuid not null);
grant select on tests.users to anon, authenticated, service_role;

create function tests.uid(n text) returns uuid language sql stable as $$ select id from tests.users where name = n $$;

create function tests.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is distinct from true then raise exception 'FAILED: %', msg; end if;
end $$;

create function tests.throws(stmt text, msg text, expected_state text default null) returns void language plpgsql as $$
begin
  execute stmt;
  raise exception 'FAILED (no error): %', msg;
exception when others then
  if sqlerrm like 'FAILED (no error)%' then raise; end if;
  if expected_state is not null and sqlstate <> expected_state then
    raise exception 'FAILED: % (expected sqlstate %, got % %)', msg, expected_state, sqlstate, sqlerrm;
  end if;
end $$;

create function tests.as_user(n text) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', tests.uid(n), 'role', 'authenticated')::text, true);
end $$;
create function tests.as_anon() returns void language plpgsql as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
end $$;
create function tests.as_service() returns void language plpgsql as $$
begin
  perform set_config('role', 'service_role', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
end $$;
create function tests.as_admin() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
end $$;
grant execute on all functions in schema tests to anon, authenticated, service_role;

-- World: teachers tA (class c1, code AAAAAA) and tB (class c2, code BBBBBB);
-- students s1, s2 in c1 and s3 in c2.
-- a1: c1 test, 7-item pool, question_count 50, max_attempts 1.
-- a3: c1 practice, due yesterday.   a2: c2 practice.   a4: c1 test with 60s limit.
create function tests.seed_world() returns void language plpgsql as $$
declare n text; a1 uuid; a2 uuid; a3 uuid; a4 uuid; c1 uuid; c2 uuid;
begin
  foreach n in array array['tA','tB','s1','s2','s3'] loop
    insert into tests.users values (n, gen_random_uuid());
    insert into auth.users (id, email, raw_user_meta_data)
    values (tests.uid(n), n || '@example.test',
            json_build_object('role', case when n like 't%' then 'teacher' else 'student' end, 'display_name', n)::jsonb);
  end loop;
  insert into classes (teacher_id, name, join_code) values (tests.uid('tA'), 'Latin III', 'AAAAAA') returning id into c1;
  insert into classes (teacher_id, name, join_code) values (tests.uid('tB'), 'Latin IV', 'BBBBBB') returning id into c2;
  insert into enrollments (class_id, student_id, display_name) values
    (c1, tests.uid('s1'), 's1'), (c1, tests.uid('s2'), 's2'), (c2, tests.uid('s3'), 's3');

  insert into assignments (class_id, title, mode, source, question_count, max_attempts)
    values (c1, 'Test 1', 'test', '{"kind":"modules","moduleIds":[]}', 50, 1) returning id into a1;
  insert into assignment_pool (assignment_id, item_key, question) values
    (a1, 'k1', '{"id":"k1","type":"typein","badge":"B","prompt":"1sg pres act subj of amare","answers":["amem"],"explanation":"e"}'),
    (a1, 'k2', '{"id":"k2","type":"typein","badge":"B","prompt":"p","answers":["amarem"]}'),
    (a1, 'k3', '{"id":"k3","type":"mc","badge":"B","prompt":"p","choices":["x","y"],"correct":"y"}'),
    (a1, 'k4', '{"id":"k4","type":"typein","badge":"B","prompt":"p","answers":["amaverim"]}'),
    (a1, 'k5', '{"id":"k5","type":"typein","badge":"B","prompt":"p","answers":["amavissem"]}'),
    (a1, 'k6', '{"id":"k6","type":"typein","badge":"B","prompt":"p","answers":["amatus sim"]}'),
    (a1, 'k7', '{"id":"k7","type":"typein","badge":"B","prompt":"p","answers":["amer"]}');

  insert into assignments (class_id, title, mode, source, question_count)
    values (c2, 'Other class', 'practice', '{"kind":"modules","moduleIds":[]}', 5) returning id into a2;
  insert into assignment_pool (assignment_id, item_key, question) values
    (a2, 'z1', '{"id":"z1","type":"typein","badge":"B","prompt":"p","answers":["sim"]}');

  insert into assignments (class_id, title, mode, source, question_count, due_at)
    values (c1, 'Practice late', 'practice', '{"kind":"modules","moduleIds":[]}', 2, now() - interval '1 day') returning id into a3;
  insert into assignment_pool (assignment_id, item_key, question) values
    (a3, 'p1', '{"id":"p1","type":"typein","badge":"B","prompt":"p","answers":["sim"]}'),
    (a3, 'p2', '{"id":"p2","type":"mc","badge":"B","prompt":"p","choices":["x","y"],"correct":"x"}');

  insert into assignments (class_id, title, mode, source, question_count, time_limit_sec)
    values (c1, 'Timed', 'test', '{"kind":"modules","moduleIds":[]}', 1, 60) returning id into a4;
  insert into assignment_pool (assignment_id, item_key, question) values
    (a4, 't1', '{"id":"t1","type":"typein","badge":"B","prompt":"p","answers":["sit"]}');

  insert into tests.users values ('c1', c1), ('c2', c2), ('a1', a1), ('a2', a2), ('a3', a3), ('a4', a4);
end $$;

-- Pool row id for an item key within an assignment.
create function tests.pool(a text, k text) returns uuid language sql stable security definer as $$
  select id from assignment_pool where assignment_id = tests.uid(a) and item_key = k
$$;
grant execute on function tests.pool(text, text) to anon, authenticated, service_role;
