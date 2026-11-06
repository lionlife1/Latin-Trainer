import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { VocabListItemRow } from './api';

const items: VocabListItemRow[] = [
  { id: 'i1', lexicon_id: 1, definition_override: 'maiden', position: 0, lexicon: { id: 1, owner_id: null, headword: 'puella, puellae, f.', lemma: 'puella', definition: 'girl', pos: 'noun' } },
  { id: 'i2', lexicon_id: 2, definition_override: null, position: 1, lexicon: { id: 2, owner_id: null, headword: 'rēx, rēgis, m.', lemma: 'rēx', definition: 'king', pos: 'noun' } },
];

vi.mock('./api', async () => {
  const real = await vi.importActual<typeof import('./api')>('./api');
  return {
    toVocabItem: real.toVocabItem,
    getVocabList: () => Promise.resolve({ list: { id: 'L1', name: 'Ch. 1 words', created_at: '' }, items }),
    searchLexicon: () => Promise.resolve([]),
    loadFallbackLexicon: () => Promise.resolve([{ itemId: 'f', headword: 'via', lemma: 'via', definition: 'road', pos: 'noun' }]),
  };
});
vi.mock('../auth/AuthProvider', () => ({ useAuth: () => ({ profile: { id: 'T1' } }) }));
const downloadCsv = vi.fn();
const downloadText = vi.fn();
vi.mock('../../lib/csv', async () => ({
  ...(await vi.importActual<object>('../../lib/csv')),
  downloadCsv: (...a: unknown[]) => downloadCsv(...a),
  downloadText: (...a: unknown[]) => downloadText(...a),
}));

import { VocabListEditor } from './VocabListEditor';

const renderEditor = () =>
  render(
    <MemoryRouter initialEntries={['/t/vocab/L1']}>
      <Routes><Route path="/t/vocab/:listId" element={<VocabListEditor />} /></Routes>
    </MemoryRouter>,
  );

describe('VocabListEditor export', () => {
  beforeEach(() => { downloadCsv.mockReset(); downloadText.mockReset(); });

  it('downloads Quizlet lines with the definition used in quizzes', async () => {
    renderEditor();
    await userEvent.click(await screen.findByRole('button', { name: 'Quizlet (.txt)' }));
    expect(downloadText).toHaveBeenCalledWith('Ch-1-words.txt', 'puella, puellae, f.\tmaiden\nrēx, rēgis, m.\tking\n');
  });

  it('downloads Gimkit and Blooket CSVs with fallback distractors', async () => {
    renderEditor();
    await userEvent.click(await screen.findByRole('button', { name: 'Gimkit (.csv)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Blooket (.csv)' }));
    const [[gName, gimkit], [bName, blooket]] = downloadCsv.mock.calls;
    expect(gName).toBe('Ch-1-words.gimkit.csv');
    expect(gimkit).toContain('"puella, puellae, f.",maiden');
    expect(gimkit).toContain('road');
    expect(bName).toBe('Ch-1-words.blooket.csv');
    expect(blooket).toContain('Question #');
  });

  it('puts macron buttons on the Latin fields', async () => {
    renderEditor();
    await screen.findByRole('button', { name: 'Quizlet (.txt)' });
    // Dictionary search, custom headword, import box.
    expect(screen.getAllByRole('group', { name: /long vowel/i })).toHaveLength(3);
    await userEvent.type(screen.getByLabelText('Dictionary form'), 'ga=dius');
    expect(screen.getByLabelText('Dictionary form')).toHaveValue('gādius');
  });
});
