import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudySet } from './storage';

const downloadText = vi.fn();
vi.mock('../../lib/csv', () => ({ downloadText: (...a: unknown[]) => downloadText(...a) }));

import { QuizletExport, setToQuizlet } from './QuizletExport';

const make = (name: string, cards: [string, string][]): StudySet => ({
  id: 's1', name, directions: ['l2e'], newPerDay: 10, createdAt: '', updatedAt: '',
  cards: cards.map(([latin, english], i) => ({ id: `c${i}`, latin, english })),
});

describe('QuizletExport', () => {
  beforeEach(() => downloadText.mockClear());

  it('setToQuizlet writes one tab-separated card per line', () => {
    const set = make('Chapter 1', [['puella', 'girl'], ['amo, amare', 'to love\tlike']]);
    expect(setToQuizlet(set)).toBe('puella\tgirl\namo, amare\tto love like\n');
  });

  it('shows the text and copies it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const set = make('Chapter 1', [['puella', 'girl']]);
    render(<QuizletExport set={set} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export to Quizlet' }));
    expect((screen.getByLabelText('Quizlet import text') as HTMLTextAreaElement).value).toBe('puella\tgirl\n');
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('puella\tgirl\n');
    expect(await screen.findByText('Copied.')).toBeInTheDocument();
  });

  it('downloads a .txt named after the set', () => {
    render(<QuizletExport set={make('Chapter 1', [['puella', 'girl']])} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export to Quizlet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download .txt' }));
    expect(downloadText).toHaveBeenCalledWith('chapter-1-quizlet.txt', 'puella\tgirl\n');
  });
});
