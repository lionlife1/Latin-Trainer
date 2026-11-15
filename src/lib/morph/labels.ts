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

/** The same information as cellLabel, one captioned value per feature, in a fixed order. */
export function cellParts(w: MorphWord, cell: Cell): { key: string; value: string }[] {
    switch (w.kind) {
        case 'verb': {
            const v = w.verb, c = cell as VerbCell;
            const voice = (x: { voice: string }) => (hasPassive(v) ? [{ key: 'Voice', value: x.voice }] : []);
            switch (c.mood) {
                case 'indicative':
                case 'subjunctive':
                case 'imperative':
                    return [
                        { key: 'Person', value: `${ORD[c.person]} ${NUM[c.number]}` },
                        { key: 'Tense', value: tenseName(c.tense) },
                        ...voice(c),
                        { key: 'Mood', value: c.mood },
                    ];
                case 'infinitive':
                    return [{ key: 'Tense', value: c.tense }, ...voice(c), { key: 'Mood', value: 'infinitive' }];
                case 'participle':
                    if (c.tense === 'future' && c.voice === 'passive') return [{ key: 'Form', value: 'gerundive' }];
                    if (c.tense === 'perfect' && (v.deponent || v.semiDeponent)) return [{ key: 'Tense', value: 'perfect' }, { key: 'Mood', value: 'participle' }];
                    return [{ key: 'Tense', value: c.tense }, { key: 'Voice', value: c.voice }, { key: 'Mood', value: 'participle' }];
                case 'gerund':
                    return [{ key: 'Form', value: 'gerund' }, { key: 'Case', value: c.case }];
            }
        }
        case 'noun': {
            const c = cell as { case: string; number: string };
            return [{ key: 'Case', value: c.case }, { key: 'Number', value: c.number }];
        }
        case 'adjective': {
            const c = cell as { case: string; number: string; gender: 'm' | 'f' | 'n'; degree: string };
            const parts = [{ key: 'Case', value: c.case }, { key: 'Number', value: c.number }, { key: 'Gender', value: GENDER[c.gender] }];
            return c.degree === 'positive' ? parts : [...parts, { key: 'Degree', value: c.degree }];
        }
        case 'pronoun': {
            const c = cell as { case: string; number: string; gender?: 'm' | 'f' | 'n' };
            const parts = [{ key: 'Case', value: c.case }];
            if (c.gender) return [...parts, { key: 'Number', value: c.number }, { key: 'Gender', value: GENDER[c.gender] }];
            return w.pronoun.id === 'sui' ? parts : [...parts, { key: 'Number', value: c.number }];
        }
    }
}
