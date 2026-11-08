export type Voice = 'active' | 'passive';
export type GrammaticalNumber = 'singular' | 'plural';
export type Person = 1 | 2 | 3;
export type VerbTense = 'present' | 'imperfect' | 'future' | 'perfect' | 'pluperfect' | 'futurePerfect';
export type Case = 'nominative' | 'genitive' | 'dative' | 'accusative' | 'ablative' | 'vocative';
export type Gender = 'm' | 'f' | 'n';
export type Degree = 'positive' | 'comparative' | 'superlative';

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

export type VerbCell =
    | { mood: 'indicative'; tense: VerbTense; voice: Voice; person: Person; number: GrammaticalNumber }
    | { mood: 'subjunctive'; tense: 'present' | 'imperfect' | 'perfect' | 'pluperfect'; voice: Voice; person: Person; number: GrammaticalNumber }
    | { mood: 'imperative'; tense: 'present' | 'future'; voice: Voice; person: 2 | 3; number: GrammaticalNumber }
    | { mood: 'infinitive'; tense: 'present' | 'perfect' | 'future'; voice: Voice }
    | { mood: 'participle'; tense: 'present' | 'perfect' | 'future'; voice: Voice }
    | { mood: 'gerund'; case: 'genitive' | 'dative' | 'accusative' | 'ablative' };
