interface Scored { score: number | null; total: number | null; submitted_at: string | null }

/** null when there is no real ratio; SQL orders those after every real one (nulls last). */
const ratio = (t: Scored): number | null => (t.score !== null && t.total !== null && t.total > 0 ? t.score / t.total : null);
const cmpNullsLast = (a: number | null, b: number | null) => (a === b ? 0 : a === null ? -1 : b === null ? 1 : a - b);

/**
 * The best submitted attempt: highest score/total, then higher score, then most recent.
 * Mirrors the ordering in the SQL gradebook function.
 */
export function bestAttempt<T extends Scored>(attempts: T[]): T | null {
  let best: T | null = null;
  for (const t of attempts) {
    if (!t.submitted_at) continue;
    if (!best?.submitted_at) { best = t; continue; }
    const d = cmpNullsLast(ratio(t), ratio(best)) || cmpNullsLast(t.score, best.score) || t.submitted_at.localeCompare(best.submitted_at);
    if (d > 0) best = t;
  }
  return best;
}
