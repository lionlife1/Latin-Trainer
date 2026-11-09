import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SetEditor } from './SetEditor';
import { addCards, createSet, getSet } from './storage';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/practice/vocab/:setId/edit" element={<SetEditor />} />
        <Route path="/practice/vocab/:setId" element={<p>set page</p>} />
        <Route path="/practice/vocab" element={<p>vocab home</p>} />
      </Routes>
    </MemoryRouter>,
  );
}
const setup = () => {
  const id = createSet('Ch 1')!.id;
  renderAt(`/practice/vocab/${id}/edit`);
  return id;
};
const addRow = async (user: ReturnType<typeof userEvent.setup>, latin: string, english: string) => {
  if (latin) await user.type(screen.getByRole('textbox', { name: 'Latin' }), latin);
  if (english) await user.type(screen.getByRole('textbox', { name: 'English' }), english);
  await user.click(screen.getByRole('button', { name: 'Add card' }));
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('SetEditor', () => {
  it('adds a card and clears the fields', async () => {
    const user = userEvent.setup();
    const id = setup();
    await addRow(user, 'puella', 'girl');
    expect(screen.getByText('puella')).toBeInTheDocument();
    expect(screen.getByText('girl')).toBeInTheDocument();
    expect(getSet(id)!.cards).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Latin' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'English' })).toHaveValue('');
  });

  it('rejects blanks and duplicates', async () => {
    const user = userEvent.setup();
    setup();
    await addRow(user, 'puella', '');
    expect(screen.getByText('Fill in both Latin and English.')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'English' }), 'girl');
    await user.click(screen.getByRole('button', { name: 'Add card' }));
    await addRow(user, 'puella', 'girl');
    expect(screen.getByText('That card is already in the set.')).toBeInTheDocument();
  });

  it('edits and removes a card', async () => {
    const user = userEvent.setup();
    const id = createSet('Ch 1')!.id;
    addCards(id, [{ latin: 'puella', english: 'girl' }]);
    renderAt(`/practice/vocab/${id}/edit`);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const eng = screen.getByRole('textbox', { name: 'Edit English' });
    await user.clear(eng);
    await user.type(eng, 'young girl');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(getSet(id)!.cards[0].english).toBe('young girl');
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(getSet(id)!.cards).toHaveLength(0);
  });

  it('renames on blur and refuses a blank name', async () => {
    const user = userEvent.setup();
    const id = setup();
    const name = screen.getByLabelText('Set name');
    await user.clear(name);
    await user.tab();
    expect(screen.getByText('Give the set a name.')).toBeInTheDocument();
    expect(getSet(id)!.name).toBe('Ch 1');
    await user.clear(screen.getByLabelText('Set name'));
    await user.type(screen.getByLabelText('Set name'), 'Ch 2');
    await user.tab();
    expect(getSet(id)!.name).toBe('Ch 2');
  });

  it('keeps at least one direction', async () => {
    const user = userEvent.setup();
    const id = setup();
    expect(screen.getByLabelText('Latin to English')).toBeDisabled();
    await user.click(screen.getByLabelText('English to Latin'));
    expect(getSet(id)!.directions).toEqual(['l2e', 'e2l']);
    expect(screen.getByLabelText('Latin to English')).toBeEnabled();
    expect(screen.getByLabelText('English to Latin')).toBeEnabled();
  });

  it('saves new cards per day', async () => {
    const user = userEvent.setup();
    const id = setup();
    const n = screen.getByLabelText('New cards per day');
    await user.clear(n);
    await user.type(n, '25');
    await user.tab();
    expect(getSet(id)!.newPerDay).toBe(25);
  });

  it('deletes the set after confirming', async () => {
    const user = userEvent.setup();
    const id = setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    await user.click(screen.getByRole('button', { name: 'Delete set' }));
    expect(confirm).toHaveBeenCalledWith('Delete "Ch 1"? Its cards and review history will be gone for good.');
    expect(getSet(id)).toBeDefined();
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Delete set' }));
    expect(screen.getByText('vocab home')).toBeInTheDocument();
    expect(getSet(id)).toBeUndefined();
  });

  it('shows a storage error instead of crashing', async () => {
    const user = userEvent.setup();
    setup();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    await addRow(user, 'puella', 'girl');
    expect(screen.getByText("Couldn't save. Your browser's storage may be full.")).toBeInTheDocument();
  });

  it('redirects an unknown set', () => {
    renderAt('/practice/vocab/nope/edit');
    expect(screen.getByText('vocab home')).toBeInTheDocument();
  });
});
