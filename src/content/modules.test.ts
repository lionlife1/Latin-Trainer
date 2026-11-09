import { MODULES } from './modules';
import { normalize } from '../lib/grading';

export const SUBJUNCTIVE_IDS = [
  'forms_bootcamp', 'sequence_of_tenses', 'independent_uses', 'purpose_result_indirect', 'cum_clauses',
  'indirect_question', 'fear_clauses', 'conditionals', 'quin_clauses', 'relative_subjunctive',
];
const ALL = MODULES.flatMap(m => m.questions);

describe('MODULES content', () => {
  it('starts with the 10 subjunctive modules in order', () => {
    expect(MODULES.slice(0, 10).map(m => m.id)).toEqual(SUBJUNCTIVE_IDS);
  });
  it('every question has a plain-text explanation', () => {
    for (const q of ALL) {
      expect(q.explanation?.trim(), q.id).toBeTruthy();
      expect(q.explanation, q.id).not.toMatch(/</);
    }
  });
  it('mc choices are distinct after grading normalization', () => {
    for (const q of ALL) if (q.type === 'mc') {
      expect(q.choices.length, q.id).toBeGreaterThanOrEqual(2);
      expect(new Set(q.choices.map(normalize)).size, q.id).toBe(q.choices.length);
    }
  });
  it('typein answers are stored normalized (lowercase, no macrons, letters and single spaces)', () => {
    for (const q of ALL) if (q.type === 'typein') for (const a of q.answers) {
      expect(a, q.id).toBe(normalize(a));
      expect(a, q.id).toMatch(/^[a-z]+( [a-z]+)*$/);
    }
  });
  it('has globally unique question ids', () => {
    const ids = MODULES.flatMap(m => m.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('every mc question lists its correct answer among choices', () => {
    for (const q of MODULES.flatMap(m => m.questions)) {
      if (q.type === 'mc') expect(q.choices, q.id).toContain(q.correct);
    }
  });
  it('every typein question has at least one answer', () => {
    for (const q of MODULES.flatMap(m => m.questions)) {
      if (q.type === 'typein') expect(q.answers.length, q.id).toBeGreaterThan(0);
    }
  });
});
