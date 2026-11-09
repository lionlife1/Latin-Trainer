import { describe, it, expect } from 'vitest';
import { VERBS } from '../conjugator';
import { cellKey, cellLabel, parse, PRONOUNS, type MorphWord, type Verb } from './index';
import type { Adjective } from './adjectives';
import type { Noun } from './nouns';

const verb = (v: Verb): MorphWord => ({ kind: 'verb', verb: v });
const amo = verb({ inf: 'amare', conj: 1, pres: 'am', perf: 'amav', ppp: 'amat', trans: 'to love' });
const rego = verb({ inf: 'regere', conj: 3, pres: 'reg', perf: 'rex', ppp: 'rect', trans: 'to rule' });
const ire = verb(VERBS.find(v => v.inf === 'ire')!);
const puella: MorphWord = { kind: 'noun', noun: { nom: 'puella', stem: 'puell', decl: 1, gender: 'f', trans: 'girl' } as Noun };
const rex: MorphWord = { kind: 'noun', noun: { nom: 'rex', stem: 'reg', decl: 3, gender: 'm', trans: 'king' } as Noun };
const bonus: MorphWord = { kind: 'adjective', adjective: { nom: 'bonus', stem: 'bon', decl: '12', comp: 'meli', sup: 'opti', trans: 'good' } as Adjective };
const sui: MorphWord = { kind: 'pronoun', pronoun: PRONOUNS.find(p => p.id === 'sui')! };

const labels = (form: string, words: MorphWord[]) => parse(form, words).map(a => cellLabel(a.word, a.cell)).sort();

describe('parse', () => {
    it('puellae', () => {
        expect(labels('puellae', [puella])).toEqual(['dative singular', 'genitive singular', 'nominative plural', 'vocative plural']);
    });
    it('amare', () => {
        expect(labels('amare', [amo])).toEqual(['2nd sg. present passive imperative', 'present active infinitive']);
    });
    it('regis across words', () => {
        const r = parse('regis', [rex, rego]);
        expect(r.map(a => [a.word, cellLabel(a.word, a.cell)])).toEqual([[rex, 'genitive singular'], [rego, '2nd sg. present active indicative']]);
    });
    it('normalizes case and macrons', () => {
        expect(labels('AMĀVIT', [amo])).toEqual(['3rd sg. perfect active indicative']);
    });
    it('counts variants', () => {
        expect(labels('iit', [ire])).toEqual(['3rd sg. perfect indicative']);
    });
    it('sui', () => {
        expect(labels('se', [sui])).toEqual(['ablative', 'accusative']);
    });
    it('bonae', () => {
        expect(labels('bonae', [bonus])).toEqual([
            'dative singular feminine', 'genitive singular feminine', 'nominative plural feminine', 'vocative plural feminine']);
    });
    it('no match', () => {
        expect(parse('amata est', [amo])).toEqual([]);
        expect(parse('xyz', [amo, puella])).toEqual([]);
    });
});

describe('cellKey', () => {
    it('ignores key order and separates differing cells', () => {
        expect(cellKey({ number: 'singular', case: 'genitive' })).toBe(cellKey({ case: 'genitive', number: 'singular' }));
        expect(cellKey({ case: 'genitive', number: 'singular' })).not.toBe(cellKey({ case: 'genitive', number: 'plural' }));
    });
});
