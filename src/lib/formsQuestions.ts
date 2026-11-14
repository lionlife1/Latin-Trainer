// Question generators for the Forms trainer: "make the form" (type-in) and "identify the form" (multiple choice).
import {
    PRONOUNS, cellFeatures, cellLabel, cellsOf, entryOf, formsOf, meaningOf, parse,
    type Adjective, type Cell, type Degree, type MorphWord, type Noun, type Pronoun, type Verb, type VerbCell, type VerbTense, type Voice,
} from './morph';
import { trainerPool } from './conjugator';
import { CORE_NOUNS } from '../content/nouns.generated';
import { CORE_ADJECTIVES } from '../content/adjectives.generated';
import { escapeHtml } from './html';
import { shuffle } from './shuffle';
import type { DrillQuestion, MCQuestion, TypeInQuestion } from './types';

export type FormsKind = 'verbs' | 'nouns' | 'adjectives' | 'pronouns';
export type FormsStyle = 'make' | 'identify';
export type VerbGroup = '1' | '2' | '3' | '3io' | '4' | 'irregular' | 'deponent';
export type MoodFilter = 'indicative' | 'subjunctive' | 'imperative' | 'infinitive' | 'participle';

export interface FormsConfig {
    kinds: FormsKind[];
    styles: FormsStyle[];
    verbGroups: VerbGroup[];
    moods: MoodFilter[];
    tenses: VerbTense[];
    voices: Voice[];
    declensions: (1 | 2 | 3 | 4 | 5)[];
    adjTypes: ('12' | '3')[];
    degrees: Degree[];
}

export const DEFAULT_FORMS_CONFIG: FormsConfig = {
    kinds: ['verbs'],
    styles: ['make', 'identify'],
    verbGroups: ['1', '2', '3', '3io', '4', 'irregular', 'deponent'],
    moods: ['indicative', 'subjunctive'],
    tenses: ['present', 'imperfect', 'future', 'perfect', 'pluperfect', 'futurePerfect'],
    voices: ['active', 'passive'],
    declensions: [1, 2, 3, 4, 5],
    adjTypes: ['12', '3'],
    degrees: ['positive'],
};

export interface FormsPools { verbs: Verb[]; nouns: Noun[]; adjectives: Adjective[]; pronouns: readonly Pronoun[] }

let defaultPools: FormsPools | undefined;
export function defaultFormsPools(): FormsPools {
    return (defaultPools ??= { verbs: trainerPool(), nouns: CORE_NOUNS, adjectives: CORE_ADJECTIVES, pronouns: PRONOUNS });
}

export function verbGroup(v: Verb): VerbGroup {
    if (v.deponent || v.semiDeponent) return 'deponent';
    if (v.irregular) return 'irregular';
    if (v.conj === 3.5) return '3io';
    return String(v.conj) as VerbGroup;
}

function verbCellFits(v: Verb, cell: VerbCell, config: FormsConfig): boolean {
    const mood: MoodFilter = cell.mood === 'gerund' ? 'participle' : cell.mood;
    if (!config.moods.includes(mood)) return false;
    if (cell.mood === 'gerund') return true; // no tense or voice
    if (!config.tenses.includes(cell.tense)) return false;
    return v.deponent || v.semiDeponent ? true : config.voices.includes(cell.voice);
}

export function candidateCells(w: MorphWord, config: FormsConfig): Cell[] {
    const cells = cellsOf(w);
    switch (w.kind) {
        case 'verb':
            if (!config.verbGroups.includes(verbGroup(w.verb))) return [];
            return cells.filter(c => verbCellFits(w.verb, c as VerbCell, config));
        case 'noun':
            return config.declensions.includes(w.noun.decl) ? cells : [];
        case 'adjective':
            return config.adjTypes.includes(w.adjective.decl) ? cells.filter(c => config.degrees.includes((c as { degree: Degree }).degree)) : [];
        case 'pronoun':
            return cells;
    }
}

const wordsOf = (kind: FormsKind, pools: FormsPools): MorphWord[] => {
    switch (kind) {
        case 'verbs': return pools.verbs.map(verb => ({ kind: 'verb', verb }));
        case 'nouns': return pools.nouns.map(noun => ({ kind: 'noun', noun }));
        case 'adjectives': return pools.adjectives.map(adjective => ({ kind: 'adjective', adjective }));
        case 'pronouns': return pools.pronouns.map(pronoun => ({ kind: 'pronoun', pronoun }));
    }
};

const eligibleCache = new WeakMap<FormsConfig, WeakMap<FormsPools, Map<FormsKind, MorphWord[]>>>();

export function eligibleWords(kind: FormsKind, config: FormsConfig, pools: FormsPools): MorphWord[] {
    let byPools = eligibleCache.get(config);
    if (!byPools) eligibleCache.set(config, (byPools = new WeakMap()));
    let byKind = byPools.get(pools);
    if (!byKind) byPools.set(pools, (byKind = new Map()));
    let words = byKind.get(kind);
    if (!words) byKind.set(kind, (words = wordsOf(kind, pools).filter(w => candidateCells(w, config).length > 0)));
    return words;
}

export function formsConfigHasQuestions(config: FormsConfig, pools: FormsPools = defaultFormsPools()): boolean {
    return config.styles.length > 0 && config.kinds.some(k => eligibleWords(k, config, pools).length > 0);
}

function distance(a: Cell, b: Cell): number {
    const fa = cellFeatures(a), fb = cellFeatures(b);
    let d = 0;
    for (const k of new Set([...Object.keys(fa), ...Object.keys(fb)])) if (fa[k] !== fb[k]) d++;
    return d;
}

/** Up to three wrong cells, nearest in features first, never one a student could defend as right. */
export function pickDistractorCells(w: MorphWord, correct: Cell, valid: Cell[], rng: () => number): Cell[] {
    const banned = new Set([correct, ...valid].map(c => cellLabel(w, c)));
    const ranked = shuffle(cellsOf(w), rng)
        .filter(c => !banned.has(cellLabel(w, c)))
        .map(c => ({ c, d: distance(c, correct) }))
        .sort((x, y) => x.d - y.d); // stable, so the shuffle breaks ties
    const seen = new Set<string>();
    const out: Cell[] = [];
    for (const { c } of ranked) {
        const label = cellLabel(w, c);
        if (seen.has(label)) continue;
        seen.add(label);
        out.push(c);
        if (out.length === 3) break;
    }
    return out;
}

/** `amatus est` also accepts `amata est` and `amatum est`; the prompt only ever shows the masculine. */
function genderVariants(form: string): string[] {
    const [first, ...rest] = form.split(' ');
    if (!rest.length || form.endsWith(' iri')) return [];
    const tail = rest.join(' ');
    if (first.endsWith('us')) return [`${first.slice(0, -2)}a ${tail}`, `${first.slice(0, -2)}um ${tail}`];
    if (first.endsWith('i')) return [`${first.slice(0, -1)}ae ${tail}`, `${first.slice(0, -1)}a ${tail}`];
    return [];
}

function takesGender(w: MorphWord, cell: Cell): boolean {
    if (w.kind !== 'verb') return false;
    const c = cell as VerbCell;
    if (c.mood === 'indicative' || c.mood === 'subjunctive' || c.mood === 'imperative') return true;
    return c.mood === 'infinitive' && (c.tense === 'perfect' || c.tense === 'future');
}

const nextId = (rng: () => number) => `forms_${Date.now()}_${Math.floor(rng() * 1e9)}`;

/** Every form a student may type for a cell: the engine's forms, plus feminine and neuter participle variants. */
export function acceptedForms(w: MorphWord, cell: Cell): string[] {
    const forms = formsOf(w, cell);
    const answers = [...forms];
    if (takesGender(w, cell)) for (const f of forms) for (const v of genderVariants(f)) if (!answers.includes(v)) answers.push(v);
    return answers;
}

export function makeFormQuestion(w: MorphWord, cell: Cell, rng: () => number): TypeInQuestion {
    const forms = formsOf(w, cell);
    const answers = acceptedForms(w, cell);
    const variants = forms.slice(1);
    return {
        id: nextId(rng),
        type: 'typein',
        badge: 'MAKE THE FORM',
        prompt: `<span class='latin-word' style='font-size: 1.4em;'>${escapeHtml(entryOf(w))}</span><br><span style='font-size: 0.8em; color: var(--text-secondary);'>${cellLabel(w, cell)}</span>`,
        hint: escapeHtml(meaningOf(w)),
        answers,
        explanation: `The form is ${answers[0]}.${variants.length ? ` Also accepted: ${variants.join(', ')}.` : ''}`,
    };
}

export function identifyFormQuestion(w: MorphWord, cell: Cell, rng: () => number): MCQuestion | null {
    const form = formsOf(w, cell)[0];
    if (!form) return null;
    const valid = parse(form, [w]).map(a => a.cell);
    const distractors = pickDistractorCells(w, cell, valid, rng);
    if (distractors.length < 3) return null;
    const correct = cellLabel(w, cell);
    const labels = [...new Set(valid.map(c => cellLabel(w, c)))];
    return {
        id: nextId(rng),
        type: 'mc',
        badge: 'IDENTIFY THE FORM',
        prompt: `<span class='latin-word' style='font-size: 1.4em;'>${escapeHtml(form)}</span><br><span style='font-size: 0.8em; color: var(--text-secondary);'>from ${escapeHtml(entryOf(w))}</span>`,
        hint: escapeHtml(meaningOf(w)),
        choices: [correct, ...distractors.map(c => cellLabel(w, c))],
        correct,
        explanation: labels.length > 1 ? `${form} can be any of these: ${labels.join('; ')}.` : `${form}: ${correct}.`,
    };
}

export function generateFormsQuestion(config: FormsConfig, rng: () => number = Math.random, pools: FormsPools = defaultFormsPools()): DrillQuestion | null {
    if (!config.styles.length) return null;
    const kinds = config.kinds.filter(k => eligibleWords(k, config, pools).length > 0);
    if (!kinds.length) return null;
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
    const draw = (style?: FormsStyle) => {
        const word = pick(eligibleWords(pick(kinds), config, pools));
        const cell = pick(candidateCells(word, config));
        return { word, cell, style: style ?? pick(config.styles) };
    };
    for (let i = 0; i < 20; i++) {
        const { word, cell, style } = draw();
        if (style === 'make') return makeFormQuestion(word, cell, rng);
        const q = identifyFormQuestion(word, cell, rng);
        if (q) return q;
    }
    const { word, cell } = draw('make');
    return makeFormQuestion(word, cell, rng);
}

export function buildFormsSession(config: FormsConfig, count: number, rng: () => number = Math.random, pools: FormsPools = defaultFormsPools()): DrillQuestion[] {
    const out: DrillQuestion[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < count * 5 && out.length < count; i++) {
        const q = generateFormsQuestion(config, rng, pools);
        if (!q) break;
        const key = `${q.type}|${q.prompt}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(q);
    }
    return out;
}
