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

// One-off corrections for typos in the vendored source text (applied to the
// joined entry string before parsing). Keep this list small.
const SOURCE_FIXES: Array<[string, string]> = [
  ['«anim-advertō, -ere, -tī, -sus [[animus»', '«anim-advertō, -ere, -tī, -sus» [[«animus»'],
  ['[[«quam», _how]], how great, how much_, «tantus', '[[«quam», _how_]], _how great, how much_. «tantus'],
  ['[[«pugna», _battle]], fight_', '[[«pugna», _battle_]], _fight_'],
  ['f _-fight, battle._', 'f. _fight, battle_.'],
  ['_m.food, victuals_', 'm. _food, victuals_'],
  ['f. [«victor», _victor_],', 'f. [[«victor», _victor_]],'],
  ['(§247.2.a]', '(§247.2.a)'],
  ['_or_ «fidē», _trust', 'or «fidē», _trust'],
];

// Entries whose source has no part-of-speech marker at all.
const POS_OVERRIDES: Record<string, string> = {
  inde: 'adverb',
  sīcut: 'adverb',
  initium: 'noun',
  vāgīna: 'noun',
  fidēs: 'noun',
  dēpendeō: 'verb',
  inquit: 'verb',
  'quā rē': 'adverb',
  'quā dē causā': 'adverb',
};

const GENDER_RE = /[mfn]\.(?:\s*(?:and|or)\s*[mfn]\.)?(?:\s*plur\.)?/;

const stripParens = (s: string) => s.replace(/\([^)]*\)/g, ' ');

function parseEntry(rawEntry: string): SourceRow | null {
  let entry = rawEntry;
  for (const [from, to] of SOURCE_FIXES) entry = entry.replace(from, to);
  const m = /^«([^»]*)»/.exec(entry);
  if (!m) return null;
  let rest = entry.slice(m[0].length);
  const alt = /^ or «([^»]*)»/.exec(rest);
  const fixHead = (h: string) =>
    clean(stripParens(h).replace(/(\p{L})\.(?= -)/gu, '$1,')).replace(/\s+,/g, ',');
  let headword = fixHead(m[1]);
  const lemma = lemmaOf(headword);
  if (alt) {
    headword = `${headword} or ${fixHead(alt[1])}`;
    rest = rest.slice(alt[0].length);
  }
  if (/^\p{Lu}/u.test(headword)) return null;

  // Text between the headword and the first span carries pos / gender.
  const stripped = rest.replace(/\[\[[\s\S]*?\]\]/g, ' ').replace(/\([^)]*\)/g, ' ');
  const preEnd = stripped.indexOf('_');
  const pre = preEnd === -1 ? stripped : stripped.slice(0, preEnd);

  let pos: string | null = null;
  let best = Infinity;
  let bestIdx = -1;
  for (const [re, p] of POS_MARKERS) {
    const mm = re.exec(pre);
    if (mm && mm.index < best) {
      best = mm.index;
      pos = p;
      bestIdx = p === 'noun' ? mm.index : -1;
    }
  }
  const parts = headword.split(',').length;
  if (pos === null) pos = POS_OVERRIDES[lemma] ?? (parts >= 3 || /sum$/.test(lemma) ? 'verb' : 'other');
  if (bestIdx >= 0) {
    const g = GENDER_RE.exec(pre.slice(bestIdx))?.[0].replace(/\s+/g, ' ');
    if (g) headword = `${headword}, ${g}`;
  }

  // Definition spans: `_..._` outside (...); parentheses inside spans are dropped.
  const spans: string[] = [];
  const re = /_([^_]*)_|\([^)]*\)/g;
  let sm: RegExpExecArray | null;
  const body = rest.replace(/\[\[[\s\S]*?\]\]/g, ' ');
  while ((sm = re.exec(body))) {
    if (sm[1] === undefined) continue; // parenthetical outside a span
    const span = stripParens(sm[1])
      .replace(/§\s*[\d.]*/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^[\s,;-]+|[\s,;.]+$/g, '');
    if (span) spans.push(span);
    if (/^\.(\s|$)/.test(body.slice(re.lastIndex))) break;
  }
  const definition = spans.join(', ');
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
