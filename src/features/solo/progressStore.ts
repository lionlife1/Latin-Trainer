import type { ModuleContent, ModuleMeta } from '../../lib/types';
import type { DrillResult } from '../drill/useDrill';
import { appendSession, type NewSession, type PracticeSession } from '../practice/sessionLog';

// Same keys as the legacy app so existing learners keep their progress.
const KEY_PROGRESS = 'latiniq_progress';
const KEY_STREAK = 'latiniq_streak';
const KEY_XP = 'latiniq_xp';

export interface ModuleProgress {
  completed?: boolean;
  xp?: number;
  wrong_ids?: string[];
}
export type Progress = Record<string, ModuleProgress>;
export interface Streak {
  lastDate: string;
  count: number;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export const loadProgress = (): Progress => readJSON<Progress>(KEY_PROGRESS, {});
export const loadStreak = (): Streak => readJSON<Streak>(KEY_STREAK, { lastDate: '', count: 0 });
export const loadTotalXP = (): number => parseInt(localStorage.getItem(KEY_XP) ?? '0', 10) || 0;

/** The local calendar day as YYYY-MM-DD. Streak days are the student's own days, not UTC days. */
export function todayISO(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The calendar day before an ISO day. Built from local parts, so it is safe across DST. */
export function prevDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return todayISO(new Date(y, m - 1, d - 1));
}

/** The calendar day n days after an ISO day (n may be negative). Built from local parts, so it is safe across DST. */
export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return todayISO(new Date(y, m - 1, d + n));
}

/** Whole days from day a to day b. */
export function dayDiff(a: string, b: string): number {
  const utc = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}

export function updateStreak(today: string): Streak {
  const s = loadStreak();
  // Same day, or a lastDate written under the old UTC rule that is a day ahead of the local day.
  if (s.lastDate >= today) return s;
  const next = { lastDate: today, count: s.lastDate === prevDay(today) ? s.count + 1 : 1 };
  localStorage.setItem(KEY_STREAK, JSON.stringify(next));
  return next;
}

/** Runs `log` (which records a session and counts today) and returns the streak count if that made today a new streak day of 2 or more, else null. */
export function streakMilestone(log: () => void): number | null {
  const before = loadStreak();
  log();
  const after = loadStreak();
  return after.lastDate !== before.lastDate && after.count >= 2 ? after.count : null;
}

/** A streak only counts if its last day is today or yesterday. */
export function liveStreak(today = todayISO()): number {
  const s = loadStreak();
  return s.lastDate >= prevDay(today) ? s.count : 0;
}

export function isUnlocked(mod: ModuleMeta, progress: Progress): boolean {
  return mod.prerequisites.every(p => progress[p]?.completed === true);
}

/** Legacy rules: complete at >=70% on a session of 10+ questions (or the whole module); XP proportional to length. */
export function recordSession(mod: ModuleContent, results: DrillResult[]) {
  const progress = loadProgress();
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const earnedXP = Math.round(mod.xp_reward * (total / mod.questions.length));
  const qualifies = total >= Math.min(10, mod.questions.length) && pct >= 70;
  const inModule = new Set(mod.questions.map(q => q.id));
  const answeredRight = new Set(results.filter(r => r.correct).map(r => r.q.id));
  const alreadyComplete = progress[mod.id]?.completed === true;

  const p = (progress[mod.id] ??= {});
  // Mistakes accumulate: only a correct answer (or a question removed from the module) clears one.
  const wrongIds = (p.wrong_ids ?? []).filter(id => inModule.has(id) && !answeredRight.has(id));
  for (const r of results) if (!r.correct && !wrongIds.includes(r.q.id)) wrongIds.push(r.q.id);
  p.wrong_ids = wrongIds;
  if (qualifies) {
    p.completed = true;
    p.xp = (p.xp ?? 0) + earnedXP;
    localStorage.setItem(KEY_XP, String(loadTotalXP() + earnedXP));
  }
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
  appendSession({
    kind: 'module', module_id: mod.id, correct, total, xp: qualifies ? earnedXP : 0, completed: qualifies,
  });
  return { completed: qualifies, earnedXP: qualifies ? earnedXP : 0, pct, alreadyComplete };
}

/** Consecutive days with practice, ending today or yesterday. */
export function streakFrom(dates: string[], today = todayISO()): Streak {
  const days = new Set(dates);
  let day = days.has(today) ? today : prevDay(today);
  if (!days.has(day)) return { lastDate: [...days].sort().pop() ?? '', count: 0 };
  const lastDate = day;
  let count = 0;
  while (days.has(day)) {
    count++;
    day = prevDay(day);
  }
  return { lastDate, count };
}

/** One 'import' session per module the legacy app completed that has no completed session in the log. */
export function legacyImports(progress: Progress, sessions: PracticeSession[]): NewSession[] {
  const covered = new Set(sessions.filter(s => s.completed && s.module_id).map(s => s.module_id));
  return Object.entries(progress)
    .filter(([id, p]) => p.completed && !covered.has(id))
    .map(([id, p]) => ({ kind: 'import', module_id: id, correct: 0, total: 0, xp: p.xp ?? 0, completed: true }));
}

/** Recomputes completion, XP and streak from the session log. Keeps this device's wrong_ids. */
export function rebuildFromSessions(sessions: PracticeSession[], today = todayISO()) {
  const progress: Progress = {};
  for (const [id, p] of Object.entries(loadProgress())) if (p.wrong_ids) progress[id] = { wrong_ids: p.wrong_ids };
  let total = 0;
  for (const s of sessions) {
    total += s.xp;
    if (!s.module_id || (!s.completed && !s.xp)) continue;
    const p = (progress[s.module_id] ??= {});
    if (s.completed) p.completed = true;
    p.xp = (p.xp ?? 0) + s.xp;
  }
  const dates = sessions.filter(s => s.kind !== 'import').map(s => todayISO(new Date(s.finished_at)));
  const rebuilt = streakFrom(dates, today);
  const stored = loadStreak(); // read before anything is written
  let streak = rebuilt;
  // The log is capped and legacy learners have none, so a live stored streak must not be cut short.
  if (stored.count > 0 && stored.lastDate >= prevDay(today)) {
    if (!dates.length) {
      streak = stored;
    } else if (rebuilt.count > 0) {
      const oldest = [...dates].sort()[0];
      const runStart = addDays(rebuilt.lastDate, -(rebuilt.count - 1));
      const storedStart = addDays(stored.lastDate, -(stored.count - 1));
      if (runStart === oldest && storedStart < oldest && stored.lastDate >= prevDay(oldest)) {
        streak = { lastDate: rebuilt.lastDate, count: dayDiff(storedStart, rebuilt.lastDate) + 1 };
      }
    }
  }
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
  localStorage.setItem(KEY_XP, String(total));
  localStorage.setItem(KEY_STREAK, JSON.stringify(streak));
}

export function resetAll() {
  [KEY_PROGRESS, KEY_STREAK, KEY_XP, 'latiniq_sessions'].forEach(k => localStorage.removeItem(k));
}
