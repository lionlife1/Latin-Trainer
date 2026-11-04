import { normalize } from './grading';

/** The fields rankLexicon reads; LexiconRow from the teacher API satisfies it. */
export interface RankableLexiconRow {
  lemma: string;
  core?: boolean;
  /** SQL `latin_normalize(lemma)`; computed with `normalize` when the row lacks it. */
  lemma_search?: string;
}

/**
 * Orders dictionary search results: an exact lemma match first, then lemmas starting with the term,
 * then everything else (definition and mid-word matches). Within each group core words come first,
 * then shorter lemmas, then alphabetical order. `term` must already be normalized.
 */
export function rankLexicon<T extends RankableLexiconRow>(rows: T[], term: string): T[] {
  const keyed = rows.map(r => {
    const key = r.lemma_search ?? normalize(r.lemma);
    const group = key === term ? 0 : key.startsWith(term) ? 1 : 2;
    return { r, key, group };
  });
  keyed.sort((a, b) =>
    a.group - b.group
    || Number(!!b.r.core) - Number(!!a.r.core)
    || a.key.length - b.key.length
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
  );
  return keyed.map(k => k.r);
}
