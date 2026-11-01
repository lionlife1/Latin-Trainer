import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { syncSessions } from './sync';

const listeners = new Set<() => void>();

/** Ask the mounted provider to sync now (e.g. right after a drill). No-op when signed out. */
export const requestSync = () => listeners.forEach(l => l());

const VersionContext = createContext(0);

/**
 * Syncs practice sessions whenever a signed-in user appears and on requestSync().
 * Provides a counter that bumps after each sync so pages re-read local progress.
 */
export function SessionSyncProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!supabase || !userId) return;
    const sb = supabase;
    let alive = true;
    const run = () => syncSessions(sb, userId).then(() => alive && setVersion(v => v + 1));
    run();
    listeners.add(run);
    return () => {
      alive = false;
      listeners.delete(run);
    };
  }, [userId]);

  return <VersionContext.Provider value={version}>{children}</VersionContext.Provider>;
}

export const useSyncVersion = () => useContext(VersionContext);
