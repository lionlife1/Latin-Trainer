import type { SupabaseClient } from '@supabase/supabase-js';
import { loadProgress, loadTotalXP } from '../solo/progressStore';
import { appendSession, loadSessions } from './sessionLog';
import { syncSessions } from './sync';

type Row = Record<string, unknown>;

function fakeClient(opts: { failPush?: boolean; remote?: Row[] } = {}) {
  const table: Row[] = [...(opts.remote ?? [])];
  const pushes: Row[][] = [];
  const query = {
    eq: () => query, order: () => query,
    limit: async () => ({ data: table.map(r => ({ ...r })), error: null }),
  };
  const client = {
    from: () => ({
      upsert: async (rows: Row[]) => {
        pushes.push(rows);
        if (opts.failPush) return { error: { message: 'offline' } };
        for (const r of rows) if (!table.some(t => t.id === r.id)) table.push(r);
        return { error: null };
      },
      select: () => query,
    }),
  };
  return { sb: client as unknown as SupabaseClient, table, pushes };
}

const base = { kind: 'module' as const, module_id: 'm0', correct: 8, total: 10, xp: 25, completed: true };

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('syncSessions', () => {
  it('pushes only unsynced rows, without the synced flag, tagged with the user', async () => {
    appendSession(base);
    const { sb, pushes } = fakeClient();
    await syncSessions(sb, 'u1');
    expect(pushes).toHaveLength(1);
    expect(pushes[0][0]).not.toHaveProperty('synced');
    expect(pushes[0][0]).toMatchObject({ user_id: 'u1', module_id: 'm0' });
    expect(loadSessions().every(s => s.synced)).toBe(true);
  });

  it('failed push leaves sessions unsynced', async () => {
    appendSession(base);
    await syncSessions(fakeClient({ failPush: true }).sb, 'u1');
    expect(loadSessions()[0].synced).toBe(false);
  });

  it('push is idempotent: a second sync sends nothing', async () => {
    appendSession(base);
    const { sb, pushes, table } = fakeClient();
    await syncSessions(sb, 'u1');
    await syncSessions(sb, 'u1');
    expect(pushes).toHaveLength(1);
    expect(table).toHaveLength(1);
  });

  it('pulls remote sessions and rebuilds progress from them', async () => {
    const remote = [{ id: crypto.randomUUID(), ...base, module_id: 'm3', xp: 40, finished_at: '2026-10-01T10:00:00+00:00' }];
    await syncSessions(fakeClient({ remote }).sb, 'u1');
    expect(loadSessions()[0]).toMatchObject({ module_id: 'm3', synced: true, finished_at: '2026-10-01T10:00:00.000Z' });
    expect(loadProgress().m3.completed).toBe(true);
    expect(loadTotalXP()).toBe(40);
  });

  it('legacy import preserves progress, once', async () => {
    localStorage.setItem('latiniq_progress', JSON.stringify({ m0: { completed: true, xp: 50 } }));
    localStorage.setItem('latiniq_xp', '50');
    const { sb, table } = fakeClient();
    await syncSessions(sb, 'u1');
    expect(table).toHaveLength(1);
    expect(table[0]).toMatchObject({ kind: 'import', module_id: 'm0', xp: 50 });
    expect(loadProgress().m0.completed).toBe(true);
    expect(loadTotalXP()).toBe(50);
    localStorage.setItem('latiniq_progress', JSON.stringify({ m0: { completed: true, xp: 50 }, m1: { completed: true, xp: 5 } }));
    await syncSessions(sb, 'u1');
    expect(table).toHaveLength(1);
  });
});
