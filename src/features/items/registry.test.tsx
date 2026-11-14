import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DrillQuestion } from '../../lib/types';
import { ITEM_RENDERERS, rendererFor } from './registry';

const mc: DrillQuestion = { id: 'a', type: 'mc', badge: 'b', prompt: 'p', choices: ['x', 'y'], correct: 'x' };
const typein: DrillQuestion = { id: 'b', type: 'typein', badge: 'b', prompt: 'p', answers: ['amo'] };

describe('item renderer registry', () => {
  it('has an entry for every type', () => {
    for (const t of ['mc', 'typein', 'grid', 'parse'] as const) expect(ITEM_RENDERERS[t]).toBeDefined();
    expect(rendererFor(mc)).toBe(ITEM_RENDERERS.mc);
  });

  it('renders mc practice choices and reports the pick', () => {
    const onSubmit = vi.fn();
    const { Practice } = rendererFor(mc);
    render(<Practice q={mc} onSubmit={onSubmit} />);
    screen.getByRole('button', { name: 'y' }).click();
    expect(onSubmit).toHaveBeenCalledWith('y');
  });

  it('renders the typein test input as a controlled field', () => {
    const { Test, answered } = rendererFor(typein);
    render(<Test q={typein} value="am" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Type your answer…')).toHaveValue('am');
    expect(answered(typein, 'am')).toBe('full');
    expect(answered(typein, ' ')).toBe('none');
  });

  it('shows a placeholder for grid and parse', () => {
    const { Test } = rendererFor({ type: 'grid' });
    render(<Test q={mc} value={undefined} onChange={() => {}} />);
    expect(screen.getByText('This question type is not supported yet.')).toBeInTheDocument();
  });
});
