import { guessPos, matchImportRow, parseVocabImport, splitImportLine, type ImportCandidate } from './vocabImport';

describe('splitImportLine', () => {
  it('splits a Quizlet export on the tab', () => {
    expect(splitImportLine('capiō, capere, cēpī, captum\tto take, seize')).toEqual(['capiō, capere, cēpī, captum', 'to take, seize']);
  });
  it('splits on spaced hyphen, en dash, em dash and equals', () => {
    expect(splitImportLine('puella - girl')).toEqual(['puella', 'girl']);
    expect(splitImportLine('gladius, gladiī, m. – sword')).toEqual(['gladius, gladiī, m.', 'sword']);
    expect(splitImportLine('rēx — king')).toEqual(['rēx', 'king']);
    expect(splitImportLine('amō = to love')).toEqual(['amō', 'to love']);
  });
  it('does not split on a hyphen inside a word', () => {
    expect(splitImportLine('-que - and')).toEqual(['-que', 'and']);
  });
  it('reads CSV: first field Latin, the rest English', () => {
    expect(splitImportLine('puella,girl')).toEqual(['puella', 'girl']);
    expect(splitImportLine('"capiō, capere, cēpī, captum","to take, seize"')).toEqual(['capiō, capere, cēpī, captum', 'to take, seize']);
    expect(splitImportLine('via,road, way')).toEqual(['via', 'road, way']);
  });
  it('returns null without a separator or with an empty side', () => {
    expect(splitImportLine('puella')).toBeNull();
    expect(splitImportLine('puella\t')).toBeNull();
    expect(splitImportLine(' - girl')).toBeNull();
  });
});

describe('parseVocabImport', () => {
  it('parses lines, skips blanks and a header row, and reports bad lines with their number', () => {
    const out = parseVocabImport('Term\tDefinition\r\npuella\tgirl\n\n  \nnonsense\nrēx - king\n');
    expect(out.rows).toEqual([
      { line: 2, latin: 'puella', english: 'girl' },
      { line: 6, latin: 'rēx', english: 'king' },
    ]);
    expect(out.skipped).toEqual([{ line: 5, text: 'nonsense', reason: 'No separator (tab, " - ", " = " or comma)' }]);
  });
  it('skips fields longer than the database allows', () => {
    const out = parseVocabImport(`${'a'.repeat(121)}\tx\npuella\t${'b'.repeat(201)}`);
    expect(out.rows).toEqual([]);
    expect(out.skipped.map(s => s.reason)).toEqual(['Latin is over 120 characters', 'English is over 200 characters']);
  });
  it('drops a repeated line, ignoring macrons and case', () => {
    const out = parseVocabImport('puella\tgirl\npuellā\tGirl\nmalum\tevil\nmālum\tapple');
    expect(out.rows.map(r => r.line)).toEqual([1, 3, 4]);
    expect(out.skipped).toEqual([{ line: 2, text: 'puellā\tGirl', reason: 'Repeats line 1' }]);
  });
});

const cand = (id: number, headword: string, definition: string, pos = 'noun', core = false): ImportCandidate => ({
  id, headword, lemma: headword.split(',')[0], definition, pos, core,
});

describe('matchImportRow', () => {
  const row = (latin: string, english: string) => ({ line: 1, latin, english });
  const puella = cand(1, 'puella, puellae, f.', 'girl', 'noun', true);

  it('matches one exact lemma, macrons optional, and keeps no override when the meaning is the same', () => {
    const m = matchImportRow(row('puella', 'Girl'), [cand(9, 'puellaris, -e', 'girlish', 'adjective'), puella], new Set());
    expect(m).toEqual({ kind: 'matched', row: row('puella', 'Girl'), word: puella, override: null });
    const capio = cand(2, 'capiō, capere, cēpī, captum', 'take, seize', 'verb');
    expect(matchImportRow(row('capio, capere', 'to take'), [capio], new Set())).toMatchObject({ kind: 'matched', word: capio, override: 'to take' });
  });

  it('marks several exact lemmas ambiguous, ranked core first', () => {
    const a = cand(3, 'mālum, mālī, n.', 'apple');
    const b = cand(4, 'malum, malī, n.', 'evil', 'noun', true);
    const m = matchImportRow(row('malum', 'apple'), [a, b], new Set());
    expect(m).toEqual({ kind: 'ambiguous', row: row('malum', 'apple'), options: [b, a] });
  });

  it('uses the macrons the teacher typed to pick between homographs', () => {
    const a = cand(3, 'mālum, mālī, n.', 'apple');
    const b = cand(4, 'malum, malī, n.', 'evil');
    expect(matchImportRow(row('mālum', 'apple'), [a, b], new Set())).toMatchObject({ kind: 'matched', word: a, override: null });
  });

  it('makes a custom word when nothing matches exactly', () => {
    expect(matchImportRow(row('gladius, gladiī, m.', 'sword'), [cand(5, 'gladiator', 'gladiator')], new Set()))
      .toEqual({ kind: 'custom', row: row('gladius, gladiī, m.', 'sword'), pos: 'noun' });
  });

  it('flags a word already in the list', () => {
    expect(matchImportRow(row('puella', 'girl'), [puella], new Set([1]))).toMatchObject({ kind: 'duplicate', word: puella });
  });
});

describe('guessPos', () => {
  it('reads gender, principal parts and adjective endings from the dictionary form', () => {
    expect(guessPos('gladius, gladiī, m.')).toBe('noun');
    expect(guessPos('nōmen, nōminis n')).toBe('noun');
    expect(guessPos('capiō, capere, cēpī, captum')).toBe('verb');
    expect(guessPos('hortor, hortārī, hortātus sum')).toBe('verb');
    expect(guessPos('bonus, -a, -um')).toBe('adjective');
    expect(guessPos('fortis, forte')).toBe('other');
    expect(guessPos('et')).toBe('other');
  });
});
