import { parseCsvRow } from './csv';
import { normalize } from './grading';
import { lemmaOf } from './lexicon';
import { rankLexicon } from './lexiconRank';

/** Column limits from the lexicon / vocab_list_items checks. */
export const MAX_HEADWORD = 120;
export const MAX_DEFINITION = 200;

/** Parts of speech offered for custom words (guessPos returns one of these). */
export const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'other'];

export interface ImportRow { line: number; latin: string; english: string }
export interface ImportSkip { line: number; text: string; reason: string }

/** The lexicon fields matching needs; LexiconRow from the teacher API satisfies it. */
export interface ImportCandidate {
  id: number; headword: string; lemma: string; definition: string; pos: string;
  core?: boolean; lemma_search?: string;
}

export type ImportMatch<C extends ImportCandidate = ImportCandidate> =
  | { kind: 'matched'; row: ImportRow; word: C; override: string | null }
  | { kind: 'ambiguous'; row: ImportRow; options: C[] }
  | { kind: 'custom'; row: ImportRow; pos: string }
  | { kind: 'duplicate'; row: ImportRow; word: C };

const DASH = /\s[-–—=]\s/;

/**
 * "latin<sep>english" -> [latin, english], or null. Separators, in order: tab (Quizlet export), a
 * spaced - – — or =, then a comma (CSV). In CSV the first field is the Latin and the rest is the
 * English, so a dictionary form with commas must be quoted (or use a tab or dash instead).
 */
export function splitImportLine(line: string): [string, string] | null {
  let parts: string[];
  const dash = line.match(DASH);
  if (line.includes('\t')) {
    const [l, ...rest] = line.split('\t');
    parts = [l, rest.join(' ')];
  } else if (!line.trimStart().startsWith('"') && dash?.index !== undefined) {
    parts = [line.slice(0, dash.index), line.slice(dash.index + dash[0].length)];
  } else if (line.includes(',')) {
    const [l, ...rest] = parseCsvRow(line);
    parts = [l, rest.filter(Boolean).join(', ')];
  } else return null;
  const [latin, english] = parts.map(p => p.trim());
  return latin && english ? [latin, english] : null;
}

const HEADER = /^(term|latin|word|question)$/i;
const HEADER_EN = /^(definition|english|meaning|answer)$/i;

/** Pasted text -> rows to match, plus lines that could not be used (with 1-based line numbers). */
export function parseVocabImport(text: string): { rows: ImportRow[]; skipped: ImportSkip[] } {
  const rows: ImportRow[] = [];
  const skipped: ImportSkip[] = [];
  const seen = new Map<string, number>();
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = i + 1;
    if (!raw.trim()) return;
    const parts = splitImportLine(raw);
    const skip = (reason: string) => skipped.push({ line, text: raw, reason });
    if (!parts) return skip('No separator (tab, " - ", " = " or comma)');
    const [latin, english] = parts;
    if (rows.length === 0 && HEADER.test(latin) && HEADER_EN.test(english)) return;
    if (latin.length > MAX_HEADWORD) return skip(`Latin is over ${MAX_HEADWORD} characters`);
    if (english.length > MAX_DEFINITION) return skip(`English is over ${MAX_DEFINITION} characters`);
    const key = `${normalize(latin)}\t${normalize(english)}`;
    const first = seen.get(key);
    if (first !== undefined) return skip(`Repeats line ${first}`);
    seen.set(key, line);
    rows.push({ line, latin, english });
  });
  return { rows, skipped };
}

/** The pasted English as a definition override, or null when it says the same as the dictionary. */
export function definitionOverride(english: string, definition: string): string | null {
  return normalize(english) === normalize(definition) ? null : english;
}

/** Rough part of speech for a custom word, read from its dictionary form. The teacher can change it. */
export function guessPos(headword: string): string {
  const h = headword.normalize('NFC').toLowerCase();
  if (/(^|[\s,])-?a,\s*-?um\b/.test(h) || /,\s*-a,\s*-um/.test(h)) return 'adjective';
  if (/[,\s](m|f|n|c)\.?$/.test(h) || /,\s*(m|f|n)\.?(\s|,|$)/.test(h)) return 'noun';
  const parts = h.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2 && /(ō|o|or)$/.test(parts[0]) && /(āre|ēre|ere|īre|are|ire|ārī|ērī|ī|ri)$/.test(parts[1])) return 'verb';
  return 'other';
}

/**
 * Matches one pasted row against dictionary search results: exact lemma only (macrons optional, but
 * macrons the teacher typed break ties between homographs like malum / mālum). One match -> matched,
 * several -> ambiguous (ranked like search: core words first), none -> a custom word.
 */
export function matchImportRow<C extends ImportCandidate>(row: ImportRow, candidates: C[], inList: ReadonlySet<number>): ImportMatch<C> {
  const lemma = lemmaOf(row.latin);
  const term = normalize(lemma);
  let exact = rankLexicon(candidates.filter(c => (c.lemma_search ?? normalize(c.lemma)) === term), term);
  const typed = lemma.normalize('NFC').toLowerCase();
  if (typed !== term) {
    const sameMacrons = exact.filter(c => c.lemma.normalize('NFC').toLowerCase() === typed);
    if (sameMacrons.length) exact = sameMacrons;
  }
  const dup = exact.find(c => inList.has(c.id));
  if (dup) return { kind: 'duplicate', row, word: dup };
  if (exact.length === 1) return { kind: 'matched', row, word: exact[0], override: definitionOverride(row.english, exact[0].definition) };
  if (exact.length > 1) return { kind: 'ambiguous', row, options: exact };
  return { kind: 'custom', row, pos: guessPos(row.latin) };
}
