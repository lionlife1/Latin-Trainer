import fixtures from '../../tests/fixtures/normalize.json';
import { normalize, isCorrect, correctDisplay, grade, earnedPoints } from './grading';
import type { DrillQuestion } from './types';

const typein: DrillQuestion = { id: 't', type: 'typein', badge: 'B', prompt: 'p', answers: ['amem', 'amātus sim'] };
const mc: DrillQuestion = {
  id: 'm', type: 'mc', badge: 'B', prompt: 'p',
  choices: ['Present active subjunctive', 'Imperfect active subjunctive'],
  correct: 'Imperfect active subjunctive',
};

describe('normalize', () => {
  it.each(fixtures as [string, string][])('normalize(%j) === %j', (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });
});

describe('isCorrect', () => {
  it('accepts typein answer ignoring macrons, case and spacing', () => {
    expect(isCorrect(typein, 'Amēm ')).toBe(true);
    expect(isCorrect(typein, 'amatus   sim')).toBe(true);
  });
  it('rejects a wrong typein answer', () => {
    expect(isCorrect(typein, 'amarem')).toBe(false);
  });
  it('grades mc by normalized text', () => {
    expect(isCorrect(mc, 'imperfect active subjunctive')).toBe(true);
    expect(isCorrect(mc, 'Present active subjunctive')).toBe(false);
  });
  it('correctDisplay shows first answer or mc correct', () => {
    expect(correctDisplay(typein)).toBe('amem');
    expect(correctDisplay(mc)).toBe('Imperfect active subjunctive');
  });
});

describe('grade', () => {
  const ti: DrillQuestion = { id: 't', type: 'typein', badge: 'B', prompt: 'p', answers: ['amem'] };
  const mc1: DrillQuestion = { id: 'm', type: 'mc', badge: 'B', prompt: 'p', choices: ['x', 'y'], correct: 'y' };
  const grid: DrillQuestion = {
    id: 'g', type: 'grid', badge: 'B', prompt: 'p', columns: ['c1'],
    rows: [
      { label: 'r1', cells: [{ id: 'a' }] },
      { label: 'r2', cells: [{ id: 'b' }] },
      { label: 'r3', cells: [{ id: 'c' }, { id: 'd', given: 'amo' }, null] },
    ],
    key: { a: ['amo'], b: ['amas'], c: ['amatus est', 'amata est'] },
  };
  const parse: DrillQuestion = {
    id: 'p', type: 'parse', badge: 'B', prompt: 'p',
    fields: [
      { id: 'case', label: 'Case', options: [
        { value: 'genitive', label: 'genitive' }, { value: 'dative', label: 'dative' },
        { value: 'nominative', label: 'nominative' }, { value: 'ablative', label: 'ablative' }] },
      { id: 'number', label: 'Number', options: [
        { value: 'singular', label: 'singular' }, { value: 'plural', label: 'plural' }] },
    ],
    key: [
      { case: 'genitive', number: 'singular' },
      { case: 'dative', number: 'singular' },
      { case: 'nominative', number: 'plural' },
    ],
  };
  const ro = (q: DrillQuestion, g: Parameters<typeof grade>[1]) => {
    const r = grade(q, g);
    return [r.right, r.outOf];
  };

  it('typein and mc', () => {
    expect(ro(ti, ' Amēm ')).toEqual([1, 1]);
    expect(ro(ti, '')).toEqual([0, 1]);
    expect(ro(ti, '   ')).toEqual([0, 1]);
    expect(ro(ti, { a: 'amem' })).toEqual([0, 1]);
    expect(ro(mc1, 'x')).toEqual([0, 1]);
    expect(grade(mc1, 'y').parts).toEqual([{ id: 'answer', ok: true }]);
  });

  it('grid', () => {
    const g = grade(grid, { a: 'amo', b: 'amat', c: 'AMATA  est' });
    expect([g.right, g.outOf]).toEqual([2, 3]);
    expect(g.parts).toEqual([{ id: 'a', ok: true }, { id: 'b', ok: false }, { id: 'c', ok: true }]);
    expect(ro(grid, {})).toEqual([0, 3]);
    expect(ro(grid, 'amo')).toEqual([0, 3]);
    expect(ro(grid, { a: '  ' })).toEqual([0, 3]);
  });

  it('parse', () => {
    expect(ro(parse, { case: 'dative', number: 'singular' })).toEqual([2, 2]);
    expect(ro(parse, { case: 'nominative', number: 'singular' })).toEqual([1, 2]);
    expect(ro(parse, { case: 'ablative', number: 'plural' })).toEqual([1, 2]);
    expect(ro(parse, {})).toEqual([0, 2]);
    expect(ro(parse, 'dative')).toEqual([0, 2]);
  });

  it('isCorrect means all parts right', () => {
    expect(isCorrect(parse, { case: 'genitive', number: 'singular' })).toBe(true);
    expect(isCorrect(grid, { a: 'amo', b: 'amas', c: 'amata est' })).toBe(true);
    expect(isCorrect(grid, { a: 'amo' })).toBe(false);
  });

  it('correctDisplay for grid and parse', () => {
    expect(correctDisplay(grid)).toBe('amo, amas, amatus est');
    expect(correctDisplay(parse)).toBe('genitive singular / dative singular / nominative plural');
  });

  it('earnedPoints', () => {
    expect(earnedPoints({ right: 2, outOf: 3, parts: [] }, 3)).toBe(2);
    expect(earnedPoints({ right: 1, outOf: 3, parts: [] }, 1)).toBe(0.33);
  });
});
