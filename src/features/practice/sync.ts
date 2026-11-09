import type { SupabaseClient } from '@supabase/supabase-js';
import { legacyImports, loadProgress, rebuildFromSessions } from '../solo/progressStore';
import { appendSession, loadSessions, mergeSessions, saveSessions, syncsToServer, type PracticeSession } from './sessionLog';

const KEY_IMPORTED = 'latiniq_imported';
const COLS = 'id, kind, module_id, correct, total, xp, completed, finished_at';

/**
 * Push unsynced local sessions, pull the account's history, merge, and rebuild local progress.
 * Never throws: on failure sessions stay unsynced and the next sync retries.
 */
export async function syncSessions(sb: SupabaseClient, userId: string): Promise<void> {
  try {
    if (!localStorage.getItem(KEY_IMPORTED)) {
      for (const s of legacyImports(loadProgress(), loadSessions())) appendSession(s);
      localStorage.setItem(KEY_IMPORTED, '1');
    }

    const unsynced = loadSessions().filter(s => !s.synced && syncsToServer(s));
    if (unsynced.length) {
      const rows = unsynced.map(({ synced: _synced, ...row }) => ({ ...row, user_id: userId }));
      const { error } = await sb.from('practice_sessions').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
      if (error) throw new Error(error.message);
      const pushed = new Set(unsynced.map(s => s.id));
      saveSessions(loadSessions().map(s => (pushed.has(s.id) ? { ...s, synced: true } : s)));
    }

    const { data, error } = await sb
      .from('practice_sessions')
      .select(COLS)
      .eq('user_id', userId)
      .order('finished_at', { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    // Postgres returns "+00:00" offsets; normalise so string sorting matches local entries.
    const remote = ((data ?? []) as PracticeSession[]).map(s => ({ ...s, finished_at: new Date(s.finished_at).toISOString() }));
    const merged = mergeSessions(loadSessions(), remote);
    saveSessions(merged);
    rebuildFromSessions(merged);
  } catch (e) {
    console.warn('Practice sync failed; will retry', e);
  }
}
