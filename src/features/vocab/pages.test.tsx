import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { localDay } from './scheduler';
import { SetPage } from './SetPage';
import { VocabHome } from './VocabHome';
import { createSet, itemKey, loadSets, saveSrsRecord, updateSet, type SrsRecord, type StudySet } from './storage';

const DAY = 86400000;
const rec = (dueOffsetDays: number, introducedDaysAgo: number): SrsRecord => ({
  due: new Date(Date.now() + dueOffsetDays * DAY).toISOString(), stability: 1, difficulty: 5, elapsed_days: 0, scheduled_days: 1,
  learning_steps: 0, reps: 1, lapses: 0, state: 2, introduced: localDay(new Date(Date.now() - introducedDaysAgo * DAY)),
});
const words = (n: number) => Array.from({ length: n }, (_, i) => ({ latin: `verbum${i}`, english: `word ${i}` }));
const rate = (s: StudySet, i: number, r: SrsRecord) => saveSrsRecord(itemKey(s.id, s.cards[i].id, 'l2e'), r);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/practice/vocab" element={<VocabHome />} />
        <Route path="/practice/vocab/:setId" element={<SetPage />} />
        <Route path="/practice/vocab/:setId/edit" element={<p>editor</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

describe('VocabHome', () => {
  it('lists sets with due counts', () => {
    const a = createSet('Ch 1', words(3))!;
    createSet('Ch 2');
    rate(a, 0, rec(-1, 3));
    renderAt('/practice/vocab');
    const row = screen.getByRole('link', { name: /Ch 1/ });
    expect(row).toHaveTextContent('3 cards · 1 due today');
    expect(row).toHaveTextContent('1 due');
    expect(screen.getByRole('link', { name: /Ch 2/ })).toHaveTextContent('0 cards · 0 due today');
  });

  it('shows an empty state and the footnote', () => {
    renderAt('/practice/vocab');
    expect(screen.getByText('No study sets yet. Make your first one with New set.')).toBeInTheDocument();
    expect(screen.getByText("Sets are saved in this browser only. They don't sync to your account or other devices.")).toBeInTheDocument();
  });

  it('New set creates a set and opens the editor', async () => {
    const user = userEvent.setup();
    renderAt('/practice/vocab');
    await user.click(screen.getByRole('button', { name: 'New set' }));
    await user.type(screen.getByRole('textbox', { name: 'Set name' }), 'Ch 3{Enter}');
    expect(screen.getByText('editor')).toBeInTheDocument();
    expect(loadSets()[0].name).toBe('Ch 3');
  });

  it('Cancel closes the form', async () => {
    const user = userEvent.setup();
    renderAt('/practice/vocab');
    await user.click(screen.getByRole('button', { name: 'New set' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox', { name: 'Set name' })).not.toBeInTheDocument();
  });
});

describe('SetPage', () => {
  const stat = (label: string) => screen.getByText(label).previousElementSibling!.textContent;

  it('shows counts and study links', () => {
    const s = createSet('Ch 1', words(3))!;
    updateSet(s.id, { newPerDay: 2 });
    rate(s, 0, rec(-1, 1));
    renderAt(`/practice/vocab/${s.id}`);
    expect(stat('New')).toBe('2');
    expect(stat('Due today')).toBe('1');
    expect(stat('Learned')).toBe('0');
    expect(screen.getByRole('link', { name: /Review/ })).toHaveTextContent('1 due · 2 new');
    expect(screen.getByRole('link', { name: /Review/ })).toHaveAttribute('href', `/practice/vocab/${s.id}/review`);
    expect(screen.getByRole('link', { name: /Learn/ })).toHaveAttribute('href', `/practice/vocab/${s.id}/learn`);
    expect(screen.getByRole('link', { name: /Flashcards/ })).toHaveAttribute('href', `/practice/vocab/${s.id}/flashcards`);
    expect(screen.getByText('3 cards · Latin to English')).toBeInTheDocument();
  });

  it('with nothing to review says so', () => {
    const s = createSet('Ch 1', words(2))!;
    rate(s, 0, rec(3, 0));
    rate(s, 1, rec(3, 0));
    renderAt(`/practice/vocab/${s.id}`);
    expect(screen.getByText('All caught up for today')).toBeInTheDocument();
  });

  it('with no cards points to the editor', () => {
    const s = createSet('Empty')!;
    renderAt(`/practice/vocab/${s.id}`);
    expect(screen.getByText('This set has no cards yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add cards' })).toHaveAttribute('href', `/practice/vocab/${s.id}/edit`);
    expect(screen.queryByRole('link', { name: /Review/ })).not.toBeInTheDocument();
  });

  it('shows 50 cards then all', async () => {
    const user = userEvent.setup();
    const s = createSet('Big', words(60))!;
    renderAt(`/practice/vocab/${s.id}`);
    const rows = () => within(document.querySelector('ul.rows')!).getAllByRole('listitem');
    expect(rows()).toHaveLength(50);
    await user.click(screen.getByRole('button', { name: 'Show all 60 cards' }));
    expect(rows()).toHaveLength(60);
  });

  it('unknown set redirects to the Vocab page', () => {
    renderAt('/practice/vocab/nope');
    expect(screen.getByRole('heading', { name: 'Vocab' })).toBeInTheDocument();
  });
});
