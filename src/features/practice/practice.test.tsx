import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MODULES } from '../../content/modules';
import { logEndless } from './EndlessRoute';
import { GrammarPath } from './GrammarPath';
import { PracticeHome } from './PracticeHome';
import { relativeDay } from './relativeDay';
import { loadSessions, saveSessions, type PracticeSession } from './sessionLog';

const sess = (over: Partial<PracticeSession>): PracticeSession => ({
  id: crypto.randomUUID(), kind: 'module', module_id: MODULES[1].id, correct: 6, total: 10, xp: 0, completed: false,
  finished_at: new Date().toISOString(), synced: true, ...over,
});

const at = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => localStorage.clear());

describe('relativeDay', () => {
  const now = new Date(2026, 9, 10, 12);
  it('labels recent days and falls back to a date', () => {
    expect(relativeDay(new Date(2026, 9, 10, 1).toISOString(), now)).toBe('Today');
    expect(relativeDay(new Date(2026, 9, 9, 23).toISOString(), now)).toBe('Yesterday');
    expect(relativeDay(new Date(2026, 9, 7, 9).toISOString(), now)).toBe('3 days ago');
    expect(relativeDay(new Date(2026, 9, 1).toISOString(), now)).not.toMatch(/ago|day/);
  });
});

describe('GrammarPath', () => {
  it('shows every module with its state and marks the first incomplete one as up next', () => {
    localStorage.setItem('latiniq_progress', JSON.stringify({ [MODULES[0].id]: { completed: true } }));
    saveSessions([sess({})]);
    at(<GrammarPath />);
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(MODULES.length);
    expect(steps[0]).toHaveAttribute('data-state', 'complete');
    expect(steps[1]).toHaveAttribute('data-state', 'practiced');
    expect(within(steps[1]).getByText('Best 60%')).toBeInTheDocument();
    expect(within(steps[1]).getByText('Up next')).toBeInTheDocument();
    expect(steps[2]).toHaveAttribute('data-state', 'new');
    expect(within(steps[2]).getByRole('link')).toHaveAttribute('href', `/practice/grammar/${MODULES[2].id}`);
  });
});

describe('PracticeHome', () => {
  it('shows an empty state with no sessions', () => {
    at(<PracticeHome />);
    expect(screen.getByText('Your practice sessions will show up here.')).toBeInTheDocument();
    expect(screen.getAllByText('Coming soon')).toHaveLength(2);
  });

  it('links to Forms between Grammar and Vocab', () => {
    at(<PracticeHome />);
    const titles = Array.from(document.querySelectorAll('.subject-title')).map(e => e.textContent);
    expect(titles).toEqual(['Grammar', 'Forms', 'Vocab', 'Translation']);
    expect(screen.getByRole('link', { name: /Forms/ })).toHaveAttribute('href', '/practice/forms');
  });

  it('shows Forms sessions in recents', () => {
    saveSessions([sess({ kind: 'forms', module_id: null, correct: 1, total: 2 })]);
    at(<PracticeHome />);
    expect(screen.getByRole('button', { name: /Forms/ })).toHaveTextContent('1/2 correct');
  });

  it('tolerates an unknown session kind', () => {
    saveSessions([sess({ kind: 'mystery' as never, module_id: null })]);
    at(<PracticeHome />);
    expect(screen.getByRole('button', { name: /Practice/ })).toBeInTheDocument();
  });

  it('lists the five newest sessions with scores, skipping imports', () => {
    saveSessions([
      ...Array.from({ length: 6 }, (_, i) => sess({ finished_at: new Date(Date.now() - i * 60_000).toISOString(), correct: i })),
      sess({ kind: 'import', finished_at: new Date(Date.now() + 60_000).toISOString() }),
    ]);
    at(<PracticeHome />);
    const rows = screen.getAllByRole('button', { name: new RegExp(MODULES[1].title) });
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent('0/10 correct');
    expect(rows[0]).toHaveTextContent('Today');
  });
});

describe('logEndless', () => {
  it('records nothing when no question was answered', () => {
    expect(logEndless([])).toBe(false);
    expect(loadSessions()).toEqual([]);
  });
  it('records an endless session after answering', () => {
    const q = { id: 'g', type: 'typein' as const, badge: 'B', prompt: '', answers: ['x'] };
    logEndless([{ q, given: 'x', correct: true }, { q, given: 'y', correct: false }]);
    expect(loadSessions()[0]).toMatchObject({ kind: 'endless', module_id: null, correct: 1, total: 2, xp: 0 });
  });
});
