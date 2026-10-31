-- Macron/case-insensitive lexicon search ("capio" finds "capiō").
alter table public.lexicon
  add column search_text text generated always as (public.latin_normalize(headword || ' ' || definition)) stored;
