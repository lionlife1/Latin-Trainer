import { describe, it, expect } from 'vitest';
import type { Verb, VerbCell, VerbTense, Voice, Person } from './types';
import { ALL_VERB_CELLS, hasVerbCell, verbCells, verbForms } from './verbs';

const amo: Verb = { inf: 'amare', conj: 1, pres: 'am', perf: 'amav', ppp: 'amat', trans: 'to love' };
const moneo: Verb = { inf: 'monere', conj: 2, pres: 'mon', perf: 'monu', ppp: 'monit', trans: 'to warn' };
const rego: Verb = { inf: 'regere', conj: 3, pres: 'reg', perf: 'rex', ppp: 'rect', trans: 'to rule' };
const capio: Verb = { inf: 'capere', conj: 3.5, pres: 'cap', perf: 'cep', ppp: 'capt', trans: 'to take' };
const audio: Verb = { inf: 'audire', conj: 4, pres: 'aud', perf: 'audiv', ppp: 'audit', trans: 'to hear' };
const hortor: Verb = { inf: 'hortari', conj: 1, pres: 'hort', perf: 'hortat', deponent: true, impfBase: 'hortare', trans: 'to urge' };
const cado: Verb = { inf: 'cadere', conj: 3, pres: 'cad', perf: 'cecid', ppp: 'cas', noPassive: true, trans: 'to fall' };
const ducere: Verb = { inf: 'ducere', conj: 3, pres: 'duc', perf: 'dux', ppp: 'duct', trans: 'to lead' };
const mori: Verb = { inf: 'mori', conj: 3.5, pres: 'mor', perf: 'mortu', deponent: true, impfBase: 'morere', trans: 'to die' };
const t = (s: string) => s.split(',').map(x => x.trim());
const six = (v: Verb, mood: 'indicative' | 'subjunctive', tense: VerbTense, voice: Voice) =>
    ([1, 2, 3, 1, 2, 3] as Person[]).map((person, i) =>
        verbForms(v, { mood, tense, voice, person, number: i < 3 ? 'singular' : 'plural' } as VerbCell)[0]);
const one = (v: Verb, cell: VerbCell) => verbForms(v, cell)[0];
const imp = (tense: 'present' | 'future', voice: Voice, person: 2 | 3, number: 'singular' | 'plural'): VerbCell =>
    ({ mood: 'imperative', tense, voice, person, number });
const inf = (tense: 'present' | 'perfect' | 'future', voice: Voice): VerbCell => ({ mood: 'infinitive', tense, voice });
const part = (tense: 'present' | 'perfect' | 'future', voice: Voice): VerbCell => ({ mood: 'participle', tense, voice });
const ger = (c: 'genitive' | 'dative' | 'accusative' | 'ablative'): VerbCell => ({ mood: 'gerund', case: c });

describe('finite forms', () => {
    it('amo indicative present active', () => { expect(six(amo, 'indicative', 'present', 'active')).toEqual(t('amo, amas, amat, amamus, amatis, amant')); });
    it('amo indicative imperfect active', () => { expect(six(amo, 'indicative', 'imperfect', 'active')).toEqual(t('amabam, amabas, amabat, amabamus, amabatis, amabant')); });
    it('amo indicative future active', () => { expect(six(amo, 'indicative', 'future', 'active')).toEqual(t('amabo, amabis, amabit, amabimus, amabitis, amabunt')); });
    it('amo indicative perfect active', () => { expect(six(amo, 'indicative', 'perfect', 'active')).toEqual(t('amavi, amavisti, amavit, amavimus, amavistis, amaverunt')); });
    it('amo indicative pluperfect active', () => { expect(six(amo, 'indicative', 'pluperfect', 'active')).toEqual(t('amaveram, amaveras, amaverat, amaveramus, amaveratis, amaverant')); });
    it('amo indicative futurePerfect active', () => { expect(six(amo, 'indicative', 'futurePerfect', 'active')).toEqual(t('amavero, amaveris, amaverit, amaverimus, amaveritis, amaverint')); });
    it('amo indicative present passive', () => { expect(six(amo, 'indicative', 'present', 'passive')).toEqual(t('amor, amaris, amatur, amamur, amamini, amantur')); });
    it('amo indicative imperfect passive', () => { expect(six(amo, 'indicative', 'imperfect', 'passive')).toEqual(t('amabar, amabaris, amabatur, amabamur, amabamini, amabantur')); });
    it('amo indicative future passive', () => { expect(six(amo, 'indicative', 'future', 'passive')).toEqual(t('amabor, amaberis, amabitur, amabimur, amabimini, amabuntur')); });
    it('amo indicative perfect passive', () => { expect(six(amo, 'indicative', 'perfect', 'passive')).toEqual(t('amatus sum, amatus es, amatus est, amati sumus, amati estis, amati sunt')); });
    it('amo indicative pluperfect passive', () => { expect(six(amo, 'indicative', 'pluperfect', 'passive')).toEqual(t('amatus eram, amatus eras, amatus erat, amati eramus, amati eratis, amati erant')); });
    it('amo indicative futurePerfect passive', () => { expect(six(amo, 'indicative', 'futurePerfect', 'passive')).toEqual(t('amatus ero, amatus eris, amatus erit, amati erimus, amati eritis, amati erunt')); });
    it('amo subjunctive present active', () => { expect(six(amo, 'subjunctive', 'present', 'active')).toEqual(t('amem, ames, amet, amemus, ametis, ament')); });
    it('amo subjunctive imperfect passive', () => { expect(six(amo, 'subjunctive', 'imperfect', 'passive')).toEqual(t('amarer, amareris, amaretur, amaremur, amaremini, amarentur')); });
    it('amo subjunctive perfect active', () => { expect(six(amo, 'subjunctive', 'perfect', 'active')).toEqual(t('amaverim, amaveris, amaverit, amaverimus, amaveritis, amaverint')); });
    it('amo subjunctive pluperfect passive', () => { expect(six(amo, 'subjunctive', 'pluperfect', 'passive')).toEqual(t('amatus essem, amatus esses, amatus esset, amati essemus, amati essetis, amati essent')); });
    it('moneo indicative present active', () => { expect(six(moneo, 'indicative', 'present', 'active')).toEqual(t('moneo, mones, monet, monemus, monetis, monent')); });
    it('moneo indicative future passive', () => { expect(six(moneo, 'indicative', 'future', 'passive')).toEqual(t('monebor, moneberis, monebitur, monebimur, monebimini, monebuntur')); });
    it('moneo indicative pluperfect passive', () => { expect(six(moneo, 'indicative', 'pluperfect', 'passive')).toEqual(t('monitus eram, monitus eras, monitus erat, moniti eramus, moniti eratis, moniti erant')); });
    it('moneo subjunctive present passive', () => { expect(six(moneo, 'subjunctive', 'present', 'passive')).toEqual(t('monear, monearis, moneatur, moneamur, moneamini, moneantur')); });
    it('rego indicative present active', () => { expect(six(rego, 'indicative', 'present', 'active')).toEqual(t('rego, regis, regit, regimus, regitis, regunt')); });
    it('rego indicative present passive', () => { expect(six(rego, 'indicative', 'present', 'passive')).toEqual(t('regor, regeris, regitur, regimur, regimini, reguntur')); });
    it('rego indicative imperfect active', () => { expect(six(rego, 'indicative', 'imperfect', 'active')).toEqual(t('regebam, regebas, regebat, regebamus, regebatis, regebant')); });
    it('rego indicative future active', () => { expect(six(rego, 'indicative', 'future', 'active')).toEqual(t('regam, reges, reget, regemus, regetis, regent')); });
    it('rego indicative future passive', () => { expect(six(rego, 'indicative', 'future', 'passive')).toEqual(t('regar, regeris, regetur, regemur, regemini, regentur')); });
    it('rego indicative perfect active', () => { expect(six(rego, 'indicative', 'perfect', 'active')).toEqual(t('rexi, rexisti, rexit, reximus, rexistis, rexerunt')); });
    it('rego subjunctive present active', () => { expect(six(rego, 'subjunctive', 'present', 'active')).toEqual(t('regam, regas, regat, regamus, regatis, regant')); });
    it('capio indicative present active', () => { expect(six(capio, 'indicative', 'present', 'active')).toEqual(t('capio, capis, capit, capimus, capitis, capiunt')); });
    it('capio indicative present passive', () => { expect(six(capio, 'indicative', 'present', 'passive')).toEqual(t('capior, caperis, capitur, capimur, capimini, capiuntur')); });
    it('capio indicative imperfect active', () => { expect(six(capio, 'indicative', 'imperfect', 'active')).toEqual(t('capiebam, capiebas, capiebat, capiebamus, capiebatis, capiebant')); });
    it('capio indicative future passive', () => { expect(six(capio, 'indicative', 'future', 'passive')).toEqual(t('capiar, capieris, capietur, capiemur, capiemini, capientur')); });
    it('capio subjunctive imperfect active', () => { expect(six(capio, 'subjunctive', 'imperfect', 'active')).toEqual(t('caperem, caperes, caperet, caperemus, caperetis, caperent')); });
    it('audio indicative present active', () => { expect(six(audio, 'indicative', 'present', 'active')).toEqual(t('audio, audis, audit, audimus, auditis, audiunt')); });
    it('audio indicative present passive', () => { expect(six(audio, 'indicative', 'present', 'passive')).toEqual(t('audior, audiris, auditur, audimur, audimini, audiuntur')); });
    it('audio indicative future active', () => { expect(six(audio, 'indicative', 'future', 'active')).toEqual(t('audiam, audies, audiet, audiemus, audietis, audient')); });
    it('audio indicative imperfect passive', () => { expect(six(audio, 'indicative', 'imperfect', 'passive')).toEqual(t('audiebar, audiebaris, audiebatur, audiebamur, audiebamini, audiebantur')); });
    it('audio subjunctive present active', () => { expect(six(audio, 'subjunctive', 'present', 'active')).toEqual(t('audiam, audias, audiat, audiamus, audiatis, audiant')); });
    it('hortor indicative present active', () => { expect(six(hortor, 'indicative', 'present', 'active')).toEqual(t('hortor, hortaris, hortatur, hortamur, hortamini, hortantur')); });
    it('hortor indicative future active', () => { expect(six(hortor, 'indicative', 'future', 'active')).toEqual(t('hortabor, hortaberis, hortabitur, hortabimur, hortabimini, hortabuntur')); });
    it('hortor indicative perfect active', () => { expect(six(hortor, 'indicative', 'perfect', 'active')).toEqual(t('hortatus sum, hortatus es, hortatus est, hortati sumus, hortati estis, hortati sunt')); });
    it('hortor subjunctive present active', () => { expect(six(hortor, 'subjunctive', 'present', 'active')).toEqual(t('horter, horteris, hortetur, hortemur, hortemini, hortentur')); });
    it('hortor subjunctive imperfect active', () => { expect(six(hortor, 'subjunctive', 'imperfect', 'active')).toEqual(t('hortarer, hortareris, hortaretur, hortaremur, hortaremini, hortarentur')); });
});

describe('imperatives', () => {
    it('present active', () => {
        const got = [amo, moneo, rego, capio, audio].map(v => [one(v, imp('present', 'active', 2, 'singular')), one(v, imp('present', 'active', 2, 'plural'))]);
        expect(got).toEqual([['ama', 'amate'], ['mone', 'monete'], ['rege', 'regite'], ['cape', 'capite'], ['audi', 'audite']]);
    });
    it('present passive', () => {
        expect([one(amo, imp('present', 'passive', 2, 'singular')), one(amo, imp('present', 'passive', 2, 'plural'))]).toEqual(['amare', 'amamini']);
        expect([one(rego, imp('present', 'passive', 2, 'singular')), one(rego, imp('present', 'passive', 2, 'plural'))]).toEqual(['regere', 'regimini']);
    });
    it('deponent present', () => {
        expect([one(hortor, imp('present', 'active', 2, 'singular')), one(hortor, imp('present', 'active', 2, 'plural'))]).toEqual(['hortare', 'hortamini']);
    });
    it('future active', () => {
        expect(one(amo, imp('future', 'active', 2, 'singular'))).toBe('amato');
        expect(one(amo, imp('future', 'active', 3, 'singular'))).toBe('amato');
        expect(one(amo, imp('future', 'active', 2, 'plural'))).toBe('amatote');
        expect(one(amo, imp('future', 'active', 3, 'plural'))).toBe('amanto');
        expect(one(rego, imp('future', 'active', 3, 'plural'))).toBe('regunto');
        expect(one(audio, imp('future', 'active', 3, 'plural'))).toBe('audiunto');
    });
    it('drops the -e of duc, dic, fac', () => {
        expect(one(ducere, imp('present', 'active', 2, 'singular'))).toBe('duc');
        expect(one({ ...rego, inf: 'dicere', pres: 'dic' }, imp('present', 'active', 2, 'singular'))).toBe('dic');
        expect(one({ ...capio, inf: 'facere', pres: 'fac' }, imp('present', 'active', 2, 'singular'))).toBe('fac');
        expect(one({ ...ducere, inf: 'educere', pres: 'educ' }, imp('present', 'active', 2, 'singular'))).toBe('educ');
    });
    it('deponents have no future imperative', () => {
        expect(verbForms(hortor, imp('future', 'active', 2, 'singular'))).toEqual([]);
    });
});

describe('infinitives', () => {
    it('amo', () => {
        const cells: [('present' | 'perfect' | 'future'), Voice][] = [['present', 'active'], ['present', 'passive'], ['perfect', 'active'], ['perfect', 'passive'], ['future', 'active'], ['future', 'passive']];
        expect(cells.map(([tn, v]) => one(amo, inf(tn, v)))).toEqual(t('amare, amari, amavisse, amatus esse, amaturus esse, amatum iri'));
    });
    it('present passive across conjugations', () => {
        expect(one(rego, inf('present', 'passive'))).toBe('regi');
        expect(one(capio, inf('present', 'passive'))).toBe('capi');
        expect(one(audio, inf('present', 'passive'))).toBe('audiri');
        expect(one(moneo, inf('present', 'passive'))).toBe('moneri');
    });
    it('deponent', () => {
        expect(one(hortor, inf('present', 'active'))).toBe('hortari');
        expect(one(hortor, inf('perfect', 'active'))).toBe('hortatus esse');
        expect(one(hortor, inf('future', 'active'))).toBe('hortaturus esse');
    });
});

describe('participles and gerunds', () => {
    const four = (v: Verb) => [one(v, part('present', 'active')), one(v, part('perfect', 'passive')), one(v, part('future', 'active')), one(v, part('future', 'passive'))];
    it('participles', () => {
        expect(four(amo)).toEqual(t('amans, amatus, amaturus, amandus'));
        expect(four(moneo)).toEqual(t('monens, monitus, moniturus, monendus'));
        expect(four(rego)).toEqual(t('regens, rectus, recturus, regendus'));
        expect(four(capio)).toEqual(t('capiens, captus, capturus, capiendus'));
        expect(four(audio)).toEqual(t('audiens, auditus, auditurus, audiendus'));
    });
    it('deponent participles', () => {
        expect(one(hortor, part('present', 'active'))).toBe('hortans');
        expect(one(hortor, part('perfect', 'active'))).toBe('hortatus');
        expect(one(hortor, part('future', 'active'))).toBe('hortaturus');
        expect(one(hortor, part('future', 'passive'))).toBe('hortandus');
        expect(verbForms(hortor, part('perfect', 'passive'))).toEqual([]);
    });
    it('gerunds', () => {
        expect((['genitive', 'dative', 'accusative', 'ablative'] as const).map(c => one(amo, ger(c)))).toEqual(t('amandi, amando, amandum, amando'));
        expect(one(capio, ger('genitive'))).toBe('capiendi');
        expect(one(hortor, ger('genitive'))).toBe('hortandi');
    });
    it('uses the fixed future participle stem for mori', () => {
        expect(one(mori, part('future', 'active'))).toBe('moriturus');
    });
});

describe('cell sets', () => {
    it('has 143 cells in total', () => {
        expect(ALL_VERB_CELLS).toHaveLength(143);
    });
    it('amo claims all but the deponent-only perfect active participle', () => {
        expect(verbCells(amo)).toHaveLength(142);
        expect(hasVerbCell(amo, part('perfect', 'active'))).toBe(false);
    });
    it('every claimed cell yields a form, every other cell none', () => {
        for (const v of [amo, moneo, rego, capio, audio, hortor, cado, mori]) {
            for (const c of ALL_VERB_CELLS) {
                expect(verbForms(v, c).length > 0).toBe(hasVerbCell(v, c));
            }
        }
    });
    it('deponents claim no passive finite cells', () => {
        const cell: VerbCell = { mood: 'indicative', tense: 'present', voice: 'passive', person: 1, number: 'singular' };
        expect(hasVerbCell(hortor, cell)).toBe(false);
        expect(verbCells(hortor).some(c => 'voice' in c && c.voice === 'passive' && c.mood !== 'participle')).toBe(false);
    });
    it('noPassive verbs', () => {
        const pres: VerbCell = { mood: 'indicative', tense: 'present', voice: 'passive', person: 3, number: 'singular' };
        expect(hasVerbCell(cado, pres)).toBe(false);
        expect(verbForms(cado, pres)).toEqual([]);
        expect(hasVerbCell(cado, part('perfect', 'passive'))).toBe(false);
        expect(hasVerbCell(cado, part('future', 'passive'))).toBe(false);
        expect(one(cado, part('future', 'active'))).toBe('casurus');
    });
    it('irregular verbs have no forms yet', () => {
        const esse: Verb = { inf: 'esse', irregular: true, noPassive: true, perf: 'fu', trans: 'to be' };
        expect(verbCells(esse)).toEqual([]);
    });
});
