import { act, renderHook } from '@testing-library/react';
import { useDrill } from './useDrill';
import type { DrillQuestion } from '../../lib/types';

const qs: DrillQuestion[] = [
  { id: 'a', type: 'typein', badge: 'B', prompt: 'p1', answers: ['amem'] },
  { id: 'b', type: 'mc', badge: 'B', prompt: 'p2', choices: ['x', 'y'], correct: 'y' },
];

describe('useDrill practice mode', () => {
  it('grades, scores and advances to finished', () => {
    const onAnswer = vi.fn();
    const { result } = renderHook(() => useDrill(qs, { mode: 'practice', onAnswer }));
    expect(result.current.current?.id).toBe('a');
    act(() => result.current.answer('Amēm'));
    expect(result.current.lastResult?.correct).toBe(true);
    expect(result.current.score).toBe(1);
    expect(onAnswer).toHaveBeenCalledWith(qs[0], 'Amēm', true, expect.any(Number));
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    act(() => result.current.answer('x'));
    expect(result.current.score).toBe(1);
    act(() => result.current.next());
    expect(result.current.finished).toBe(true);
    expect(result.current.results.map(r => r.correct)).toEqual([true, false]);
  });

  it('ignores a second answer to the same question', () => {
    const { result } = renderHook(() => useDrill(qs, { mode: 'practice' }));
    act(() => result.current.answer('wrong'));
    act(() => result.current.answer('amem'));
    expect(result.current.results).toHaveLength(1);
    expect(result.current.score).toBe(0);
  });
});

describe('useDrill test mode', () => {
  it('records answers without grading', () => {
    const onAnswer = vi.fn();
    const { result } = renderHook(() => useDrill(qs, { mode: 'test', onAnswer }));
    act(() => result.current.answer('amem'));
    expect(result.current.results[0].correct).toBeUndefined();
    expect(result.current.score).toBe(0);
    expect(onAnswer).toHaveBeenCalledWith(qs[0], 'amem', undefined, expect.any(Number));
  });
});

describe('useDrill endless', () => {
  it('appends a generated question on next and never finishes', () => {
    let n = 0;
    const gen = (): DrillQuestion => ({ id: `g${n++}`, type: 'typein', badge: 'E', prompt: 'g', answers: ['x'] });
    const first = [gen()];
    const { result } = renderHook(() => useDrill(first, { mode: 'practice', generate: gen }));
    act(() => result.current.answer('x'));
    act(() => result.current.next());
    expect(result.current.current?.id).toBe('g1');
    expect(result.current.finished).toBe(false);
  });
});
