interface Scored { score: number | null; total: number; submitted_at: string | null }

const ratio = (t: Scored) => (t.total > 0 ? (t.score ?? 0) / t.total : 0);

/**
 * The best submitted attempt: highest score/total, then higher score, then most recent.
 * Mirrors the ordering in the SQL gradebook function.
 */
export function bestAttempt<T extends Scored>(attempts: T[]): T | null {
  let best: T | null = null;
  for (const t of attempts) {
    if (!t.submitted_at) continue;
    if (!best?.submitted_at) { best = t; continue; }
    const d = ratio(t) - ratio(best) || (t.score ?? 0) - (best.score ?? 0) || t.submitted_at.localeCompare(best.submitted_at);
    if (d > 0) best = t;
  }
  return best;
}
