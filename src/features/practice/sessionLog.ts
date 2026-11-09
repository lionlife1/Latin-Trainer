// Practice session history on this device. Feeds recents, best scores and (after sync) rebuilt progress.
const KEY = 'latiniq_sessions';
const CAP = 200;

/** Kinds the practice_sessions check constraint accepts. Anything else stays on this device. */
export const SERVER_KINDS: ReadonlySet<string> = new Set(['module', 'endless', 'import']);
export const syncsToServer = (s: Pick<PracticeSession, 'kind'>): boolean => SERVER_KINDS.has(s.kind);

export interface PracticeSession {
  /** Also the server primary key, so pushes are idempotent. */
  id: string;
  kind: 'module' | 'endless' | 'import' | 'forms';
  module_id: string | null;
  correct: number;
  total: number;
  /** XP earned by this session (0 if it didn't qualify). */
  xp: number;
  /** Did this session mark the module complete. */
  completed: boolean;
  finished_at: string;
  synced: boolean;
}

export type NewSession = Omit<PracticeSession, 'id' | 'synced' | 'finished_at'> & { finished_at?: string };

const newestFirst = (a: PracticeSession, b: PracticeSession) => b.finished_at.localeCompare(a.finished_at);

const isSession = (v: unknown): v is PracticeSession => {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.finished_at === 'string' && typeof o.kind === 'string'
    && Number.isFinite(o.correct) && Number.isFinite(o.total);
};

export function loadSessions(): PracticeSession[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter(isSession).sort(newestFirst) : [];
  } catch {
    return [];
  }
}

/** Keeps the newest CAP entries, but never drops an unsynced one while synced or local-only ones remain. */
export function saveSessions(sessions: PracticeSession[]) {
  let list = [...sessions].sort(newestFirst);
  while (list.length > CAP) {
    let drop = -1;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].synced || !syncsToServer(list[i])) {
        drop = i;
        break;
      }
    }
    list.splice(drop === -1 ? list.length - 1 : drop, 1);
  }
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function appendSession(s: NewSession): PracticeSession {
  const session: PracticeSession = { finished_at: new Date().toISOString(), ...s, id: crypto.randomUUID(), synced: false };
  saveSessions([session, ...loadSessions()]);
  return session;
}

export function mergeSessions(local: PracticeSession[], remote: PracticeSession[]): PracticeSession[] {
  const byId = new Map(local.map(s => [s.id, s]));
  for (const r of remote) byId.set(r.id, { ...r, synced: true });
  return [...byId.values()].sort(newestFirst);
}

export const recentSessions = (n = 5) => loadSessions().slice(0, n);

export const pct = (s: Pick<PracticeSession, 'correct' | 'total'>) => (s.total ? Math.round((s.correct / s.total) * 100) : 0);

/** Best score (%) per module, ignoring imports, which carry no score. */
export function bestScores(sessions: PracticeSession[]): Record<string, number> {
  const best: Record<string, number> = {};
  for (const s of sessions) {
    if (s.kind !== 'module' || !s.module_id || !s.total) continue;
    best[s.module_id] = Math.max(best[s.module_id] ?? 0, pct(s));
  }
  return best;
}
