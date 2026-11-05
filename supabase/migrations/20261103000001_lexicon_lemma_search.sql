-- Normalized lemma for prefix search ("sum" finds sum before every definition that mentions "sum").
alter table public.lexicon
  add column lemma_search text generated always as (public.latin_normalize(lemma)) stored;
create index lexicon_lemma_search on public.lexicon (lemma_search text_pattern_ops);
