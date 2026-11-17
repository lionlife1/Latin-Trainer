import { describe, it, expect } from 'vitest';
import { VERBS } from '../conjugator';
import { cellLabel, cellParts, cellsOf, PRONOUNS, type Cell, type MorphWord, type Verb } from './index';
import type { Adjective } from './adjectives';
import type { Noun } from './nouns';

const amo: Verb = { inf: 'amare', conj: 1, pres: 'am', perf: 'amav', ppp: 'amat', trans: 'to love' };
const moneo: Verb = { inf: 'monere', conj: 2, pres: 'mon', perf: 'monu', ppp: 'monit', trans: 'to warn' };
const hortor: Verb = { inf: 'hortari', conj: 1, pres: 'hort', perf: 'hortat', deponent: true, impfBase: 'hortare', trans: 'to urge' };
const cado: Verb = { inf: 'cadere', conj: 3, pres: 'cad', perf: 'cecid', ppp: 'cas', noPassive: true, trans: 'to fall' };
const puella: Noun = { nom: 'puella', stem: 'puell', decl: 1, gender: 'f', trans: 'girl' };
const bonus: Adjective = { nom: 'bonus', stem: 'bon', decl: '12', comp: 'meli', sup: 'opti', trans: 'good' };
const v = (verb: Verb): MorphWord => ({ kind: 'verb', verb });
const L = (w: MorphWord, c: Cell) => cellLabel(w, c);

describe('cellLabel', () => {
    it('finite verbs', () => {
        expect(L(v(moneo), { mood: 'indicative', tense: 'pluperfect', voice: 'passive', person: 3, number: 'plural' })).toBe('3rd pl. pluperfect passive indicative');
        expect(L(v(amo), { mood: 'indicative', tense: 'futurePerfect', voice: 'active', person: 1, number: 'singular' })).toBe('1st sg. future perfect active indicative');
        expect(L(v(amo), { mood: 'imperative', tense: 'present', voice: 'active', person: 2, number: 'singular' })).toBe('2nd sg. present active imperative');
    });
    it('omits voice without a passive finite cell', () => {
        expect(L(v(hortor), { mood: 'subjunctive', tense: 'perfect', voice: 'active', person: 1, number: 'singular' })).toBe('1st sg. perfect subjunctive');
        expect(L(v(cado), { mood: 'infinitive', tense: 'present', voice: 'active' })).toBe('present infinitive');
        expect(L(v(amo), { mood: 'infinitive', tense: 'perfect', voice: 'passive' })).toBe('perfect passive infinitive');
        expect(L(v(hortor), { mood: 'infinitive', tense: 'future', voice: 'active' })).toBe('future infinitive');
    });
    it('participles and gerunds', () => {
        expect(L(v(cado), { mood: 'participle', tense: 'future', voice: 'active' })).toBe('future active participle');
        expect(L(v(amo), { mood: 'participle', tense: 'future', voice: 'passive' })).toBe('gerundive');
        expect(L(v(amo), { mood: 'participle', tense: 'perfect', voice: 'passive' })).toBe('perfect passive participle');
        expect(L(v(hortor), { mood: 'participle', tense: 'perfect', voice: 'active' })).toBe('perfect participle');
        expect(L(v(amo), { mood: 'gerund', case: 'genitive' })).toBe('gerund, genitive');
    });
    it('nouns, adjectives, pronouns', () => {
        expect(L({ kind: 'noun', noun: puella }, { case: 'genitive', number: 'singular' })).toBe('genitive singular');
        expect(L({ kind: 'adjective', adjective: bonus }, { case: 'dative', number: 'plural', gender: 'f', degree: 'comparative' })).toBe('dative plural feminine, comparative');
        expect(L({ kind: 'adjective', adjective: bonus }, { case: 'dative', number: 'plural', gender: 'f', degree: 'positive' })).toBe('dative plural feminine');
        const p = (id: string) => ({ kind: 'pronoun', pronoun: PRONOUNS.find(x => x.id === id)! }) as MorphWord;
        expect(L(p('sui'), { case: 'accusative', number: 'singular' })).toBe('accusative');
        expect(L(p('ego'), { case: 'dative', number: 'plural' })).toBe('dative plural');
        expect(L(p('hic'), { case: 'nominative', number: 'singular', gender: 'n' })).toBe('nominative singular neuter');
    });
    it('ire (noPassive) omits voice', () => {
        const ire = VERBS.find(x => x.inf === 'ire')!;
        expect(L(v(ire), { mood: 'indicative', tense: 'perfect', voice: 'active', person: 3, number: 'singular' })).toBe('3rd sg. perfect indicative');
    });
});

describe('cellParts', () => {
    const sui: MorphWord = { kind: 'pronoun', pronoun: PRONOUNS.find(p => p.id === 'sui')! };
    const words: MorphWord[] = [
        v(amo), v(hortor), v(cado), { kind: 'noun', noun: puella }, { kind: 'adjective', adjective: bonus }, sui,
        ...PRONOUNS.slice(0, 3).map(pronoun => ({ kind: 'pronoun', pronoun }) as MorphWord),
    ];
    it('every value appears in cellLabel, for every cell', () => {
        for (const w of words) for (const c of cellsOf(w)) {
            const label = cellLabel(w, c);
            const parts = cellParts(w, c);
            expect(parts.length).toBeGreaterThan(0);
            for (const p of parts) expect(label, `${label} / ${p.key}`).toContain(p.value);
        }
    });
    it('names the features in a fixed order', () => {
        expect(cellParts(v(amo), { mood: 'indicative', tense: 'futurePerfect', voice: 'passive', person: 2, number: 'plural' })).toEqual([
            { key: 'Person', value: '2nd pl.' }, { key: 'Tense', value: 'future perfect' }, { key: 'Voice', value: 'passive' }, { key: 'Mood', value: 'indicative' },
        ]);
        expect(cellParts(v(cado), { mood: 'infinitive', tense: 'present', voice: 'active' }).map(p => p.key)).toEqual(['Tense', 'Mood']);
        expect(cellParts(v(amo), { mood: 'participle', tense: 'future', voice: 'passive' })).toEqual([{ key: 'Form', value: 'gerundive' }]);
        expect(cellParts(v(hortor), { mood: 'participle', tense: 'perfect', voice: 'active' })).toEqual([{ key: 'Tense', value: 'perfect' }, { key: 'Mood', value: 'participle' }]);
        expect(cellParts(v(amo), { mood: 'gerund', case: 'genitive' } as Cell)).toEqual([{ key: 'Form', value: 'gerund' }, { key: 'Case', value: 'genitive' }]);
    });
    it('adjective degree only when not positive; sui has no number', () => {
        const keys = (c: Cell) => cellParts({ kind: 'adjective', adjective: bonus }, c).map(p => p.key);
        const cells = cellsOf({ kind: 'adjective', adjective: bonus }) as { degree: string }[];
        expect(keys(cells.find(c => c.degree === 'positive') as Cell)).toEqual(['Case', 'Number', 'Gender']);
        expect(keys(cells.find(c => c.degree === 'comparative') as Cell)).toEqual(['Case', 'Number', 'Gender', 'Degree']);
        expect(cellParts(sui, cellsOf(sui)[0]).map(p => p.key)).toEqual(['Case']);
    });
});
