import type { ModuleContent, ModuleMeta } from '../../lib/types';
import type { DrillResult } from '../drill/useDrill';

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
  return { completed: qualifies, earnedXP: qualifies ? earnedXP : 0, pct };
}

export function resetAll() {
  [KEY_PROGRESS, KEY_STREAK, KEY_XP].forEach(k => localStorage.removeItem(k));
}
