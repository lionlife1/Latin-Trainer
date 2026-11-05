import { VERBS, generateSubjunctiveForm, generateRandomQuestion, trainerPool, verbKey, type Verb } from './conjugator';

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

const absum: Verb = { inf: 'abesse', irregular: true, noPassive: true, base: 'esse', prefix: 'ab', perf: 'afu', pp1: 'absum', trans: 'to be away' };
const confero: Verb = { inf: 'conferre', irregular: true, base: 'ferre', prefix: 'con', perf: 'contul', ppp: 'collat', pp1: 'confero', trans: 'to bring together' };
const redeo: Verb = { inf: 'redire', irregular: true, noPassive: true, base: 'ire', prefix: 'red', perf: 'rediv', pp1: 'redeo', trans: 'to return' };
const cado: Verb = { inf: 'cadere', conj: 3, pres: 'cad', perf: 'cecid', noPassive: true, pp1: 'cado', trans: 'to fall' };

describe('compound irregulars', () => {
  it('esse compound present', () => expect(generateSubjunctiveForm(absum, 'present', 'active', 1, 'singular')).toBe('absim'));
  it('esse compound imperfect', () => expect(generateSubjunctiveForm(absum, 'imperfect', 'active', 3, 'plural')).toBe('abessent'));
  it('ferre compound present passive', () => expect(generateSubjunctiveForm(confero, 'present', 'passive', 3, 'singular')).toBe('conferatur'));
  it('ferre compound perfect passive', () => expect(generateSubjunctiveForm(confero, 'perfect', 'passive', 1, 'plural')).toBe('collati simus'));
  it('ire compound present', () => expect(generateSubjunctiveForm(redeo, 'present', 'active', 2, 'singular')).toBe('redeas'));
});

describe('generateRandomQuestion with a custom pool', () => {
  it('leaves noPassive standard verbs out of a passive-only run', () => {
    const amo = verb('amare');
    const rng = seeded(5);
    for (let i = 0; i < 50; i++) {
      const q = generateRandomQuestion({ stdAct: false, stdPass: true, dep: false, irr: false }, rng, [cado, amo]);
      expect(q?.prompt).toContain('amare');
    }
    expect(generateRandomQuestion({ stdAct: false, stdPass: true, dep: false, irr: false }, rng, [cado])).toBeNull();
  });
  it('names the verb when two verbs share an infinitive', () => {
    const iaceo: Verb = { inf: 'iacere', conj: 2, pres: 'iac', perf: 'iacu', noPassive: true, pp1: 'iaceo', trans: 'to lie' };
    const iacio: Verb = { inf: 'iacere', conj: 3.5, pres: 'iac', perf: 'iec', ppp: 'iact', pp1: 'iacio', trans: 'to throw' };
    const rng = seeded(9);
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const q = generateRandomQuestion({ stdAct: true, stdPass: false, dep: false, irr: false }, rng, [iaceo, iacio]);
      const shown = q?.prompt.match(/iaci?e?o/)?.[0];
      expect(shown).toBeDefined();
      seen.add(shown!);
    }
    expect(seen).toEqual(new Set(['iaceo', 'iacio']));
  });
  it('never asks a noPassive standard verb in the passive', () => {
    const rng = seeded(3);
    for (let i = 0; i < 50; i++) {
      const q = generateRandomQuestion({ stdAct: true, stdPass: true, dep: false, irr: false }, rng, [cado]);
      if (q?.type !== 'typein') throw new Error('expected typein');
      expect(q.prompt).not.toContain('passive');
      expect(q.answers[0]).not.toMatch(/ |r$|ris$|tur$|mur$|mini$|ntur$/);
    }
  });
  it('accepts contracted pluperfects of ire compounds and builds a generic hint', () => {
    const rng = seeded(11);
    let seen = 0;
    for (let i = 0; i < 400; i++) {
      const q = generateRandomQuestion({ stdAct: true, stdPass: false, dep: false, irr: true }, rng, [redeo]);
      if (q?.type !== 'typein') throw new Error('expected typein');
      expect(q.hint).toBe('Principal parts: redeo, redire, redivi');
      if (q.prompt.includes('1st sg. · pluperfect')) {
        seen++;
        expect(q.answers).toEqual(expect.arrayContaining(['redivissem', 'rediissem', 'redissem']));
      }
    }
    expect(seen).toBeGreaterThan(0);
  });
});

describe('trainerPool', () => {
  const pool = trainerPool();
  it('adds the generated core verbs', () => expect(pool.length).toBeGreaterThan(600));
  it('has each verb once', () => expect(new Set(pool.map(verbKey)).size).toBe(pool.length));
  it('keeps the hand-written entry over a generated one', () => {
    expect(pool.find(v => v.inf === 'amare')).toBe(VERBS.find(v => v.inf === 'amare'));
    expect(pool.find(v => v.inf === 'ferre')).toBe(VERBS.find(v => v.inf === 'ferre'));
    expect(pool.find(v => v.inf === 'ferre')?.base).toBeUndefined();
  });
  it('keeps both verbs that share an unmarked infinitive', () => {
    expect(pool.filter(v => v.inf === 'iacere').map(v => v.conj).sort()).toEqual([2, 3.5]);
  });
  it('generates well-formed answers across the whole pool', () => {
    const rng = seeded(2026);
    const cfg = { stdAct: true, stdPass: true, dep: true, irr: true };
    for (let i = 0; i < 2000; i++) {
      const q = generateRandomQuestion(cfg, rng);
      if (q?.type !== 'typein') throw new Error('expected typein');
      for (const a of q.answers) {
        expect(a).toMatch(/^[a-z]+( [a-z]+)?$/);
        expect(a).not.toMatch(/undefined|NaN|j/);
      }
    }
  });
});
