import { clipGloss, firstSense } from './gloss';

describe('firstSense', () => {
  it.each([
    ['hide, conceal', 'hide'],
    ['say (to); declare', 'say'],
    ['bring [news] together', 'bring together'],
    ['try.', 'try'],
  ])('%s', (def, sense) => expect(firstSense(def)).toBe(sense));
});

describe('clipGloss', () => {
  it('leaves short glosses alone', () => expect(clipGloss('to hide')).toBe('to hide'));
  it('cuts a long gloss at a word boundary', () => {
    const long = 'to overwhelm and overthrow and demolish and destroy utterly';
    expect(long.length).toBeGreaterThan(40);
    const g = clipGloss(long);
    expect(g.length).toBeLessThanOrEqual(40);
    expect(g.endsWith(' ')).toBe(false);
    expect(long.startsWith(g + ' ')).toBe(true);
  });
  it('also cuts at a slash', () => {
    const g = clipGloss('to overwhelm/overthrow/demolish/destroy/annihilate');
    expect(g).toBe('to overwhelm/overthrow/demolish/destroy');
  });
});
