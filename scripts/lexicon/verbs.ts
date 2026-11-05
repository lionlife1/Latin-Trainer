import { verbKey, type Verb } from '../../src/lib/conjugator';
import type { LexiconRow } from '../build-seed';
import { lemmaKey } from './compose';
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

/** Every drillable verb in DICTLINE, one per verbKey (best frequency letter, then file order). */
export function parseWhitakerVerbs(dictline: string): WhitakerVerb[] {
  const best = new Map<string, WhitakerVerb>();
  dictline.split('\n').forEach((l, line) => {
    const r = verbFromLine(l);
    if (!r) return;
    const key = verbKey({ ...r.verb, trans: '' });
    const cur = best.get(key);
    if (!cur || freqRank(r.freq) < freqRank(cur.freq)) best.set(key, { ...r, line });
  });
  return [...best.values()];
}

const GLOSS_MAX = 40;

/** A lexicon definition -> the short "to ..." meaning shown in the trainer. */
export function shortGloss(definition: string): string {
  let g = definition.split(';')[0].split(',')[0]
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s.:]+$/, '')
    .trim();
  if (!g.startsWith('to ')) g = 'to ' + g;
  if (g.length <= GLOSS_MAX) return g;
  const head = g.slice(0, GLOSS_MAX + 1);
  const cut = Math.max(head.lastIndexOf(' '), head.lastIndexOf('/'));
  return cut > 3 ? g.slice(0, cut) : g.slice(0, GLOSS_MAX);
}

/**
 * Core verbs with no personal passive that Whitaker doesn't mark INTRANS (by 1st principal part,
 * without macrons). Verbs whose 4th principal part is a future participle (-ūrus) are caught separately.
 */
const INTRANSITIVE = new Set([
  'accedo', 'ardeo', 'careo', 'cedo', 'consentio', 'consisto', 'consuesco', 'convenio', 'decedo', 'decerto',
  'decido', 'decurro', 'desilio', 'desisto', 'discedo', 'dissentio', 'erro', 'erumpo', 'evado', 'evenio',
  'excedo', 'exsulto', 'faveo', 'fluo', 'haereo', 'hiemo', 'incedo', 'incido', 'incumbo', 'indulgeo',
  'intercedo', 'invideo', 'inruo', 'lacrimo', 'maneo', 'mano', 'misereo', 'noceo', 'occurro', 'parco',
  'pergo', 'permaneo', 'pertineo', 'pervenio', 'placeo', 'procedo', 'procumbo', 'procurro', 'propero',
  'quiesco', 'recedo', 'regno', 'remaneo', 'salio', 'sedeo', 'serpo', 'servio', 'sono', 'spiro', 'spumo',
  'sto', 'succedo', 'succurro', 'surgo', 'triumpho', 'vaco', 'valeo', 'venio', 'vigilo', 'vivo', 'volito',
]);

/** Core lexicon verbs -> trainer verbs; rows with no matching Whitaker verb are returned as unmatched headwords. */
export function coreTrainerVerbs(rows: LexiconRow[], whitaker: WhitakerVerb[]): { verbs: Verb[]; unmatched: string[] } {
  const byPp1 = new Map<string, WhitakerVerb[]>();
  for (const w of whitaker) {
    const key = lemmaKey(w.verb.pp1 ?? '');
    byPp1.set(key, [...(byPp1.get(key) ?? []), w]);
  }
  const verbs = new Map<string, Verb>();
  const unmatched: string[] = [];
  for (const r of rows) {
    if (!r.core || r.pos !== 'verb') continue;
    const second = r.headword.split(',')[1]?.trim();
    const infKey = second ? lemmaKey(second) : '';
    const match = infKey
      ? (byPp1.get(lemmaKey(r.lemma)) ?? [])
          .filter(w => lemmaKey(w.verb.inf).endsWith(infKey))
          .sort((x, y) => freqRank(x.freq) - freqRank(y.freq) || x.line - y.line)[0]
      : undefined;
    if (!match) {
      unmatched.push(r.headword);
      continue;
    }
    const verb: Verb = { ...match.verb, trans: shortGloss(r.definition) };
    const [, , third, fourth] = r.headword.split(',').map(p => p.trim());
    // A spelled-out perfect in the lexicon beats Whitaker's unassimilated stem (attulī, not adtulī).
    if (!verb.deponent && third && !third.startsWith('-') && !third.includes(' ')) {
      const perf = lemmaKey(third);
      if (perf.length > 1 && perf.endsWith('i')) verb.perf = perf.slice(0, -1);
    }
    if (!verb.deponent && (INTRANSITIVE.has(lemmaKey(verb.pp1 ?? '')) || (fourth && lemmaKey(fourth).endsWith('urus')))) {
      verb.noPassive = true;
    }
    if (!verbs.has(verbKey(verb))) verbs.set(verbKey(verb), verb);
  }
  return { verbs: [...verbs.values()].sort((x, y) => x.inf.localeCompare(y.inf)), unmatched };
}

/** Source of src/content/verbs.generated.ts. */
export function verbsModule(verbs: Verb[]): string {
  return [
    '// Generated by scripts/build-seed.ts from the core lexicon verbs and Whitaker stems. Do not edit by hand.',
    "import type { Verb } from '../lib/conjugator';",
    '',
    `export const CORE_VERBS: Verb[] = [\n${verbs.map(v => '  ' + JSON.stringify(v)).join(',\n')}\n];`,
    '',
  ].join('\n');
}
