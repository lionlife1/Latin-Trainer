import { describe, it, expect } from 'vitest';
import type { Verb, VerbCell, VerbTense, Voice, Person } from './types';
import { VERBS } from '../conjugator';
import { ALL_VERB_CELLS, hasVerbCell, principalParts, verbCells, verbForms } from './verbs';

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
        for (const v of [amo, moneo, rego, capio, audio, hortor, cado, mori, ...IRR, absum, prosum, confero, redeo]) {
            for (const c of ALL_VERB_CELLS) {
                const forms = verbForms(v, c);
                expect(forms.length > 0).toBe(hasVerbCell(v, c));
                for (const form of forms) expect(form).not.toMatch(/undefined|NaN/);
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
    it('an unknown irregular verb claims nothing', () => {
        const odd: Verb = { inf: 'odd', irregular: true, noPassive: true, perf: 'o', trans: 'odd' };
        expect(verbCells(odd)).toEqual([]);
    });
    it('a deponent without impfBase has no imperfect subjunctive', () => {
        const bad: Verb = { ...hortor, impfBase: undefined };
        expect(verbForms(bad, { mood: 'subjunctive', tense: 'imperfect', voice: 'active', person: 1, number: 'singular' })).toEqual([]);
    });
});

const V = (inf: string) => VERBS.find(v => v.inf === inf)!;
const esse = V('esse'), posse = V('posse'), ferre = V('ferre'), velle = V('velle'), nolle = V('nolle'), malle = V('malle'), ire = V('ire'), fieri = V('fieri');
const IRR = [esse, posse, ferre, velle, nolle, malle, ire, fieri];
const absum: Verb = { inf: 'abesse', irregular: true, noPassive: true, base: 'esse', prefix: 'ab', perf: 'afu', pp1: 'absum', trans: 'to be away' };
const confero: Verb = { inf: 'conferre', irregular: true, base: 'ferre', prefix: 'con', perf: 'contul', ppp: 'collat', pp1: 'confero', trans: 'to bring together' };
const redeo: Verb = { inf: 'redire', irregular: true, noPassive: true, base: 'ire', prefix: 'red', perf: 'rediv', pp1: 'redeo', trans: 'to return' };
const prosum: Verb = { inf: 'prodesse', irregular: true, noPassive: true, base: 'esse', prefix: 'pro', perf: 'profu', pp1: 'prosum', trans: 'to be useful' };
const pp = (v: Verb, tense: VerbTense, voice: Voice, p: Person, n: 'singular' | 'plural') =>
    verbForms(v, { mood: 'indicative', tense, voice, person: p, number: n });

describe('irregular finite forms', () => {
    const rows: [Verb, 'indicative' | 'subjunctive', VerbTense, Voice, string][] = [
        [esse, 'indicative', 'present', 'active', 'sum, es, est, sumus, estis, sunt'],
        [esse, 'indicative', 'imperfect', 'active', 'eram, eras, erat, eramus, eratis, erant'],
        [esse, 'indicative', 'future', 'active', 'ero, eris, erit, erimus, eritis, erunt'],
        [esse, 'indicative', 'perfect', 'active', 'fui, fuisti, fuit, fuimus, fuistis, fuerunt'],
        [esse, 'subjunctive', 'imperfect', 'active', 'essem, esses, esset, essemus, essetis, essent'],
        [posse, 'indicative', 'present', 'active', 'possum, potes, potest, possumus, potestis, possunt'],
        [posse, 'indicative', 'future', 'active', 'potero, poteris, poterit, poterimus, poteritis, poterunt'],
        [ire, 'indicative', 'present', 'active', 'eo, is, it, imus, itis, eunt'],
        [ire, 'indicative', 'future', 'active', 'ibo, ibis, ibit, ibimus, ibitis, ibunt'],
        [ire, 'indicative', 'perfect', 'active', 'ivi, ivisti, ivit, ivimus, ivistis, iverunt'],
        [ire, 'subjunctive', 'present', 'active', 'eam, eas, eat, eamus, eatis, eant'],
        [ferre, 'indicative', 'present', 'active', 'fero, fers, fert, ferimus, fertis, ferunt'],
        [ferre, 'indicative', 'present', 'passive', 'feror, ferris, fertur, ferimur, ferimini, feruntur'],
        [ferre, 'indicative', 'future', 'active', 'feram, feres, feret, feremus, feretis, ferent'],
        [ferre, 'indicative', 'perfect', 'passive', 'latus sum, latus es, latus est, lati sumus, lati estis, lati sunt'],
        [ferre, 'subjunctive', 'imperfect', 'passive', 'ferrer, ferreris, ferretur, ferremur, ferremini, ferrentur'],
        [velle, 'indicative', 'present', 'active', 'volo, vis, vult, volumus, vultis, volunt'],
        [velle, 'indicative', 'future', 'active', 'volam, voles, volet, volemus, voletis, volent'],
        [nolle, 'indicative', 'present', 'active', 'nolo, non vis, non vult, nolumus, non vultis, nolunt'],
        [malle, 'indicative', 'present', 'active', 'malo, mavis, mavult, malumus, mavultis, malunt'],
        [fieri, 'indicative', 'present', 'active', 'fio, fis, fit, fimus, fitis, fiunt'],
        [fieri, 'indicative', 'imperfect', 'active', 'fiebam, fiebas, fiebat, fiebamus, fiebatis, fiebant'],
        [fieri, 'indicative', 'perfect', 'active', 'factus sum, factus es, factus est, facti sumus, facti estis, facti sunt'],
        [fieri, 'subjunctive', 'perfect', 'active', 'factus sim, factus sis, factus sit, facti simus, facti sitis, facti sint'],
        [fieri, 'subjunctive', 'pluperfect', 'active', 'factus essem, factus esses, factus esset, facti essemus, facti essetis, facti essent'],
    ];
    for (const [v, mood, tense, voice, want] of rows)
        it(`${v.inf} ${mood} ${tense} ${voice}`, () => { expect(six(v, mood, tense, voice)).toEqual(t(want)); });

    it('compounds', () => {
        expect(six(absum, 'indicative', 'present', 'active')).toEqual(t('absum, abes, abest, absumus, abestis, absunt'));
        expect(six(prosum, 'indicative', 'present', 'active')).toEqual(t('prosum, prodes, prodest, prosumus, prodestis, prosunt'));
        expect(pp(prosum, 'imperfect', 'active', 1, 'singular')).toEqual(['proderam']);
        expect(pp(confero, 'present', 'passive', 3, 'singular')).toEqual(['confertur']);
        expect(pp(redeo, 'pluperfect', 'active', 1, 'singular')).toEqual(['rediveram', 'redieram']);
        expect(pp(redeo, 'perfect', 'active', 2, 'singular')).toEqual(['redivisti', 'rediisti', 'redisti']);
        expect(verbCells(redeo).some(c => 'voice' in c && c.voice === 'passive')).toBe(false);
        expect(verbForms(redeo, inf('present', 'passive'))).toEqual([]);
        expect(verbForms(redeo, inf('future', 'passive'))).toEqual([]);
    });
    it('ire perfect-system variants', () => {
        expect(pp(ire, 'perfect', 'active', 2, 'singular')).toEqual(['ivisti', 'iisti', 'isti']);
        expect(pp(ire, 'perfect', 'active', 3, 'singular')).toEqual(['ivit', 'iit']);
        expect(pp(ire, 'perfect', 'active', 3, 'plural')).toEqual(['iverunt', 'ierunt']);
        expect(verbForms(ire, { mood: 'subjunctive', tense: 'pluperfect', voice: 'active', person: 1, number: 'singular' })).toEqual(['ivissem', 'iissem', 'issem']);
    });
});

describe('irregular imperatives, infinitives, participles', () => {
    it('imperatives', () => {
        expect([one(esse, imp('present', 'active', 2, 'singular')), one(esse, imp('present', 'active', 2, 'plural'))]).toEqual(['es', 'este']);
        expect([2, 3].map(p => one(esse, imp('future', 'active', p as 2 | 3, 'singular')))).toEqual(['esto', 'esto']);
        expect([one(esse, imp('future', 'active', 2, 'plural')), one(esse, imp('future', 'active', 3, 'plural'))]).toEqual(['estote', 'sunto']);
        expect([one(ire, imp('present', 'active', 2, 'singular')), one(ire, imp('present', 'active', 2, 'plural')), one(ire, imp('future', 'active', 3, 'plural'))]).toEqual(['i', 'ite', 'eunto']);
        expect([one(ferre, imp('present', 'active', 2, 'singular')), one(ferre, imp('present', 'active', 2, 'plural')), one(ferre, imp('present', 'passive', 2, 'singular')), one(ferre, imp('present', 'passive', 2, 'plural'))]).toEqual(['fer', 'ferte', 'ferre', 'ferimini']);
        expect([one(nolle, imp('present', 'active', 2, 'singular')), one(nolle, imp('present', 'active', 2, 'plural'))]).toEqual(['noli', 'nolite']);
        expect([one(nolle, imp('future', 'active', 2, 'singular')), one(nolle, imp('future', 'active', 3, 'singular')), one(nolle, imp('future', 'active', 2, 'plural')), one(nolle, imp('future', 'active', 3, 'plural'))]).toEqual(['nolito', 'nolito', 'nolitote', 'nolunto']);
        expect([one(fieri, imp('present', 'active', 2, 'singular')), one(fieri, imp('present', 'active', 2, 'plural'))]).toEqual(['fi', 'fite']);
        for (const v of [posse, velle, malle]) expect(verbCells(v).some(c => c.mood === 'imperative')).toBe(false);
    });
    it('infinitives', () => {
        expect(verbForms(esse, inf('future', 'active'))).toEqual(['futurus esse', 'fore']);
        const cells: [('present' | 'perfect' | 'future'), Voice][] = [['present', 'active'], ['present', 'passive'], ['perfect', 'active'], ['perfect', 'passive'], ['future', 'active'], ['future', 'passive']];
        expect(cells.map(([tn, v]) => one(ferre, inf(tn, v)))).toEqual(t('ferre, ferri, tulisse, latus esse, laturus esse, latum iri'));
        expect(verbForms(ire, inf('perfect', 'active'))).toEqual(['ivisse', 'iisse', 'isse']);
        expect([one(fieri, inf('present', 'active')), one(fieri, inf('perfect', 'active'))]).toEqual(['fieri', 'factus esse']);
        expect([one(posse, inf('present', 'active')), one(posse, inf('perfect', 'active'))]).toEqual(['posse', 'potuisse']);
    });
    it('participles and gerunds', () => {
        expect([one(ire, part('present', 'active')), one(ire, part('future', 'active'))]).toEqual(['iens', 'iturus']);
        expect([part('present', 'active'), part('perfect', 'passive'), part('future', 'active'), part('future', 'passive')].map(c => one(ferre, c))).toEqual(t('ferens, latus, laturus, ferendus'));
        expect(one(velle, part('present', 'active'))).toBe('volens');
        expect(one(esse, part('future', 'active'))).toBe('futurus');
        expect(one(absum, part('future', 'active'))).toBe('afuturus');
        expect(one(ire, ger('genitive'))).toBe('eundi');
        expect(one(ferre, ger('genitive'))).toBe('ferendi');
        const cs = verbCells(esse);
        expect(cs.some(c => c.mood === 'gerund')).toBe(false);
        expect(cs.some(c => c.mood === 'participle' && c.tense === 'present')).toBe(false);
        for (const v of [velle, nolle, malle, fieri, posse]) expect(verbCells(v).some(c => c.mood === 'gerund')).toBe(false);
    });
});

describe('transitive ire compounds have a passive', () => {
    const adeo: Verb = { inf: 'adire', irregular: true, base: 'ire', prefix: 'ad', perf: 'adiv', ppp: 'adit', pp1: 'adeo', trans: 'to go to' };
    const cell = (mood: 'indicative' | 'subjunctive', tense: VerbTense, person: Person, number: 'singular' | 'plural'): VerbCell =>
        ({ mood, tense, voice: 'passive', person, number } as VerbCell);

    it('conjugates adeor in the passive', () => {
        expect(adeo.noPassive).toBeUndefined();
        expect(one(adeo, cell('indicative', 'present', 3, 'singular'))).toBe('aditur');
        expect(one(adeo, cell('indicative', 'future', 1, 'plural'))).toBe('adibimur');
        expect(one(adeo, cell('indicative', 'perfect', 1, 'singular'))).toBe('aditus sum');
        expect(one(adeo, cell('indicative', 'pluperfect', 3, 'plural'))).toBe('aditi erant');
        expect(one(adeo, cell('subjunctive', 'imperfect', 2, 'singular'))).toBe('adireris');
        expect(one(adeo, part('perfect', 'passive'))).toBe('aditus');
        expect(one(adeo, part('future', 'passive'))).toBe('adeundus');
        expect(one(adeo, inf('present', 'passive'))).toBe('adiri');
        expect(one(adeo, inf('future', 'passive'))).toBe('aditum iri');
    });
    it('keeps intransitive compounds active only', () => {
        expect(verbCells(adeo).some(c => 'voice' in c && c.voice === 'passive')).toBe(true);
        expect(verbCells(redeo).some(c => 'voice' in c && c.voice === 'passive')).toBe(false);
        expect(verbForms(redeo, inf('present', 'passive'))).toEqual([]);
        expect(verbForms(redeo, inf('future', 'passive'))).toEqual([]);
    });
});

describe('semi-deponents, principal parts and the fugere family', () => {
    const audeo: Verb = { inf: 'audere', conj: 2, pres: 'aud', perf: 'aus', semiDeponent: true, noPassive: true, pp1: 'audeo', trans: 'to dare' };
    const vb = (inf: string) => VERBS.find(v => v.inf === inf)!;

    it('conjugates semi-deponents: present system active, perfect system with sum', () => {
        expect(six(audeo, 'indicative', 'present', 'active')).toEqual(t('audeo, audes, audet, audemus, audetis, audent'));
        expect(six(audeo, 'indicative', 'perfect', 'active')).toEqual(t('ausus sum, ausus es, ausus est, ausi sumus, ausi estis, ausi sunt'));
        expect(one(audeo, { mood: 'subjunctive', tense: 'perfect', voice: 'active', person: 1, number: 'singular' })).toBe('ausus sim');
        expect(one(audeo, { mood: 'subjunctive', tense: 'pluperfect', voice: 'active', person: 3, number: 'plural' })).toBe('ausi essent');
        expect(one(audeo, { mood: 'subjunctive', tense: 'imperfect', voice: 'active', person: 1, number: 'singular' })).toBe('auderem');
    });
    it('gives semi-deponents their infinitives and participles', () => {
        expect([inf('present', 'active'), inf('perfect', 'active'), inf('future', 'active')].map(c => one(audeo, c))).toEqual(['audere', 'ausus esse', 'ausurus esse']);
        expect([part('present', 'active'), part('perfect', 'active'), part('future', 'active')].map(c => one(audeo, c))).toEqual(['audens', 'ausus', 'ausurus']);
        expect(one(audeo, ger('genitive'))).toBe('audendi');
        expect(one(audeo, imp('present', 'active', 2, 'singular'))).toBe('aude');
        expect(one(audeo, imp('future', 'active', 2, 'singular'))).toBe('audeto');
    });
    it('gives semi-deponents no passive and no gerundive', () => {
        const cells = verbCells(audeo);
        expect(cells.some(c => 'voice' in c && c.voice === 'passive')).toBe(false);
        expect(cells.some(c => c.mood === 'participle' && c.tense === 'future' && c.voice === 'passive')).toBe(false);
    });

    it('writes principal parts', () => {
        expect(principalParts(audeo)).toBe('audeo, audere, ausus sum');
        expect(principalParts(vb('amare'))).toBe('amo, amare, amavi, amatus');
        expect(principalParts(vb('esse'))).toBe('sum, esse, fui, futurus');
        expect(principalParts(vb('hortari'))).toBe('hortor, hortari, hortatus sum');
        const cadoPP: Verb = { inf: 'cadere', conj: 3, pres: 'cad', perf: 'cecid', noPassive: true, pp1: 'cado', trans: 'to fall' };
        expect(principalParts(cadoPP)).toBe('cado, cadere, cecidi');
        expect(principalParts({ ...cadoPP, ppp: 'cas' })).toBe('cado, cadere, cecidi');
    });

    it('gives effugere and fugere no passive', () => {
        const eff = vb('effugere'), fug = vb('fugere');
        for (const v of [eff, fug]) {
            const cells = verbCells(v);
            expect(cells.some(c => 'voice' in c && c.voice === 'passive'), v.inf).toBe(false);
            expect(cells.some(c => c.mood === 'participle' && c.tense === 'perfect' && c.voice === 'passive'), v.inf).toBe(false);
        }
        expect(one(fug, part('future', 'active'))).toBe('fugiturus');
    });

    it('derives the future infinitive of esse compounds from the perfect stem', () => {
        expect(verbForms(absum, inf('future', 'active'))).toEqual(['afuturus esse', 'afore']);
        expect(verbForms(prosum, inf('future', 'active'))).toEqual(['profuturus esse', 'profore']);
    });
});
