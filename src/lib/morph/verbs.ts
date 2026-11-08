// Regular Latin verb forms, built from a verb's stems. Irregular verbs are handled separately.
import type { Verb, VerbCell, VerbTense } from './types';

type Conj = 1 | 2 | 3 | 3.5 | 4;

const ACT = ['m', 's', 't', 'mus', 'tis', 'nt'];
const PASS = ['r', 'ris', 'tur', 'mur', 'mini', 'ntur'];

/** Present indicative endings added to the present stem (active, passive). */
const PRES_ACT: Record<Conj, string[]> = {
    1: ['o', 'as', 'at', 'amus', 'atis', 'ant'],
    2: ['eo', 'es', 'et', 'emus', 'etis', 'ent'],
    3: ['o', 'is', 'it', 'imus', 'itis', 'unt'],
    3.5: ['io', 'is', 'it', 'imus', 'itis', 'iunt'],
    4: ['io', 'is', 'it', 'imus', 'itis', 'iunt'],
};
const PRES_PASS: Record<Conj, string[]> = {
    1: ['or', 'aris', 'atur', 'amur', 'amini', 'antur'],
    2: ['eor', 'eris', 'etur', 'emur', 'emini', 'entur'],
    3: ['or', 'eris', 'itur', 'imur', 'imini', 'untur'],
    3.5: ['ior', 'eris', 'itur', 'imur', 'imini', 'iuntur'],
    4: ['ior', 'iris', 'itur', 'imur', 'imini', 'iuntur'],
};
/** Imperfect indicative: stem + this + (m s t mus tis nt | r ris tur ...). */
const IMPF: Record<Conj, string> = { 1: 'aba', 2: 'eba', 3: 'eba', 3.5: 'ieba', 4: 'ieba' };
/** Future: 1st and 2nd take -b-; the rest take -a- in the first person and -e- after. */
const FUT_ACT: Record<Conj, string[]> = {
    1: ['abo', 'abis', 'abit', 'abimus', 'abitis', 'abunt'],
    2: ['ebo', 'ebis', 'ebit', 'ebimus', 'ebitis', 'ebunt'],
    3: ['am', 'es', 'et', 'emus', 'etis', 'ent'],
    3.5: ['iam', 'ies', 'iet', 'iemus', 'ietis', 'ient'],
    4: ['iam', 'ies', 'iet', 'iemus', 'ietis', 'ient'],
};
const FUT_PASS: Record<Conj, string[]> = {
    1: ['abor', 'aberis', 'abitur', 'abimur', 'abimini', 'abuntur'],
    2: ['ebor', 'eberis', 'ebitur', 'ebimur', 'ebimini', 'ebuntur'],
    3: ['ar', 'eris', 'etur', 'emur', 'emini', 'entur'],
    3.5: ['iar', 'ieris', 'ietur', 'iemur', 'iemini', 'ientur'],
    4: ['iar', 'ieris', 'ietur', 'iemur', 'iemini', 'ientur'],
};
const SUBJ_PRES: Record<Conj, string> = { 1: 'e', 2: 'ea', 3: 'a', 3.5: 'ia', 4: 'ia' };
/** Present passive infinitive ending (the present active infinitive is `verb.inf`). */
const INF_PASS: Record<Conj, string> = { 1: 'ari', 2: 'eri', 3: 'i', 3.5: 'i', 4: 'iri' };
/** Singular present imperative ending, and the plural one. */
const IMP_SG: Record<Conj, string> = { 1: 'a', 2: 'e', 3: 'e', 3.5: 'e', 4: 'i' };
const IMP_PL: Record<Conj, string> = { 1: 'ate', 2: 'ete', 3: 'ite', 3.5: 'ite', 4: 'ite' };
const IMP_PASS_SG: Record<Conj, string> = { 1: 'are', 2: 'ere', 3: 'ere', 3.5: 'ere', 4: 'ire' };
const IMP_PASS_PL: Record<Conj, string> = { 1: 'amini', 2: 'emini', 3: 'imini', 3.5: 'imini', 4: 'imini' };
/** Future imperative: second/third person singular stem, and the third person plural. */
const IMP_FUT_SG: Record<Conj, string> = { 1: 'ato', 2: 'eto', 3: 'ito', 3.5: 'ito', 4: 'ito' };
const IMP_FUT_3PL: Record<Conj, string> = { 1: 'anto', 2: 'ento', 3: 'unto', 3.5: 'iunto', 4: 'iunto' };
const PRES_PART: Record<Conj, string> = { 1: 'ans', 2: 'ens', 3: 'ens', 3.5: 'iens', 4: 'iens' };
/** Gerund and gerundive stem: stem + this + (ndi, ndo, ndum, ndus). */
const GERUND: Record<Conj, string> = { 1: 'a', 2: 'e', 3: 'e', 3.5: 'ie', 4: 'ie' };

const ESSE_PRES = ['sum', 'es', 'est', 'sumus', 'estis', 'sunt'];
const ESSE_IMPF = ['eram', 'eras', 'erat', 'eramus', 'eratis', 'erant'];
const ESSE_FUT = ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erunt'];
const ESSE_SUBJ_PRES = ['sim', 'sis', 'sit', 'simus', 'sitis', 'sint'];
const ESSE_SUBJ_IMPF = ['essem', 'esses', 'esset', 'essemus', 'essetis', 'essent'];
const PERF_ACT = ['i', 'isti', 'it', 'imus', 'istis', 'erunt'];
const PLUP_ACT = ['eram', 'eras', 'erat', 'eramus', 'eratis', 'erant'];
const FUTPERF_ACT = ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erint'];
const SUBJ_PERF_ACT = ['erim', 'eris', 'erit', 'erimus', 'eritis', 'erint'];
const SUBJ_PLUP_ACT = ['issem', 'isses', 'isset', 'issemus', 'issetis', 'issent'];

/** Future active participle stems that cannot be derived from the principal parts. */
const FUT_PART_STEM: Record<string, string> = { mori: 'moritur', oriri: 'oritur' };

const CASES = ['genitive', 'dative', 'accusative', 'ablative'] as const;
const ENDS_G = { genitive: 'ndi', dative: 'ndo', accusative: 'ndum', ablative: 'ndo' };

function buildAllCells(): VerbCell[] {
    const cells: VerbCell[] = [];
    const persons = [1, 2, 3] as const;
    const numbers = ['singular', 'plural'] as const;
    const voices = ['active', 'passive'] as const;
    const indTenses: VerbTense[] = ['present', 'imperfect', 'future', 'perfect', 'pluperfect', 'futurePerfect'];
    for (const tense of indTenses) for (const voice of voices) for (const number of numbers) for (const person of persons)
        cells.push({ mood: 'indicative', tense, voice, person, number });
    for (const tense of ['present', 'imperfect', 'perfect', 'pluperfect'] as const)
        for (const voice of voices) for (const number of numbers) for (const person of persons)
            cells.push({ mood: 'subjunctive', tense, voice, person, number });
    for (const number of numbers) cells.push({ mood: 'imperative', tense: 'present', voice: 'active', person: 2, number });
    for (const number of numbers) cells.push({ mood: 'imperative', tense: 'present', voice: 'passive', person: 2, number });
    for (const [person, number] of [[2, 'singular'], [3, 'singular'], [2, 'plural'], [3, 'plural']] as const)
        cells.push({ mood: 'imperative', tense: 'future', voice: 'active', person, number });
    for (const tense of ['present', 'perfect', 'future'] as const) for (const voice of voices)
        cells.push({ mood: 'infinitive', tense, voice });
    cells.push({ mood: 'participle', tense: 'present', voice: 'active' });
    cells.push({ mood: 'participle', tense: 'perfect', voice: 'passive' });
    cells.push({ mood: 'participle', tense: 'perfect', voice: 'active' });
    cells.push({ mood: 'participle', tense: 'future', voice: 'active' });
    cells.push({ mood: 'participle', tense: 'future', voice: 'passive' });
    for (const c of CASES) cells.push({ mood: 'gerund', case: c });
    return cells;
}

export const ALL_VERB_CELLS: readonly VerbCell[] = buildAllCells();

function conjOf(verb: Verb): Conj | undefined {
    if (verb.irregular || verb.pres === undefined) return undefined;
    const c = verb.conj;
    return c === 1 || c === 2 || c === 3 || c === 3.5 || c === 4 ? c : undefined;
}

/** Stem of the future active participle (`amatur`), when the verb has one. */
function futurePartStem(verb: Verb): string | undefined {
    if (FUT_PART_STEM[verb.inf]) return FUT_PART_STEM[verb.inf];
    if (verb.deponent) return verb.perf + 'ur';
    return verb.ppp ? verb.ppp + 'ur' : undefined;
}

export function hasVerbCell(verb: Verb, cell: VerbCell): boolean {
    if (conjOf(verb) === undefined) return false;
    const passive = !verb.deponent && !verb.noPassive;
    switch (cell.mood) {
        case 'indicative':
        case 'subjunctive':
            return cell.voice === 'active' || passive;
        case 'imperative':
            if (cell.tense === 'future') return cell.voice === 'active' && !verb.deponent;
            return cell.voice === 'active' || passive;
        case 'infinitive':
            if (cell.voice === 'active') return cell.tense !== 'future' || futurePartStem(verb) !== undefined;
            return passive && (cell.tense === 'present' || !!verb.ppp);
        case 'participle':
            if (cell.tense === 'present') return cell.voice === 'active';
            if (cell.tense === 'perfect') return cell.voice === 'active' ? !!verb.deponent : passive && !!verb.ppp;
            return cell.voice === 'active' ? futurePartStem(verb) !== undefined : !!verb.deponent || !verb.noPassive;
        case 'gerund':
            return true;
    }
}

export function verbCells(verb: Verb): VerbCell[] {
    return ALL_VERB_CELLS.filter(c => hasVerbCell(verb, c));
}

export function verbForms(verb: Verb, cell: VerbCell): string[] {
    if (!hasVerbCell(verb, cell)) return [];
    return [build(verb, conjOf(verb)!, cell)];
}

function build(verb: Verb, conj: Conj, cell: VerbCell): string {
    const stem = verb.pres!;
    switch (cell.mood) {
        case 'indicative':
        case 'subjunctive':
            return finite(verb, conj, cell);
        case 'imperative': {
            const plural = cell.number === 'plural';
            const passiveEndings = cell.voice === 'passive' || !!verb.deponent;
            if (cell.tense === 'future') {
                if (plural) return cell.person === 3 ? stem + IMP_FUT_3PL[conj] : stem + IMP_FUT_SG[conj] + 'te';
                return stem + IMP_FUT_SG[conj];
            }
            if (passiveEndings) return stem + (plural ? IMP_PASS_PL[conj] : IMP_PASS_SG[conj]);
            if (plural) return stem + IMP_PL[conj];
            const dropsE = (conj === 3 && /d[iu]c$/.test(stem)) || (conj === 3.5 && stem === 'fac')
                || verb.inf === 'dicere' || verb.inf === 'ducere' || verb.inf === 'facere';
            return dropsE ? stem : stem + IMP_SG[conj];
        }
        case 'infinitive': {
            const part = verb.deponent ? verb.perf : verb.ppp!;
            if (cell.tense === 'present') return cell.voice === 'active' ? verb.inf : stem + INF_PASS[conj];
            if (cell.tense === 'perfect') return cell.voice === 'active' && !verb.deponent ? verb.perf + 'isse' : part + 'us esse';
            return cell.voice === 'active' ? futurePartStem(verb)! + 'us esse' : verb.ppp + 'um iri';
        }
        case 'participle':
            if (cell.tense === 'present') return stem + PRES_PART[conj];
            if (cell.tense === 'perfect') return (verb.deponent ? verb.perf : verb.ppp) + 'us';
            if (cell.voice === 'active') return futurePartStem(verb)! + 'us';
            return stem + GERUND[conj] + 'ndus';
        case 'gerund':
            return stem + GERUND[conj] + ENDS_G[cell.case];
    }
}

function finite(verb: Verb, conj: Conj, cell: Extract<VerbCell, { mood: 'indicative' | 'subjunctive' }>): string {
    const i = (cell.person - 1) + (cell.number === 'plural' ? 3 : 0);
    const stem = verb.pres!;
    // Deponents are active in meaning and passive in form.
    const passive = cell.voice === 'passive' || !!verb.deponent;
    const ends = passive ? PASS : ACT;
    const partStem = verb.deponent ? verb.perf : (verb.ppp ?? verb.perf);
    const participle = partStem + (cell.number === 'plural' ? 'i' : 'us');

    if (cell.mood === 'subjunctive') {
        switch (cell.tense) {
            case 'present': return stem + SUBJ_PRES[conj] + ends[i];
            case 'imperfect': return (verb.deponent ? verb.impfBase ?? verb.inf : verb.inf) + ends[i];
            case 'perfect': return passive ? `${participle} ${ESSE_SUBJ_PRES[i]}` : verb.perf + SUBJ_PERF_ACT[i];
            case 'pluperfect': return passive ? `${participle} ${ESSE_SUBJ_IMPF[i]}` : verb.perf + SUBJ_PLUP_ACT[i];
        }
    }
    switch (cell.tense) {
        case 'present': return stem + (passive ? PRES_PASS : PRES_ACT)[conj][i];
        case 'imperfect': return stem + IMPF[conj] + ends[i];
        case 'future': return stem + (passive ? FUT_PASS : FUT_ACT)[conj][i];
        case 'perfect': return passive ? `${participle} ${ESSE_PRES[i]}` : verb.perf + PERF_ACT[i];
        case 'pluperfect': return passive ? `${participle} ${ESSE_IMPF[i]}` : verb.perf + PLUP_ACT[i];
        case 'futurePerfect': return passive ? `${participle} ${ESSE_FUT[i]}` : verb.perf + FUTPERF_ACT[i];
    }
}
