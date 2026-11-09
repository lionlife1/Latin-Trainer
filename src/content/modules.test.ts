import { MODULES } from './modules';
import { normalize } from '../lib/grading';

export const SUBJUNCTIVE_IDS = [
  'forms_bootcamp', 'sequence_of_tenses', 'independent_uses', 'purpose_result_indirect', 'cum_clauses',
  'indirect_question', 'fear_clauses', 'conditionals', 'quin_clauses', 'relative_subjunctive',
];
const ALL = MODULES.flatMap(m => m.questions);

interface NewModuleSpec {
  id: string; badge: string; title: string; concepts: string[];
  prerequisites: string[]; xp_reward: number; mc: number; typein: number;
}

function expectNewModule(index: number, s: NewModuleSpec): void {
  const m = MODULES[index];
  expect(m?.id).toBe(s.id);
  expect(m.badge).toBe(s.badge);
  expect(m.title).toBe(s.title);
  expect(m.prerequisites).toEqual(s.prerequisites);
  expect(m.xp_reward).toBe(s.xp_reward);
  expect(m.concepts).toEqual(s.concepts);
  expect(m.tagline.trim()).toBeTruthy();
  expect(m.description.trim()).toBeTruthy();
  expect(m.questions.filter(q => q.type === 'mc')).toHaveLength(s.mc);
  expect(m.questions.filter(q => q.type === 'typein')).toHaveLength(s.typein);
  expect(m.questions.length).toBeGreaterThanOrEqual(30);
  expect(m.questions.length).toBeLessThanOrEqual(35);
  for (const q of m.questions) {
    expect(q.id.startsWith(`${s.badge.toLowerCase()}-`), q.id).toBe(true);
    expect(q.hint?.trim(), q.id).toBeTruthy();
  }
  const earlier = MODULES.slice(0, index).map(e => e.id);
  for (const p of s.prerequisites) expect(earlier, p).toContain(p);
}

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
  it('M10 Participles and the Ablative Absolute follows the path', () => expectNewModule(10, {
    id: 'participles_ablative_absolute', badge: 'M10', title: 'Participles and the Ablative Absolute',
    concepts: ['Present Active Participle', 'Perfect Passive Participle', 'Future Active Participle',
      'Participles of Deponent Verbs', 'Agreement and Relative Time', 'Ablative Absolute',
      'Ablative Absolute without a Participle'],
    prerequisites: [], xp_reward: 110, mc: 21, typein: 12,
  }));
  it('M11 Indirect Statement follows M10', () => expectNewModule(11, {
    id: 'indirect_statement', badge: 'M11', title: 'Indirect Statement',
    concepts: ['Verbs of Saying, Thinking, Knowing and Perceiving', 'Accusative Subject + Infinitive',
      'Present Infinitive: Same Time', 'Perfect Infinitive: Time Before', 'Future Infinitive: Time After',
      'Reflexive sē and suus', 'negō: Say That ... Not'],
    prerequisites: ['participles_ablative_absolute'], xp_reward: 110, mc: 20, typein: 13,
  }));
  it('M12 Gerund and Gerundive follows M11', () => expectNewModule(12, {
    id: 'gerund_gerundive', badge: 'M12', title: 'Gerund and Gerundive',
    concepts: ['Gerund: a Verbal Noun', 'Gerundive: a Verbal Adjective', 'Gerundive in Place of Gerund + Object',
      'Passive Periphrastic (Obligation)', 'Dative of Agent', 'Impersonal Passive Periphrastic',
      'Purpose: ad + Gerund or Gerundive', 'Purpose: causā or grātiā + Genitive'],
    prerequisites: ['participles_ablative_absolute'], xp_reward: 110, mc: 20, typein: 13,
  }));
  it('M13 Noun Case Uses ends the path', () => expectNewModule(13, {
    id: 'case_uses', badge: 'M13', title: 'Noun Case Uses',
    concepts: ['Ablative: Means, Manner, Accompaniment', 'Ablative: Time When and Time Within Which',
      'Ablative: Agent, Comparison, Separation, Cause', 'Ablative of Description',
      'Dative: Indirect Object and Special Verbs', 'Dative: Possession, Purpose and Reference',
      'Genitive: Partitive and Description', 'Accusative: Extent and Place to Which'],
    prerequisites: [], xp_reward: 120, mc: 22, typein: 13,
  }));
});
