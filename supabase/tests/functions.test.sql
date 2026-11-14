begin;
\ir _helpers.sql
select tests.seed_world();

-- latin_normalize matches tests/fixtures/normalize.json
select tests.ok(latin_normalize(i) = o, format('latin_normalize(%L) = %L, got %L', i, o, latin_normalize(i)))
from (values ('  Amēmus ', 'amemus'), ('AMĀTUS   SIM', 'amatus sim'), ('cēpissent', 'cepissent'), ('Ȳ', 'y'), ('', ''),
             (E'laudārēris\t', 'laudareris'), ('Ō Īnferī Ū', 'o inferi u')) f(i, o);

-- Test attempt: question_count (50) larger than pool (7) uses whole pool
select tests.as_user('s1');
create temp table t_att on commit drop as select start_attempt(tests.uid('a1')) as id;
grant select on t_att to authenticated, service_role;
select tests.ok((select total from attempts where id = (select id from t_att)) = 7, 'total = pool size when count > pool');
select tests.ok((select count(*) from attempt_items where attempt_id = (select id from t_att)) = 7, '7 attempt items');
select tests.ok(start_attempt(tests.uid('a1')) = (select id from t_att), 'start_attempt resumes the open attempt');

-- No answers leak before submission
select tests.ok(not exists (
  select 1 from get_attempt_items((select id from t_att)) g
  where g.question ? 'answers' or g.question ? 'correct' or g.question ? 'explanation'), 'no answers before submit');
select tests.ok((select count(*) from get_attempt_items((select id from t_att))) = 7, 'all items returned');
select tests.throws(format($$select record_practice_response(%L, %L, 'amem', 100)$$, (select id from t_att), tests.pool('a1','k1')),
  'cannot record practice responses on a test');

select tests.as_user('s2');
select tests.throws(format($$select * from get_attempt_items(%L)$$, (select id from t_att)), 'other student cannot read my attempt', '42501');
select tests.throws(format($$select submit_test(%L, '[]')$$, (select id from t_att)), 'other student cannot submit my attempt', '42501');

-- Server grading
select tests.as_user('s1');
select tests.ok((submit_test((select id from t_att), jsonb_build_array(
    jsonb_build_object('pool_id', tests.pool('a1','k1'), 'given', 'Amēm ', 'ms', 1200),
    jsonb_build_object('pool_id', tests.pool('a1','k2'), 'given', 'Amārem', 'ms', 900),
    jsonb_build_object('pool_id', tests.pool('a1','k3'), 'given', 'x', 'ms', 500),
    jsonb_build_object('pool_id', tests.pool('a1','k6'), 'given', 'amatus  SIM', 'ms', 500),
    jsonb_build_object('pool_id', tests.pool('a1','k4'), 'given', 'AMAVERAM', 'ms', 500)
  )) ->> 'score')::numeric = 3, 'score counts macron/case/space-insensitive matches');
select tests.ok((select count(*) from responses where attempt_id = (select id from t_att)) = 7, 'unanswered items stored as responses');
select tests.ok((select is_late from attempts where id = (select id from t_att)) = false, 'not late without due date');
select tests.throws(format($$select submit_test(%L, '[]')$$, (select id from t_att)), 'cannot submit twice');
select tests.ok((select count(*) from get_attempt_items((select id from t_att)) g where g.question ? 'answers' or g.question ? 'correct') = 7,
  'answers revealed after submit when reveal_answers');
select tests.throws(format($$select start_attempt(%L)$$, tests.uid('a1')), 'max_attempts enforced');
select tests.throws(format($$select start_attempt(%L)$$, tests.uid('a2')), 'cannot start assignment in another class', '42501');

-- Hidden answers stay hidden after submit when reveal_answers = false
select tests.as_admin();
update assignments set reveal_answers = false where id = tests.uid('a1');
select tests.as_user('s1');
select tests.ok(not exists (select 1 from get_attempt_items((select id from t_att)) g where g.question ? 'answers'),
  'answers hidden after submit when reveal_answers is off');
select tests.as_admin();
update assignments set reveal_answers = true where id = tests.uid('a1');

-- Practice: server-graded, late flagged not blocked
select tests.as_user('s1');
create temp table p_att on commit drop as select start_attempt(tests.uid('a3')) as id;
grant select on p_att to authenticated;
select tests.ok((select count(*) from get_attempt_items((select id from p_att)) g where g.question ? 'answers' or g.question ? 'correct') = 2,
  'practice items include answers');
select tests.ok(record_practice_response((select id from p_att), tests.pool('a3','p1'), 'sīm', 300) = true, 'practice response graded true');
select tests.ok(record_practice_response((select id from p_att), tests.pool('a3','p2'), 'y', 300) = false, 'practice response graded false');
select tests.ok(record_practice_response((select id from p_att), tests.pool('a3','p2'), 'x', 300) = false, 'first practice answer is kept');
select tests.ok((finish_practice((select id from p_att)) ->> 'score')::numeric = 1, 'finish_practice scores');
select tests.ok((select is_late from attempts where id = (select id from p_att)), 'late practice flagged');
select tests.ok((select submitted_at is not null from attempts where id = (select id from p_att)), 'practice submitted');

-- Time limit: over-time flagged, still graded
select tests.as_user('s2');
create temp table o_att on commit drop as select start_attempt(tests.uid('a4')) as id;
grant select on o_att to authenticated;
select tests.as_admin();
update attempts set started_at = now() - interval '10 minutes' where id = (select id from o_att);
select tests.as_user('s2');
select tests.ok((submit_test((select id from o_att), jsonb_build_array(jsonb_build_object('pool_id', tests.pool('a4','t1'), 'given', 'sit'))) ->> 'score')::numeric = 1,
  'over-time submission still graded');
select tests.ok((select over_time from attempts where id = (select id from o_att)), 'over_time flagged');

-- Reveal policy: with attempts left and no due date passed, a submitted test must not reveal answers
-- (otherwise: submit blank, read answers, retake).
select tests.ok(not exists (select 1 from get_attempt_items((select id from o_att)) g where g.question ? 'answers'),
  'answers hidden while the student can still retake');
select tests.as_admin();
update assignments set due_at = now() - interval '1 minute' where id = tests.uid('a4');
select tests.as_user('s2');
select tests.ok(exists (select 1 from get_attempt_items((select id from o_att)) g where g.question ? 'answers'),
  'answers revealed once the due date has passed');

-- Teacher reports
select tests.as_user('s1');
select tests.throws(format($$select * from item_analysis(%L)$$, tests.uid('a1')), 'student cannot run item analysis', '42501');
select tests.as_user('tA');
select tests.ok((select top_wrong -> 0 ->> 'answer' from item_analysis(tests.uid('a1')) where item_key = 'k4') = 'amaveram',
  'item analysis lists normalized wrong answer');
select tests.ok((select pct_correct from item_analysis(tests.uid('a1')) where item_key = 'k1') = 100, 'pct_correct computed');
select tests.ok((select count(*) from gradebook(tests.uid('c1'))) = 6, 'gradebook has student x assignment rows (2 x 3)');
select tests.ok((select best_score from gradebook(tests.uid('c1')) where student_id = tests.uid('s1') and assignment_id = tests.uid('a1')) = 3,
  'gradebook best score');
select tests.ok((select attempts from gradebook(tests.uid('c1')) where student_id = tests.uid('s2') and assignment_id = tests.uid('a3')) = 0,
  'gradebook counts zero attempts for untouched assignment');
select tests.ok((select g.best_attempt_id = (select t.id from attempts t where t.student_id = tests.uid('s1') and t.assignment_id = tests.uid('a1')
                   and t.submitted_at is not null order by t.score desc, t.submitted_at desc limit 1)
                 from gradebook(tests.uid('c1')) g where g.student_id = tests.uid('s1') and g.assignment_id = tests.uid('a1')),
  'gradebook links the best attempt');
select tests.ok((select best_attempt_id is null from gradebook(tests.uid('c1')) where student_id = tests.uid('s2') and assignment_id = tests.uid('a3')),
  'gradebook has no best attempt for an untouched assignment');
select tests.ok(teacher_owns_student(tests.uid('s1')), 'teacher owns enrolled student');
select tests.ok(not teacher_owns_student(tests.uid('s3')), 'teacher does not own other class student');

-- Service-only student account helpers
select tests.as_admin();
insert into tests.users values ('s4', gen_random_uuid()), ('s5', gen_random_uuid());
insert into auth.users (id, email) values (tests.uid('s4'), 's4@students.invalid'), (tests.uid('s5'), 's5@students.invalid');
select tests.as_service();
select tests.ok(join_class_as(tests.uid('s4'), 'aaaaaa', ' Marcus ') = tests.uid('c1'), 'join by code, case-insensitive code');
select tests.throws(format($$select join_class_as(%L, 'AAAAAA', 'MARCUS')$$, tests.uid('s5')), 'duplicate name (case-insensitive) rejected', '23505');
select tests.throws(format($$select join_class_as(%L, 'ZZZZZZ', 'Julia')$$, tests.uid('s5')), 'unknown join code rejected', 'P0002');
select tests.ok(student_email_for('AAAAAA', 'marcus') = 's4@students.invalid', 'login lookup by code + name');
select tests.ok(student_email_for('AAAAAA', 'nobody') is null, 'unknown name returns null');
select tests.as_admin();
select tests.ok((select role from profiles where id = tests.uid('s4')) = 'student', 'joined user has student profile');
select tests.ok((select display_name from profiles where id = tests.uid('s4')) = 'Marcus', 'profile display name trimmed');

-- Lexicon search text ignores macrons
select tests.ok(exists (select 1 from lexicon where search_text like '%capio%' and owner_id is null), 'lexicon search_text is macron-free');

-- grade_parts: the same rows as the grade table in the TypeScript tests
select tests.ok(grade_parts('{"type":"typein","answers":["amem"]}', '" Amēm "') ->> 'right' = '1'
  and grade_parts('{"type":"typein","answers":["amem"]}', '" Amēm "') ->> 'outOf' = '1', 'grade_parts typein right');
select tests.ok(grade_parts('{"type":"typein","answers":["amem"]}', '""') ->> 'right' = '0', 'grade_parts empty typein wrong');
select tests.ok(grade_parts('{"type":"typein","answers":["amem"]}', '{"a":"amem"}') ->> 'right' = '0', 'grade_parts object for typein wrong');
select tests.ok(grade_parts('{"type":"mc","correct":"y"}', '"x"') ->> 'right' = '0', 'grade_parts mc wrong');
select tests.ok(grade_parts('{"type":"mc","correct":"y"}', '"y"') -> 'parts' -> 0 ->> 'id' = 'answer', 'grade_parts mc part id');

create temp table gq on commit drop as select
  '{"type":"grid","columns":["x"],"rows":[{"label":"r1","cells":[{"id":"a"}]},{"label":"r2","cells":[{"id":"b"}]},{"label":"r3","cells":[{"id":"c"}]}],
    "key":{"c":["amatus est","amata est"],"a":["amo"],"b":["amas"]}}'::jsonb as q;
select tests.ok(grade_parts((select q from gq), '{"a":"amo","b":"amat","c":"AMATA  est"}') = '{"right":2,"outOf":3,"parts":[{"id":"a","ok":true},{"id":"b","ok":false},{"id":"c","ok":true}]}'::jsonb,
  'grade_parts grid 2/3 in row order');
select tests.ok(grade_parts((select q from gq), '{}') = '{"right":0,"outOf":3,"parts":[{"id":"a","ok":false},{"id":"b","ok":false},{"id":"c","ok":false}]}'::jsonb,
  'grade_parts grid empty object 0/3');
select tests.ok(grade_parts((select q from gq), '"amo"') ->> 'right' = '0' and grade_parts((select q from gq), '"amo"') ->> 'outOf' = '3',
  'grade_parts grid string given 0/3');
select tests.ok(grade_parts((select q from gq), '{"a":"","b":" ","c":5}') ->> 'right' = '0', 'grade_parts grid blank and non-string cells wrong');

create temp table pq on commit drop as select
  '{"type":"parse","fields":[{"id":"case","label":"Case","options":[]},{"id":"number","label":"Number","options":[]}],
    "key":[{"case":"genitive","number":"singular"},{"case":"dative","number":"singular"},{"case":"nominative","number":"plural"}]}'::jsonb as q;
select tests.ok(grade_parts((select q from pq), '{"case":"dative","number":"singular"}') = '{"right":2,"outOf":2,"parts":[{"id":"case","ok":true},{"id":"number","ok":true}]}'::jsonb,
  'grade_parts parse full match');
select tests.ok(grade_parts((select q from pq), '{"case":"nominative","number":"singular"}') ->> 'right' = '1', 'grade_parts parse mixed 1/2');
select tests.ok(grade_parts((select q from pq), '{"case":"ablative","number":"plural"}') = '{"right":1,"outOf":2,"parts":[{"id":"case","ok":false},{"id":"number","ok":true}]}'::jsonb,
  'grade_parts parse ablative plural 1/2 on number');
select tests.ok(grade_parts((select q from pq), '{}') ->> 'right' = '0' and grade_parts((select q from pq), '{}') ->> 'outOf' = '2', 'grade_parts parse empty 0/2');
select tests.ok(grade_parts((select q from pq), '"genitive"') ->> 'right' = '0' and grade_parts((select q from pq), '"genitive"') ->> 'outOf' = '2',
  'grade_parts parse string given 0/2');
select tests.as_anon();
select tests.ok(grade_parts('{"type":"mc","correct":"y"}', '"y"') ->> 'right' = '1', 'anon may call grade_parts');
select tests.as_admin();

-- Points: grid worth 3, parse worth 1, typein worth 1 (and a practice twin of the same items)
create temp table pt on commit drop as
  select gen_random_uuid() as tid, gen_random_uuid() as pid;
grant select on pt to authenticated;
insert into assignments (id, class_id, title, mode, source, question_count, max_attempts)
  values ((select tid from pt), tests.uid('c1'), 'Points test', 'test', '{"kind":"modules","moduleIds":[]}', 10, 2),
         ((select pid from pt), tests.uid('c1'), 'Points practice', 'practice', '{"kind":"modules","moduleIds":[]}', 10, null);
insert into assignment_pool (assignment_id, item_key, question, points)
select a, k, case k when 'g' then (select q from gq) when 'p' then (select q from pq)
  else '{"id":"t","type":"typein","badge":"B","prompt":"p","answers":["sim"]}'::jsonb end,
  case k when 'g' then 3 else 1 end
from (select tid a from pt union all select pid from pt) x, (values ('g'), ('p'), ('t')) kk(k);
insert into tests.users select 'pt', tid from pt;
insert into tests.users select 'pp', pid from pt;

select tests.as_user('s1');
create temp table pt_att on commit drop as select start_attempt(tests.uid('pt')) as id;
grant select on pt_att to authenticated;
select tests.ok((select total from attempts where id = (select id from pt_att)) = 5, 'total is the sum of points');
select tests.ok(not exists (select 1 from get_attempt_items((select id from pt_att)) g where g.question ? 'key' or g.question ? 'answers'),
  'no key before submit');
select tests.ok((select points from get_attempt_items((select id from pt_att)) g where g.pool_id = tests.pool('pt', 'g')) = 3, 'get_attempt_items returns points');
select tests.ok((submit_test((select id from pt_att), jsonb_build_array(
    jsonb_build_object('pool_id', tests.pool('pt','g'), 'given', '{"a":"amo","b":"amat","c":"amata est"}'::jsonb),
    jsonb_build_object('pool_id', tests.pool('pt','p'), 'given', '{"case":"dative","number":"singular"}'::jsonb),
    jsonb_build_object('pool_id', tests.pool('pt','t'), 'given', 'x')
  )) ->> 'score')::numeric = 3, 'submit_test scores 2 of 3 cells + parse + wrong typein = 3');
select tests.ok((select score from attempts where id = (select id from pt_att)) = 3 and
                (select total from attempts where id = (select id from pt_att)) = 5, 'attempt score and total in points');
select tests.ok((select earned = 2 and possible = 3 and not correct and jsonb_array_length(parts) = 3
                   and given_json ->> 'a' = 'amo' and given = ''
                 from responses where attempt_id = (select id from pt_att) and pool_id = tests.pool('pt','g')), 'grid response row');
select tests.ok((select earned = 1 and possible = 1 and correct from responses
                 where attempt_id = (select id from pt_att) and pool_id = tests.pool('pt','p')), 'parse response row');
select tests.ok((select earned = 0 and not correct and given = 'x' and given_json = '"x"' from responses
                 where attempt_id = (select id from pt_att) and pool_id = tests.pool('pt','t')), 'typein response row');
select tests.as_user('tA');
select tests.ok((select best_score = 3 and total = 5 from gradebook(tests.uid('c1'))
                 where student_id = tests.uid('s1') and assignment_id = tests.uid('pt')), 'gradebook returns point totals');
select tests.ok((select pct_correct from item_analysis(tests.uid('pt')) where item_key = 'g') = 0, 'item_analysis works with structured responses');
select tests.ok((select top_wrong from item_analysis(tests.uid('pt')) where item_key = 'g') = '[]'::jsonb, 'item_analysis skips empty given');

-- Fractional best score: 1 of 3 grid cells on 3 points
select tests.as_user('s2');
create temp table pt_att2 on commit drop as select start_attempt(tests.uid('pt')) as id;
grant select on pt_att2 to authenticated;
select submit_test((select id from pt_att2), jsonb_build_array(
    jsonb_build_object('pool_id', tests.pool('pt','g'), 'given', '{"a":"amo"}'::jsonb)));
select tests.as_user('tA');
select tests.ok((select best_score from gradebook(tests.uid('c1'))
                 where student_id = tests.uid('s2') and assignment_id = tests.uid('pt')) = 1.00, 'gradebook fractional best score');

-- Practice with structured answers
select tests.as_user('s1');
create temp table pp_att on commit drop as select start_attempt(tests.uid('pp')) as id;
grant select on pp_att to authenticated;
select tests.ok(jsonb_array_length(record_practice_response_v2((select id from pp_att), tests.pool('pp','g'),
    '{"a":"amo","b":"amas"}'::jsonb, 100) -> 'parts') = 3, 'v2 returns parts');
select tests.ok((record_practice_response_v2((select id from pp_att), tests.pool('pp','g'), '{}'::jsonb, 100) ->> 'earned')::numeric = 2,
  'second v2 call returns the first result');
select tests.ok(record_practice_response_v2((select id from pp_att), tests.pool('pp','p'), '{"case":"genitive","number":"singular"}'::jsonb, 1) ->> 'correct' = 'true',
  'v2 parse correct');
select tests.ok(record_practice_response((select id from pp_att), tests.pool('pp','t'), 'sim', 1) = true, 'old text practice function still returns a boolean');
select tests.ok((finish_practice((select id from pp_att)) ->> 'score')::numeric = 4, 'finish_practice sums earned');
select tests.ok((select total from attempts where id = (select id from pp_att)) = 5, 'practice total in points');

rollback;
\echo functions ok
