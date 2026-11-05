vi.mock('./api', () => ({
  listVocabLists: () => Promise.resolve([]),
  createVocabList: () => Promise.resolve({}),
}));

import { LEXICON_CREDIT } from './VocabLists';

describe('LEXICON_CREDIT', () => {
  it('credits Whitaker and no longer mentions DCC', () => {
    expect(LEXICON_CREDIT).toMatch(/Whitaker/);
    expect(LEXICON_CREDIT).not.toMatch(/DCC|Dickinson|CC BY/);
  });
});
