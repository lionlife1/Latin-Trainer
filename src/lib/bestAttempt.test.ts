import { describe, it, expect } from 'vitest';
import { bestAttempt } from './bestAttempt';

const at = (id: string, score: number, total: number, submitted_at: string | null = '2026-01-01T00:00:00Z') => ({ id, score, total, submitted_at });

describe('bestAttempt', () => {
  it('picks the highest ratio, not the highest raw score', () => {
    expect(bestAttempt([at('a', 9, 10), at('b', 8, 30)])?.id).toBe('a');
    expect(bestAttempt([at('b', 12, 30), at('a', 9, 10)])?.id).toBe('a');
  });
  it('ties go to the higher score, then the most recent', () => {
    expect(bestAttempt([at('a', 1, 2), at('b', 5, 10)])?.id).toBe('b');
    expect(bestAttempt([at('a', 5, 10, '2026-01-01T00:00:00Z'), at('b', 5, 10, '2026-02-01T00:00:00Z')])?.id).toBe('b');
  });
  it('ignores unsubmitted attempts and a zero total', () => {
    expect(bestAttempt([at('a', 1, 2, null)])).toBeNull();
    expect(bestAttempt([at('z', 0, 0), at('a', 1, 4)])?.id).toBe('a');
    expect(bestAttempt([])).toBeNull();
  });
  it('a zero or null total sorts after any real ratio, like SQL nulls last', () => {
    expect(bestAttempt([at('a', 0, 10, '2026-01-01T00:00:00Z'), at('z', 0, 0, '2026-02-01T00:00:00Z')])?.id).toBe('a');
    expect(bestAttempt([at('z', 0, 0, '2026-02-01T00:00:00Z'), at('a', 0, 10, '2026-01-01T00:00:00Z')])?.id).toBe('a');
  });
});
