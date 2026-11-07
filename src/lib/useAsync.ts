import { useCallback, useEffect, useState } from 'react';

/** The text to show for a caught error, without the "Error: " prefix String(e) adds. */
export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const run = useCallback(() => {
    let live = true;
    setState(s => ({ ...s, loading: true }));
    fn().then(
      data => live && setState({ data, loading: false }),
      (e: unknown) => live && setState({ error: errorMessage(e), loading: false }),
    );
    return () => {
      live = false;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(run, [run]);
  return { ...state, reload: run };
}
