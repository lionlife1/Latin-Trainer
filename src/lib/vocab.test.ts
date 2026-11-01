import { buildVocabQuestions, type VocabItem } from './vocab';

const item = (itemId: string, lemma: string, definition: string, pos = 'verb', headword = lemma): VocabItem => ({ itemId, headword, lemma, definition, pos });

const list: VocabItem[] = [
  item('1', 'capiō', 'to take, seize', 'verb', 'capiō, capere, cēpī, captum'),
  item('2', 'videō', 'to see'),
  item('3', 'dūcō', 'to lead'),
  item('4', 'puella', 'girl', 'noun'),
  item('5', 'mittō', 'to send'),
];
const fallback: VocabItem[] = [item('f1', 'amō', 'to love'), item('f2', 'rēx', 'king', 'noun'), item('f3', 'audiō', 'to hear')];
const rng = () => 0.42;

describe('buildVocabQuestions l2e', () => {
  const qs = buildVocabQuestions(list, ['l2e'], fallback, rng);
  it('makes one MC per item with stable keys', () => {
    expect(qs.map(q => q.item_key)).toEqual(['vocab:1:l2e', 'vocab:2:l2e', 'vocab:3:l2e', 'vocab:4:l2e', 'vocab:5:l2e']);
    expect(qs.every(q => q.question.type === 'mc')).toBe(true);
  });
  it('has 4 unique choices including the correct definition', () => {
    for (const { question: q } of qs) {
      if (q.type !== 'mc') throw new Error();
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices).toContain(q.correct);
    }
  });
  it('prefers distractors of the same part of speech from the list', () => {
    const q = qs[1].question;
    if (q.type !== 'mc') throw new Error();
    expect(q.correct).toBe('to see');
    expect(q.choices.filter(c => c !== 'to see').every(c => c.startsWith('to '))).toBe(true);
  });
  it('shows the full headword in the prompt', () => {
    expect(qs[0].question.prompt).toContain('capiō, capere, cēpī, captum');
  });
});

describe('buildVocabQuestions with a short list', () => {
  it('tops up distractors from the fallback lexicon', () => {
    const qs = buildVocabQuestions([list[0], list[1]], ['l2e'], fallback, rng);
    const q = qs[0].question;
    if (q.type !== 'mc') throw new Error();
    expect(q.choices).toHaveLength(4);
  });
  it('never uses a distractor equal to the correct answer', () => {
    const qs = buildVocabQuestions([item('a', 'videō', 'to see')], ['l2e'], [item('b', 'cernō', 'To  see'), ...fallback], rng);
    const q = qs[0].question;
    if (q.type !== 'mc') throw new Error();
    expect(q.choices.filter(c => c.toLowerCase().replace(/\s+/g, ' ') === 'to see')).toHaveLength(1);
  });
});

describe('buildVocabQuestions e2l', () => {
  it('accepts every lemma in the list sharing the definition', () => {
    const qs = buildVocabQuestions([item('1', 'capiō', 'to seize'), item('2', 'rapiō', 'to seize'), item('3', 'videō', 'to see')], ['e2l'], [], rng);
    const q = qs[0].question;
    if (q.type !== 'typein') throw new Error();
    expect(q.answers.sort()).toEqual(['capiō', 'rapiō']);
    expect(qs[0].item_key).toBe('vocab:1:e2l');
  });
  it('uses both directions when asked', () => {
    expect(buildVocabQuestions(list, ['l2e', 'e2l'], fallback, rng)).toHaveLength(10);
  });
});

describe('escaping', () => {
  it('escapes HTML in teacher-entered words', () => {
    const qs = buildVocabQuestions([item('x', '<b>', 'a & b <i>')], ['l2e', 'e2l'], fallback, rng);
    expect(qs[0].question.prompt).not.toContain('<b>');
    expect(qs[1].question.prompt).toContain('a &amp; b &lt;i&gt;');
  });
});
