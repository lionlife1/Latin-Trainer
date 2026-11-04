import { searchLexicon, type LexiconRow } from './api';

type Call = { method: string; args: unknown[] };
const queries: Call[][] = [];
let responses: LexiconRow[][] = [];

function builder() {
  const calls: Call[] = [];
  queries.push(calls);
  const data = responses[queries.length - 1] ?? [];
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'like', 'ilike', 'order', 'limit']) {
    b[m] = (...args: unknown[]) => { calls.push({ method: m, args }); return b; };
  }
  b.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
    Promise.resolve({ data, error: null }).then(res, rej);
  return b;
}

vi.mock('../../lib/supabase', () => ({
  requireSupabase: () => ({ from: (table: string) => { expect(table).toBe('lexicon'); return builder(); } }),
}));

const row = (id: number, lemma: string, core: boolean, definition = 'x'): LexiconRow => ({
  id, owner_id: null, headword: lemma, lemma, definition, pos: 'verb', core, lemma_search: lemma,
});

beforeEach(() => { queries.length = 0; responses = []; });

describe('searchLexicon', () => {
  it('returns nothing for an empty term without querying', async () => {
    expect(await searchLexicon('  %_ ')).toEqual([]);
    expect(queries).toHaveLength(0);
  });

  it('runs a lemma-prefix and a full-text query, merges, dedupes and ranks exact matches first', async () => {
    const sum = row(1, 'sum', true, 'be');
    responses = [
      [row(2, 'summus', true), sum, row(3, 'summa', false)],
      [row(4, 'absum', true, 'be away'), row(5, 'adipiscor', true, 'consume'), sum],
    ];
    const out = await searchLexicon('SŪM');
    expect(out.map(r => r.lemma)).toEqual(['sum', 'summus', 'summa', 'absum', 'adipiscor']);

    expect(queries).toHaveLength(2);
    const [prefix, full] = queries;
    expect(prefix).toContainEqual({ method: 'like', args: ['lemma_search', 'sum%'] });
    expect(prefix).toContainEqual({ method: 'order', args: ['core', { ascending: false }] });
    expect(prefix).toContainEqual({ method: 'order', args: ['lemma_search'] });
    expect(full).toContainEqual({ method: 'ilike', args: ['search_text', '%sum%'] });
    expect(full).toContainEqual({ method: 'order', args: ['lemma'] });
    for (const q of queries) {
      expect(q).toContainEqual({ method: 'limit', args: [20] });
      expect(String(q.find(c => c.method === 'select')!.args[0])).toMatch(/core.*lemma_search|lemma_search.*core/);
      expect(q.some(c => c.method === 'order' && c.args[0] === 'frequency')).toBe(false);
    }
  });

  it('returns at most limit rows', async () => {
    responses = [[row(1, 'a', true), row(2, 'ab', true)], [row(3, 'ba', true)]];
    expect(await searchLexicon('a', 2)).toHaveLength(2);
  });
});
