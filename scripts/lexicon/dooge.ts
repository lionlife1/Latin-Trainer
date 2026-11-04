import { lemmaOf } from '../../src/lib/lexicon';

export interface SourceRow {
  headword: string;
  lemma: string;
  definition: string;
  pos: string;
}

const clean = (s: string) => s.replace(/´/g, '').replace(/(?<=\p{L})-/gu, '').replace(/\s+/g, ' ').trim();

function groupEntries(text: string): string[] {
  const entries: string[] = [];
  let cur: string | null = null;
  const flush = () => {
    if (cur !== null) entries.push(cur);
    cur = null;
  };
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('«')) {
      flush();
      cur = line;
    } else if (cur !== null && /^ {4}\S/.test(line)) {
      cur += ' ' + line.trim();
    } else if (line.trim() === '' || /^[A-Z]$/.test(line.trim())) {
      flush();
    }
    // 2-space sub-phrase lines and anything else: ignored
  }
  flush();
  return entries;
}

const POS_MARKERS: Array<[RegExp, string]> = [
  [/(?<![a-z])prep[.,]/, 'preposition'],
  [/(?<![a-z])conj\./, 'conjunction'],
  [/(?<![a-z])adv[.,]/, 'adverb'],
  [/(?<![a-z])adj[.,]/, 'adjective'],
  [/(?<![a-z])pron\./, 'pronoun'],
  [/(?<![a-z])interj\./, 'other'],
  [/(?<![a-z])dep\. verb/, 'verb'],
  [/(?<![a-z])[mfn]\./, 'noun'],
];

function parseEntry(entry: string): SourceRow | null {
  const m = /^«([^»]*)»/.exec(entry);
  if (!m) return null;
  let rest = entry.slice(m[0].length);
    const alt = /^ or «([^»]*)»/.exec(rest);
  let headword = clean(m[1]);
  const lemma = lemmaOf(headword);
  if (alt) {
    headword = `${headword} or ${clean(alt[1])}`;
    rest = rest.slice(alt[0].length);
  }
  if (/^\p{Lu}/u.test(headword)) return null;

  // Text between the headword and the first [[, ( or _ carries pos / gender.
  const stripped = rest.replace(/\[\[[\s\S]*?\]\]/g, ' ').replace(/\([^)]*\)/g, ' ');
  const preEnd = stripped.indexOf('_');
  const pre = preEnd === -1 ? stripped : stripped.slice(0, preEnd);

  let pos: string | null = null;
  let best = Infinity;
  let genderMatch = false;
  for (const [re, p] of POS_MARKERS) {
    const mm = re.exec(pre);
    if (mm && mm.index < best) {
      best = mm.index;
      pos = p;
      genderMatch = p === 'noun';
    }
  }
  const parts = headword.split(',').length;
  if (pos === null) pos = parts >= 3 || /sum$/.test(lemma) ? 'verb' : 'other';
  if (genderMatch) {
    const g = /^\s*,?\s*(.*?)[\s,]*$/.exec(pre)?.[1];
    if (g) headword = `${headword}, ${g}`;
  }

  // Definition spans: outside [[...]] and (...).
  const body = stripped;
  const spans: string[] = [];
  const re = /_([^_]+)_/g;
  let sm: RegExpExecArray | null;
  while ((sm = re.exec(body))) {
    spans.push(sm[1].replace(/[;,\s]+$/, ''));
    if (/^\.(\s|$)/.test(body.slice(re.lastIndex))) break;
  }
  const definition = spans
    .join(', ')
    .replace(/§\s*[\d.]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!definition) return null;
  return { headword, lemma, definition, pos };
}

export function parseDooge(text: string): SourceRow[] {
  const rows: SourceRow[] = [];
  for (const e of groupEntries(text)) {
    const r = parseEntry(e);
    if (r) rows.push(r);
  }
  return rows;
}
