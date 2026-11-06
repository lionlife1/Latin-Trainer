import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LexiconRow } from './api';

const lex = (id: number, headword: string, definition: string, pos = 'noun', core = true): LexiconRow => ({
  id, owner_id: null, headword, lemma: headword.split(',')[0], definition, pos, core,
});
const DICT: LexiconRow[] = [
  lex(1, 'puella, puellae, f.', 'girl'),
  lex(2, 'capiō, capere, cēpī, captum', 'take, seize', 'verb'),
  lex(3, 'mālum, mālī, n.', 'apple', 'noun', false),
  lex(4, 'malum, malī, n.', 'evil'),
  lex(5, 'rēx, rēgis, m.', 'king'),
];

const searchLexicon = vi.fn();
const addListItem = vi.fn();
const addCustomWord = vi.fn();
vi.mock('./api', () => ({
  searchLexicon: (...a: unknown[]) => searchLexicon(...a),
  addListItem: (...a: unknown[]) => addListItem(...a),
  addCustomWord: (...a: unknown[]) => addCustomWord(...a),
}));

import { VocabImport } from './VocabImport';

const onDone = vi.fn();
const renderImport = () =>
  render(<VocabImport listId="L1" ownerId="T1" inList={new Set([5])} nextPos={10} onDone={onDone} />);

const paste = (text: string) => fireEvent.change(screen.getByLabelText('Words to import'), { target: { value: text } });

describe('VocabImport', () => {
  beforeEach(() => {
    searchLexicon.mockReset().mockImplementation((q: string) =>
      Promise.resolve(DICT.filter(r => r.lemma.normalize('NFD').replace(/\p{M}/gu, '').startsWith(q.normalize('NFD').replace(/\p{M}/gu, '')))));
    addListItem.mockReset().mockResolvedValue(undefined);
    addCustomWord.mockReset().mockResolvedValue(lex(99, 'gladius, gladiī, m.', 'sword'));
    onDone.mockReset();
  });

  it('reviews matched, ambiguous, custom and duplicate rows, then adds them all', async () => {
    renderImport();
    paste('puella\tgirl\ncapio, capere - to take\nmalum = apple\ngladius, gladiī, m. - sword\nrēx\tking\nnonsense');
    await userEvent.click(screen.getByRole('button', { name: /check words/i }));

    expect(await screen.findByTestId('import-summary')).toHaveTextContent('2 matched · 1 to choose · 1 new · 1 already in list');
    expect(searchLexicon).toHaveBeenCalledWith('capio', 50);
    expect(screen.getByTestId('import-skipped')).toHaveTextContent('Line 6');
    expect(screen.getByText('Already in list')).toBeInTheDocument();
    expect(screen.getByLabelText('Part of speech for gladius, gladiī, m.')).toHaveValue('noun');

    // Ambiguous: core "malum (evil)" is offered first; the teacher picks the apple.
    const malum = screen.getByLabelText('Add malum as');
    expect(malum).toHaveValue('4');
    await userEvent.selectOptions(malum, '3');

    await userEvent.click(screen.getByRole('button', { name: 'Add 4 words' }));
    expect(addListItem.mock.calls).toEqual([
      ['L1', 1, 10, null],
      ['L1', 2, 11, 'to take'],
      ['L1', 3, 12, null],
      ['L1', 99, 13],
    ]);
    expect(addCustomWord).toHaveBeenCalledWith({ headword: 'gladius, gladiī, m.', definition: 'sword', pos: 'noun' }, 'T1');
    expect(await screen.findByText('Added 4 words.')).toBeInTheDocument();
    expect(onDone).toHaveBeenCalled();
    expect(screen.getByLabelText('Words to import')).toHaveValue('');
  });

  it('lets the teacher skip a row or turn a match into their own word', async () => {
    renderImport();
    paste('puella\tgirl\ncapiō - to grab');
    await userEvent.click(screen.getByRole('button', { name: /check words/i }));
    await userEvent.selectOptions(await screen.findByLabelText('Add puella as'), 'skip');
    await userEvent.selectOptions(screen.getByLabelText('Add capiō as'), 'custom');
    await userEvent.selectOptions(screen.getByLabelText('Part of speech for capiō'), 'verb');
    await userEvent.click(screen.getByRole('button', { name: 'Add 1 word' }));
    expect(addCustomWord).toHaveBeenCalledWith({ headword: 'capiō', definition: 'to grab', pos: 'verb' }, 'T1');
    expect(addListItem.mock.calls).toEqual([['L1', 99, 10]]);
  });

  it('keeps the review open and lists failures when a row cannot be added', async () => {
    addListItem.mockRejectedValueOnce(new Error('duplicate key'));
    renderImport();
    paste('puella\tgirl');
    await userEvent.click(screen.getByRole('button', { name: /check words/i }));
    await userEvent.click(await screen.findByRole('button', { name: 'Add 1 word' }));
    expect(await screen.findByText('Line 1 (puella): duplicate key')).toBeInTheDocument();
    expect(screen.getByText('Added 0 words.')).toBeInTheDocument();
    expect(screen.getByTestId('import-summary')).toBeInTheDocument();
  });

  it('explains the format when nothing parses', async () => {
    renderImport();
    paste('just one word');
    await userEvent.click(screen.getByRole('button', { name: /check words/i }));
    expect(screen.getByText(/no words found/i)).toBeInTheDocument();
    expect(searchLexicon).not.toHaveBeenCalled();
  });
});
