import { act, renderHook } from '@testing-library/react';
import { prefersReducedMotion, useCountUp } from './motion';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('prefersReducedMotion', () => {
  it('is true when matchMedia is missing (jsdom)', () => {
    expect(prefersReducedMotion()).toBe(true);
  });
  it('is false when matchMedia reports no preference', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('useCountUp', () => {
  it('renders the target at once in jsdom', () => {
    const { result } = renderHook(() => useCountUp(50, { from: 0 }));
    expect(result.current).toBe(50);
  });

  it('animates from 0 to exactly 50 when motion is allowed', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const { result } = renderHook(() => useCountUp(50, { from: 0, ms: 500 }));
    expect(result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(50);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(50);
  });

  it('animates from the displayed value when the target changes', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const { result, rerender } = renderHook(({ t }) => useCountUp(t, { from: 0 }), {
      initialProps: { t: 10 },
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(10);
    rerender({ t: 20 });
    expect(result.current).toBe(10);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(20);
  });
});
