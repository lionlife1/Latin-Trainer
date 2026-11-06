import { MACRON_VOWELS, insertAt, macronShortcut } from './macrons';

describe('MACRON_VOWELS', () => {
  it('lists the six long vowels', () => {
    expect(MACRON_VOWELS).toEqual(['ā', 'ē', 'ī', 'ō', 'ū', 'ȳ']);
  });
});

describe('insertAt', () => {
  it('inserts at the caret and moves the caret after the insert', () => {
    expect(insertAt('amo', 2, 2, 'ā')).toEqual({ value: 'amāo', caret: 3 });
  });
  it('replaces a selection', () => {
    expect(insertAt('amo', 2, 3, 'ō')).toEqual({ value: 'amō', caret: 3 });
  });
  it('appends when the caret is unknown', () => {
    expect(insertAt('am', null, null, 'ō')).toEqual({ value: 'amō', caret: 3 });
  });
});

describe('macronShortcut', () => {
  it('turns a vowel followed by = into its long vowel', () => {
    expect(macronShortcut('amo', 3)).toEqual({ value: 'amō', caret: 3 });
    expect(macronShortcut('rex', 2)).toEqual({ value: 'rēx', caret: 2 });
  });
  it('keeps capitals', () => {
    expect(macronShortcut('A', 1)).toEqual({ value: 'Ā', caret: 1 });
    expect(macronShortcut('Y', 1)).toEqual({ value: 'Ȳ', caret: 1 });
  });
  it('does nothing after a consonant, a space, or at the start', () => {
    expect(macronShortcut('am', 2)).toBeNull();
    expect(macronShortcut('amo ', 4)).toBeNull();
    expect(macronShortcut('', 0)).toBeNull();
  });
  it('does nothing after a vowel that already has a macron', () => {
    expect(macronShortcut('amō', 3)).toBeNull();
  });
});
