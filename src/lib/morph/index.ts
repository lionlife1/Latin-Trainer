// Generic word API over verbs, nouns, adjectives and pronouns.
import type { Verb } from './types';
import { adjectiveCells, adjectiveEntry, adjectiveForms, type Adjective, type AdjectiveCell } from './adjectives';
import { nounCells, nounEntry, nounForms, type Noun, type NounCell } from './nouns';
import { pronounCells, pronounForms, type Pronoun, type PronounCell } from './pronouns';
import { principalParts, verbCells, verbForms } from './verbs';
import type { VerbCell } from './types';

export * from './types';
export * from './verbs';
export * from './nouns';
export * from './adjectives';
export * from './pronouns';
export * from './labels';
export * from './parse';

export type MorphWord =
    | { kind: 'verb'; verb: Verb }
    | { kind: 'noun'; noun: Noun }
    | { kind: 'adjective'; adjective: Adjective }
    | { kind: 'pronoun'; pronoun: Pronoun };
export type Cell = VerbCell | NounCell | AdjectiveCell | PronounCell;
export interface Analysis { word: MorphWord; cell: Cell }

export function cellsOf(w: MorphWord): Cell[] {
    switch (w.kind) {
        case 'verb': return verbCells(w.verb);
        case 'noun': return nounCells(w.noun);
        case 'adjective': return adjectiveCells(w.adjective);
        case 'pronoun': return pronounCells(w.pronoun);
    }
}

export function formsOf(w: MorphWord, cell: Cell): string[] {
    switch (w.kind) {
        case 'verb': return verbForms(w.verb, cell as VerbCell);
        case 'noun': return nounForms(w.noun, cell as NounCell);
        case 'adjective': return adjectiveForms(w.adjective, cell as AdjectiveCell);
        case 'pronoun': return pronounForms(w.pronoun, cell as PronounCell);
    }
}

export function entryOf(w: MorphWord): string {
    switch (w.kind) {
        case 'verb': return principalParts(w.verb);
        case 'noun': return nounEntry(w.noun);
        case 'adjective': return adjectiveEntry(w.adjective);
        case 'pronoun': return w.pronoun.entry;
    }
}

export function meaningOf(w: MorphWord): string {
    switch (w.kind) {
        case 'verb': return w.verb.trans;
        case 'noun': return w.noun.trans;
        case 'adjective': return w.adjective.trans;
        case 'pronoun': return w.pronoun.trans;
    }
}

/** Feature map used for equality and for "differs in one feature". Absent features are omitted. */
export function cellFeatures(cell: Cell): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(cell)) if (v !== undefined) out[k] = String(v);
    return out;
}

export function cellKey(cell: Cell): string {
    return Object.entries(cellFeatures(cell)).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('|');
}
