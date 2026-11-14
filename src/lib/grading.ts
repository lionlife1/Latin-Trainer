import type { DrillQuestion, Given } from './types';

const MACRONS: Record<string, string> = {
  ā: 'a', ē: 'e', ī: 'i', ō: 'o', ū: 'u', ȳ: 'y',
};

/**
 * Canonical form used for grading. Must stay identical to the SQL
 * function latin_normalize() (see tests/fixtures/normalize.json).
 */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[āēīōūȳ]/g, ch => MACRONS[ch])
    .replace(/\s+/g, ' ')
    .trim();
}

export interface PartResult { id: string; ok: boolean }
export interface Grade { right: number; outOf: number; parts: PartResult[] }

function asRecord(given: unknown): Record<string, unknown> | null {
  return given !== null && typeof given === 'object' && !Array.isArray(given)
    ? (given as Record<string, unknown>)
    : null;
}

function matches(given: unknown, accepted: string[]): boolean {
  if (typeof given !== 'string') return false;
  const g = normalize(given);
  return g !== '' && accepted.some(a => normalize(a) === g);
}

export function grade(q: DrillQuestion, given: Given): Grade {
  let parts: PartResult[];
  if (q.type === 'mc') {
    parts = [{ id: 'answer', ok: matches(given, [q.correct]) }];
  } else if (q.type === 'typein') {
    parts = [{ id: 'answer', ok: matches(given, q.answers) }];
  } else if (q.type === 'grid') {
    const g = asRecord(given);
    const ids: string[] = [];
    for (const row of q.rows) {
      for (const cell of row.cells) {
        if (cell && cell.given === undefined && q.key[cell.id]) ids.push(cell.id);
      }
    }
    parts = ids.map(id => ({ id, ok: matches(g?.[id], q.key[id]) }));
  } else {
    const g = asRecord(given);
    let best = -1;
    let bestParts: PartResult[] = q.fields.map(f => ({ id: f.id, ok: false }));
    for (const parse of q.key) {
      const cand = q.fields.map(f => ({
        id: f.id,
        ok: typeof g?.[f.id] === 'string' && g[f.id] !== '' && g[f.id] === parse[f.id],
      }));
      const n = cand.filter(p => p.ok).length;
      if (n > best) { best = n; bestParts = cand; }
    }
    parts = bestParts;
  }
  return { right: parts.filter(p => p.ok).length, outOf: parts.length, parts };
}

/** points * right / outOf, rounded to 2 places. */
export function earnedPoints(g: Grade, points: number): number {
  if (g.outOf === 0) return 0;
  return Math.round(points * g.right / g.outOf * 100) / 100;
}

export function isCorrect(q: DrillQuestion, given: Given): boolean {
  const g = grade(q, given);
  return g.right === g.outOf;
}

export function correctDisplay(q: DrillQuestion): string {
  if (q.type === 'mc') return q.correct;
  if (q.type === 'typein') return q.answers[0];
  if (q.type === 'grid') {
    const ids = grade(q, {}).parts.map(p => p.id);
    return ids.map(id => q.key[id][0]).join(', ');
  }
  return q.key
    .map(parse => q.fields
      .map(f => f.options.find(o => o.value === parse[f.id])?.label ?? parse[f.id])
      .filter(l => l !== undefined && l !== '')
      .join(' '))
    .join(' / ');
}
