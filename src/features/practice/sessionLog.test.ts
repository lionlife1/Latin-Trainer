import { appendSession, bestScores, loadSessions, mergeSessions, recentSessions, saveSessions, type PracticeSession } from './sessionLog';

const s = (id: string, finished_at: string, over: Partial<PracticeSession> = {}): PracticeSession => ({
  id, kind: 'module', module_id: 'm0', correct: 5, total: 10, xp: 0, completed: false, finished_at, synced: true, ...over,
});

beforeEach(() => localStorage.clear());

describe('sessionLog', () => {
  it('appends with an id, unsynced, newest first', () => {
    appendSession({ kind: 'module', module_id: 'm0', correct: 1, total: 2, xp: 0, completed: false, finished_at: '2026-10-01T10:00:00Z' });
    const b = appendSession({ kind: 'endless', module_id: null, correct: 3, total: 3, xp: 0, completed: false, finished_at: '2026-10-02T10:00:00Z' });
    const all = loadSessions();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe(b.id);
    expect(b.synced).toBe(false);
    expect(b.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('caps at 200, dropping the oldest synced entries before unsynced ones', () => {
    const many = Array.from({ length: 205 }, (_, i) =>
      s(`id${i}`, new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(), { synced: i !== 0 }));
    saveSessions(many);
    const kept = loadSessions();
    expect(kept).toHaveLength(200);
    expect(kept.some(x => x.id === 'id0')).toBe(true); // oldest, but unsynced
    expect(kept.some(x => x.id === 'id1')).toBe(false);
  });

  it('merges by id and marks remote copies synced', () => {
    const local = [s('a', '2026-10-02T00:00:00Z', { synced: false }), s('b', '2026-10-01T00:00:00Z')];
    const remote = [s('a', '2026-10-02T00:00:00Z'), s('c', '2026-10-03T00:00:00Z')];
    const merged = mergeSessions(local, remote);
    expect(merged.map(x => x.id)).toEqual(['c', 'a', 'b']);
    expect(merged.find(x => x.id === 'a')!.synced).toBe(true);
  });

  it('returns recent sessions and best score per module', () => {
    saveSessions([s('a', '2026-10-01T00:00:00Z', { correct: 9 }), s('b', '2026-10-02T00:00:00Z'), s('c', '2026-10-03T00:00:00Z', { module_id: null, kind: 'endless' })]);
    expect(recentSessions(2).map(x => x.id)).toEqual(['c', 'b']);
    expect(bestScores(loadSessions())).toEqual({ m0: 90 });
  });

  it('treats corrupt storage as empty', () => {
    localStorage.setItem('latiniq_sessions', '{nope');
    expect(loadSessions()).toEqual([]);
  });
});
