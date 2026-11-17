import type { SupabaseClient } from '@supabase/supabase-js';
import { loadProgress, loadTotalXP } from '../solo/progressStore';
import { appendSession, loadSessions } from './sessionLog';
import { syncSessions } from './sync';

type Row = Record<string, unknown>;

function fakeClient(opts: { failPush?: boolean; remote?: Row[] } = {}) {
  const table: Row[] = [...(opts.remote ?? [])];
  const pushes: Row[][] = [];
  const select = () => {
    let progressOnly = false;
    let desc = false;
    const q = {
      eq: () => q,
      // The only filter the app uses: or('completed.eq.true,xp.gt.0').
      or: (f: string) => {
        if (f !== 'completed.eq.true,xp.gt.0') throw new Error(`unsupported filter ${f}`);
        progressOnly = true;
        return q;
      },
      order: (_col: string, o: { ascending: boolean }) => {
        desc = !o.ascending;
        return q;
      },
      limit: async (n: number) => {
        let rows = table.filter(r => !progressOnly || r.completed === true || Number(r.xp) > 0);
        rows = [...rows].sort((a, b) => new Date(String(a.finished_at)).getTime() - new Date(String(b.finished_at)).getTime());
        if (desc) rows.reverse();
        return { data: rows.slice(0, n).map(r => ({ ...r })), error: null };
      },
    };
    return q;
  };
  const client = {
    from: () => ({
      upsert: async (rows: Row[]) => {
        pushes.push(rows);
        if (opts.failPush) return { error: { message: 'offline' } };
        for (const r of rows) if (!table.some(t => t.id === r.id)) table.push(r);
        return { error: null };
      },
      select,
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

  it('never pushes a kind the server rejects', async () => {
    appendSession({ ...base, kind: 'forms', module_id: null });
    appendSession(base);
    const { sb, pushes } = fakeClient();
    await syncSessions(sb, 'u1');
    expect(pushes).toHaveLength(1);
    expect(pushes[0]).toHaveLength(1);
    expect(pushes[0][0]).toMatchObject({ kind: 'module' });
    const forms = loadSessions().find(x => x.kind === 'forms');
    expect(forms?.synced).toBe(false);
    await syncSessions(sb, 'u1');
    expect(pushes).toHaveLength(1);
  });

  it('never pushes vocab sessions and keeps them locally', async () => {
    appendSession({ ...base, kind: 'vocab', module_id: null, set_id: 's1' });
    appendSession(base);
    const { sb, pushes } = fakeClient();
    await syncSessions(sb, 'u1');
    expect(pushes).toHaveLength(1);
    expect(pushes[0]).toHaveLength(1);
    expect(pushes[0][0]).toMatchObject({ kind: 'module' });
    expect(pushes[0][0]).not.toHaveProperty('set_id');
    const vocab = loadSessions().find(x => x.kind === 'vocab');
    expect(vocab).toMatchObject({ set_id: 's1', synced: false });
  });

  it('sends nothing when only vocab sessions are unsynced', async () => {
    appendSession({ ...base, kind: 'vocab', module_id: null, set_id: 's1' });
    const { sb, pushes } = fakeClient();
    await syncSessions(sb, 'u1');
    expect(pushes).toHaveLength(0);
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

  it('keeps an old completed module on a fresh device when 200 newer sessions follow it', async () => {
    const t = (i: number) => new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString();
    const remote: Row[] = [
      { id: crypto.randomUUID(), ...base, finished_at: t(0) },
      ...Array.from({ length: 200 }, (_, i) => ({
        id: crypto.randomUUID(), kind: 'endless', module_id: null, correct: 1, total: 2, xp: 0, completed: false, finished_at: t(i + 1),
      })),
    ];
    await syncSessions(fakeClient({ remote }).sb, 'u1');
    expect(loadProgress().m0.completed).toBe(true);
    expect(loadTotalXP()).toBe(25);
    expect(loadSessions()).toHaveLength(200);
    await syncSessions(fakeClient({ remote }).sb, 'u1');
    expect(loadProgress().m0.completed).toBe(true);
    expect(loadTotalXP()).toBe(25);
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
