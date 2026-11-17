process.env.TZ = 'America/Chicago';

import { liveStreak, loadStreak, rebuildFromSessions, todayISO, updateStreak } from './progressStore';
import type { PracticeSession } from '../practice/sessionLog';

const sess = (finished: Date): PracticeSession => ({
  id: crypto.randomUUID(), kind: 'module', module_id: 'm0', correct: 8, total: 10, xp: 0, completed: false,
  finished_at: finished.toISOString(), synced: true,
});

beforeEach(() => localStorage.clear());

describe('local calendar days (America/Chicago)', () => {
  it('runs in the expected time zone', () => {
    expect(new Date(2026, 10, 16, 19, 0).getTimezoneOffset()).toBe(360);
  });

  it('7 pm Monday and 5 pm Tuesday are different days', () => {
    expect(todayISO(new Date(2026, 10, 16, 19, 0))).toBe('2026-11-16');
    expect(todayISO(new Date(2026, 10, 17, 17, 0))).toBe('2026-11-17');
  });

  it('rebuild gives a streak of 2 for Monday 5 pm and Tuesday 7 pm', () => {
    rebuildFromSessions([sess(new Date(2026, 10, 16, 17, 0)), sess(new Date(2026, 10, 17, 19, 0))], '2026-11-17');
    expect(loadStreak()).toEqual({ lastDate: '2026-11-17', count: 2 });
  });

  it('updateStreak does not reset a streak whose lastDate is tomorrow', () => {
    localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate: '2026-11-17', count: 4 }));
    expect(updateStreak('2026-11-16')).toEqual({ lastDate: '2026-11-17', count: 4 });
    expect(loadStreak()).toEqual({ lastDate: '2026-11-17', count: 4 });
  });

  it('liveStreak: today, yesterday, two days ago, future', () => {
    const today = '2026-11-16';
    const set = (lastDate: string) => localStorage.setItem('latiniq_streak', JSON.stringify({ lastDate, count: 3 }));
    set('2026-11-16');
    expect(liveStreak(today)).toBe(3);
    set('2026-11-15');
    expect(liveStreak(today)).toBe(3);
    set('2026-11-14');
    expect(liveStreak(today)).toBe(0);
    set('2026-11-17');
    expect(liveStreak(today)).toBe(3);
  });
});
