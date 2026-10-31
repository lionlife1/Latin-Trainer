import { validateJoin, validatePin, JOIN_CODE_ALPHABET } from './validate';

describe('validateJoin', () => {
  const good = { join_code: 'abc234', display_name: ' Marcus ', pin: '123456' };
  it('normalizes code and name', () => {
    expect(validateJoin(good)).toEqual({ ok: true, value: { join_code: 'ABC234', display_name: 'Marcus', pin: '123456' } });
  });
  it.each([
    [{ ...good, pin: '12345' }, 'PIN must be 6 digits'],
    [{ ...good, pin: '12345a' }, 'PIN must be 6 digits'],
    [{ ...good, display_name: '   ' }, 'Name must be 1–24 characters'],
    [{ ...good, display_name: 'x'.repeat(25) }, 'Name must be 1–24 characters'],
    [{ ...good, join_code: 'ABC' }, 'Class code must be 6 characters'],
    [{ ...good, join_code: 'ABCDE0' }, 'Class code must be 6 characters'],
  ])('rejects %j', (input, error) => {
    expect(validateJoin(input)).toEqual({ ok: false, error });
  });
  it('rejects non-string input', () => {
    expect(validateJoin({ join_code: 1, display_name: null, pin: undefined } as never).ok).toBe(false);
  });
  it('alphabet has no ambiguous characters', () => {
    expect(JOIN_CODE_ALPHABET).not.toMatch(/[ILO01]/);
    expect(JOIN_CODE_ALPHABET).toHaveLength(31);
  });
  it('validatePin', () => {
    expect(validatePin('000123')).toBe(true);
    expect(validatePin(' 123456')).toBe(false);
  });
});
