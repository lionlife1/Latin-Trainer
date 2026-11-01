import { VERBS, generateSubjunctiveForm, generateRandomQuestion } from './conjugator';

const verb = (inf: string) => {
  const v = VERBS.find(v => v.inf === inf);
  if (!v) throw new Error(`missing verb ${inf}`);
  return v;
};

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

describe('generateSubjunctiveForm', () => {
  it('present active 1st conj', () => {
    expect(generateSubjunctiveForm(verb('amare'), 'present', 'active', 1, 'singular')).toBe('amem');
  });
  it('imperfect passive 3rd -io', () => {
    expect(generateSubjunctiveForm(verb('capere'), 'imperfect', 'passive', 3, 'plural')).toBe('caperentur');
  });
  it('perfect of deponent uses participle + sim', () => {
    expect(generateSubjunctiveForm(verb('sequi'), 'perfect', 'active', 1, 'singular')).toBe('secutus sim');
  });
  it('irregular esse', () => {
    expect(generateSubjunctiveForm(verb('esse'), 'present', 'active', 3, 'plural')).toBe('sint');
  });
  it('pluperfect active', () => {
    expect(generateSubjunctiveForm(verb('audire'), 'pluperfect', 'active', 2, 'plural')).toBe('audivissetis');
  });
});

describe('generateRandomQuestion', () => {
  it('returns null when every verb type is disabled', () => {
    expect(generateRandomQuestion({ stdAct: false, stdPass: false, dep: false, irr: false })).toBeNull();
  });
  it('produces a typein question deterministically with a seeded rng', () => {
    const cfg = { stdAct: true, stdPass: true, dep: true, irr: true };
    const a = generateRandomQuestion(cfg, seeded(42));
    const b = generateRandomQuestion(cfg, seeded(42));
    expect(a?.type).toBe('typein');
    expect(a && a.type === 'typein' && a.answers.length).toBeGreaterThan(0);
    expect(a?.prompt).toBe(b?.prompt);
  });
  it('only uses deponents when only dep is enabled', () => {
    const rng = seeded(7);
    for (let i = 0; i < 20; i++) {
      const q = generateRandomQuestion({ stdAct: false, stdPass: false, dep: true, irr: false }, rng);
      expect(q?.prompt).toContain('(deponent)');
    }
  });
});
