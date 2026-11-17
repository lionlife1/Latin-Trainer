import { useEffect, useRef, useState } from 'react';

/** True when the user asks for reduced motion, or when matchMedia is unavailable (jsdom). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}

/**
 * Counts up to `target` with an ease-out curve and integer output. `from` defaults to `target`
 * (no animation on first render). When `target` changes, animates from the displayed value.
 */
export function useCountUp(target: number, opts: { from?: number; ms?: number } = {}): number {
  const ms = opts.ms ?? 500;
  const [shown, setShown] = useState<number>(() =>
    prefersReducedMotion() ? target : Math.round(opts.from ?? target),
  );
  const shownRef = useRef(shown);

  useEffect(() => {
    if (prefersReducedMotion() || shownRef.current === target || ms <= 0) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const start = shownRef.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = p >= 1 ? target : Math.round(start + (target - start) * eased);
      shownRef.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return prefersReducedMotion() ? target : shown;
}
