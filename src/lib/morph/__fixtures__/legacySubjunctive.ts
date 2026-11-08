// Frozen copy of the conjugator before the engine (2026-11-06). Test fixture only.
import type { Verb, Voice, GrammaticalNumber, Person } from '../types';

type Tense = 'present' | 'imperfect' | 'perfect' | 'pluperfect';

const ENDINGS_ACT = ["m", "s", "t", "mus", "tis", "nt"];
const ENDINGS_PASS = ["r", "ris", "tur", "mur", "mini", "ntur"];

function getPersonNumberIndex(person: Person, number: GrammaticalNumber): number {
    return (person - 1) + (number === "plural" ? 3 : 0);
}

export function legacySubjunctiveForm(verb: Verb, tense: Tense, voice: Voice, person: Person, number: GrammaticalNumber): string {
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
