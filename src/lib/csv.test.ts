import { toCsv } from './csv';

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
  it('leaves numbers alone', () => {
    expect(toCsv([[-5, 0]])).toBe('-5,0\r\n');
  });
});
