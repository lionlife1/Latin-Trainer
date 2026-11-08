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
    if (verb.deponent || verb.semiDeponent) return verb.perf + 'ur';
    return verb.ppp ? verb.ppp + 'ur' : undefined;
}

export function hasVerbCell(verb: Verb, cell: VerbCell): boolean {
    if (verb.irregular) return irregularForms(verb, cell).length > 0;
    if (conjOf(verb) === undefined) return false;
    const passive = !verb.deponent && !verb.noPassive;
    switch (cell.mood) {
        case 'indicative':
            return cell.voice === 'active' || passive;
        case 'subjunctive':
            // A deponent's imperfect subjunctive is built on `impfBase`; without it there is no form.
            if (cell.tense === 'imperfect' && verb.deponent && !verb.impfBase) return false;
            return cell.voice === 'active' || passive;
        case 'imperative':
            if (cell.tense === 'future') return cell.voice === 'active' && !verb.deponent;
            return cell.voice === 'active' || passive;
        case 'infinitive':
            if (cell.voice === 'active') return cell.tense !== 'future' || futurePartStem(verb) !== undefined;
            return passive && (cell.tense === 'present' || !!verb.ppp);
        case 'participle':
            if (cell.tense === 'present') return cell.voice === 'active';
            if (cell.tense === 'perfect') return cell.voice === 'active' ? !!verb.deponent || !!verb.semiDeponent : passive && !!verb.ppp;
            return cell.voice === 'active' ? futurePartStem(verb) !== undefined : !!verb.deponent || !verb.noPassive;
        case 'gerund':
            return true;
    }
}

export function verbCells(verb: Verb): VerbCell[] {
    return ALL_VERB_CELLS.filter(c => hasVerbCell(verb, c));
}

export function verbForms(verb: Verb, cell: VerbCell): string[] {
    if (verb.irregular) return irregularForms(verb, cell);
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
            const perfDep = verb.deponent || verb.semiDeponent;
            const part = perfDep ? verb.perf : verb.ppp!;
            if (cell.tense === 'present') return cell.voice === 'active' ? verb.inf : stem + INF_PASS[conj];
            if (cell.tense === 'perfect') return cell.voice === 'active' && !perfDep ? verb.perf + 'isse' : part + 'us esse';
            return cell.voice === 'active' ? futurePartStem(verb)! + 'us esse' : verb.ppp + 'um iri';
        }
        case 'participle':
            if (cell.tense === 'present') return stem + PRES_PART[conj];
            if (cell.tense === 'perfect') return (verb.deponent || verb.semiDeponent ? verb.perf : verb.ppp) + 'us';
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
    // Semi-deponents are active in the present system and passive in form (participle plus sum) in the perfect system.
    const perfPassive = passive || !!verb.semiDeponent;
    const ends = passive ? PASS : ACT;
    const partStem = verb.deponent || verb.semiDeponent ? verb.perf : (verb.ppp ?? verb.perf);
    const participle = partStem + (cell.number === 'plural' ? 'i' : 'us');

    if (cell.mood === 'subjunctive') {
        switch (cell.tense) {
            case 'present': return stem + SUBJ_PRES[conj] + ends[i];
            case 'imperfect': return (verb.deponent ? verb.impfBase! : verb.inf) + ends[i];
            case 'perfect': return perfPassive ? `${participle} ${ESSE_SUBJ_PRES[i]}` : verb.perf + SUBJ_PERF_ACT[i];
            case 'pluperfect': return perfPassive ? `${participle} ${ESSE_SUBJ_IMPF[i]}` : verb.perf + SUBJ_PLUP_ACT[i];
        }
    }
    switch (cell.tense) {
        case 'present': return stem + (passive ? PRES_PASS : PRES_ACT)[conj][i];
        case 'imperfect': return stem + IMPF[conj] + ends[i];
        case 'future': return stem + (passive ? FUT_PASS : FUT_ACT)[conj][i];
        case 'perfect': return perfPassive ? `${participle} ${ESSE_PRES[i]}` : verb.perf + PERF_ACT[i];
        case 'pluperfect': return perfPassive ? `${participle} ${ESSE_IMPF[i]}` : verb.perf + PLUP_ACT[i];
        case 'futurePerfect': return perfPassive ? `${participle} ${ESSE_FUT[i]}` : verb.perf + FUTPERF_ACT[i];
    }
}


// ---------------------------------------------------------------------------------------------
// Irregular verbs: esse, posse, ferre, velle, nolle, malle, ire, fieri and the compounds of
// esse / ferre / ire (A&G 170, 199-204).

/** The forms one irregular verb has outside the perfect system. Arrays are in person order 1sg ... 3pl. */
interface Irregular {
    pres: string[]; impf: string[]; fut: string[]; subjPres: string[]; subjImpf: string[];
    /** Passive counterparts of the five lists above; only for verbs with a passive. */
    passive?: { pres: string[]; impf: string[]; fut: string[]; subjPres: string[]; subjImpf: string[] };
    /** Present imperative singular and plural, passive singular and plural. */
    impPres?: [string, string]; impPresPass?: [string, string];
    /** Future imperative: 2sg, 3sg, 2pl, 3pl. */
    impFut?: [string, string, string, string];
    infPres: string; infPresPass?: string;
    infFut?: string[]; infFutPass?: string;
    partPres?: string; partFut?: string; gerundive?: string;
    /** Genitive, dative, accusative and ablative of the gerund. */
    gerund?: [string, string, string, string];
    /** Stem of the perfect participle, when the verb has perfect forms made with `sum`. */
    perfPart?: string;
    /** `fieri` has no perfect active of its own: its perfect system is the participle plus `sum`. */
    perfectIsPassive?: boolean;
}

const ends = (stem: string, list: string[]) => list.map(e => stem + e);
const prefixed = (pre: string, list: string[]) => list.map(f => pre + f);
const IMPF_BA = (stem: string) => ends(stem + 'ba', ACT);

function irregularSpec(verb: Verb): Irregular | undefined {
    const irr = verb.base ?? verb.inf;
    const pre = verb.prefix ?? '';
    const passive = !verb.noPassive;
    switch (irr) {
        case 'esse': {
            // pro- puts a d between itself and a form starting with e: prodes, proderam, prodesse.
            const e = (f: string) => (pre.endsWith('pro') && f.startsWith('e') ? pre + 'd' + f : pre + f);
            return {
                pres: ESSE_PRES.map(e), impf: ESSE_IMPF.map(e), fut: ESSE_FUT.map(e),
                subjPres: ESSE_SUBJ_PRES.map(e), subjImpf: ESSE_SUBJ_IMPF.map(e),
                impPres: [e('es'), e('este')], impFut: [e('esto'), e('esto'), e('estote'), e('sunto')],
                infPres: e('esse'),
                // fore is built on the perfect stem (afu- gives afore), not the prefix (abfore).
                infFut: [verb.perf + 'turus esse', verb.perf.replace(/u$/, '') + 'ore'],
                partFut: verb.perf + 'turus',
            };
        }
        case 'posse':
            return {
                pres: ['possum', 'potes', 'potest', 'possumus', 'potestis', 'possunt'],
                impf: ends('pote', ['ram', 'ras', 'rat', 'ramus', 'ratis', 'rant']),
                fut: ends('pote', ['ro', 'ris', 'rit', 'rimus', 'ritis', 'runt']),
                subjPres: ends('poss', ['im', 'is', 'it', 'imus', 'itis', 'int']),
                subjImpf: ends('posse', ACT),
                infPres: 'posse',
            };
        case 'ferre': {
            const f = (list: string[]) => prefixed(pre, list);
            const part = verb.ppp ?? pre + 'lat';
            return {
                pres: f(['fero', 'fers', 'fert', 'ferimus', 'fertis', 'ferunt']),
                impf: f(IMPF_BA('fere')),
                fut: f(['feram', 'feres', 'feret', 'feremus', 'feretis', 'ferent']),
                subjPres: f(ends('fera', ACT)),
                subjImpf: f(ends('ferre', ACT)),
                passive: passive ? {
                    pres: f(['feror', 'ferris', 'fertur', 'ferimur', 'ferimini', 'feruntur']),
                    impf: f(ends('fereba', PASS)),
                    fut: f(['ferar', 'fereris', 'feretur', 'feremur', 'feremini', 'ferentur']),
                    subjPres: f(ends('fera', PASS)),
                    subjImpf: f(ends('ferre', PASS)),
                } : undefined,
                impPres: [pre + 'fer', pre + 'ferte'],
                impPresPass: passive ? [pre + 'ferre', pre + 'ferimini'] : undefined,
                impFut: [pre + 'ferto', pre + 'ferto', pre + 'fertote', pre + 'ferunto'],
                infPres: pre + 'ferre', infPresPass: passive ? pre + 'ferri' : undefined,
                infFut: [part + 'urus esse'], infFutPass: passive ? part + 'um iri' : undefined,
                partPres: pre + 'ferens', partFut: part + 'urus', gerundive: passive ? pre + 'ferendus' : undefined,
                gerund: [pre + 'ferendi', pre + 'ferendo', pre + 'ferendum', pre + 'ferendo'],
                perfPart: passive ? part : undefined,
            };
        }
        case 'velle':
        case 'nolle':
        case 'malle': {
            const root = irr === 'velle' ? 'vol' : irr === 'nolle' ? 'nol' : 'mal';
            const subj = irr === 'velle' ? 'vel' : root;
            const pres = irr === 'velle' ? ['volo', 'vis', 'vult', 'volumus', 'vultis', 'volunt']
                : irr === 'nolle' ? ['nolo', 'non vis', 'non vult', 'nolumus', 'non vultis', 'nolunt']
                : ['malo', 'mavis', 'mavult', 'malumus', 'mavultis', 'malunt'];
            return {
                pres,
                impf: IMPF_BA(root + 'e'),
                fut: ends(root, ['am', 'es', 'et', 'emus', 'etis', 'ent']),
                subjPres: ends(subj, ['im', 'is', 'it', 'imus', 'itis', 'int']),
                subjImpf: ends(irr, ACT),
                infPres: irr,
                impPres: irr === 'nolle' ? ['noli', 'nolite'] : undefined,
                impFut: irr === 'nolle' ? ['nolito', 'nolito', 'nolitote', 'nolunto'] : undefined,
                partPres: irr === 'malle' ? undefined : root + 'ens',
            };
        }
        case 'ire': {
            const i = (list: string[]) => prefixed(pre, list);
            return {
                pres: i(['eo', 'is', 'it', 'imus', 'itis', 'eunt']),
                impf: i(IMPF_BA('i')),
                fut: i(['ibo', 'ibis', 'ibit', 'ibimus', 'ibitis', 'ibunt']),
                subjPres: i(ends('ea', ACT)),
                subjImpf: i(ends('ire', ACT)),
                passive: passive ? {
                    pres: i(['eor', 'iris', 'itur', 'imur', 'imini', 'euntur']),
                    impf: i(ends('iba', PASS)),
                    fut: i(['ibor', 'iberis', 'ibitur', 'ibimur', 'ibimini', 'ibuntur']),
                    subjPres: i(ends('ea', PASS)),
                    subjImpf: i(ends('ire', PASS)),
                } : undefined,
                impPres: [pre + 'i', pre + 'ite'],
                impFut: [pre + 'ito', pre + 'ito', pre + 'itote', pre + 'eunto'],
                infPres: pre + 'ire', infPresPass: passive ? pre + 'iri' : undefined,
                infFut: [pre + 'iturus esse'], infFutPass: passive && verb.ppp ? verb.ppp + 'um iri' : undefined,
                partPres: pre + 'iens', partFut: pre + 'iturus', gerundive: passive ? pre + 'eundus' : undefined,
                gerund: [pre + 'eundi', pre + 'eundo', pre + 'eundum', pre + 'eundo'],
                perfPart: passive ? verb.ppp : undefined,
            };
        }
        case 'fieri':
            return {
                pres: ['fio', 'fis', 'fit', 'fimus', 'fitis', 'fiunt'],
                impf: IMPF_BA('fie'),
                fut: ends('fi', ['am', 'es', 'et', 'emus', 'etis', 'ent']),
                subjPres: ends('fia', ACT),
                subjImpf: ends('fiere', ACT),
                impPres: ['fi', 'fite'],
                infPres: 'fieri',
                perfPart: verb.perf, perfectIsPassive: true,
            };
        default:
            return undefined;
    }
}

function irregularForms(verb: Verb, cell: VerbCell): string[] {
    const spec = irregularSpec(verb);
    if (!spec) return [];
    const forms = irregularBuild(verb, spec, cell);
    return (verb.base ?? verb.inf) === 'ire' ? ireVariants(verb.prefix ?? '', cell, forms) : forms;
}

/** The perfect-system forms of `ire` also come without the v: ivisti, iisti, isti; iverunt, ierunt. */
function ireVariants(pre: string, cell: VerbCell, forms: string[]): string[] {
    const perfectSystem = (cell.mood === 'indicative' && ['perfect', 'pluperfect', 'futurePerfect'].includes(cell.tense) && cell.voice === 'active')
        || (cell.mood === 'subjunctive' && (cell.tense === 'perfect' || cell.tense === 'pluperfect') && cell.voice === 'active')
        || (cell.mood === 'infinitive' && cell.tense === 'perfect' && cell.voice === 'active');
    if (!perfectSystem || forms.length !== 1 || !forms[0].startsWith(pre + 'iv')) return forms;
    const end = forms[0].slice(pre.length + 2);
    const out = [forms[0], pre + 'i' + end];
    if (end.startsWith('is')) out.push(pre + 'i' + end.slice(1));
    return out;
}

function irregularBuild(verb: Verb, spec: Irregular, cell: VerbCell): string[] {
    const hasPassive = !!spec.passive;
    switch (cell.mood) {
        case 'indicative':
        case 'subjunctive': {
            const i = (cell.person - 1) + (cell.number === 'plural' ? 3 : 0);
            const subj = cell.mood === 'subjunctive';
            const tense = cell.tense;
            const isPassive = cell.voice === 'passive';
            if (!perfectTense(tense)) {
                const src = isPassive ? spec.passive : spec;
                if (!src) return [];
                if (tense === 'present') return [(subj ? src.subjPres : src.pres)[i]];
                if (tense === 'imperfect') return [(subj ? src.subjImpf : src.impf)[i]];
                return subj ? [] : [src.fut[i]];
            }
            // Perfect system: perfect stem plus endings, or a perfect participle plus `sum`.
            if (!isPassive && !spec.perfectIsPassive) return [verb.perf + perfectEnding(cell.mood, tense, i)];
            if (isPassive && (spec.perfectIsPassive || !spec.passive)) return [];
            if (!spec.perfPart) return [];
            const participle = spec.perfPart + (cell.number === 'plural' ? 'i' : 'us');
            return [`${participle} ${perfectAuxiliary(cell.mood, tense, i)}`];
        }
        case 'imperative': {
            if (cell.tense === 'future') {
                if (cell.voice !== 'active' || !spec.impFut) return [];
                return [spec.impFut[(cell.person === 3 ? 1 : 0) + (cell.number === 'plural' ? 2 : 0)]];
            }
            const pair = cell.voice === 'active' ? spec.impPres : spec.impPresPass;
            return cell.person === 2 && pair ? [pair[cell.number === 'plural' ? 1 : 0]] : [];
        }
        case 'infinitive': {
            if (cell.tense === 'present') return cell.voice === 'active' ? [spec.infPres] : spec.infPresPass ? [spec.infPresPass] : [];
            if (cell.tense === 'perfect') {
                if (cell.voice === 'active') return spec.perfectIsPassive ? [spec.perfPart + 'us esse'] : [verb.perf + 'isse'];
                return hasPassive && spec.perfPart ? [spec.perfPart + 'us esse'] : [];
            }
            return cell.voice === 'active' ? spec.infFut ?? [] : spec.infFutPass ? [spec.infFutPass] : [];
        }
        case 'participle': {
            if (cell.tense === 'present') return cell.voice === 'active' && spec.partPres ? [spec.partPres] : [];
            if (cell.tense === 'perfect') return cell.voice === 'passive' && hasPassive && spec.perfPart ? [spec.perfPart + 'us'] : [];
            if (cell.voice === 'active') return spec.partFut ? [spec.partFut] : [];
            return spec.gerundive ? [spec.gerundive] : [];
        }
        case 'gerund':
            return spec.gerund ? [spec.gerund[CASES.indexOf(cell.case)]] : [];
    }
}

const perfectTense = (t: VerbTense) => t === 'perfect' || t === 'pluperfect' || t === 'futurePerfect';

function perfectEnding(mood: 'indicative' | 'subjunctive', tense: VerbTense, i: number): string {
    if (mood === 'subjunctive') return tense === 'perfect' ? SUBJ_PERF_ACT[i] : SUBJ_PLUP_ACT[i];
    return tense === 'perfect' ? PERF_ACT[i] : tense === 'pluperfect' ? PLUP_ACT[i] : FUTPERF_ACT[i];
}

function perfectAuxiliary(mood: 'indicative' | 'subjunctive', tense: VerbTense, i: number): string {
    if (mood === 'subjunctive') return tense === 'perfect' ? ESSE_SUBJ_PRES[i] : ESSE_SUBJ_IMPF[i];
    return tense === 'perfect' ? ESSE_PRES[i] : tense === 'pluperfect' ? ESSE_IMPF[i] : ESSE_FUT[i];
}

// ---------------------------------------------------------------------------------------------
// Principal parts, for hints.

const IRREGULAR_PARTS: Record<string, string> = {
    esse: 'sum, esse, fui, futurus', posse: 'possum, posse, potui', velle: 'volo, velle, volui',
    nolle: 'nolo, nolle, nolui', malle: 'malo, malle, malui', ferre: 'fero, ferre, tuli, latus',
    ire: 'eo, ire, ivi, itus', fieri: 'fio, fieri, factus sum',
};

/** First principal part of a regular verb, derived from the present stem. */
function firstPart(verb: Verb): string {
    if (verb.conj === 2) return verb.pres + 'eo';
    if (verb.conj === 3.5 || verb.conj === 4) return verb.pres + 'io';
    return verb.pres + 'o'; // 1st and 3rd
}

/** The principal parts as a student writes them (`amo, amare, amavi, amatus`), with no label. */
export function principalParts(verb: Verb): string {
    if (verb.semiDeponent) return `${verb.pp1 ?? firstPart(verb)}, ${verb.inf}, ${verb.perf}us sum`;
    if (verb.deponent) return `${verb.pp1 ?? verb.pres + 'or'}, ${verb.inf}, ${verb.perf}us sum`;
    if (verb.irregular && !verb.pp1 && IRREGULAR_PARTS[verb.inf]) return IRREGULAR_PARTS[verb.inf];
    return `${verb.pp1 ?? firstPart(verb)}, ${verb.inf}, ${verb.perf}i` + (verb.ppp && !verb.noPassive ? `, ${verb.ppp}us` : '');
}
