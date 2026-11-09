// Student-facing names for cells, e.g. "3rd pl. pluperfect passive indicative".
import type { Verb, VerbCell } from './types';
import { hasVerbCell } from './verbs';
import type { MorphWord, Cell } from './index';

const ORD = { 1: '1st', 2: '2nd', 3: '3rd' } as const;
const GENDER = { m: 'masculine', f: 'feminine', n: 'neuter' } as const;
const NUM = { singular: 'sg.', plural: 'pl.' } as const;
const tenseName = (t: string) => (t === 'futurePerfect' ? 'future perfect' : t);

/** Voice is only worth naming for verbs that have a passive finite form. */
function hasPassive(v: Verb): boolean {
    return hasVerbCell(v, { mood: 'indicative', tense: 'present', voice: 'passive', person: 3, number: 'singular' });
}

function verbLabel(v: Verb, cell: VerbCell): string {
    const voice = (c: { voice: string }) => (hasPassive(v) ? ` ${c.voice}` : '');
    switch (cell.mood) {
        case 'indicative':
        case 'subjunctive':
        case 'imperative':
            return `${ORD[cell.person]} ${NUM[cell.number]} ${tenseName(cell.tense)}${voice(cell)} ${cell.mood}`;
        case 'infinitive':
            return `${cell.tense}${voice(cell)} infinitive`;
        case 'participle':
            if (cell.tense === 'future' && cell.voice === 'passive') return 'gerundive';
            if (cell.tense === 'perfect' && (v.deponent || v.semiDeponent)) return 'perfect participle';
            return `${cell.tense} ${cell.voice} participle`;
        case 'gerund':
            return `gerund, ${cell.case}`;
    }
}

export function cellLabel(w: MorphWord, cell: Cell): string {
    switch (w.kind) {
        case 'verb':
            return verbLabel(w.verb, cell as VerbCell);
        case 'noun': {
            const c = cell as { case: string; number: string };
            return `${c.case} ${c.number}`;
        }
        case 'adjective': {
            const c = cell as { case: string; number: string; gender: 'm' | 'f' | 'n'; degree: string };
            return `${c.case} ${c.number} ${GENDER[c.gender]}${c.degree === 'positive' ? '' : `, ${c.degree}`}`;
        }
        case 'pronoun': {
            const c = cell as { case: string; number: string; gender?: 'm' | 'f' | 'n' };
            if (c.gender) return `${c.case} ${c.number} ${GENDER[c.gender]}`;
            return w.pronoun.id === 'sui' ? c.case : `${c.case} ${c.number}`;
        }
    }
}
