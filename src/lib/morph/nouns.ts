// Latin noun declensions (A&G §§37-98), built from a noun's nominative and oblique stem.
import type { Case, Gender, GrammaticalNumber } from './types';

export type NounGender = Gender | 'c'; // 'c' = common (m. and f.)

export interface Noun {
    /** Nominative singular: 'puella', 'rex', 'nomen'. */
    nom: string;
    /** Oblique stem: 'puell', 'reg', 'nomin'. */
    stem: string;
    decl: 1 | 2 | 3 | 4 | 5;
    gender: NounGender;
    /** 3rd declension i-stem. */
    iStem?: boolean;
    irregular?: 'domus' | 'vis' | 'deus';
    trans: string;
}

export interface NounCell {
    case: Case;
    number: GrammaticalNumber;
}

const CASES: Case[] = ['nominative', 'genitive', 'dative', 'accusative', 'ablative', 'vocative'];
export const ALL_NOUN_CELLS: readonly NounCell[] = (['singular', 'plural'] as const).flatMap(number =>
    CASES.map(c => ({ case: c, number })));

/** Ending slot: a string or variants added to the stem, or `=` for the nominative singular itself, or null for no form. */
type Slot = string | string[] | null;
/** Six singular slots then six plural slots, in case order nom gen dat acc abl voc. */
type Paradigm = Slot[];

const NOM = '=';

const PARADIGMS: Record<string, Paradigm> = {
    first: ['a', 'ae', 'ae', 'am', 'a', 'a', 'ae', 'arum', 'is', 'as', 'is', 'ae'],
    secondUs: [NOM, 'i', 'o', 'um', 'o', 'e', 'i', 'orum', 'is', 'os', 'is', 'i'],
    secondEr: [NOM, 'i', 'o', 'um', 'o', NOM, 'i', 'orum', 'is', 'os', 'is', 'i'],
    secondUm: [NOM, 'i', 'o', NOM, 'o', NOM, 'a', 'orum', 'is', 'a', 'is', 'a'],
    third: [NOM, 'is', 'i', 'em', 'e', NOM, 'es', 'um', 'ibus', 'es', 'ibus', 'es'],
    thirdI: [NOM, 'is', 'i', 'em', 'e', NOM, 'es', 'ium', 'ibus', ['es', 'is'], 'ibus', 'es'],
    thirdN: [NOM, 'is', 'i', NOM, 'e', NOM, 'a', 'um', 'ibus', 'a', 'ibus', 'a'],
    thirdNI: [NOM, 'is', 'i', NOM, 'i', NOM, 'ia', 'ium', 'ibus', 'ia', 'ibus', 'ia'],
    fourth: [NOM, 'us', 'ui', 'um', 'u', NOM, 'us', 'uum', 'ibus', 'us', 'ibus', 'us'],
    fourthN: [NOM, 'us', 'u', NOM, 'u', NOM, 'ua', 'uum', 'ibus', 'ua', 'ibus', 'ua'],
    fifth: [NOM, 'ei', 'ei', 'em', 'e', NOM, 'es', 'erum', 'ebus', 'es', 'ebus', 'es'],
};

/** Whole forms (not stem + ending) for the irregular nouns, variants after the main form. */
const IRREGULAR: Record<NonNullable<Noun['irregular']>, Paradigm> = {
    domus: ['domus', 'domus', ['domui', 'domo'], 'domum', ['domo', 'domu'], 'domus',
        'domus', ['domuum', 'domorum'], 'domibus', ['domos', 'domus'], 'domibus', 'domus'],
    vis: ['vis', null, null, 'vim', 'vi', 'vis',
        'vires', 'virium', 'viribus', ['vires', 'viris'], 'viribus', 'vires'],
    deus: ['deus', 'dei', 'deo', 'deum', 'deo', 'deus',
        ['di', 'dei', 'dii'], ['deorum', 'deum'], ['dis', 'deis', 'diis'], 'deos', ['dis', 'deis', 'diis'], ['di', 'dei', 'dii']],
};

function paradigmKey(n: Noun): string {
    switch (n.decl) {
        case 1: return 'first';
        case 2:
            if (n.nom.endsWith('um')) return 'secondUm';
            return n.nom.endsWith('us') ? 'secondUs' : 'secondEr';
        case 3:
            if (n.gender === 'n') return n.iStem ? 'thirdNI' : 'thirdN';
            return n.iStem ? 'thirdI' : 'third';
        case 4: return n.gender === 'n' ? 'fourthN' : 'fourth';
        case 5: return 'fifth';
    }
}

export function nounForms(n: Noun, cell: NounCell): string[] {
    const index = CASES.indexOf(cell.case) + (cell.number === 'plural' ? 6 : 0);
    if (n.irregular) {
        const slot = IRREGULAR[n.irregular][index];
        return slot === null ? [] : Array.isArray(slot) ? [...slot] : [slot];
    }
    const key = paradigmKey(n);
    const slot = PARADIGMS[key][index];
    if (slot === null) return [];
    if (slot === NOM) return [n.nom];
    if (Array.isArray(slot)) return slot.map(e => n.stem + e);
    // Second declension: -ius / -ium stems have a contracted genitive singular too, and filius / genius a vocative in -i.
    if (key === 'secondUs' && cell.case === 'vocative' && cell.number === 'singular' && (n.nom === 'filius' || n.nom === 'genius')) return [n.stem];
    if ((key === 'secondUs' || key === 'secondUm') && cell.case === 'genitive' && cell.number === 'singular' && n.stem.endsWith('i')) {
        return [n.stem + slot, n.stem];
    }
    return [n.stem + slot];
}

export function nounCells(n: Noun): NounCell[] {
    return ALL_NOUN_CELLS.filter(c => nounForms(n, c).length > 0);
}

const GENDER_TEXT: Record<NounGender, string> = { m: 'm.', f: 'f.', n: 'n.', c: 'm./f.' };

/** Dictionary entry: nominative, genitive singular, gender (no genitive for vis). */
export function nounEntry(n: Noun): string {
    const gen = nounForms(n, { case: 'genitive', number: 'singular' })[0];
    return gen ? `${n.nom}, ${gen}, ${GENDER_TEXT[n.gender]}` : `${n.nom}, ${GENDER_TEXT[n.gender]}`;
}
