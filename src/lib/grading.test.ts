import fixtures from '../../tests/fixtures/normalize.json';
import { normalize, isCorrect, correctDisplay } from './grading';
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
