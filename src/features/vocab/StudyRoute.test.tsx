import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSessions } from '../practice/sessionLog';
import { rate } from './scheduler';
import { StudyRoute } from './StudyRoute';
import { addCards, createSet, getSet, loadSrs, saveSrsRecord } from './storage';

const CARDS = [
  { latin: 'puella', english: 'girl' },
  { latin: 'aqua', english: 'water' },
  { latin: 'via', english: 'road' },
  { latin: 'silva', english: 'forest' },
];
const makeSet = (n = 2) => {
  const id = createSet('Ch 1')!.id;
  addCards(id, CARDS.slice(0, n));
  return id;
};
const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/practice/vocab/:setId/:mode" element={<StudyRoute />} />
        <Route path="/practice/vocab/:setId" element={<p>set page</p>} />
        <Route path="/practice/vocab" element={<p>vocab home</p>} />
      </Routes>
    </MemoryRouter>,
  );
const type = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  await user.type(screen.getByPlaceholderText(/type your answer/i), `${text}{Enter}`);
};
const next = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Continue' }));
const sched = (id: string, word: string) => {
  const card = getSet(id)!.cards.find(c => c.latin === word)!;
  return loadSrs()[`${id}:${card.id}:l2e`];
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('StudyRoute', () => {
  it('review rates each answer and logs the session', async () => {
    const user = userEvent.setup();
    const id = makeSet();
    renderAt(`/practice/vocab/${id}/review`);
    expect(screen.getByText(/puella/)).toBeInTheDocument();
    await type(user, 'girl');
    await next(user);
    await type(user, 'fire');
    await next(user);
    expect(screen.getByText('Session complete')).toBeInTheDocument();
    expect(Object.keys(loadSrs())).toHaveLength(2);
    expect(sched(id, 'puella').reps).toBe(1);
    expect(sched(id, 'aqua').reps).toBe(1);
    expect(sched(id, 'aqua').scheduled_days).toBeLessThanOrEqual(sched(id, 'puella').scheduled_days);
    expect(loadSessions()[0]).toMatchObject({ kind: 'vocab', set_id: id, correct: 1, total: 2 });
  });

  it('That was easy schedules further out than Good', async () => {
    const user = userEvent.setup();
    const id = makeSet();
    renderAt(`/practice/vocab/${id}/review`);
    await type(user, 'girl');
    await user.click(screen.getByRole('button', { name: 'That was easy' }));
    await type(user, 'water');
    await next(user);
    expect(sched(id, 'puella').scheduled_days).toBeGreaterThan(sched(id, 'aqua').scheduled_days);
  });

  it('nothing due shows All caught up', async () => {
    const user = userEvent.setup();
    const id = makeSet();
    for (const c of getSet(id)!.cards) saveSrsRecord(`${id}:${c.id}:l2e`, rate(undefined, 'good', new Date()));
    renderAt(`/practice/vocab/${id}/review`);
    expect(screen.getByRole('heading', { name: 'All caught up' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to set' }));
    expect(screen.getByText('set page')).toBeInTheDocument();
  });

  it('flashcards save the chosen rating', async () => {
    const user = userEvent.setup();
    const id = makeSet();
    renderAt(`/practice/vocab/${id}/flashcards`);
    await user.click(screen.getByRole('button', { name: 'Flashcard. Tap to flip.' }));
    await user.click(screen.getByRole('button', { name: 'Easy' }));
    expect(sched(id, 'puella').reps).toBe(1);
  });

  it('learn changes no schedule', async () => {
    const user = userEvent.setup();
    const id = makeSet(4);
    renderAt(`/practice/vocab/${id}/learn`);
    const total = Number(screen.getByText(/^1 \/ \d+$/).textContent!.split('/')[1]);
    for (let i = 0; i < total; i++) {
      await user.click(document.querySelector('.mc-btn') as HTMLElement);
      await next(user);
    }
    expect(screen.getByText('Session complete')).toBeInTheDocument();
    expect(loadSrs()).toEqual({});
    expect(loadSessions()[0]).toMatchObject({ kind: 'vocab', total });
  });

  it('learn needs two cards', () => {
    const id = makeSet(1);
    renderAt(`/practice/vocab/${id}/learn`);
    expect(screen.getByRole('heading', { name: 'Not enough cards' })).toBeInTheDocument();
  });

  it('exiting after one answer logs it', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const id = makeSet();
    renderAt(`/practice/vocab/${id}/review`);
    await type(user, 'girl');
    await next(user);
    await user.click(screen.getByRole('button', { name: 'Exit session' }));
    expect(screen.getByText('set page')).toBeInTheDocument();
    expect(loadSessions()).toHaveLength(1);
    expect(loadSessions()[0]).toMatchObject({ kind: 'vocab', total: 1 });
  });

  it('exiting before answering logs nothing', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const id = makeSet();
    renderAt(`/practice/vocab/${id}/review`);
    await user.click(screen.getByRole('button', { name: 'Exit session' }));
    expect(screen.getByText('set page')).toBeInTheDocument();
    expect(loadSessions()).toHaveLength(0);
  });

  it('unknown set goes to the Vocab page', () => {
    renderAt('/practice/vocab/nope/review');
    expect(screen.getByText('vocab home')).toBeInTheDocument();
  });

  it('unknown mode goes to the set page', () => {
    const id = makeSet();
    renderAt(`/practice/vocab/${id}/bogus`);
    expect(screen.getByText('set page')).toBeInTheDocument();
  });
});
