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

export function todayISO(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function updateStreak(today: string): Streak {
  const s = loadStreak();
  if (s.lastDate === today) return s;
  const y = new Date(today + 'T00:00:00Z');
  y.setUTCDate(y.getUTCDate() - 1);
  const next = { lastDate: today, count: s.lastDate === todayISO(y) ? s.count + 1 : 1 };
  localStorage.setItem(KEY_STREAK, JSON.stringify(next));
  return next;
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
  const wrongIds = results.filter(r => !r.correct).map(r => r.q.id);

  if (qualifies) {
    const p = (progress[mod.id] ??= {});
    p.completed = true;
    p.xp = (p.xp ?? 0) + earnedXP;
    p.wrong_ids = wrongIds;
    localStorage.setItem(KEY_XP, String(loadTotalXP() + earnedXP));
  } else if (progress[mod.id]) {
    progress[mod.id].wrong_ids = wrongIds;
  }
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
  appendSession({
    kind: 'module', module_id: mod.id, correct, total, xp: qualifies ? earnedXP : 0, completed: qualifies,
  });
  return { completed: qualifies, earnedXP: qualifies ? earnedXP : 0, pct };
}

/** Consecutive days with practice, ending today or yesterday. */
export function streakFrom(dates: string[], today = todayISO()): Streak {
  const days = new Set(dates);
  const prev = (iso: string) => {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return todayISO(d);
  };
  let day = days.has(today) ? today : prev(today);
  if (!days.has(day)) return { lastDate: [...days].sort().pop() ?? '', count: 0 };
  const lastDate = day;
  let count = 0;
  while (days.has(day)) {
    count++;
    day = prev(day);
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
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(progress));
  localStorage.setItem(KEY_XP, String(total));
  localStorage.setItem(KEY_STREAK, JSON.stringify(streakFrom(dates, today)));
}

export function resetAll() {
  [KEY_PROGRESS, KEY_STREAK, KEY_XP, 'latiniq_sessions'].forEach(k => localStorage.removeItem(k));
}
