import { legacyImports, loadProgress, loadStreak, loadTotalXP, rebuildFromSessions, recordSession, streakFrom, updateStreak, isUnlocked, prevDay, todayISO, liveStreak, streakMilestone, addDays, dayDiff } from './progressStore';
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

describe('prevDay and local days', () => {
  it('prevDay crosses month, year and leap boundaries', () => {
    expect(prevDay('2026-11-01')).toBe('2026-10-31');
    expect(prevDay('2026-01-01')).toBe('2025-12-31');
    expect(prevDay('2024-03-01')).toBe('2024-02-29');
  });
  it('todayISO uses the local calendar day', () => {
    expect(todayISO(new Date(2026, 10, 16, 23, 30))).toBe('2026-11-16');
    expect(todayISO(new Date(2026, 10, 16, 0, 5))).toBe('2026-11-16');
  });
  it('updateStreak leaves a streak whose lastDate is ahead of today', () => {
    localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate: '2026-10-03', count: 4 }));
    expect(updateStreak('2026-10-02')).toEqual({ lastDate: '2026-10-03', count: 4 });
  });
  it('liveStreak is the stored count only for today or yesterday (or later)', () => {
    localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate: '2026-10-09', count: 4 }));
    expect(liveStreak('2026-10-10')).toBe(4);
    expect(liveStreak('2026-10-11')).toBe(0);
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
    expect(out).toEqual({ completed: true, earnedXP: 50, pct: 80, alreadyComplete: false });
    expect(loadTotalXP()).toBe(50);
    expect(loadProgress().m0.wrong_ids).toEqual(['m08', 'm09']);
  });
  it('does not complete on a short session', () => {
    const m = mod('m0', 20);
    const out = recordSession(m, [{ q: m.questions[0], given: 'x', correct: true }]);
    expect(out.completed).toBe(false);
    expect(loadTotalXP()).toBe(0);
  });
  it('keeps wrong_ids from a first failed session', () => {
    const m = mod('m0', 20);
    const out = recordSession(m, [{ q: m.questions[0], given: 'x', correct: false }, { q: m.questions[1], given: 'x', correct: true }]);
    expect(out.alreadyComplete).toBe(false);
    expect(loadProgress().m0).toEqual({ wrong_ids: ['m00'] });
  });
  it('reports alreadyComplete for a module completed earlier', () => {
    const m = mod('m0', 20);
    localStorage.setItem('latiniq_progress', JSON.stringify({ m0: { completed: true, xp: 50 } }));
    const out = recordSession(m, [{ q: m.questions[0], given: 'x', correct: true }]);
    expect(out).toMatchObject({ completed: false, alreadyComplete: true });
    expect(loadProgress().m0.completed).toBe(true);
  });
});

describe('recordSession wrong_ids accumulate', () => {
  const miss = (m: ModuleContent, i: number, correct: boolean) => ({ q: m.questions[i], given: 'x', correct });

  it('keeps mistakes from an earlier session through a later one on other questions', () => {
    const m = mod('m0', 20);
    recordSession(m, [miss(m, 0, false), miss(m, 1, false)]);
    recordSession(m, [miss(m, 5, true), miss(m, 6, false)]);
    expect(loadProgress().m0.wrong_ids).toEqual(['m00', 'm01', 'm06']);
  });
  it('removes an id answered correctly later', () => {
    const m = mod('m0', 20);
    recordSession(m, [miss(m, 0, false), miss(m, 1, false)]);
    recordSession(m, [miss(m, 0, true)]);
    expect(loadProgress().m0.wrong_ids).toEqual(['m01']);
  });
  it('removes ids that are not in the module', () => {
    const m = mod('m0', 20);
    localStorage.setItem('latiniq_progress', JSON.stringify({ m0: { wrong_ids: ['gone', 'm03'] } }));
    recordSession(m, [miss(m, 1, false)]);
    expect(loadProgress().m0.wrong_ids).toEqual(['m03', 'm01']);
  });
  it('does not duplicate an id that is wrong again', () => {
    const m = mod('m0', 20);
    recordSession(m, [miss(m, 0, false)]);
    recordSession(m, [miss(m, 0, false), miss(m, 0, false)]);
    expect(loadProgress().m0.wrong_ids).toEqual(['m00']);
  });
});

describe('streakMilestone', () => {
  it('returns the new count on the first session of a streak day', () => {
    localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate: prevDay(todayISO()), count: 4 }));
    expect(streakMilestone(() => updateStreak(todayISO()))).toBe(5);
    expect(streakMilestone(() => updateStreak(todayISO()))).toBeNull();
  });
  it('returns null for a brand-new streak of 1', () => {
    expect(streakMilestone(() => updateStreak(todayISO()))).toBeNull();
  });
});

describe('day helpers', () => {
  it('addDays and dayDiff work across month and DST boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(dayDiff('2026-03-01', '2026-03-31')).toBe(30);
    expect(dayDiff('2026-10-01', '2026-11-30')).toBe(60);
  });
});

describe('rebuildFromSessions keeps a real streak', () => {
  const today = '2026-11-14';
  const at = (iso: string, kind: PracticeSession['kind'] = 'module'): PracticeSession => {
    const [y, m, d] = iso.split('-').map(Number);
    return {
      id: crypto.randomUUID(), kind, module_id: 'm0', correct: 1, total: 1, xp: 0, completed: false,
      finished_at: new Date(y, m - 1, d, 12).toISOString(), synced: true,
    };
  };
  const setStreak = (lastDate: string, count: number) => localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate, count }));

  it('keeps a live stored streak when the log is empty or only imports', () => {
    setStreak(today, 12);
    rebuildFromSessions([], today);
    expect(loadStreak()).toEqual({ lastDate: today, count: 12 });
    rebuildFromSessions([at(today, 'import')], today);
    expect(loadStreak()).toEqual({ lastDate: today, count: 12 });
  });
  it('extends a log-truncated run back to the stored start', () => {
    setStreak(today, 30);
    rebuildFromSessions([0, 1, 2, 3, 4].map(n => at(addDays(today, -n))), today);
    expect(loadStreak()).toEqual({ lastDate: today, count: 30 });
  });
  it('uses the rebuilt value when the log has a gap inside its own range', () => {
    setStreak(today, 30);
    rebuildFromSessions([at(today), at(addDays(today, -3))], today);
    expect(loadStreak()).toEqual({ lastDate: today, count: 1 });
  });
  it('gives 0 for a stored streak that is not live and an empty log', () => {
    setStreak(addDays(today, -5), 8);
    rebuildFromSessions([], today);
    expect(loadStreak().count).toBe(0);
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
