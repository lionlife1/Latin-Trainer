import { lemmaOf } from '../../src/lib/lexicon';
import type { SourceRow } from './dooge';

export interface WhitakerRow extends SourceRow {
  freq: string;
}

const SIMPLE_POS: Record<string, string> = {
  ADV: 'adverb',
  PREP: 'preposition',
  CONJ: 'conjunction',
  INTERJ: 'other',
  PRON: 'pronoun',
  NUM: 'other',
};

const GENDER: Record<string, string> = { M: 'm.', F: 'f.', N: 'n.', C: 'c.' };

// [nominative suffix of s1, genitive suffix of s2] per "decl var"
const NOUN: Record<string, [string, string]> = {
  '1 1': ['a', 'ae'],
  '2 1': ['us', 'i'],
  '2 4': ['us', 'i'],
  '2 2': ['um', 'i'],
  '2 3': ['', 'i'],
  '3 1': ['', 'is'],
  '3 2': ['', 'is'],
  '3 3': ['', 'is'],
  '3 4': ['', 'is'],
  '4 1': ['us', 'us'],
  '4 2': ['u', 'us'],
  '5 1': ['es', 'ei'],
};

// present suffix, infinitive suffix, deponent present, deponent infinitive
const VERB: Record<string, [string, string, string, string]> = {
  '1 1': ['o', 'are', 'or', 'ari'],
  '2 1': ['eo', 'ere', 'eor', 'eri'],
  '3 1': ['o', 'ere', 'or', 'i'],
  '3 4': ['o', 'ire', 'or', 'iri'],
};

const have = (s: string) => s !== '' && s !== 'zzz';

function headwordFor(pos: string, f: string[], s: string[]): { headword: string; pos: string } | null {
  const key = `${f[1]} ${f[2]}`;
  const [s1, s2raw, s3, s4] = s;
  if (pos in SIMPLE_POS) return { headword: s1, pos: SIMPLE_POS[pos] };
  if (pos === 'N') {
    if (f[1] === '9') return { headword: s1, pos: 'noun' };
    const t = NOUN[key];
    if (!t) return null;
    const g = GENDER[f[3]];
    const hw = `${s1}${t[0]}, ${s2raw}${t[1]}` + (g ? `, ${g}` : '');
    return { headword: hw, pos: 'noun' };
  }
  if (pos === 'ADJ') {
    const s2 = have(s2raw) ? s2raw : s1;
    switch (key) {
      case '1 1':
        return { headword: `${s1}us, ${s2}a, ${s2}um`, pos: 'adjective' };
      case '1 2':
        return { headword: `${s1}, ${s2}a, ${s2}um`, pos: 'adjective' };
      case '3 1':
        return { headword: `${s1}, ${s2}is`, pos: 'adjective' };
      case '3 2':
        return { headword: `${s1}is, ${s1}e`, pos: 'adjective' };
      case '3 3':
        return { headword: `${s1}, ${s2}is, ${s2}e`, pos: 'adjective' };
      default:
        return null;
    }
  }
  if (pos === 'V') {
    const t = VERB[key];
    if (!t) return null;
    const kind = f[3];
    const parts: string[] = [];
    const part = (stem: string, suffix: string) => {
      if (have(stem)) parts.push(stem + suffix);
    };
    if (kind === 'DEP') {
      part(s1, t[2]);
      part(s2raw, t[3]);
      part(s4, 'us sum');
    } else if (kind === 'SEMIDEP') {
      part(s1, t[0]);
      part(s2raw, t[1]);
      part(s4, 'us sum');
    } else {
      part(s1, t[0]);
      part(s2raw, t[1]);
      part(s3, 'i');
      part(s4, 'us');
    }
    return parts.length ? { headword: parts.join(', '), pos: 'verb' } : null;
  }
  return null;
}

export function parseDictlineLine(line: string): WhitakerRow | null {
  const l = line.replace(/\r$/, '');
  if (l.length < 111) return null;
  const s = [0, 19, 38, 57].map((i) => l.slice(i, i + 19).trim());
  const f = l.slice(76, 100).trim().split(/\s+/);
  const age = l[100];
  const freq = l[106];
  const meaning = l.slice(110).trim().replace(/;+$/, '').trim();
  if (meaning.startsWith('|') || meaning === '') return null;
  if (age === 'F' || age === 'G' || age === 'H') return null;
  const r = headwordFor(f[0], f, s);
  if (!r || !r.headword) return null;
  return { headword: r.headword, lemma: lemmaOf(r.headword), definition: meaning, pos: r.pos, freq };
}

export function parseDictline(text: string): WhitakerRow[] {
  const out: WhitakerRow[] = [];
  for (const line of text.split('\n')) {
    const r = parseDictlineLine(line);
    if (r) out.push(r);
  }
  return out;
}
