import { readFileSync } from 'node:fs';
import { parseDictline, parseDictlineLine } from './whitaker';

const line = (stems: string[], posFields: string, age = 'X', freq = 'A', meaning = 'x') =>
  stems.map((s) => s.padEnd(19)).join('').padEnd(76) + posFields.padEnd(24) + `${age} X X ${freq} O ${meaning}`;

const cases: Array<[string[], string, string, string]> = [
  [['am', 'am', 'amav', 'amat'], 'V 1 1 X', 'amo, amare, amavi, amatus', 'verb'],
  [['mon', 'mon', 'monu', 'monit'], 'V 2 1 X', 'moneo, monere, monui, monitus', 'verb'],
  [['capi', 'cap', 'cep', 'capt'], 'V 3 1 TRANS', 'capio, capere, cepi, captus', 'verb'],
  [['audi', 'aud', 'audiv', 'audit'], 'V 3 4 X', 'audio, audire, audivi, auditus', 'verb'],
  [['hort', 'hort', 'zzz', 'hortat'], 'V 1 1 DEP', 'hortor, hortari, hortatus sum', 'verb'],
  [['aud', 'aud', 'aus', 'aus'], 'V 2 1 SEMIDEP', 'audeo, audere, ausus sum', 'verb'],
  [['miles', 'milit'], 'N 3 1 M P', 'miles, militis, m.', 'noun'],
  [['puer', 'puer'], 'N 2 3 M P', 'puer, pueri, m.', 'noun'],
  [['bell', 'bell'], 'N 2 2 N T', 'bellum, belli, n.', 'noun'],
  [['corn', 'corn'], 'N 4 2 N T', 'cornu, cornus, n.', 'noun'],
  [['di', 'di'], 'N 5 1 C T', 'dies, diei, c.', 'noun'],
  [['bon', 'bon', 'meli', 'opti'], 'ADJ 1 1 X', 'bonus, bona, bonum', 'adjective'],
  [['liber', 'liber', 'liberi', 'liberri'], 'ADJ 1 2 X', 'liber, libera, liberum', 'adjective'],
  [['acer', 'acr', 'acri', 'acerri'], 'ADJ 3 3 X', 'acer, acris, acre', 'adjective'],
  [['fort', 'fort', 'forti', 'fortissi'], 'ADJ 3 2 X', 'fortis, forte', 'adjective'],
  [['ingens', 'ingent'], 'ADJ 3 1 X', 'ingens, ingentis', 'adjective'],
  [['ex'], 'PREP ABL', 'ex', 'preposition'],
];

describe('parseDictlineLine', () => {
  it.each(cases)('%j %s', (stems, pos, headword, p) => {
    const r = parseDictlineLine(line(stems, pos));
    expect(r?.headword).toBe(headword);
    expect(r?.pos).toBe(p);
    expect(r?.freq).toBe('A');
  });

  it('rejects unsupported classes and filtered lines', () => {
    expect(parseDictlineLine(line(['fer', 'fer', 'tul', 'lat'], 'V 3 2 X'))).toBeNull();
    expect(parseDictlineLine(line(['e', 'i', 'iv', 'it'], 'V 6 1 X'))).toBeNull();
    expect(parseDictlineLine(line(['act'], 'V 1 1 X', 'X', 'A', '|act/take action'))).toBeNull();
    expect(parseDictlineLine(line(['am', 'am', 'amav', 'amat'], 'V 1 1 X', 'F'))).toBeNull();
  });

  it('drops PRON and NUM lines (stems only)', () => {
    expect(parseDictlineLine(line(['aliqu', 'alicu'], 'PRON 1 0 INDEF'))).toBeNull();
    expect(parseDictlineLine(line(['amb'], 'NUM 1 2 CARD'))).toBeNull();
  });

  it('drops rows whose required stem is zzz', () => {
    expect(parseDictlineLine(line(['zzz', 'zzz'], 'N 3 1 N T'))).toBeNull();
    expect(parseDictlineLine(line(['ep', 'zzz'], 'N 3 1 N T'))).toBeNull();
    expect(parseDictlineLine(line(['zzz'], 'ADV POS'))).toBeNull();
    expect(parseDictlineLine(line(['zzz', 'zzz'], 'ADJ 1 1 X'))).toBeNull();
  });

  it('parses a real DICTLINE.GEN line', () => {
    const real =
      'am                 am                 amav               amat               V      1 1 X            X X X A O love, like; fall in love with; be fond of; have a tendency to;';
    const r = parseDictlineLine(real);
    expect(r?.headword).toBe('amo, amare, amavi, amatus');
    expect(r?.freq).toBe('A');
    expect(r?.definition.startsWith('love, like; fall in love with')).toBe(true);
    expect(r?.definition.endsWith(';')).toBe(false);
  });
});

describe('parseDictline (whole file)', () => {
  const rows = parseDictline(readFileSync('content/sources/whitaker/DICTLINE.GEN', 'utf8'));
  it('yields a plausible number of rows with short headwords', () => {
    expect(rows.length).toBeGreaterThanOrEqual(25000);
    expect(rows.length).toBeLessThanOrEqual(36000);
    expect(rows.every((r) => r.headword.length <= 120)).toBe(true);
    expect(rows.some((r) => /zzz/.test(r.headword))).toBe(false);
    expect(rows.some((r) => /(^|, ),|,\s*$|^\s*$/.test(r.headword))).toBe(false);
    expect(rows.some((r) => r.pos === 'pronoun')).toBe(false);
  });
});
