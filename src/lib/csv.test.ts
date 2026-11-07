import { parseCsvRow, toCsv } from './csv';

describe('toCsv', () => {
  it('quotes commas, quotes and newlines; CRLF row endings', () => {
    expect(toCsv([['a,"b"', 'plain'], ['line\nbreak', 3]])).toBe('"a,""b""",plain\r\n"line\nbreak",3\r\n');
  });
  it('renders null as an empty field', () => {
    expect(toCsv([[null, 'x']])).toBe(',x\r\n');
  });
  it('neutralizes spreadsheet formulas in text cells', () => {
    expect(toCsv([['=HYPERLINK("x")', '+1', '-2', '@a']])).toBe(`"'=HYPERLINK(""x"")",'+1,'-2,'@a\r\n`);
  });
  it('leaves Latin enclitics and endings alone but still guards dash formulas', () => {
    expect(toCsv([['-que', '-ārum', '-HYPERLINK("x")', '-1+1']])).toBe(`-que,-ārum,"'-HYPERLINK(""x"")",'-1+1\r\n`);
  });
  it('leaves numbers alone', () => {
    expect(toCsv([[-5, 0]])).toBe('-5,0\r\n');
  });
});

describe('parseCsvRow', () => {
  it('splits on commas and trims', () => {
    expect(parseCsvRow('puella , girl,3')).toEqual(['puella', 'girl', '3']);
  });
  it('keeps commas and doubled quotes inside quoted fields', () => {
    expect(parseCsvRow('"capiō, capere, cēpī, captum","to take, ""seize"""')).toEqual(['capiō, capere, cēpī, captum', 'to take, "seize"']);
  });
  it('keeps empty fields', () => {
    expect(parseCsvRow('a,,b,')).toEqual(['a', '', 'b', '']);
  });
  it('round-trips toCsv output for plain text', () => {
    const row = ['rēs, reī, f.', 'thing, "matter"', 'x'];
    expect(parseCsvRow(toCsv([row]).trimEnd())).toEqual(row);
  });
});
