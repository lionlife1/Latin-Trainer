// Algorithmic Latin subjunctive conjugation engine (ported from legacy trainer.js).
import type { DrillQuestion, EndlessConfig } from './types';
import { CORE_VERBS } from '../content/verbs.generated';

export interface Verb {
    inf: string;
    conj?: number;
    pres?: string;
    perf: string;
    ppp?: string;
    trans: string;
    irregular?: boolean;
    noPassive?: boolean;
    deponent?: boolean;
    impfBase?: string;
    /** Compounds of esse / ferre / ire conjugate like their base with `prefix` in front. */
    base?: 'esse' | 'ferre' | 'ire';
    prefix?: string;
    /** First principal part, for hints; set on generated verbs. */
    pp1?: string;
}
export type Tense = 'present' | 'imperfect' | 'perfect' | 'pluperfect';
export type Voice = 'active' | 'passive';
export type GrammaticalNumber = 'singular' | 'plural';
export type Person = 1 | 2 | 3;


export const VERBS: Verb[] = [
    // --- Irregulars ---
    { inf: "esse", irregular: true, noPassive: true, perf: "fu", ppp: "futur", trans: "to be" },
    { inf: "posse", irregular: true, noPassive: true, perf: "potu", trans: "to be able" },
    { inf: "ferre", irregular: true, perf: "tul", ppp: "lat", trans: "to carry / bear" },
    { inf: "velle", irregular: true, noPassive: true, perf: "volu", trans: "to want" },
    { inf: "nolle", irregular: true, noPassive: true, perf: "nolu", trans: "to not want" },
    { inf: "malle", irregular: true, noPassive: true, perf: "malu", trans: "to prefer" },
    { inf: "ire", irregular: true, noPassive: true, perf: "iv", ppp: "it", trans: "to go" },
    { inf: "fieri", irregular: true, noPassive: true, perf: "fact", trans: "to become / happen" },

    // --- Deponents ---
    { inf: "conari", conj: 1, pres: "con", perf: "conat", deponent: true, impfBase: "conare", trans: "to try" },
    { inf: "hortari", conj: 1, pres: "hort", perf: "hortat", deponent: true, impfBase: "hortare", trans: "to urge" },
    { inf: "vereri", conj: 2, pres: "ver", perf: "verit", deponent: true, impfBase: "verere", trans: "to fear" },
    { inf: "sequi", conj: 3, pres: "sequ", perf: "secut", deponent: true, impfBase: "sequere", trans: "to follow" },
    { inf: "loqui", conj: 3, pres: "loqu", perf: "locut", deponent: true, impfBase: "loquere", trans: "to speak" },
    { inf: "uti", conj: 3, pres: "ut", perf: "us", deponent: true, impfBase: "utere", trans: "to use" },
    { inf: "pati", conj: 3.5, pres: "pat", perf: "pass", deponent: true, impfBase: "patere", trans: "to suffer / endure" },
    { inf: "mori", conj: 3.5, pres: "mor", perf: "mortu", deponent: true, impfBase: "morere", trans: "to die" }, { inf: "egredi", conj: 3.5, pres: "egred", perf: "egress", deponent: true, impfBase: "egredere", trans: "to exit" },
    { inf: "oriri", conj: 4, pres: "or", perf: "ort", deponent: true, impfBase: "orire", trans: "to rise" },

    // --- 1st Conjugation ---
    { inf: "amare", conj: 1, pres: "am", perf: "amav", ppp: "amat", trans: "to love" },
    { inf: "ambulare", conj: 1, pres: "ambul", perf: "ambulav", ppp: "ambulat", trans: "to walk" },
    { inf: "clamare", conj: 1, pres: "clam", perf: "clamav", ppp: "clamat", trans: "to shout" },
    { inf: "dare", conj: 1, pres: "d", perf: "ded", ppp: "dat", trans: "to give" },
    { inf: "demonstrare", conj: 1, pres: "demonstr", perf: "demonstrav", ppp: "demonstrat", trans: "to show" },
    { inf: "dubitare", conj: 1, pres: "dubit", perf: "dubitav", ppp: "dubitat", trans: "to doubt" },
    { inf: "errare", conj: 1, pres: "err", perf: "errav", ppp: "errat", trans: "to err" },
    { inf: "exspectare", conj: 1, pres: "exspect", perf: "exspectav", ppp: "exspectat", trans: "to wait for" },
    { inf: "habitare", conj: 1, pres: "habit", perf: "habitav", ppp: "habitat", trans: "to live" },
    { inf: "imperare", conj: 1, pres: "imper", perf: "imperav", ppp: "imperat", trans: "to order" },
    { inf: "laborare", conj: 1, pres: "labor", perf: "laborav", ppp: "laborat", trans: "to work" },
    { inf: "laudare", conj: 1, pres: "laud", perf: "laudav", ppp: "laudat", trans: "to praise" },
    { inf: "liberare", conj: 1, pres: "liber", perf: "liberav", ppp: "liberat", trans: "to free" },
    { inf: "monstrare", conj: 1, pres: "monstr", perf: "monstrav", ppp: "monstrat", trans: "to show" },
    { inf: "narrare", conj: 1, pres: "narr", perf: "narrav", ppp: "narrat", trans: "to tell" },
    { inf: "navigare", conj: 1, pres: "navig", perf: "navigav", ppp: "navigat", trans: "to sail" },
    { inf: "nuntiare", conj: 1, pres: "nunti", perf: "nuntiav", ppp: "nuntiat", trans: "to announce" },
    { inf: "occupare", conj: 1, pres: "occup", perf: "occupav", ppp: "occupat", trans: "to seize" },
    { inf: "oppugnare", conj: 1, pres: "oppugn", perf: "oppugnav", ppp: "oppugnat", trans: "to attack" },
    { inf: "parare", conj: 1, pres: "par", perf: "parav", ppp: "parat", trans: "to prepare" },
    { inf: "portare", conj: 1, pres: "port", perf: "portav", ppp: "portat", trans: "to carry" },
    { inf: "pugnare", conj: 1, pres: "pugn", perf: "pugnav", ppp: "pugnat", trans: "to fight" },
    { inf: "putare", conj: 1, pres: "put", perf: "putav", ppp: "putat", trans: "to think" },
    { inf: "rogare", conj: 1, pres: "rog", perf: "rogav", ppp: "rogat", trans: "to ask" },
    { inf: "servare", conj: 1, pres: "serv", perf: "servav", ppp: "servat", trans: "to save" },
    { inf: "spectare", conj: 1, pres: "spect", perf: "spectav", ppp: "spectat", trans: "to look at" },
    { inf: "sperare", conj: 1, pres: "sper", perf: "sperav", ppp: "sperat", trans: "to hope" },
    { inf: "stare", conj: 1, pres: "st", perf: "stet", ppp: "stat", trans: "to stand" },
    { inf: "superare", conj: 1, pres: "super", perf: "superav", ppp: "superat", trans: "to overcome" },
    { inf: "temptare", conj: 1, pres: "tempt", perf: "temptav", ppp: "temptat", trans: "to try" },
    { inf: "vocare", conj: 1, pres: "voc", perf: "vocav", ppp: "vocat", trans: "to call" },
    { inf: "vulnerare", conj: 1, pres: "vulner", perf: "vulnerav", ppp: "vulnerat", trans: "to wound" },

    // --- 2nd Conjugation ---
    { inf: "cavere", conj: 2, pres: "cav", perf: "cav", ppp: "caut", trans: "to beware" },
    { inf: "censere", conj: 2, pres: "cens", perf: "censu", ppp: "cens", trans: "to estimate" },
    { inf: "debere", conj: 2, pres: "deb", perf: "debu", ppp: "debit", trans: "to owe" },
    { inf: "docere", conj: 2, pres: "doc", perf: "docu", ppp: "doct", trans: "to teach" },
    { inf: "habere", conj: 2, pres: "hab", perf: "habu", ppp: "habit", trans: "to have" },
    { inf: "iubere", conj: 2, pres: "iub", perf: "iuss", ppp: "iuss", trans: "to order" },
    { inf: "manere", conj: 2, pres: "man", perf: "mans", ppp: "mans", trans: "to remain" },
    { inf: "monere", conj: 2, pres: "mon", perf: "monu", ppp: "monit", trans: "to warn" },
    { inf: "movere", conj: 2, pres: "mov", perf: "mov", ppp: "mot", trans: "to move" },
    { inf: "praebere", conj: 2, pres: "praeb", perf: "praebu", ppp: "praebit", trans: "to provide" },
    { inf: "prohibere", conj: 2, pres: "prohib", perf: "prohibu", ppp: "prohibit", trans: "to prevent" },
    { inf: "respondere", conj: 2, pres: "respond", perf: "respond", ppp: "respons", trans: "to answer" },
    { inf: "retinere", conj: 2, pres: "retin", perf: "retinu", ppp: "retent", trans: "to hold back" },
    { inf: "ridere", conj: 2, pres: "rid", perf: "ris", ppp: "ris", trans: "to laugh" },
    { inf: "sedere", conj: 2, pres: "sed", perf: "sed", ppp: "sess", trans: "to sit" },
    { inf: "sustinere", conj: 2, pres: "sustin", perf: "sustinu", ppp: "sustent", trans: "to withstand" },
    { inf: "tenere", conj: 2, pres: "ten", perf: "tenu", ppp: "tent", trans: "to hold" },
    { inf: "terrere", conj: 2, pres: "terr", perf: "terru", ppp: "territ", trans: "to frighten" },
    { inf: "videre", conj: 2, pres: "vid", perf: "vid", ppp: "vis", trans: "to see" },

    // --- 3rd Conjugation ---
    { inf: "agere", conj: 3, pres: "ag", perf: "eg", ppp: "act", trans: "to drive / do" },
    { inf: "amittere", conj: 3, pres: "amitt", perf: "amis", ppp: "amiss", trans: "to lose" },
    { inf: "cadere", conj: 3, pres: "cad", perf: "cecid", ppp: "cas", trans: "to fall" },
    { inf: "caedere", conj: 3, pres: "caed", perf: "cecid", ppp: "caes", trans: "to cut / kill" },
    { inf: "cedere", conj: 3, pres: "ced", perf: "cess", ppp: "cess", trans: "to yield" },
    { inf: "claudere", conj: 3, pres: "claud", perf: "claus", ppp: "claus", trans: "to close" },
    { inf: "cogere", conj: 3, pres: "cog", perf: "coeg", ppp: "coact", trans: "to compel" },
    { inf: "cognoscere", conj: 3, pres: "cognosc", perf: "cognov", ppp: "cognit", trans: "to learn" },
    { inf: "committere", conj: 3, pres: "committ", perf: "commis", ppp: "commiss", trans: "to entrust" },
    { inf: "constituere", conj: 3, pres: "constitu", perf: "constitu", ppp: "constitut", trans: "to decide" },
    { inf: "consumere", conj: 3, pres: "consum", perf: "consumps", ppp: "consumpt", trans: "to consume" },
    { inf: "credere", conj: 3, pres: "cred", perf: "credid", ppp: "credit", trans: "to believe" },
    { inf: "currere", conj: 3, pres: "curr", perf: "cucurr", ppp: "curs", trans: "to run" },
    { inf: "defendere", conj: 3, pres: "defend", perf: "defend", ppp: "defens", trans: "to defend" },
    { inf: "dicere", conj: 3, pres: "dic", perf: "dix", ppp: "dict", trans: "to say" },
    { inf: "discedere", conj: 3, pres: "disced", perf: "discess", ppp: "discess", trans: "to depart" },
    { inf: "dividere", conj: 3, pres: "divid", perf: "divis", ppp: "divis", trans: "to divide" },
    { inf: "ducere", conj: 3, pres: "duc", perf: "dux", ppp: "duct", trans: "to lead" },
    { inf: "expellere", conj: 3, pres: "expell", perf: "expul", ppp: "expuls", trans: "to drive out" },
    { inf: "gerere", conj: 3, pres: "ger", perf: "gess", ppp: "gest", trans: "to wear / wage" },
    { inf: "intellegere", conj: 3, pres: "intelleg", perf: "intellex", ppp: "intellect", trans: "to understand" },
    { inf: "iungere", conj: 3, pres: "iung", perf: "iunx", ppp: "iunct", trans: "to join" },
    { inf: "legere", conj: 3, pres: "leg", perf: "leg", ppp: "lect", trans: "to read" },
    { inf: "mittere", conj: 3, pres: "mitt", perf: "mis", ppp: "miss", trans: "to send" },
    { inf: "ostendere", conj: 3, pres: "ostend", perf: "ostend", ppp: "ostent", trans: "to show" },
    { inf: "pellere", conj: 3, pres: "pell", perf: "pepul", ppp: "puls", trans: "to push" },
    { inf: "petere", conj: 3, pres: "pet", perf: "petiv", ppp: "petit", trans: "to seek" },
    { inf: "ponere", conj: 3, pres: "pon", perf: "posu", ppp: "posit", trans: "to put" },
    { inf: "procedere", conj: 3, pres: "proced", perf: "process", ppp: "process", trans: "to advance" },
    { inf: "promittere", conj: 3, pres: "promitt", perf: "promis", ppp: "promiss", trans: "to promise" },
    { inf: "quaerere", conj: 3, pres: "quaer", perf: "quaesiv", ppp: "quaesit", trans: "to seek" },
    { inf: "regere", conj: 3, pres: "reg", perf: "rex", ppp: "rect", trans: "to rule" },
    { inf: "relinquere", conj: 3, pres: "relinqu", perf: "reliqu", ppp: "relict", trans: "to leave behind" },
    { inf: "scribere", conj: 3, pres: "scrib", perf: "scrips", ppp: "script", trans: "to write" },
    { inf: "statuere", conj: 3, pres: "statu", perf: "statu", ppp: "statut", trans: "to establish" },
    { inf: "tangere", conj: 3, pres: "tang", perf: "tetig", ppp: "tact", trans: "to touch" },
    { inf: "tradere", conj: 3, pres: "trad", perf: "tradid", ppp: "tradit", trans: "to hand over" },
    { inf: "trahere", conj: 3, pres: "trah", perf: "trax", ppp: "tract", trans: "to drag" },
    { inf: "vertere", conj: 3, pres: "vert", perf: "vert", ppp: "vers", trans: "to turn" },
    { inf: "vincere", conj: 3, pres: "vinc", perf: "vic", ppp: "vict", trans: "to conquer" },

    // --- 3rd -io Conjugation ---
    { inf: "accipere", conj: 3.5, pres: "accip", perf: "accep", ppp: "accept", trans: "to receive" },
    { inf: "capere", conj: 3.5, pres: "cap", perf: "cep", ppp: "capt", trans: "to take" },
    { inf: "conficere", conj: 3.5, pres: "confic", perf: "confec", ppp: "confect", trans: "to finish" },
    { inf: "conspicere", conj: 3.5, pres: "conspic", perf: "conspex", ppp: "conspect", trans: "to catch sight of" },
    { inf: "cupere", conj: 3.5, pres: "cup", perf: "cupiv", ppp: "cupit", trans: "to desire" },
    { inf: "effugere", conj: 3.5, pres: "effug", perf: "effug", ppp: "effugit", trans: "to escape" },
    { inf: "excipere", conj: 3.5, pres: "excip", perf: "excep", ppp: "except", trans: "to welcome" },
    { inf: "fugere", conj: 3.5, pres: "fug", perf: "fug", ppp: "fugit", trans: "to flee" },
    { inf: "iacere", conj: 3.5, pres: "iac", perf: "iec", ppp: "iact", trans: "to throw" },
    { inf: "incipere", conj: 3.5, pres: "incip", perf: "incep", ppp: "incept", trans: "to begin" },
    { inf: "interficere", conj: 3.5, pres: "interfic", perf: "interfec", ppp: "interfect", trans: "to kill" },
    { inf: "rapere", conj: 3.5, pres: "rap", perf: "rapu", ppp: "rapt", trans: "to seize" },
    { inf: "suscipere", conj: 3.5, pres: "suscip", perf: "suscep", ppp: "suscept", trans: "to undertake" },

    // --- 4th Conjugation ---
    { inf: "aperire", conj: 4, pres: "aper", perf: "aperu", ppp: "apert", trans: "to open" },
    { inf: "audire", conj: 4, pres: "aud", perf: "audiv", ppp: "audit", trans: "to hear" },
    { inf: "convenire", conj: 4, pres: "conven", perf: "conven", ppp: "convent", trans: "to assemble" },
    { inf: "custodire", conj: 4, pres: "custod", perf: "custodiv", ppp: "custodit", trans: "to guard" },
    { inf: "dormire", conj: 4, pres: "dorm", perf: "dormiv", ppp: "dormit", trans: "to sleep" },
    { inf: "impedire", conj: 4, pres: "imped", perf: "impediv", ppp: "impedit", trans: "to hinder" },
    { inf: "invenire", conj: 4, pres: "inven", perf: "inven", ppp: "invent", trans: "to find" },
    { inf: "munire", conj: 4, pres: "mun", perf: "muniv", ppp: "munit", trans: "to fortify" },
    { inf: "nescire", conj: 4, pres: "nesc", perf: "nesciv", ppp: "nescit", trans: "to not know" },
    { inf: "pervenire", conj: 4, pres: "perven", perf: "perven", ppp: "pervent", trans: "to arrive" },
    { inf: "punire", conj: 4, pres: "pun", perf: "puniv", ppp: "punit", trans: "to punish" },
    { inf: "reperire", conj: 4, pres: "reper", perf: "repper", ppp: "repert", trans: "to discover" },
    { inf: "scire", conj: 4, pres: "sc", perf: "sciv", ppp: "scit", trans: "to know" },
    { inf: "sentire", conj: 4, pres: "sent", perf: "sens", ppp: "sens", trans: "to feel" },
    { inf: "venire", conj: 4, pres: "ven", perf: "ven", ppp: "vent", trans: "to come" }
];

const TENSES: Tense[] = ["present", "imperfect", "perfect", "pluperfect"];
const PERSONS: Person[] = [1, 2, 3];
const NUMBERS: GrammaticalNumber[] = ["singular", "plural"];

const ENDINGS_ACT = ["m", "s", "t", "mus", "tis", "nt"];
const ENDINGS_PASS = ["r", "ris", "tur", "mur", "mini", "ntur"];

function getPersonNumberIndex(person: Person, number: GrammaticalNumber): number {
    return (person - 1) + (number === "plural" ? 3 : 0);
}

export function generateSubjunctiveForm(verb: Verb, tense: Tense, voice: Voice, person: Person, number: GrammaticalNumber): string {
    const pIndex = getPersonNumberIndex(person, number);
    const actEnd = ENDINGS_ACT[pIndex];
    const passEnd = ENDINGS_PASS[pIndex];

    const calcVoice = verb.deponent ? "passive" : voice;
    const irr = verb.base ?? verb.inf;
    const pre = verb.prefix ?? "";

    // 1. PRESENT SUBJUNCTIVE
    if (tense === "present") {
        if (irr === "esse") return pre + ["sim", "sis", "sit", "simus", "sitis", "sint"][pIndex];
        if (verb.inf === "posse") return ["possim", "possis", "possit", "possimus", "possitis", "possint"][pIndex];
        if (verb.inf === "velle") return "vel" + (pIndex === 0 ? "im" : pIndex === 1 ? "is" : pIndex === 2 ? "it" : pIndex === 3 ? "imus" : pIndex === 4 ? "itis" : "int");
        if (verb.inf === "nolle") return "nol" + (pIndex === 0 ? "im" : pIndex === 1 ? "is" : pIndex === 2 ? "it" : pIndex === 3 ? "imus" : pIndex === 4 ? "itis" : "int");
        if (verb.inf === "malle") return "mal" + (pIndex === 0 ? "im" : pIndex === 1 ? "is" : pIndex === 2 ? "it" : pIndex === 3 ? "imus" : pIndex === 4 ? "itis" : "int");

        let stem = "";
        if (irr === "ferre") stem = pre + "fera";
        else if (irr === "ire") stem = pre + "ea";
        else if (verb.inf === "fieri") stem = "fia";
        else if (verb.conj === 1) stem = verb.pres + "e";
        else if (verb.conj === 2) stem = verb.pres + "ea";
        else if (verb.conj === 3) stem = verb.pres + "a";
        else if (verb.conj === 3.5) stem = verb.pres + "ia";
        else if (verb.conj === 4) stem = verb.pres + "ia";

        if (verb.inf === "fieri") return stem + actEnd;
        return calcVoice === "active" ? stem + actEnd : stem + passEnd;
    }

    // 2. IMPERFECT SUBJUNCTIVE
    if (tense === "imperfect") {
        let base = verb.impfBase || verb.inf;
        if (verb.inf === "fieri") return "fiere" + actEnd;
        return calcVoice === "active" ? base + actEnd : base + passEnd;
    }

    // 3. PERFECT SUBJUNCTIVE
    if (tense === "perfect") {
        if (verb.inf === "fieri" || calcVoice === "passive") {
            const essePres = ["sim", "sis", "sit", "simus", "sitis", "sint"];
            const ppp = verb.ppp || verb.perf;
            const pppEnd = number === "singular" ? "us" : "i";
            return ppp + pppEnd + " " + essePres[pIndex];
        } else {
            const perfEnds = ["erim", "eris", "erit", "erimus", "eritis", "erint"];
            return verb.perf + perfEnds[pIndex];
        }
    }

    // 4. PLUPERFECT SUBJUNCTIVE
    if (tense === "pluperfect") {
        if (verb.inf === "fieri" || calcVoice === "passive") {
            const esseImp = ["essem", "esses", "esset", "essemus", "essetis", "essent"];
            const ppp = verb.ppp || verb.perf;
            const pppEnd = number === "singular" ? "us" : "i";
            return ppp + pppEnd + " " + esseImp[pIndex];
        } else {
            const plupEnds = ["issem", "isses", "isset", "issemus", "issetis", "issent"];
            return verb.perf + plupEnds[pIndex];
        }
    }
    throw new Error(`Unknown tense: ${tense}`);
}

/**
 * Identifies a verb in the trainer pool. Without macrons a 2nd and a 3rd conjugation verb can share
 * an infinitive (iacēre / iacere), so the conjugation is part of the key.
 */
export function verbKey(v: Verb): string {
    return `${v.inf}|${v.irregular ? 'irr' : v.conj}`;
}

let pool: Verb[] | undefined;

/** Every verb the Endless trainer can draw: the hand-written VERBS, then the generated core verbs they don't cover. */
export function trainerPool(): Verb[] {
    if (!pool) {
        const handWritten = new Set(VERBS.map(verbKey));
        pool = [...VERBS, ...CORE_VERBS.filter(v => !handWritten.has(verbKey(v)))];
    }
    return pool;
}

export function generateRandomQuestion(config: EndlessConfig, rng: () => number = Math.random, verbs: Verb[] = trainerPool()): DrillQuestion | null {
    const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
    // 1. Filter the VERBS array based on the user's config
    let pool = verbs.filter(v => {
        if (v.deponent) return config.dep;
        if (v.irregular) {
            if (v.noPassive && !config.stdAct && !config.dep) return false;
            return config.irr;
        }
        // Standard verbs
        if (!config.stdAct && !config.stdPass) return false;
        return config.stdAct || config.stdPass;
    });

    if (pool.length === 0) return null; // Safe guard

    // 2. Pick a random verb
    const verb = pick(pool);
    const tense = pick(TENSES);

    // 3. Determine available voices based on verb type AND config
    let availableVoices: Voice[] = [];

    if (verb.deponent) {
        availableVoices = ["active"]; // Internal logic uses active string
    } else if (verb.irregular) {
        if (config.stdAct) availableVoices.push("active");
        if (config.stdPass && !verb.noPassive) availableVoices.push("passive");
        if (availableVoices.length === 0) availableVoices = ["active"];
    } else {
        // Standard verb
        if (config.stdAct) availableVoices.push("active");
        if (config.stdPass && !verb.noPassive) availableVoices.push("passive");
        if (availableVoices.length === 0) availableVoices = ["active"];
    }

    const voice = pick(availableVoices);
    const person = pick(PERSONS);
    const number = pick(NUMBERS);

    const answer = generateSubjunctiveForm(verb, tense, voice, person, number);
    const answers = [answer];

    if ((verb.base ?? verb.inf) === "ire" && (tense === "perfect" || tense === "pluperfect")) {
        answers.push(answer.replace("iv", "i")); // Handles ierim / iissem
        if (tense === "pluperfect") answers.push(answer.replace("ivi", "i")); // Handles issem
    }

    let ord = person === 1 ? "1st" : person === 2 ? "2nd" : "3rd";
    let numAbbr = number === "singular" ? "sg." : "pl.";

    let voiceDisplay: string = voice;
    if (verb.deponent) voiceDisplay = "(deponent)";
    else if (verb.noPassive) voiceDisplay = "";

    let hint = "";
    if (verb.pp1) {
        hint = verb.deponent
            ? `Principal parts: ${verb.pp1}, ${verb.inf}, ${verb.perf}us sum`
            : `Principal parts: ${verb.pp1}, ${verb.inf}, ${verb.perf}i` + (verb.ppp ? `, ${verb.ppp}us` : "");
    }
    else if (verb.deponent) hint = `Principal parts: ${verb.pres}or, ${verb.inf}, ${verb.perf}us sum`;
    else if (verb.irregular) {
        if (verb.inf === "esse") hint = `Principal parts: sum, esse, fui, futurus`;
        else if (verb.inf === "posse") hint = `Principal parts: possum, posse, potui`;
        else if (verb.inf === "velle") hint = `Principal parts: volo, velle, volui`;
        else if (verb.inf === "nolle") hint = `Principal parts: nolo, nolle, nolui`;
        else if (verb.inf === "malle") hint = `Principal parts: malo, malle, malui`;
        else if (verb.inf === "ferre") hint = `Principal parts: fero, ferre, tuli, latus`;
        else if (verb.inf === "ire") hint = `Principal parts: eo, ire, ivi, itus`;
        else if (verb.inf === "fieri") hint = `Principal parts: fio, fieri, factus sum`;
    }
    else hint = `Principal parts: ${getPP1(verb)}, ${verb.inf}, ${verb.perf}i, ${verb.ppp || '--'}us`;

    return {
        id: "endless_" + Date.now() + "_" + Math.floor(rng() * 1e9),
        type: "typein",
        badge: "ENDLESS TRAINER",
        prompt: `<span class='latin-word' style='font-size: 1.4em;'>${verb.inf}</span><br><span style='font-size: 0.8em; color: var(--text-secondary);'>${ord} ${numAbbr} · ${tense} ${voiceDisplay}</span>`,
        hint: hint,
        answers: answers,
        explanation: `The correct algorithmic form is ${answer}.`
    };
}

function getPP1(verb: Verb): string {
    if (verb.conj === 2) return verb.pres + 'eo';
    if (verb.conj === 3.5 || verb.conj === 4) return verb.pres + 'io';
    return verb.pres + 'o'; // 1st and 3rd
}
