import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasteImport } from './PasteImport';
import { addCards, createSet, getSet } from './storage';

const setup = (existing: { latin: string; english: string }[] = []) => {
  const id = createSet('Ch 1')!.id;
  if (existing.length) addCards(id, existing);
  const onAdded = vi.fn();
  render(<PasteImport set={getSet(id)!} onAdded={onAdded} />);
  return { id, onAdded };
};
const paste = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  await user.click(screen.getByRole('button', { name: 'Import cards' }));
  // userEvent.type treats { and [ specially; use paste for multi-line text.
  await user.click(screen.getByRole('textbox', { name: 'Cards to import' }));
  await user.paste(text);
  await user.click(screen.getByRole('button', { name: 'Preview' }));
};

beforeEach(() => localStorage.clear());

describe('PasteImport', () => {
  it('previews tab, dash, equals and comma lines', async () => {
    const user = userEvent.setup();
    const { id, onAdded } = setup();
    await paste(user, 'puella\tgirl\nagricola - farmer\naqua = water\nnauta, sailor');
    expect(screen.getByText('4 cards ready to add')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add 4 cards' }));
    expect(screen.getByText('Added 4 cards.')).toBeInTheDocument();
    expect(getSet(id)!.cards.map(c => c.latin)).toEqual(['puella', 'agricola', 'aqua', 'nauta']);
    expect(onAdded).toHaveBeenCalledTimes(1);
  });

  it('reports skipped lines and cards already in the set', async () => {
    const user = userEvent.setup();
    setup([{ latin: 'puella', english: 'girl' }]);
    await paste(user, 'puella - girl\njust words\nvia - road');
    expect(screen.getByText('1 card ready to add')).toBeInTheDocument();
    expect(screen.getByText('1 already in the set')).toBeInTheDocument();
    expect(screen.getByText('Line 2: No separator (tab, " - ", " = " or comma)')).toBeInTheDocument();
  });

  it('ignores a Quizlet header row', async () => {
    const user = userEvent.setup();
    setup();
    await paste(user, 'Term\tDefinition\nrosa\trose');
    expect(screen.getByText('1 card ready to add')).toBeInTheDocument();
  });

  it('does not turn a= into a macron', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Import cards' }));
    const box = screen.getByRole('textbox', { name: 'Cards to import' });
    await user.type(box, 'a=b');
    expect(box).toHaveValue('a=b');
  });

  it('Cancel closes without saving', async () => {
    const user = userEvent.setup();
    const { id, onAdded } = setup();
    await paste(user, 'puella\tgirl');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox', { name: 'Cards to import' })).not.toBeInTheDocument();
    expect(getSet(id)!.cards).toHaveLength(0);
    expect(onAdded).not.toHaveBeenCalled();
  });

  it('says "Added 1 card." for a single card', async () => {
    const user = userEvent.setup();
    setup();
    await paste(user, 'rosa - rose');
    await user.click(screen.getByRole('button', { name: 'Add 1 card' }));
    expect(screen.getByText('Added 1 card.')).toBeInTheDocument();
  });

  it('clears a stale save error when the text changes or Preview is pressed', async () => {
    const user = userEvent.setup();
    setup();
    await paste(user, 'rosa - rose');
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
    await user.click(screen.getByRole('button', { name: 'Add 1 card' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    spy.mockRestore();
    await user.click(screen.getByRole('textbox', { name: 'Cards to import' }));
    await user.paste('x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const spy2 = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full'); });
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    await user.click(screen.getByRole('button', { name: /^Add \d+ cards?$/ }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    spy2.mockRestore();
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
