import { parseCsvRow } from './csv';
import { seededRng } from './shuffle';
import { BLOOKET_HEADER, GIMKIT_HEADER, blooketCsv, gimkitCsv, quizletText } from './vocabExport';
import type { VocabItem } from './vocab';

const item = (itemId: string, headword: string, definition: string, pos = 'verb'): VocabItem => ({ itemId, headword, lemma: headword.split(',')[0], definition, pos });
const list = [
  item('1', 'capiō, capere, cēpī, captum', 'to take, seize'),
  item('2', 'videō, vidēre, vīdī, vīsum', 'to see'),
  item('3', 'dūcō, dūcere, dūxī, ductum', 'to lead'),
  item('4', 'puella, puellae, f.', 'girl', 'noun'),
];
const fallback = [item('f1', 'amō', 'to love'), item('f2', 'rēx', 'king', 'noun')];
/** CSV body rows after the two template rows (title, header). Fields here have no newlines. */
const body = (csv: string) => csv.trimEnd().split('\r\n').slice(2).map(parseCsvRow);

describe('quizletText', () => {
  it('writes term<TAB>definition lines with the full dictionary form', () => {
    expect(quizletText(list.slice(0, 2))).toBe('capiō, capere, cēpī, captum\tto take, seize\nvideō, vidēre, vīdī, vīsum\tto see\n');
  });
  it('flattens tabs and line breaks inside a field', () => {
    expect(quizletText([item('x', 'a\tb', 'c\nd')])).toBe('a b\tc d\n');
  });
});

describe('gimkitCsv', () => {
  const csv = gimkitCsv(list, fallback, seededRng(1));
  it('starts with the template title and header rows', () => {
    const [title, header] = csv.split('\r\n');
    expect(title).toBe('Gimkit Spreadsheet Import Template,,,,');
    expect(parseCsvRow(header)).toEqual([...GIMKIT_HEADER]);
  });
  it('has one row per word: question, correct answer, then three wrong meanings', () => {
    const rows = body(csv);
    expect(rows).toHaveLength(4);
    expect(rows[0].slice(0, 2)).toEqual(['capiō, capere, cēpī, captum', 'to take, seize']);
    for (const r of rows) {
      expect(r).toHaveLength(5);
      expect(new Set(r.slice(1)).size).toBe(4);
    }
    // Same part of speech first: the verb gets verb meanings.
    expect(rows[1].slice(2).every(d => d.startsWith('to '))).toBe(true);
  });
});

describe('blooketCsv', () => {
  const csv = blooketCsv(list, fallback, seededRng(2));
  it('starts with the template title and header rows', () => {
    const [header] = csv.split('\r\n').slice(1);
    expect(csv.split('\r\n')[0]).toBe('Blooket Import Template,,,,,,,');
    expect(parseCsvRow(header)).toEqual([...BLOOKET_HEADER]);
  });
  it('numbers questions, shuffles four answers and names the correct one by number', () => {
    const rows = body(csv);
    expect(rows.map(r => r[0])).toEqual(['1', '2', '3', '4']);
    rows.forEach((r, i) => {
      expect(r[1]).toBe(list[i].headword);
      const answers = r.slice(2, 6);
      expect(new Set(answers).size).toBe(4);
      expect(r[6]).toBe('20');
      const n = Number(r[7]);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(4);
      expect(answers[n - 1]).toBe(list[i].definition);
    });
    expect(new Set(rows.map(r => r[7])).size).toBeGreaterThan(1);
  });
  it('takes a time limit and leaves optional answers blank for a tiny list', () => {
    const rows = body(blooketCsv([list[0], list[1]], [], seededRng(3), 30));
    expect(rows[0][6]).toBe('30');
    expect(rows[0].slice(2, 6).filter(Boolean)).toHaveLength(2);
    expect(rows[0][Number(rows[0][7]) + 1]).toBe('to take, seize');
  });
});
