begin;
\ir _helpers.sql
select tests.seed_world();

-- Students
select tests.as_user('s1');
select tests.ok((select count(*) from assignment_pool) = 0, 'student cannot read assignment_pool');
select tests.ok((select count(*) from assignments) = 3, 'student sees only own class assignments (a1, a3, a4)');
select tests.ok(not exists (select 1 from assignments where id = tests.uid('a2')), 'student cannot see other class assignment');
select tests.ok((select count(*) from classes) = 1, 'student sees only own class');
select tests.ok((select count(*) from enrollments) = 1, 'student sees only own enrollment');
select tests.throws($$insert into classes (teacher_id, name) values (auth.uid(), 'Hack')$$, 'student cannot create a class');
select tests.throws($$insert into attempts (assignment_id, student_id, total) values (tests.uid('a1'), auth.uid(), 1)$$, 'student cannot insert attempts directly');
select tests.throws($$select join_class_as(auth.uid(), 'AAAAAA', 'x')$$, 'student cannot call service-only join_class_as', '42501');
select tests.throws($$select student_email_for('AAAAAA', 's2')$$, 'student cannot call service-only student_email_for', '42501');

select tests.as_admin();
insert into attempts (assignment_id, student_id, total, score) values (tests.uid('a3'), tests.uid('s2'), 2, 1);
select tests.as_user('s1');
select tests.ok((select count(*) from attempts) = 0, 'student cannot see another student''s attempts');
select tests.as_user('s2');
select tests.throws($$update attempts set score = 99$$, 'student cannot update attempts', '42501');
select tests.as_admin();
select tests.ok((select score from attempts where student_id = tests.uid('s2')) = 1, 'student cannot update own attempt score');

-- Teachers
select tests.as_user('tA');
select tests.ok((select count(*) from classes) = 1, 'teacher sees only own classes');
select tests.ok((select count(*) from enrollments) = 2, 'teacher sees own roster');
select tests.ok((select count(*) from assignment_pool) = 10, 'teacher sees own pools only');
select tests.ok((select count(*) from attempts) = 1, 'teacher sees attempts in own class');
select tests.ok((select count(*) from profiles) = 3, 'teacher sees own profile + own students');
select tests.throws(format($$insert into assignments (class_id, title, mode, source, question_count) values (%L, 'x', 'practice', '{}', 1)$$, tests.uid('c2')),
  'teacher cannot add assignment to another teacher''s class');
select tests.throws(format($$select * from gradebook(%L)$$, tests.uid('c2')), 'teacher cannot read another class gradebook', '42501');
insert into classes (name) values ('Second section');
select tests.ok((select count(*) from classes) = 2, 'teacher can create a class (teacher_id defaults to self)');
select tests.ok((select join_code ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$' from classes where name = 'Second section'), 'join code generated from safe alphabet');

-- Anonymous
select tests.as_anon();
select tests.throws($$select count(*) from classes$$, 'anon cannot read classes', '42501');
select tests.throws($$select count(*) from profiles$$, 'anon cannot read profiles', '42501');
select tests.throws($$select count(*) from assignment_pool$$, 'anon cannot read pools', '42501');
select tests.ok((select count(*) from modules) > 0 and (select count(*) from questions) > 0, 'anon can read built-in content');
select tests.ok((select count(*) from lexicon) > 0, 'anon can read built-in lexicon');

select tests.as_admin();
rollback;
\echo rls ok
