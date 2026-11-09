// Find which cells of which words produce a given form.
import { normalize } from '../grading';
import { cellsOf, formsOf, type Analysis, type MorphWord } from './index';

export function parse(form: string, words: MorphWord[]): Analysis[] {
    const target = normalize(form);
    const out: Analysis[] = [];
    for (const word of words) {
        for (const cell of cellsOf(word)) {
            if (formsOf(word, cell).some(f => normalize(f) === target)) out.push({ word, cell });
        }
    }
    return out;
}
