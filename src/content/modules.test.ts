import { MODULES } from './modules';

describe('MODULES content', () => {
  it('has the 10 legacy modules in order', () => {
    expect(MODULES).toHaveLength(10);
    expect(MODULES[0].id).toBe('forms_bootcamp');
    expect(MODULES[9].id).toBe('relative_subjunctive');
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
