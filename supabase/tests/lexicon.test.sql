-- Not wrapped in a transaction: it re-applies seed-lexicon.sql, which has its own begin/commit.
-- It therefore uses a session-local pg_temp helper instead of tests.* (no schema is left behind),
-- and deletes its temporary teacher (and so their list) at the end.
\set ON_ERROR_STOP on

create function pg_temp.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is distinct from true then raise exception 'FAILED: %', msg; end if;
end $$;

select pg_temp.ok((select count(*) from lexicon where owner_id is null) > 25000, 'full lexicon loaded');
select pg_temp.ok((select count(*) from lexicon where owner_id is null and core) between 1500 and 3500, 'core list size');
select pg_temp.ok((select core from lexicon where owner_id is null and search_text like '%amo%'
                   order by core desc, frequency asc nulls last, lemma limit 1), 'core words rank first in search');

-- A teacher (the on_auth_user_created trigger makes the profile) with a list that references the core amo row.
select gen_random_uuid() as teacher_id \gset
insert into auth.users (id, email, raw_user_meta_data)
values (:'teacher_id', 'lexicon-test@example.test', '{"role":"teacher","display_name":"lexicon test"}'::jsonb);
insert into vocab_lists (owner_id, name) values (:'teacher_id', 'lexicon test list');
insert into vocab_list_items (list_id, lexicon_id)
select (select id from vocab_lists where owner_id = :'teacher_id'),
       (select id from lexicon where owner_id is null and core and lemma = 'amō' order by id limit 1);
select count(*) as builtin_before from lexicon where owner_id is null \gset

\ir ../seed-lexicon.sql

select pg_temp.ok(
  exists (select 1 from vocab_list_items i join vocab_lists l on l.id = i.list_id where l.owner_id = :'teacher_id')
  and (select count(*) from lexicon where owner_id is null) = :builtin_before,
  're-seed keeps referenced words and is idempotent');

-- Cleanup: deleting the user cascades to the profile, list and items.
delete from auth.users where id = :'teacher_id';
