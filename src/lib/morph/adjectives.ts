// Latin adjectives (A&G §§110-124, 214-218): declension, comparison and adverbs.
import type { Case, Degree, Gender, GrammaticalNumber } from './types';

export interface Adjective {
    /** Masculine nominative singular: 'bonus', 'miser', 'pulcher', 'acer', 'fortis', 'ingens'. */
    nom: string;
    /** Oblique stem: 'bon', 'miser', 'pulchr', 'acr', 'fort', 'ingent'. */
    stem: string;
    decl: '12' | '3';
    /** 3rd declension only. */
    terminations?: 1 | 2 | 3;
    /** Comparative stem before -or: 'meli', 'forti'. */
    comp?: string;
    /** Superlative stem before -mus: 'opti', 'fortissi'. */
    sup?: string;
    /** Genitive -ius, dative -i: solus, totus, unus, nullus, alter, uter, alius. */
    pronominal?: boolean;
    /** 3rd declension consonant stem: vetus. */
    consonantStem?: boolean;
    trans: string;
}

export interface AdjectiveCell {
    case: Case;
    number: GrammaticalNumber;
    gender: Gender;
    degree: Degree;
}

const CASES: Case[] = ['nominative', 'genitive', 'dative', 'accusative', 'ablative', 'vocative'];
const DEGREES: Degree[] = ['positive', 'comparative', 'superlative'];
const GENDERS: Gender[] = ['m', 'f', 'n'];

export const ALL_ADJECTIVE_CELLS: readonly AdjectiveCell[] = DEGREES.flatMap(degree =>
    GENDERS.flatMap(gender => (['singular', 'plural'] as const).flatMap(number =>
        CASES.map(c => ({ case: c, number, gender, degree })))));

/** Six forms in case order nom gen dat acc abl voc; each a string or variants. */
type Six = (string | string[])[];

const list = (x: string | string[]): string[] => (Array.isArray(x) ? [...x] : [x]);

/** Positive (and superlative) forms of a 1st/2nd declension adjective. */
function twelve(a: Pick<Adjective, 'nom' | 'stem' | 'pronominal'>, gender: Gender, number: GrammaticalNumber): Six {
    const s = a.stem;
    if (number === 'plural') {
        if (gender === 'm') return [s + 'i', s + 'orum', s + 'is', s + 'os', s + 'is', s + 'i'];
        if (gender === 'f') return [s + 'ae', s + 'arum', s + 'is', s + 'as', s + 'is', s + 'ae'];
        return [s + 'a', s + 'orum', s + 'is', s + 'a', s + 'is', s + 'a'];
    }
    let six: Six;
    if (gender === 'm') {
        const voc = a.nom === 'meus' ? 'mi' : a.nom.endsWith('us') ? s + 'e' : a.nom;
        six = [a.nom, s + 'i', s + 'o', s + 'um', s + 'o', voc];
    } else if (gender === 'f') {
        six = [s + 'a', s + 'ae', s + 'ae', s + 'am', s + 'a', s + 'a'];
    } else {
        six = [s + 'um', s + 'i', s + 'o', s + 'um', s + 'o', s + 'um'];
    }
    if (a.pronominal) {
        six[1] = s + 'ius';
        six[2] = s + 'i';
        if (a.nom === 'alius') {
            six[1] = 'alterius';
            if (gender === 'n') six[0] = six[3] = six[5] = 'aliud';
        }
    }
    return six;
}

function third(a: Adjective, gender: Gender, number: GrammaticalNumber): Six {
    const s = a.stem;
    const cons = !!a.consonantStem;
    if (number === 'plural') {
        if (gender === 'n') {
            const nomAcc = s + (cons ? 'a' : 'ia');
            return [nomAcc, s + (cons ? 'um' : 'ium'), s + 'ibus', nomAcc, s + 'ibus', nomAcc];
        }
        return [s + 'es', s + (cons ? 'um' : 'ium'), s + 'ibus', cons ? s + 'es' : [s + 'es', s + 'is'], s + 'ibus', s + 'es'];
    }
    const abl = s + (cons ? 'e' : 'i');
    const t = a.terminations ?? 1;
    if (gender === 'n') {
        const nom = t === 1 ? a.nom : s + 'e';
        return [nom, s + 'is', s + 'i', nom, abl, nom];
    }
    const nom = gender === 'f' && t === 3 ? s + 'is' : a.nom;
    return [nom, s + 'is', s + 'i', s + 'em', abl, nom];
}

/** Comparative of an ordinary adjective: 3rd declension consonant-stem endings on comp + or. */
function comparative(comp: string, gender: Gender, number: GrammaticalNumber): Six {
    if (number === 'plural') {
        if (gender === 'n') return [comp + 'ora', comp + 'orum', comp + 'oribus', comp + 'ora', comp + 'oribus', comp + 'ora'];
        return [comp + 'ores', comp + 'orum', comp + 'oribus', comp + 'ores', comp + 'oribus', comp + 'ores'];
    }
    if (gender === 'n') {
        return [comp + 'us', comp + 'oris', comp + 'ori', comp + 'us', comp + 'ore', comp + 'us'];
    }
    return [comp + 'or', comp + 'oris', comp + 'ori', comp + 'orem', comp + 'ore', comp + 'or'];
}

/** multus: only the cells the language has; empty strings mark a missing form. */
function pluralComparative(gender: Gender, number: GrammaticalNumber): (string | null)[] {
    if (number === 'plural') {
        const nomAcc = gender === 'n' ? 'plura' : 'plures';
        return [nomAcc, 'plurium', 'pluribus', nomAcc, 'pluribus', null];
    }
    if (gender === 'n') return ['plus', 'pluris', null, 'plus', 'plure', null];
    return [null, null, null, null, null, null];
}

export function adjectiveForms(a: Adjective, cell: AdjectiveCell): string[] {
    const index = CASES.indexOf(cell.case);
    if (cell.degree !== 'positive' && !(a.comp && a.sup)) return [];
    if (cell.degree === 'comparative') {
        if (a.comp === 'plur') {
            const f = pluralComparative(cell.gender, cell.number)[index];
            return f ? [f] : [];
        }
        return list(comparative(a.comp!, cell.gender, cell.number)[index]);
    }
    if (cell.degree === 'superlative') {
        const sup = { nom: a.sup + 'mus', stem: a.sup + 'm' };
        return list(twelve(sup, cell.gender, cell.number)[index]);
    }
    const six = a.decl === '12' ? twelve(a, cell.gender, cell.number) : third(a, cell.gender, cell.number);
    return list(six[index]);
}

export function adjectiveCells(a: Adjective): AdjectiveCell[] {
    return ALL_ADJECTIVE_CELLS.filter(c => adjectiveForms(a, c).length > 0);
}

/** Dictionary entry: 'bonus, bona, bonum'; 'acer, acris, acre'; 'fortis, forte'; 'ingens, ingentis'. */
export function adjectiveEntry(a: Adjective): string {
    if (a.decl === '12') {
        const neuter = a.nom === 'alius' ? 'aliud' : a.stem + 'um';
        return `${a.nom}, ${a.stem}a, ${neuter}`;
    }
    switch (a.terminations) {
        case 3: return `${a.nom}, ${a.stem}is, ${a.stem}e`;
        case 2: return `${a.nom}, ${a.stem}e`;
        default: return `${a.nom}, ${a.stem}is`;
    }
}

const ADVERB_OVERRIDES: Record<string, [string, string, string]> = {
    bonus: ['bene', 'melius', 'optime'],
    malus: ['male', 'peius', 'pessime'],
    magnus: ['magnopere', 'magis', 'maxime'],
    parvus: ['parum', 'minus', 'minime'],
    multus: ['multum', 'plus', 'plurimum'],
    facilis: ['facile', 'facilius', 'facillime'],
    audax: ['audacter', 'audacius', 'audacissime'],
};

/** The adverb in one degree; none unless the adjective is compared, and none for consonant stems (no regular adverb). */
export function adverbForms(a: Adjective, degree: Degree): string[] {
    if (!a.comp || !a.sup || a.consonantStem) return [];
    const i = DEGREES.indexOf(degree);
    const over = ADVERB_OVERRIDES[a.nom];
    if (over) return [over[i]];
    if (degree === 'comparative') return [a.comp + 'us'];
    if (degree === 'superlative') return [a.sup + 'me'];
    if (a.decl === '12') return [a.stem + 'e'];
    return [a.stem + (a.nom.endsWith('ns') ? 'er' : 'iter')];
}
