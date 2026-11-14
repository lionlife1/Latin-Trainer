import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { grade } from '../../lib/grading';
import type { PrintQuestion } from '../../lib/print';
import type { DrillQuestion, ParseQuestion, PublicQuestion } from '../../lib/types';
import { rendererFor } from './registry';

const q: ParseQuestion = {
  id: 'p', type: 'parse', badge: 'b', prompt: 'Parse <b>puellae</b>',
  fields: [
    { id: 'case', label: 'Case', options: [{ value: 'gen', label: 'genitive' }, { value: 'dat', label: 'dative' }, { value: 'nom', label: 'nominative' }] },
    { id: 'num', label: 'Number', options: [{ value: 'sg', label: 'singular' }, { value: 'pl', label: 'plural' }] },
  ],
  key: [{ case: 'gen', num: 'sg' }, { case: 'dat', num: 'sg' }, { case: 'nom', num: 'pl' }],
};
const { key: _k, ...pub } = q;
const publicQ = pub as PublicQuestion;

describe('parse renderer', () => {
  it('practice: Check needs every field, then submits the picks', () => {
    const onSubmit = vi.fn();
    const { Practice } = rendererFor(q);
    render(<Practice q={q} onSubmit={onSubmit} />);
    const check = screen.getByRole('button', { name: 'Check' });
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Case' })).getByRole('button', { name: 'dative' }));
    expect(check).toBeDisabled();
    fireEvent.click(within(screen.getByRole('radiogroup', { name: 'Number' })).getByRole('button', { name: 'singular' }));
    expect(check).toBeEnabled();
    fireEvent.click(check);
    expect(onSubmit).toHaveBeenCalledWith({ case: 'dat', num: 'sg' });
  });

  it('practice with a result: marks fields and lists the other valid parses', () => {
    const given = { case: 'gen', num: 'pl' };
    const { Practice } = rendererFor(q);
    render(<Practice q={q} result={{ given, grade: grade(q, given) }} onSubmit={() => {}} />);
    expect(screen.getAllByText('Right')).toHaveLength(1);
    expect(screen.getAllByText('Wrong')).toHaveLength(1);
    expect(screen.getByText('Correct: singular')).toBeInTheDocument();
    expect(screen.getByText('Also correct: dative singular / nominative plural')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'genitive' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('test: controlled and answered() by fields chosen', () => {
    const onChange = vi.fn();
    const { Test, answered } = rendererFor(q);
    render(<Test q={publicQ} value={{ case: 'gen' }} onChange={onChange} />);
    screen.getByRole('button', { name: 'plural' }).click();
    expect(onChange).toHaveBeenCalledWith({ case: 'gen', num: 'pl' });
    expect(answered(publicQ, undefined)).toBe('none');
    expect(answered(publicQ, { case: 'gen' })).toBe('partial');
    expect(answered(publicQ, { case: 'gen', num: 'pl' })).toBe('full');
  });

  it('review: Label: chosen with tags, x/y, and every valid parse when revealed', () => {
    const { Review } = rendererFor(q);
    const parts = [{ id: 'case', ok: true }, { id: 'num', ok: false }];
    render(<Review q={q} given={{ case: 'gen', num: 'pl' }} parts={parts} correct={false} revealed />);
    expect(screen.getByText('1/2 correct')).toBeInTheDocument();
    expect(screen.getByText('genitive')).toBeInTheDocument();
    expect(screen.getByText('genitive singular / dative singular / nominative plural')).toBeInTheDocument();
  });

  it('print: copy has a labelled blank per field, key lists the parses', () => {
    const { PrintCopy, PrintKey } = rendererFor(q);
    const pq = { number: 1, question: q as DrillQuestion } as PrintQuestion;
    const { container, unmount } = render(<PrintCopy pq={pq} />);
    expect(container.querySelectorAll('.print-parse-field')).toHaveLength(2);
    unmount();
    render(<PrintKey pq={pq} />);
    expect(screen.getByText('genitive singular / dative singular / nominative plural')).toBeInTheDocument();
  });
});
