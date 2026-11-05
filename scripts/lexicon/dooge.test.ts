import { readFileSync } from 'node:fs';
import { parseDooge } from './dooge';

const one = (s: string) => parseDooge(s + '\n');

const MULTI_WORD_LEMMAS = new Set(['agrī cultūra', 'quā dē causā', 'quā rē', 'simul ac']);

describe('parseDooge', () => {
  it('parses a plain verb', () => {
    expect(one('«ab-dō, -ere, -didī, -ditus», _hide, conceal_')).toEqual([
      { headword: 'abdō, -ere, -didī, -ditus', lemma: 'abdō', definition: 'hide, conceal', pos: 'verb' },
    ]);
  });

  it('handles "x or y" headwords, prepositions and ignores sub-phrases', () => {
    expect(
      one('«ā» or «ab», prep. with abl. _from, by, off_.\n  Translated _on_ in «ā dextrō cornū», _on the right wing_;'),
    ).toEqual([{ headword: 'ā or ab', lemma: 'ā', definition: 'from, by, off', pos: 'preposition' }]);
  });

  it('appends gender to noun headwords and skips [[etymology]]', () => {
    expect(one('«aciēs, -ēī», f. [[«ācer», _sharp_]], _edge; line of battle_')).toEqual([
      { headword: 'aciēs, -ēī, f.', lemma: 'aciēs', definition: 'edge; line of battle', pos: 'noun' },
    ]);
  });

  it('skips parenthesised glosses', () => {
    expect(one('«circum-veniō, -īre, -vēnī, -ventus» (_come around_), _surround_')[0].definition).toBe('surround');
  });

  it('removes acute accents and hyphens from the headword', () => {
    expect(one('«circum´-dō, -dare, -dedī, -datus», _place around, surround, inclose_')[0].headword).toBe(
      'circumdō, -dare, -dedī, -datus',
    );
  });

  it('joins continuation lines and drops § references', () => {
    expect(
      one('«ad-ferō, ad-ferre, at-tulī, ad-lātus», _bring, convey; report,\n    announce; render, give_ (§426)')[0]
        .definition,
    ).toBe('bring, convey; report, announce; render, give');
  });

  it('stops at the first sentence end after a span', () => {
    const [r] = one(
      '«aequālis, -e», adj. _equal, like_. As a noun, «aequālis, -is», m. or f.\n    _one of the same age_',
    );
    expect(r).toMatchObject({ definition: 'equal, like', pos: 'adjective' });
  });

  it('treats dep. verb as verb and skips etymology', () => {
    const [r] = one(
      '«ad-loquor, -loquī, -locūtus sum», dep. verb [[«ad», _to_, + «loquor»,\n    _speak_]], _speak to, address_, with acc.',
    );
    expect(r).toMatchObject({ definition: 'speak to, address', pos: 'verb' });
  });

  it('skips entries with no definition span', () => {
    expect(one('«ac», conj., see «atque»')).toEqual([]);
  });

  it('skips proper nouns', () => {
    expect(one('«Aesōpus, -ī», m. _Æsop_, a writer of fables')).toEqual([]);
  });

  it('drops parentheticals inside definition spans (homō)', () => {
    expect(one('«homō, -inis», m. and f. _(human being), man, person_')[0]).toEqual({
      headword: 'homō, -inis, m. and f.',
      lemma: 'homō',
      definition: 'man, person',
      pos: 'noun',
    });
  });

  it('repairs the cibus source typo (gender glued to the span)', () => {
    expect(one('«cibus, -ī», _m.food, victuals_')[0]).toMatchObject({
      headword: 'cibus, -ī, m.',
      definition: 'food, victuals',
      pos: 'noun',
    });
  });

  it('tolerates a period where the source has a comma (placeō)', () => {
    expect(one('«placeō. -ēre, -uī, -itus», _please, be pleasing_, with dat. (§501.14)')[0]).toMatchObject({
      headword: 'placeō, -ēre, -uī, -itus',
      lemma: 'placeō',
    });
  });

  it('uses the bare word as lemma when the headword has a parenthetical (aliquis)', () => {
    expect(one('«aliquis (-quī), -qua, -quid (-quod)», indef. pron. _some one, some_\n    (§487)')[0]).toEqual({
      headword: 'aliquis, -qua, -quid',
      lemma: 'aliquis',
      definition: 'some one, some',
      pos: 'pronoun',
    });
  });

  it('labels 3-part adjective headwords (-a, -um) as adjectives, not verbs', () => {
    expect(one('«vērus, -a, -um», _true, actual_')[0]).toMatchObject({ lemma: 'vērus', pos: 'adjective' });
    expect(one('«integer, -gra, -grum», _untouched, whole; fresh, new_')[0]).toMatchObject({ lemma: 'integer', pos: 'adjective' });
    expect(one('«re-cūsō, -āre, -āvī, -ātus», _refuse_')[0].pos).toBe('verb');
    expect(one('«re-vertō, -ere, -ī», _turn back_')[0].pos).toBe('verb');
  });

  it('drops inseparable prefixes but keeps the preposition in', () => {
    expect(one('«com- (col-, con-, cor-, co-)», a prefix, _together, with_')).toEqual([]);
    expect(one('«re-» or «red-», an inseparable prefix, _again, back, anew, in return_')).toEqual([]);
    expect(one('«in-», inseparable prefix. With nouns _un-, in-_')).toEqual([]);
    expect(one('«in», prep, with acc. _into, to_')[0]).toMatchObject({ lemma: 'in', pos: 'preposition' });
  });

  it('parses the whole vendored file', () => {
    const rows = parseDooge(readFileSync('content/sources/dooge-latin-english.txt', 'utf8'));
    expect(rows.length).toBeGreaterThanOrEqual(1200);
    expect(rows.length).toBeLessThanOrEqual(1350);
    const allowed = new Set(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'other']);
    for (const r of rows) {
      expect(r.definition.length, r.headword).toBeGreaterThanOrEqual(1);
      expect(r.definition.length, r.headword).toBeLessThanOrEqual(200);
      expect(allowed.has(r.pos), r.headword).toBe(true);
      expect(r.definition, r.headword).toMatch(/^\p{L}/u);
      expect(r.definition, r.headword).not.toMatch(/[«»_\[\]]/);
      expect(r.headword.length, r.headword).toBeGreaterThanOrEqual(1);
      expect(r.headword.length, r.headword).toBeLessThanOrEqual(120);
      expect(r.headword, r.headword).not.toMatch(/[«»\[\]]|\s{2}/);
      if (!MULTI_WORD_LEMMAS.has(r.lemma)) expect(r.lemma, r.headword).toMatch(/^-?\p{L}+$/u);
    }
    const adjectives = ['dēmissus', 'integer', 'iussus', 'missus', 'modicus', 'molestus', 'plēnus', 'praeruptus',
      'reclīnātus', 'recreātus', 'redāctus', 'vērus'];
    for (const lemma of adjectives) {
      const found = rows.filter(r => r.lemma === lemma);
      expect(found.length, lemma).toBeGreaterThan(0);
      for (const r of found) expect(r.pos, lemma).not.toBe('verb');
    }
    for (const lemma of ['com', 'dis', 're']) expect(rows.filter(r => r.lemma === lemma), lemma).toEqual([]);
    expect(rows.filter(r => r.lemma === 'in').map(r => r.pos)).toEqual(['preposition']);
  });
});
