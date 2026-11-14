import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { grade } from '../../lib/grading';
import type { PrintQuestion } from '../../lib/print';
import type { DrillQuestion, Given, GridQuestion, PublicQuestion } from '../../lib/types';
import { rendererFor } from './registry';

const q: GridQuestion = {
  id: 'g', type: 'grid', badge: 'b', prompt: 'Decline puella',
  columns: ['Singular', 'Plural'],
  rows: [
    { label: 'Nominative', cells: [{ id: 'nom-sg', given: 'puella' }, { id: 'nom-pl' }] },
    { label: 'Genitive', cells: [{ id: 'gen-sg' }, null] },
  ],
  key: { 'nom-pl': ['puellae'], 'gen-sg': ['puellae', 'puellai'] },
};
const { key: _k, ...pub } = q;
const publicQ = pub as PublicQuestion;

describe('grid renderer', () => {
  it('practice: Check enables once a cell has text and submits the map', () => {
    const onSubmit = vi.fn();
    const { Practice } = rendererFor(q);
    render(<Practice q={q} onSubmit={onSubmit} />);
    expect(screen.getByText('puella')).toBeInTheDocument();
    expect(screen.getByText('–')).toBeInTheDocument();
    const check = screen.getByRole('button', { name: 'Check' });
    expect(check).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Genitive, Singular'), { target: { value: 'puellae' } });
    expect(check).toBeEnabled();
    fireEvent.click(check);
    expect(onSubmit).toHaveBeenCalledWith({ 'gen-sg': 'puellae' });
  });

  it('practice with a result: read-only, right/wrong classes, first accepted form beside wrong cells', () => {
    const given = { 'nom-pl': 'puella', 'gen-sg': 'puellae' };
    const { Practice } = rendererFor(q);
    render(<Practice q={q} result={{ given, grade: grade(q, given) }} onSubmit={() => {}} />);
    const wrong = screen.getByLabelText('Nominative, Plural');
    expect(wrong).toHaveClass('wrong');
    expect(wrong).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Genitive, Singular')).toHaveClass('correct');
    expect(screen.getByText('puellae')).toHaveClass('grid-correct');
  });

  it('test: controlled, reports the whole map; answered counts filled answer cells', () => {
    const { Test, answered } = rendererFor(q);
    function Host() {
      const [v, setV] = useState<Given | undefined>({ 'nom-pl': 'x' });
      return <Test q={publicQ} value={v} onChange={g => { setV(g); }} />;
    }
    render(<Host />);
    fireEvent.change(screen.getByLabelText('Genitive, Singular'), { target: { value: 'y' } });
    expect(screen.getByLabelText('Nominative, Plural')).toHaveValue('x');
    expect(screen.getByLabelText('Genitive, Singular')).toHaveValue('y');
    expect(answered(publicQ, undefined)).toBe('none');
    expect(answered(publicQ, { 'nom-pl': 'x' })).toBe('partial');
    expect(answered(publicQ, { 'nom-pl': 'x', 'gen-sg': 'y' })).toBe('full');
    expect(answered(publicQ, { 'nom-pl': ' ' })).toBe('none');
  });

  it('review: shows x/y correct and the accepted form only when revealed', () => {
    const { Review } = rendererFor(q);
    const parts = [{ id: 'nom-pl', ok: false }, { id: 'gen-sg', ok: true }];
    const given = { 'nom-pl': 'puella', 'gen-sg': 'puellae' };
    const { rerender } = render(<Review q={q} given={given} parts={parts} correct={false} revealed />);
    expect(screen.getByText('1/2 correct')).toBeInTheDocument();
    expect(screen.getByText('Wrong')).toBeInTheDocument();
    expect(document.querySelector('.grid-answer.wrong')).toHaveTextContent('puella');
    expect(document.querySelector('.grid-correct')).toHaveTextContent('puellae');
    rerender(<Review q={publicQ} given={given} parts={parts} correct={false} revealed={false} />);
    expect(document.querySelector('.grid-correct')).toBeNull();
  });

  it('print: copy has blank answer cells, key fills every accepted form', () => {
    const { PrintCopy, PrintKey } = rendererFor(q);
    const pq = { number: 1, question: q as DrillQuestion } as PrintQuestion;
    const { container, unmount } = render(<PrintCopy pq={pq} />);
    expect(container.querySelector('table.print-grid')).not.toBeNull();
    expect(container.querySelectorAll('.print-grid-blank')).toHaveLength(2);
    expect(container.querySelector('.grid-none')).not.toBeNull();
    unmount();
    render(<PrintKey pq={pq} />);
    expect(screen.getByText('puellae / puellai')).toBeInTheDocument();
  });
});

describe('grid in DrillSession and TestRunner', () => {
  it('practice feedback says x/y correct', async () => {
    const { DrillSession } = await import('../drill/DrillSession');
    render(<DrillSession questions={[q]} mode="practice" onFinish={() => {}} onExit={() => {}} />);
    fireEvent.change(screen.getByLabelText('Nominative, Plural'), { target: { value: 'puellae' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText('1/2 correct')).toBeInTheDocument();
    expect(screen.queryByText(/Correct answer/)).toBeNull();
  });

  it('test runner autosaves a grid answer without crashing', async () => {
    const { TestRunner } = await import('../student/TestRunner');
    const onSubmit = vi.fn();
    sessionStorage.clear();
    render(<TestRunner attemptId="a1" startedAt={new Date().toISOString()} timeLimitSec={null} items={[{ pool_id: 'p1', question: publicQ }]} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Nominative, Plural'), { target: { value: 'puellae' } });
    expect(screen.getByRole('button', { name: /Submit test \(1\/1 answered\)/ })).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem('latiniq_test_a1')!)).toEqual({ p1: { 'nom-pl': 'puellae' } });
  });
});
