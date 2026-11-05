import type { Verb } from '../../src/lib/conjugator';
import { dictlineFields, have } from './whitaker';

export interface WhitakerVerb {
  verb: Omit<Verb, 'trans'>;
  freq: string;
  /** 0-based line in DICTLINE.GEN; the earlier line wins a frequency tie. */
  line: number;
}

type Conj = 1 | 2 | 3 | 3.5 | 4;

// infinitive suffix, deponent infinitive suffix, deponent imperfect-subjunctive base suffix, 1st principal part suffix
const REGULAR: Record<Conj, [string, string, string, string]> = {
  1: ['are', 'ari', 'are', 'o'],
  2: ['ere', 'eri', 'ere', 'eo'],
  3: ['ere', 'i', 'ere', 'o'],
  3.5: ['ere', 'i', 'ere', 'o'],
  4: ['ire', 'iri', 'ire', 'o'],
};

const freqRank = (f: string): number => {
  const i = 'ABCDEF'.indexOf(f);
  return i < 0 ? 6 : i;
};

/** One DICTLINE line -> a conjugator verb, or null when the trainer can't drill it. */
function verbFromLine(line: string): { verb: Omit<Verb, 'trans'>; freq: string } | null {
  const d = dictlineFields(line);
  if (!d || d.f[0] !== 'V') return null;
  const [, a, b, kind] = d.f;
  if (kind === 'SEMIDEP' || kind === 'IMPERS') return null;
  const [s1, s2, s3, s4] = d.s.map(x => x.replace(/j/g, 'i'));
  const passive = kind !== 'INTRANS' && have(s4);
  const code = `${a} ${b}`;

  if (code === '5 1' || code === '6 1' || code === '3 2') {
    if (!have(s1) || !have(s2) || !have(s3)) return null;
    if (code === '5 1')
      return { freq: d.freq, verb: { inf: s2 + 'esse', irregular: true, base: 'esse', prefix: s1.replace(/s$/, ''), perf: s3, noPassive: true, pp1: s1 + 'um' } };
    if (code === '6 1')
      return { freq: d.freq, verb: { inf: s2 + 're', irregular: true, base: 'ire', prefix: s1.replace(/e$/, ''), perf: s3, noPassive: true, pp1: s1 + 'o' } };
    if (!s1.endsWith('fer')) return null;
    const verb: Omit<Verb, 'trans'> = { inf: s1 + 're', irregular: true, base: 'ferre', prefix: s1.slice(0, -3), perf: s3, pp1: s1 + 'o' };
    if (have(s4)) verb.ppp = s4;
    if (!passive) verb.noPassive = true;
    return { freq: d.freq, verb };
  }

  let conj: Conj;
  if (code === '1 1') conj = 1;
  else if (code === '2 1') conj = 2;
  else if (code === '3 1') conj = s1 === s2 + 'i' ? 3.5 : 3;
  else if (code === '3 4') conj = 4;
  else return null;
  if (!have(s1) || !have(s2)) return null;
  // Whitaker keeps the -i- of 3rd -io and 4th verbs in s1; the conjugator adds it back.
  const pres = conj === 3.5 || conj === 4 ? s2 : s1;
  const [inf, depInf, depImpf, pp1] = REGULAR[conj];

  if (kind === 'DEP') {
    if (!have(s4)) return null;
    return { freq: d.freq, verb: { inf: s2 + depInf, conj, pres, perf: s4, deponent: true, impfBase: s2 + depImpf, pp1: s1 + pp1 + 'r' } };
  }
  if (!have(s3)) return null;
  const verb: Omit<Verb, 'trans'> = { inf: s2 + inf, conj, pres, perf: s3, pp1: s1 + pp1 };
  if (have(s4)) verb.ppp = s4;
  if (!passive) verb.noPassive = true;
  return { freq: d.freq, verb };
}

/** Every drillable verb in DICTLINE, one per infinitive (best frequency letter, then file order). */
export function parseWhitakerVerbs(dictline: string): WhitakerVerb[] {
  const best = new Map<string, WhitakerVerb>();
  dictline.split('\n').forEach((l, line) => {
    const r = verbFromLine(l);
    if (!r) return;
    const cur = best.get(r.verb.inf);
    if (!cur || freqRank(r.freq) < freqRank(cur.freq)) best.set(r.verb.inf, { ...r, line });
  });
  return [...best.values()];
}
