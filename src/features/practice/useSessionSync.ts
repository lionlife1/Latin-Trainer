import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { syncSessions } from './sync';

const listeners = new Set<() => void>();

/** Ask the mounted sync hook to push now (e.g. right after a drill). No-op when signed out. */
export const requestSync = () => listeners.forEach(l => l());

/**
 * Syncs practice sessions whenever a signed-in user appears and on requestSync().
 * Returns a counter that bumps after each sync so pages can re-read local progress.
 */
export function useSessionSync(): number {
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

  return version;
}
