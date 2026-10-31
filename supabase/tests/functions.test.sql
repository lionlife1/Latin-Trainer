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
  )) ->> 'score')::int = 3, 'score counts macron/case/space-insensitive matches');
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
select tests.ok((finish_practice((select id from p_att)) ->> 'score')::int = 1, 'finish_practice scores');
select tests.ok((select is_late from attempts where id = (select id from p_att)), 'late practice flagged');
select tests.ok((select submitted_at is not null from attempts where id = (select id from p_att)), 'practice submitted');

-- Time limit: over-time flagged, still graded
select tests.as_user('s2');
create temp table o_att on commit drop as select start_attempt(tests.uid('a4')) as id;
grant select on o_att to authenticated;
select tests.as_admin();
update attempts set started_at = now() - interval '10 minutes' where id = (select id from o_att);
select tests.as_user('s2');
select tests.ok((submit_test((select id from o_att), jsonb_build_array(jsonb_build_object('pool_id', tests.pool('a4','t1'), 'given', 'sit'))) ->> 'score')::int = 1,
  'over-time submission still graded');
select tests.ok((select over_time from attempts where id = (select id from o_att)), 'over_time flagged');

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

rollback;
\echo functions ok
