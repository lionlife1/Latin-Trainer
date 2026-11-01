import { legacyImports, loadProgress, loadStreak, loadTotalXP, rebuildFromSessions, recordSession, streakFrom, updateStreak, isUnlocked } from './progressStore';
import { loadSessions, type PracticeSession } from '../practice/sessionLog';
import type { ModuleContent } from '../../lib/types';

const mod = (id: string, nQuestions: number, prerequisites: string[] = []): ModuleContent => ({
  id, badge: 'M', title: id, tagline: '', description: '', concepts: [], prerequisites, xp_reward: 100,
  questions: Array.from({ length: nQuestions }, (_, i) => ({ id: `${id}${i}`, type: 'typein', badge: 'B', prompt: '', answers: ['x'] })),
});

beforeEach(() => localStorage.clear());

describe('streak', () => {
  it('increments on consecutive days and resets after a gap', () => {
    expect(updateStreak('2026-10-01').count).toBe(1);
    expect(updateStreak('2026-10-01').count).toBe(1);
    expect(updateStreak('2026-10-02').count).toBe(2);
    expect(updateStreak('2026-10-05').count).toBe(1);
  });
});

describe('legacy compatibility', () => {
  it('reads progress written by the legacy app', () => {
    localStorage.setItem('latiniq_progress', JSON.stringify({ forms_bootcamp: { completed: true, xp: 50, wrong_ids: ['f001'] } }));
    localStorage.setItem('latiniq_xp', '50');
    localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate: '2026-10-01', count: 3 }));
    expect(loadProgress().forms_bootcamp.completed).toBe(true);
    expect(loadTotalXP()).toBe(50);
    expect(loadStreak().count).toBe(3);
  });
});

describe('recordSession', () => {
  it('completes module and awards proportional XP at >=70% on a 10+ question session', () => {
    const m = mod('m0', 20);
    const results = Array.from({ length: 10 }, (_, i) => ({ q: m.questions[i], given: 'x', correct: i < 8 }));
    const out = recordSession(m, results);
    expect(out).toEqual({ completed: true, earnedXP: 50, pct: 80 });
    expect(loadTotalXP()).toBe(50);
    expect(loadProgress().m0.wrong_ids).toEqual(['m08', 'm09']);
  });
  it('does not complete on a short session', () => {
    const m = mod('m0', 20);
    const out = recordSession(m, [{ q: m.questions[0], given: 'x', correct: true }]);
    expect(out.completed).toBe(false);
    expect(loadTotalXP()).toBe(0);
  });
});

describe('session log integration', () => {
  const sess = (over: Partial<PracticeSession>): PracticeSession => ({
    id: crypto.randomUUID(), kind: 'module', module_id: 'm0', correct: 8, total: 10, xp: 0, completed: false,
    finished_at: '2026-10-10T12:00:00Z', synced: true, ...over,
  });

  it('recordSession appends one log entry', () => {
    const m = mod('m0', 20);
    recordSession(m, Array.from({ length: 10 }, (_, i) => ({ q: m.questions[i], given: 'x', correct: true })));
    const [s] = loadSessions();
    expect(s).toMatchObject({ kind: 'module', module_id: 'm0', correct: 10, total: 10, xp: 50, completed: true, synced: false });
  });

  it('rebuild: completed if any completed session, XP summed, wrong_ids kept', () => {
    localStorage.setItem('latiniq_progress', JSON.stringify({ m0: { wrong_ids: ['a'] } }));
    rebuildFromSessions([sess({ completed: true, xp: 40 }), sess({ xp: 0 }), sess({ module_id: 'm1', xp: 10, completed: true })], '2026-10-10');
    expect(loadProgress()).toEqual({ m0: { wrong_ids: ['a'], completed: true, xp: 40 }, m1: { completed: true, xp: 10 } });
    expect(loadTotalXP()).toBe(50);
  });

  it('streak counts runs ending today or yesterday and resets after a gap', () => {
    expect(streakFrom(['2026-10-08', '2026-10-09', '2026-10-10'], '2026-10-10').count).toBe(3);
    expect(streakFrom(['2026-10-08', '2026-10-09'], '2026-10-10').count).toBe(2);
    expect(streakFrom(['2026-10-05', '2026-10-07', '2026-10-08'], '2026-10-08').count).toBe(2);
    expect(streakFrom(['2026-10-01'], '2026-10-10').count).toBe(0);
  });

  it('legacyImports covers only completed modules without a completed session', () => {
    const progress = { m0: { completed: true, xp: 30 }, m1: { completed: true, xp: 20 }, m2: { wrong_ids: [] } };
    const out = legacyImports(progress, [sess({ module_id: 'm1', completed: true })]);
    expect(out).toEqual([{ kind: 'import', module_id: 'm0', correct: 0, total: 0, xp: 30, completed: true }]);
  });
});

describe('isUnlocked', () => {
  it('requires every prerequisite completed', () => {
    const m = mod('m1', 1, ['m0']);
    expect(isUnlocked(m, {})).toBe(false);
    expect(isUnlocked(m, { m0: { completed: true } })).toBe(true);
  });
});
