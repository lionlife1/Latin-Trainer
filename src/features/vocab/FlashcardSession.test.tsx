import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TypeInQuestion } from '../../lib/types';
import { FlashcardSession } from './FlashcardSession';

const mk = (id: string, front: string, back: string): TypeInQuestion => ({ id, type: 'typein', badge: 'LATIN', prompt: front, answers: [back] });
const qs = [mk('1', 'puella', 'girl'), mk('2', 'aqua', 'water'), mk('3', 'via', 'road')];

const setup = (confirm = true) => {
  vi.spyOn(window, 'confirm').mockReturnValue(confirm);
  const props = { onRate: vi.fn(), onFinish: vi.fn(), onExit: vi.fn() };
  render(<FlashcardSession questions={qs} {...props} />);
  return props;
};
afterEach(() => vi.restoreAllMocks());

describe('FlashcardSession', () => {
  it('shows the front first, then the back and rating buttons', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText('puella')).toBeInTheDocument();
    expect(screen.queryByText('girl')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Good' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Flashcard. Tap to flip.' }));
    expect(screen.getByText('girl')).toBeInTheDocument();
    for (const n of ['Again', 'Hard', 'Good', 'Easy']) expect(screen.getByRole('button', { name: n })).toBeInTheDocument();
  });

  it('rating saves and moves on', async () => {
    const user = userEvent.setup();
    const { onRate } = setup();
    await user.click(screen.getByRole('button', { name: 'Flashcard. Tap to flip.' }));
    await user.click(screen.getByRole('button', { name: 'Good' }));
    expect(onRate).toHaveBeenCalledWith(qs[0], 'good');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByText('aqua')).toBeInTheDocument();
    expect(screen.getByText('Tap the card to see the answer')).toBeInTheDocument();
  });

  it('keyboard flips and rates', async () => {
    const user = userEvent.setup();
    const { onRate } = setup();
    await user.keyboard('3');
    expect(onRate).not.toHaveBeenCalled();
    await user.keyboard(' ');
    expect(screen.getByText('girl')).toBeInTheDocument();
    await user.keyboard('1');
    expect(onRate).toHaveBeenCalledWith(qs[0], 'again');
  });

  it('Space activates a focused button instead of flipping', async () => {
    const user = userEvent.setup();
    const { onExit } = setup(true);
    screen.getByRole('button', { name: 'Exit session' }).focus();
    await user.keyboard(' ');
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(screen.getByText('puella')).toBeInTheDocument();
  });

  it('Space on a focused rating button rates it', async () => {
    const user = userEvent.setup();
    const { onRate } = setup();
    await user.keyboard(' ');
    screen.getByRole('button', { name: 'Hard' }).focus();
    await user.keyboard(' ');
    expect(onRate).toHaveBeenCalledWith(qs[0], 'hard');
  });

  it('finishes with results', async () => {
    const user = userEvent.setup();
    const { onFinish } = setup();
    for (const key of ['1', '3', '4']) {
      await user.keyboard(' ');
      await user.keyboard(key);
    }
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0].map((r: { correct: boolean }) => r.correct)).toEqual([false, true, true]);
  });

  it('exit asks first and passes results so far', async () => {
    const user = userEvent.setup();
    const { onExit } = setup(true);
    await user.keyboard(' ');
    await user.keyboard('3');
    await user.click(screen.getByRole('button', { name: 'Exit session' }));
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onExit.mock.calls[0][0]).toHaveLength(1);
  });

  it('does not exit when the confirm is declined', async () => {
    const user = userEvent.setup();
    const { onExit } = setup(false);
    await user.click(screen.getByRole('button', { name: 'Exit session' }));
    expect(onExit).not.toHaveBeenCalled();
  });
});
