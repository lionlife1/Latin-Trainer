import { describe, it, expect } from 'vitest';
import {
    adjectiveCells, adjectiveEntry, adjectiveForms, adverbForms, type Adjective, type AdjectiveCell,
} from './adjectives';
import type { Case, Degree, Gender, GrammaticalNumber } from './types';

const bonus: Adjective = { nom: 'bonus', stem: 'bon', decl: '12', comp: 'meli', sup: 'opti', trans: 'good' };
const miser: Adjective = { nom: 'miser', stem: 'miser', decl: '12', comp: 'miseri', sup: 'miserri', trans: 'wretched' };
const pulcher: Adjective = { nom: 'pulcher', stem: 'pulchr', decl: '12', comp: 'pulchri', sup: 'pulcherri', trans: 'beautiful' };
const acer: Adjective = { nom: 'acer', stem: 'acr', decl: '3', terminations: 3, comp: 'acri', sup: 'acerri', trans: 'sharp' };
const fortis: Adjective = { nom: 'fortis', stem: 'fort', decl: '3', terminations: 2, comp: 'forti', sup: 'fortissi', trans: 'brave' };
const ingens: Adjective = { nom: 'ingens', stem: 'ingent', decl: '3', terminations: 1, comp: 'ingenti', sup: 'ingentissi', trans: 'huge' };
const facilis: Adjective = { nom: 'facilis', stem: 'facil', decl: '3', terminations: 2, comp: 'facili', sup: 'facilli', trans: 'easy' };
const vetus: Adjective = { nom: 'vetus', stem: 'veter', decl: '3', terminations: 1, consonantStem: true, comp: 'veteri', sup: 'veterri', trans: 'old' };
const multus: Adjective = { nom: 'multus', stem: 'mult', decl: '12', comp: 'plur', sup: 'pluri', trans: 'much' };
const solus: Adjective = { nom: 'solus', stem: 'sol', decl: '12', pronominal: true, trans: 'alone' };
const alius: Adjective = { nom: 'alius', stem: 'ali', decl: '12', pronominal: true, trans: 'another' };
const memor: Adjective = { nom: 'memor', stem: 'memor', decl: '3', terminations: 1, consonantStem: true, trans: 'mindful' };
const magnus: Adjective = { nom: 'magnus', stem: 'magn', decl: '12', comp: 'mai', sup: 'maxi', trans: 'big' };

const CASES: Case[] = ['nominative', 'genitive', 'dative', 'accusative', 'ablative', 'vocative'];
/** The six forms (first variant) of one gender and number, in the order nom gen dat acc abl voc. */
function row(a: Adjective, gender: Gender, number: GrammaticalNumber, degree: Degree = 'positive'): string[] {
    return CASES.map(c => adjectiveForms(a, { case: c, number, gender, degree })[0]);
}

describe('adjective declension', () => {
    const golden: [string, Adjective, Gender, GrammaticalNumber, Degree, string][] = [
        ['bonus m sg', bonus, 'm', 'singular', 'positive', 'bonus, boni, bono, bonum, bono, bone'],
        ['bonus f sg', bonus, 'f', 'singular', 'positive', 'bona, bonae, bonae, bonam, bona, bona'],
        ['bonus n pl', bonus, 'n', 'plural', 'positive', 'bona, bonorum, bonis, bona, bonis, bona'],
        ['miser m sg', miser, 'm', 'singular', 'positive', 'miser, miseri, misero, miserum, misero, miser'],
        ['pulcher m sg', pulcher, 'm', 'singular', 'positive', 'pulcher, pulchri, pulchro, pulchrum, pulchro, pulcher'],
        ['pulcher f pl', pulcher, 'f', 'plural', 'positive', 'pulchrae, pulchrarum, pulchris, pulchras, pulchris, pulchrae'],
        ['acer m sg', acer, 'm', 'singular', 'positive', 'acer, acris, acri, acrem, acri, acer'],
        ['acer f sg', acer, 'f', 'singular', 'positive', 'acris, acris, acri, acrem, acri, acris'],
        ['acer n pl', acer, 'n', 'plural', 'positive', 'acria, acrium, acribus, acria, acribus, acria'],
        ['fortis m sg', fortis, 'm', 'singular', 'positive', 'fortis, fortis, forti, fortem, forti, fortis'],
        ['fortis n sg', fortis, 'n', 'singular', 'positive', 'forte, fortis, forti, forte, forti, forte'],
        ['fortis m pl', fortis, 'm', 'plural', 'positive', 'fortes, fortium, fortibus, fortes, fortibus, fortes'],
        ['ingens n sg', ingens, 'n', 'singular', 'positive', 'ingens, ingentis, ingenti, ingens, ingenti, ingens'],
        ['ingens n pl', ingens, 'n', 'plural', 'positive', 'ingentia, ingentium, ingentibus, ingentia, ingentibus, ingentia'],
        ['vetus m sg', vetus, 'm', 'singular', 'positive', 'vetus, veteris, veteri, veterem, vetere, vetus'],
        ['vetus n pl', vetus, 'n', 'plural', 'positive', 'vetera, veterum, veteribus, vetera, veteribus, vetera'],
        ['bonus comp m sg', bonus, 'm', 'singular', 'comparative', 'melior, melioris, meliori, meliorem, meliore, melior'],
        ['bonus comp n sg', bonus, 'n', 'singular', 'comparative', 'melius, melioris, meliori, melius, meliore, melius'],
        ['bonus comp n pl', bonus, 'n', 'plural', 'comparative', 'meliora, meliorum, melioribus, meliora, melioribus, meliora'],
        ['bonus sup f sg', bonus, 'f', 'singular', 'superlative', 'optima, optimae, optimae, optimam, optima, optima'],
        ['pulcher sup m sg', pulcher, 'm', 'singular', 'superlative', 'pulcherrimus, pulcherrimi, pulcherrimo, pulcherrimum, pulcherrimo, pulcherrime'],
        ['memor n pl', memor, 'n', 'plural', 'positive', 'memora, memorum, memoribus, memora, memoribus, memora'],
        ['solus m sg', solus, 'm', 'singular', 'positive', 'solus, solius, soli, solum, solo, sole'],
    ];
    for (const [name, a, g, n, d, expected] of golden) {
        it(name, () => expect(row(a, g, n, d).join(', ')).toBe(expected));
    }

    const cell = (c: Case, number: GrammaticalNumber, gender: Gender, degree: Degree = 'positive'): AdjectiveCell =>
        ({ case: c, number, gender, degree });

    it('other degrees and variants', () => {
        expect(adjectiveForms(acer, cell('nominative', 'singular', 'm', 'superlative'))).toEqual(['acerrimus']);
        expect(adjectiveForms(facilis, cell('nominative', 'singular', 'm', 'superlative'))).toEqual(['facillimus']);
        expect(adjectiveForms(fortis, cell('nominative', 'singular', 'm', 'comparative'))).toEqual(['fortior']);
        expect(adjectiveForms(fortis, cell('accusative', 'plural', 'm'))).toEqual(['fortes', 'fortis']);
        expect(adjectiveForms(fortis, cell('accusative', 'plural', 'm', 'comparative'))).toEqual(['fortiores']);
    });

    it('alius', () => {
        expect(adjectiveForms(alius, cell('nominative', 'singular', 'n'))).toEqual(['aliud']);
        expect(adjectiveForms(alius, cell('genitive', 'singular', 'm'))).toEqual(['alterius']);
    });

    it('multus comparative is plus, pluris, plures, plura', () => {
        expect(adjectiveForms(multus, cell('nominative', 'singular', 'n', 'comparative'))).toEqual(['plus']);
        expect(adjectiveForms(multus, cell('genitive', 'singular', 'n', 'comparative'))).toEqual(['pluris']);
        expect(adjectiveForms(multus, cell('ablative', 'singular', 'n', 'comparative'))).toEqual(['plure']);
        expect(adjectiveForms(multus, cell('nominative', 'plural', 'm', 'comparative'))).toEqual(['plures']);
        expect(adjectiveForms(multus, cell('nominative', 'plural', 'n', 'comparative'))).toEqual(['plura']);
        expect(adjectiveForms(multus, cell('genitive', 'plural', 'f', 'comparative'))).toEqual(['plurium']);
        expect(adjectiveForms(multus, cell('dative', 'plural', 'm', 'comparative'))).toEqual(['pluribus']);
        expect(adjectiveForms(multus, cell('vocative', 'plural', 'm', 'comparative'))).toEqual([]);
        expect(adjectiveCells(multus).some(c => c.degree === 'comparative' && c.gender === 'm' && c.number === 'singular')).toBe(false);
        expect(adjectiveForms(multus, cell('nominative', 'singular', 'm', 'superlative'))).toEqual(['plurimus']);
    });

    it('counts cells', () => {
        expect(adjectiveCells(bonus)).toHaveLength(108);
        expect(adjectiveCells(solus)).toHaveLength(36);
        expect(adjectiveCells(bonus)[0]).toEqual({ case: 'nominative', number: 'singular', gender: 'm', degree: 'positive' });
    });
});

describe('adjectiveEntry', () => {
    it('gives the dictionary entry', () => {
        expect(adjectiveEntry(bonus)).toBe('bonus, bona, bonum');
        expect(adjectiveEntry(acer)).toBe('acer, acris, acre');
        expect(adjectiveEntry(fortis)).toBe('fortis, forte');
        expect(adjectiveEntry(ingens)).toBe('ingens, ingentis');
        expect(adjectiveEntry(miser)).toBe('miser, misera, miserum');
    });
});

describe('adverbs', () => {
    it('forms the three degrees', () => {
        expect(['positive', 'comparative', 'superlative'].map(d => adverbForms(fortis, d as Degree)[0])).toEqual(['fortiter', 'fortius', 'fortissime']);
        expect(['positive', 'comparative', 'superlative'].map(d => adverbForms(acer, d as Degree)[0])).toEqual(['acriter', 'acrius', 'acerrime']);
        expect(adverbForms(miser, 'positive')).toEqual(['misere']);
        expect(adverbForms(ingens, 'positive')).toEqual(['ingenter']);
        expect(['positive', 'comparative', 'superlative'].map(d => adverbForms(bonus, d as Degree)[0])).toEqual(['bene', 'melius', 'optime']);
        expect(['positive', 'comparative', 'superlative'].map(d => adverbForms(magnus, d as Degree)[0])).toEqual(['magnopere', 'magis', 'maxime']);
        expect(adverbForms(solus, 'positive')).toEqual([]);
        expect(adverbForms(vetus, 'positive')).toEqual([]);
        expect(adverbForms(vetus, 'superlative')).toEqual([]);
    });
});
