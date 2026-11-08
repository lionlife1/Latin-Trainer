import { describe, it, expect } from 'vitest';
import type { Case, GrammaticalNumber } from './types';
import { ALL_NOUN_CELLS, nounCells, nounEntry, nounForms, type Noun } from './nouns';

const CASES: Case[] = ['nominative', 'genitive', 'dative', 'accusative', 'ablative', 'vocative'];
const col = (n: Noun, number: GrammaticalNumber) => CASES.map(c => nounForms(n, { case: c, number })[0]);
const t = (s: string) => s.split(',').map(x => x.trim());
const mk = (nom: string, stem: string, decl: Noun['decl'], gender: Noun['gender'], extra: Partial<Noun> = {}): Noun =>
    ({ nom, stem, decl, gender, trans: 'x', ...extra });

const puella = mk('puella', 'puell', 1, 'f');
const servus = mk('servus', 'serv', 2, 'm');
const bellum = mk('bellum', 'bell', 2, 'n');
const puer = mk('puer', 'puer', 2, 'm');
const ager = mk('ager', 'agr', 2, 'm');
const filius = mk('filius', 'fili', 2, 'm');
const consilium = mk('consilium', 'consili', 2, 'n');
const rex = mk('rex', 'reg', 3, 'm');
const nomen = mk('nomen', 'nomin', 3, 'n');
const civis = mk('civis', 'civ', 3, 'c', { iStem: true });
const mare = mk('mare', 'mar', 3, 'n', { iStem: true });
const animal = mk('animal', 'animal', 3, 'n', { iStem: true });
const manus = mk('manus', 'man', 4, 'f');
const cornu = mk('cornu', 'corn', 4, 'n');
const dies = mk('dies', 'di', 5, 'm');
const domus = mk('domus', 'dom', 4, 'f', { irregular: 'domus' });
const vis = mk('vis', 'vir', 3, 'f', { irregular: 'vis' });
const deus = mk('deus', 'de', 2, 'm', { irregular: 'deus' });

const GOLDEN: [string, Noun, string, string][] = [
    ['puella', puella, 'puella, puellae, puellae, puellam, puella, puella', 'puellae, puellarum, puellis, puellas, puellis, puellae'],
    ['servus', servus, 'servus, servi, servo, servum, servo, serve', 'servi, servorum, servis, servos, servis, servi'],
    ['bellum', bellum, 'bellum, belli, bello, bellum, bello, bellum', 'bella, bellorum, bellis, bella, bellis, bella'],
    ['puer', puer, 'puer, pueri, puero, puerum, puero, puer', 'pueri, puerorum, pueris, pueros, pueris, pueri'],
    ['ager', ager, 'ager, agri, agro, agrum, agro, ager', 'agri, agrorum, agris, agros, agris, agri'],
    ['filius', filius, 'filius, filii, filio, filium, filio, fili', 'filii, filiorum, filiis, filios, filiis, filii'],
    ['consilium', consilium, 'consilium, consilii, consilio, consilium, consilio, consilium', 'consilia, consiliorum, consiliis, consilia, consiliis, consilia'],
    ['rex', rex, 'rex, regis, regi, regem, rege, rex', 'reges, regum, regibus, reges, regibus, reges'],
    ['nomen', nomen, 'nomen, nominis, nomini, nomen, nomine, nomen', 'nomina, nominum, nominibus, nomina, nominibus, nomina'],
    ['civis', civis, 'civis, civis, civi, civem, cive, civis', 'cives, civium, civibus, cives, civibus, cives'],
    ['mare', mare, 'mare, maris, mari, mare, mari, mare', 'maria, marium, maribus, maria, maribus, maria'],
    ['animal', animal, 'animal, animalis, animali, animal, animali, animal', 'animalia, animalium, animalibus, animalia, animalibus, animalia'],
    ['manus', manus, 'manus, manus, manui, manum, manu, manus', 'manus, manuum, manibus, manus, manibus, manus'],
    ['cornu', cornu, 'cornu, cornus, cornu, cornu, cornu, cornu', 'cornua, cornuum, cornibus, cornua, cornibus, cornua'],
    ['dies', dies, 'dies, diei, diei, diem, die, dies', 'dies, dierum, diebus, dies, diebus, dies'],
    ['domus', domus, 'domus, domus, domui, domum, domo, domus', 'domus, domuum, domibus, domos, domibus, domus'],
];

describe('golden paradigms', () => {
    for (const [name, n, sg, pl] of GOLDEN) {
        it(name, () => {
            expect(col(n, 'singular')).toEqual(t(sg));
            expect(col(n, 'plural')).toEqual(t(pl));
        });
    }
});

describe('variants and irregulars', () => {
    it('filius genitive singular has two forms', () => { expect(nounForms(filius, { case: 'genitive', number: 'singular' })).toEqual(['filii', 'fili']); });
    it('civis accusative plural has two forms', () => { expect(nounForms(civis, { case: 'accusative', number: 'plural' })).toEqual(['cives', 'civis']); });
    it('domus accusative plural has two forms', () => { expect(nounForms(domus, { case: 'accusative', number: 'plural' })).toEqual(['domos', 'domus']); });
    it('domus dative and ablative singular variants', () => {
        expect(nounForms(domus, { case: 'dative', number: 'singular' })).toEqual(['domui', 'domo']);
        expect(nounForms(domus, { case: 'ablative', number: 'singular' })).toEqual(['domo', 'domu']);
    });
    it('vis plural', () => { expect(col(vis, 'plural')).toEqual(t('vires, virium, viribus, vires, viribus, vires')); });
    it('vis singular has vim and vi', () => {
        expect(nounForms(vis, { case: 'nominative', number: 'singular' })).toEqual(['vis']);
        expect(nounForms(vis, { case: 'accusative', number: 'singular' })).toEqual(['vim']);
        expect(nounForms(vis, { case: 'ablative', number: 'singular' })).toEqual(['vi']);
        expect(nounForms(vis, { case: 'genitive', number: 'singular' })).toEqual([]);
        expect(nounForms(vis, { case: 'dative', number: 'singular' })).toEqual([]);
    });
    it('vis has 10 cells', () => { expect(nounCells(vis)).toHaveLength(10); });
    it('deus nominative plural', () => { expect(nounForms(deus, { case: 'nominative', number: 'plural' })).toEqual(['di', 'dei', 'dii']); });
    it('deus singular and plural', () => {
        expect(col(deus, 'singular')).toEqual(t('deus, dei, deo, deum, deo, deus'));
        expect(col(deus, 'plural')).toEqual(t('di, deorum, dis, deos, dis, di'));
    });
});

describe('entries and cells', () => {
    it('nounEntry for vis has no genitive', () => { expect(nounEntry(vis)).toBe('vis, f.'); });
    it('nounEntry', () => {
        expect(nounEntry(puella)).toBe('puella, puellae, f.');
        expect(nounEntry(civis)).toBe('civis, civis, m./f.');
        expect(nounEntry(nomen)).toBe('nomen, nominis, n.');
    });
    it('ALL_NOUN_CELLS order', () => {
        expect(ALL_NOUN_CELLS).toHaveLength(12);
        expect(ALL_NOUN_CELLS[0]).toEqual({ case: 'nominative', number: 'singular' });
        expect(ALL_NOUN_CELLS[6]).toEqual({ case: 'nominative', number: 'plural' });
    });
    it('nounCells(puella) has 12 cells', () => { expect(nounCells(puella)).toHaveLength(12); });
    it('a cell is claimed iff it has forms, and forms are clean', () => {
        for (const [, n] of GOLDEN.map(g => g as unknown as [string, Noun]).concat([['vis', vis], ['deus', deus]])) {
            const claimed = nounCells(n);
            for (const cell of ALL_NOUN_CELLS) {
                const forms = nounForms(n, cell);
                const isClaimed = claimed.some(c => c.case === cell.case && c.number === cell.number);
                expect(isClaimed).toBe(forms.length > 0);
                for (const f of forms) {
                    expect(f).not.toMatch(/undefined|NaN/);
                    expect(f).toMatch(/^[a-z]+$/);
                }
            }
        }
    });
});
