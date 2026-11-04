import { normalize } from '../../src/lib/grading';
import type { LexiconRow } from '../build-seed';
import type { SourceRow } from './dooge';
import type { WhitakerRow } from './whitaker';

/** Spelling-insensitive key shared by the Lodge, D'Ooge and Whitaker lemma forms. */
export function lemmaKey(s: string): string {
  return normalize(s).replace(/[-´']/g, '').replace(/j/g, 'i');
}

/** Lodge TSV ("rank\tlemma") -> lemma key -> rank. The first rank wins for a repeated lemma. */
export function parseLodge(tsv: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const line of tsv.split('\n')) {
    const [rank, lemma] = line.split('\t');
    if (!lemma?.trim()) continue;
    const key = lemmaKey(lemma);
    if (!out.has(key)) out.set(key, Number(rank));
  }
  return out;
}

/** Fits a row into the lexicon table's length checks. */
export function clampRow(r: LexiconRow): LexiconRow {
  let definition = r.definition;
  if (definition.length > 200) {
    const head = definition.slice(0, 200);
    const cut = Math.max(head.lastIndexOf(';'), head.lastIndexOf(','));
    definition = cut > 0 ? head.slice(0, cut).trimEnd() : definition.slice(0, 199) + '…';
  }
  return { ...r, headword: r.headword.slice(0, 120), definition };
}

const freqRank = (f: string): number => {
  const i = 'ABCDEF'.indexOf(f);
  return i < 0 ? 6 : i;
};

export function composeLexicon(
  dooge: SourceRow[],
  whitaker: WhitakerRow[],
  lodge: Map<string, number>,
): { rows: LexiconRow[]; unmatchedLodge: string[] } {
  const rows: LexiconRow[] = [];
  const seen = new Set<string>();
  const hp = (headword: string, pos: string) => `${headword}\u0000${pos}`;

  const doogeKeys = new Set<string>();
  const doogeKeyPos = new Set<string>();
  for (const r of dooge) {
    if (seen.has(hp(r.headword, r.pos))) continue;
    seen.add(hp(r.headword, r.pos));
    const key = lemmaKey(r.lemma);
    doogeKeys.add(key);
    doogeKeyPos.add(key + '\u0000' + r.pos);
    rows.push({ ...r, frequency: lodge.get(key) ?? null, core: true });
  }

  // Best Whitaker row per (headword, pos); file order wins ties.
  const best = new Map<string, WhitakerRow>();
  const whitakerKeys = new Set<string>();
  for (const r of whitaker) {
    const key = lemmaKey(r.lemma);
    whitakerKeys.add(key);
    if (doogeKeyPos.has(key + '\u0000' + r.pos)) continue;
    const id = hp(r.headword, r.pos);
    const cur = best.get(id);
    if (!cur || freqRank(r.freq) < freqRank(cur.freq)) best.set(id, r);
  }
  const survivors = [...best.values()];

  // For Lodge lemmas D'Ooge lacks, the best-frequency Whitaker entries become core.
  const bestFreq = new Map<string, number>();
  for (const r of survivors) {
    const key = lemmaKey(r.lemma);
    if (!lodge.has(key) || doogeKeys.has(key)) continue;
    bestFreq.set(key, Math.min(bestFreq.get(key) ?? 6, freqRank(r.freq)));
  }
  for (const r of survivors) {
    const key = lemmaKey(r.lemma);
    const core = bestFreq.get(key) === freqRank(r.freq) && bestFreq.has(key);
    rows.push({
      headword: r.headword, lemma: r.lemma, definition: r.definition, pos: r.pos,
      frequency: core ? lodge.get(key)! : null, core,
    });
  }

  // Clamping can make two headwords collide; the unique index would reject that.
  const out: LexiconRow[] = [];
  const final = new Set<string>();
  for (const r of rows.map(clampRow)) {
    if (final.has(hp(r.headword, r.pos))) continue;
    final.add(hp(r.headword, r.pos));
    out.push(r);
  }
  const unmatchedLodge = [...lodge.keys()].filter(k => !doogeKeys.has(k) && !whitakerKeys.has(k));
  return { rows: out, unmatchedLodge };
}
