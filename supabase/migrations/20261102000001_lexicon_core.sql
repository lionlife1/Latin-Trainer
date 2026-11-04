-- Open lexicon: a "core" flag for the curated list, and one built-in row per (headword, pos).
alter table public.lexicon add column core boolean not null default false;
create unique index lexicon_builtin_key on public.lexicon (headword, pos) where owner_id is null;
