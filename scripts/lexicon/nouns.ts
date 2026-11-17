import type { Noun, NounGender } from '../../src/lib/morph/nouns';
import type { LexiconRow } from '../build-seed';
import { lemmaKey } from './compose';
import { clipGloss, firstSense } from './gloss';
import { freqRank, headwordGenders, headwordGenitive, matchHeadword } from './match';
import { dictlineFields, have } from './whitaker';

export interface WhitakerNoun {
  noun: Omit<Noun, 'trans'>;
  /** Genitive singular spellings this line allows, main one first. */
  gens: string[];
  freq: string;
  /** 0-based line in DICTLINE.GEN; the earlier line wins a frequency tie. */
  line: number;
}

const GENDER: Record<string, NounGender> = { M: 'm', F: 'f', N: 'n', C: 'c' };

/** One DICTLINE line -> a noun, or null when the trainer can't drill it. */
function nounFromLine(line: string): Omit<WhitakerNoun, 'line'> | null {
  const d = dictlineFields(line);
  if (!d || d.f[0] !== 'N') return null;
  const gender = GENDER[d.f[3]];
  if (!gender) return null;
  const [s1, s2] = d.s.map(x => x.toLowerCase().replace(/j/g, 'i'));
  if (!have(s1) || !have(s2)) return null;
  const code = `${d.f[1]} ${d.f[2]}`;
  const mk = (nom: string, decl: Noun['decl'], gens: string[], iStem = false) => ({
    noun: { nom, stem: s2, decl, gender, ...(iStem ? { iStem } : {}) },
    gens,
    freq: d.freq,
  });
  switch (code) {
    case '1 1': return mk(s1 + 'a', 1, [s2 + 'ae']);
    case '2 1': return mk(s1 + 'us', 2, [s2 + 'i']);
    case '2 5': return mk(s1 + 'us', 2, [s2 + 'i', s2]);
    case '2 2': return mk(s1 + 'um', 2, [s2 + 'i']);
    case '2 3': return mk(s1, 2, [s2 + 'i']);
    case '2 4': return mk(s1 + (gender === 'n' ? 'um' : 'us'), 2, [s2 + 'i', s2]);
    case '3 1': case '3 2': return mk(s1, 3, [s2 + 'is']);
    case '3 3': case '3 4': return mk(s1, 3, [s2 + 'is'], true);
    case '4 1': return mk(s1 + 'us', 4, [s2 + 'us']);
    case '4 2': return mk(s1 + 'u', 4, [s2 + 'us']);
    case '5 1': return mk(s1 + 'es', 5, [s2 + 'ei']);
    default: return null;
  }
}

/** Every drillable noun in DICTLINE, one per nominative, stem, declension and gender (best frequency, then file order). */
export function parseWhitakerNouns(dictline: string): WhitakerNoun[] {
  const best = new Map<string, WhitakerNoun>();
  dictline.split('\n').forEach((l, line) => {
    const r = nounFromLine(l);
    if (!r) return;
    const key = `${r.noun.nom}|${r.noun.stem}|${r.noun.decl}|${r.noun.gender}`;
    const cur = best.get(key);
    if (!cur || freqRank(r.freq) < freqRank(cur.freq)) best.set(key, { ...r, line });
  });
  return [...best.values()];
}

/** Defective or irregular nouns we don't model, by lemma key of the nominative. */
const EXCLUDED = new Set(['nemo', 'nihil', 'bos', 'fors', 'vicis']);

const IRREGULAR: Record<string, NonNullable<Noun['irregular']>> = { domus: 'domus', vis: 'vis', deus: 'deus' };

/** Whitaker marks these i-stems, but A&G gives the consonant-stem genitive plural (canum, iuvenum). */
const CONSONANT_STEMS = new Set(['canis', 'iuvenis', 'vates']);

/** i-stems Whitaker codes as consonant stems (A&G 78: imber, linter, uter, venter have -ium; caro has carnium). */
const I_STEMS = new Set(['imber', 'caro']);

/** Accusative in -im and ablative in -i (A&G 75-76), by lemma key. */
const I_FORMS: Record<string, NonNullable<Noun['iForms']>> = {
  sitis: 'pure',
  turris: 'mixed', securis: 'mixed', puppis: 'mixed',
  navis: 'abl', ignis: 'abl', civis: 'abl', avis: 'abl', classis: 'abl', finis: 'abl', amnis: 'abl', imber: 'abl',
};

function genderFor(row: LexiconRow, w: WhitakerNoun): NounGender {
  if (w.noun.gender === 'n') return 'n';
  const stated = headwordGenders(row.headword);
  if (stated.length === 1) return stated[0] as NounGender;
  if (stated.length > 1) return 'c';
  return w.noun.gender;
}

/** Corrections to D'Ooge's plural-only rows: fasces is masculine (fascis, m.); D'Ooge prints "f." and glosses it "fasces". */
const PLURAL_FIXES: Record<string, { gender?: NounGender; trans?: string }> = {
  fasces: { gender: 'm', trans: 'rods (fasces)' },
};

/**
 * A plural-only noun built from its D'Ooge headword ("arma, -ōrum, n. plur."), or null when the row isn't one.
 * The genitive plural ending gives the declension; Whitaker has no usable line for these.
 */
function pluralOnlyNoun(row: LexiconRow): Noun | null {
  const gen = headwordGenitive(row.headword);
  const nom = lemmaKey(row.headword.split(',')[0]);
  const ending = gen?.match(/(?:orum|arum|ium|um)$/)?.[0];
  if (!ending) return null;
  if (!row.headword.includes('plur.') && !/(i|ae|a|es)$/.test(nom)) return null;
  const fix = PLURAL_FIXES[nom];
  const gender = fix?.gender ?? (headwordGenders(row.headword)[0] as NounGender | undefined);
  if (!gender) return null;
  const strip = (suffixes: string[]) => nom.replace(new RegExp(`(?:${suffixes.join('|')})$`), '');
  const trans = fix?.trans ?? clipGloss(firstSense(row.definition));
  if (ending === 'arum') return { nom, stem: strip(['ae']), decl: 1, gender, trans, pluralOnly: true };
  if (ending === 'orum') return { nom, stem: strip(['i', 'a']), decl: 2, gender, trans, pluralOnly: true };
  return { nom, stem: strip(['ia', 'a', 'es']), decl: 3, gender, ...(ending === 'ium' ? { iStem: true } : {}), trans, pluralOnly: true };
}

/** Core lexicon nouns -> trainer nouns; rows with no matching Whitaker noun are returned as unmatched headwords. */
export function coreNouns(rows: LexiconRow[], whitaker: WhitakerNoun[]): { nouns: Noun[]; unmatched: string[] } {
  const nouns = new Map<string, Noun>();
  const unmatched: string[] = [];
  for (const r of rows) {
    if (!r.core || r.pos !== 'noun') continue;
    const plural = pluralOnlyNoun(r);
    if (plural) {
      const id = `${plural.nom}|${plural.stem}|${plural.decl}`;
      if (!nouns.has(id)) nouns.set(id, plural);
      continue;
    }
    if (r.headword.includes('plur.')) continue;
    const match = matchHeadword(r, whitaker, w => w.noun.nom, w => w.gens);
    if (!match) {
      unmatched.push(r.headword);
      continue;
    }
    const key = lemmaKey(match.noun.nom);
    if (EXCLUDED.has(key)) continue;
    const noun: Noun = { ...match.noun, gender: genderFor(r, match), trans: clipGloss(firstSense(r.definition)) };
    if (IRREGULAR[key]) noun.irregular = IRREGULAR[key];
    if (CONSONANT_STEMS.has(key)) delete noun.iStem;
    if (I_STEMS.has(key)) noun.iStem = true;
    if (I_FORMS[key]) noun.iForms = I_FORMS[key];
    const id = `${noun.nom}|${noun.stem}|${noun.decl}`;
    if (!nouns.has(id)) nouns.set(id, noun);
  }
  return { nouns: [...nouns.values()].sort((x, y) => x.nom.localeCompare(y.nom)), unmatched };
}

/** Source of src/content/nouns.generated.ts. */
export function nounsModule(nouns: Noun[]): string {
  return [
    '// Generated by scripts/build-seed.ts from the core lexicon nouns and Whitaker stems. Do not edit by hand.',
    "import type { Noun } from '../lib/morph/nouns';",
    '',
    `export const CORE_NOUNS: Noun[] = [\n${nouns.map(n => '  ' + JSON.stringify(n)).join(',\n')}\n];`,
    '',
  ].join('\n');
}
