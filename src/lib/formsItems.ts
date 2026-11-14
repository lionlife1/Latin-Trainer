// Generators for forms assignments: synopsis, paradigm and principal-parts grids, parse items and make-the-form items.
import {
    cellFeatures, cellKey, cellLabel, cellsOf, entryOf, formsOf, hasVerbCell, meaningOf, parse, principalParts, verbCells,
    type Case, type Cell, type Degree, type Gender, type MorphWord, type Verb,
    type VerbCell, type VerbTense, type Voice,
} from './morph';
import {
    acceptedForms, candidateCells, defaultFormsPools, eligibleWords, makeFormQuestion,
    type FormsConfig, type FormsKind, type FormsPools,
} from './formsQuestions';
import { normalize } from './grading';
import { escapeHtml } from './html';
import { shuffle } from './shuffle';
import type { GridCell, GridQuestion, GridRow, ParseField, ParseQuestion } from './types';
import type { PoolItem } from './vocab';

export type PersonNumber = { person: 1 | 2 | 3; number: 'singular' | 'plural' };
export type SynopsisPart = 'indicative' | 'subjunctive' | 'imperative' | 'infinitive' | 'participle';
export type GivenCells = 'none' | 'first' | number; // number = that many random cells given

export type FormsAssignmentConfig =
    | { kind: 'synopsis'; words: MorphWord[]; personNumber: PersonNumber | 'all'; parts: SynopsisPart[]; giveFirst: boolean }
    | {
        kind: 'paradigm'; words: MorphWord[]; tenses: VerbTense[]; moods: ('indicative' | 'subjunctive')[]; voices: Voice[];
        degrees: Degree[]; vocative: boolean; given: GivenCells;
    }
    | { kind: 'principalParts'; words: MorphWord[] }
    | { kind: 'parse' | 'make'; filter: FormsConfig; words?: MorphWord[]; count: number };

/** Stable id for a word, used in item keys: kind + normalized dictionary entry. */
export function wordKey(w: MorphWord): string {
    return `${w.kind}:${normalize(entryOf(w))}`;
}

const LATIN = (s: string) => `<span class='latin-word' style='font-size: 1.4em;'>${escapeHtml(s)}</span>`;
const SMALL = (s: string) => `<span style='font-size: 0.8em; color: var(--text-secondary);'>${escapeHtml(s)}</span>`;
const promptOf = (first: string, second: string) => `${LATIN(first)}<br>${SMALL(second)}`;
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const tenseName = (t: string) => (t === 'futurePerfect' ? 'future perfect' : t);

const hasPassive = (v: Verb) =>
    hasVerbCell(v, { mood: 'indicative', tense: 'present', voice: 'passive', person: 3, number: 'singular' });

interface GridSpec { columns: string[]; rows: { label: string; cells: (Cell | null)[] }[] }

/** Builds a grid item: key = accepted forms for every non-given cell. `given(cell)` returns the shown text or undefined. */
function gridItem(
    w: MorphWord, item_key: string, badge: string, prompt: string, spec: GridSpec,
    givenFor: (cell: Cell, index: number) => boolean,
): PoolItem | null {
    const rows: GridRow[] = [];
    const key: Record<string, string[]> = {};
    let index = 0;
    for (const r of spec.rows) {
        if (r.cells.every(c => c === null)) continue;
        const cells: (GridCell | null)[] = r.cells.map(c => {
            if (!c) return null;
            const id = cellKey(c);
            if (givenFor(c, index++)) return { id, given: formsOf(w, c)[0] };
            key[id] = acceptedForms(w, c);
            return { id };
        });
        rows.push({ label: r.label, cells });
    }
    const points = Object.keys(key).length;
    if (!rows.length || points === 0) return null;
    const question: GridQuestion = {
        id: item_key, type: 'grid', badge, prompt, hint: escapeHtml(meaningOf(w)), columns: spec.columns, rows, key,
    };
    return { item_key, question, points };
}

// ---- synopsis ----

const ALL_PN: PersonNumber[] = [1, 2, 3].flatMap(person =>
    (['singular', 'plural'] as const).map(number => ({ person: person as 1 | 2 | 3, number })));
const ORD = { 1: '1st', 2: '2nd', 3: '3rd' } as const;

const TENSE_ROWS: { tense: VerbTense; label: string }[] = [
    { tense: 'present', label: 'Present' }, { tense: 'imperfect', label: 'Imperfect' }, { tense: 'future', label: 'Future' },
    { tense: 'perfect', label: 'Perfect' }, { tense: 'pluperfect', label: 'Pluperfect' }, { tense: 'futurePerfect', label: 'Future perfect' },
];
const SUBJ_ROWS = TENSE_ROWS.filter(t => ['present', 'imperfect', 'perfect', 'pluperfect'].includes(t.tense));
const NONFINITE: { tense: 'present' | 'perfect' | 'future'; name: string }[] = [
    { tense: 'present', name: 'Present' }, { tense: 'perfect', name: 'Perfect' }, { tense: 'future', name: 'Future' },
];

function synopsisGrid(w: MorphWord & { kind: 'verb' }, pn: PersonNumber, parts: SynopsisPart[]): PoolItem | null {
    const v = w.verb;
    const deponent = !!v.deponent;
    const voices: Voice[] = hasPassive(v) ? ['active', 'passive'] : ['active'];
    const columns = deponent ? ['Forms'] : voices.map(capital);
    const cellOrNull = (c: VerbCell): Cell | null => (hasVerbCell(v, c) ? c : null);
    const rowOf = (label: string, make: (voice: Voice) => VerbCell) => ({ label, cells: voices.map(vo => cellOrNull(make(vo))) });
    const rows: GridSpec['rows'] = [];
    if (parts.includes('indicative')) {
        for (const t of TENSE_ROWS) rows.push(rowOf(t.label, voice => ({ mood: 'indicative', tense: t.tense, voice, person: pn.person, number: pn.number })));
    }
    if (parts.includes('subjunctive')) {
        for (const t of SUBJ_ROWS) {
            rows.push(rowOf(`${t.label} subjunctive`, voice => ({
                mood: 'subjunctive', tense: t.tense as 'present' | 'imperfect' | 'perfect' | 'pluperfect', voice, person: pn.person, number: pn.number,
            })));
        }
    }
    if (parts.includes('imperative')) {
        rows.push(rowOf('Imperative', voice => ({ mood: 'imperative', tense: 'present', voice, person: 2, number: pn.number })));
    }
    if (parts.includes('infinitive')) {
        for (const t of NONFINITE) rows.push(rowOf(`${t.name} infinitive`, voice => ({ mood: 'infinitive', tense: t.tense, voice })));
    }
    if (parts.includes('participle')) {
        for (const t of NONFINITE) rows.push(rowOf(`${t.name} participle`, voice => ({ mood: 'participle', tense: t.tense, voice })));
    }
    const prompt = promptOf(entryOf(w), `Synopsis: ${ORD[pn.person]} person ${pn.number}`);
    const item_key = `syn|${wordKey(w)}|${pn.person}|${pn.number}`;
    return gridItem(w, item_key, 'SYNOPSIS', prompt, { columns, rows }, () => false);
}

function buildSynopsis(c: Extract<FormsAssignmentConfig, { kind: 'synopsis' }>): PoolItem[] {
    const out: PoolItem[] = [];
    const pns = c.personNumber === 'all' ? ALL_PN : [c.personNumber];
    for (const w of c.words) {
        if (w.kind !== 'verb') continue;
        for (const pn of pns) {
            const item = synopsisGrid(w, pn, c.parts);
            if (!item) continue;
            if (c.giveFirst) {
                const q = item.question as GridQuestion;
                const first = q.rows.flatMap(r => r.cells).find(cell => cell && cell.given === undefined);
                if (first && Object.keys(q.key).length > 1) {
                    first.given = q.key[first.id][0];
                    delete q.key[first.id];
                    item.points = Object.keys(q.key).length;
                }
            }
            out.push(item);
        }
    }
    return out;
}

// ---- paradigm ----

const CASE_ORDER: Case[] = ['nominative', 'genitive', 'dative', 'accusative', 'ablative', 'vocative'];
const GENDER_HEAD: Record<Gender, string> = { m: 'M', f: 'F', n: 'N' };
const NUM_HEAD = { singular: 'sg.', plural: 'pl.' } as const;

/** Which cells to show as given: none, the first, or n random ones (never all). */
function givenSet(total: number, given: GivenCells, rng: () => number): Set<number> {
    if (given === 'none' || total < 2) return new Set();
    if (given === 'first') return new Set([0]);
    const n = Math.max(0, Math.min(Math.floor(given), total - 1));
    return new Set(shuffle([...Array(total).keys()], rng).slice(0, n));
}

function paradigmItem(w: MorphWord, item_key: string, badge: string, second: string, spec: GridSpec, given: GivenCells, rng: () => number): PoolItem | null {
    const total = spec.rows.reduce((n, r) => n + r.cells.filter(Boolean).length, 0);
    const chosen = givenSet(total, given, rng);
    return gridItem(w, item_key, badge, promptOf(entryOf(w), second), spec, (_c, i) => chosen.has(i));
}

/** Rows are cases; columns are (number, optional gender) pairs found in the word's cells. */
function caseGrid(cells: Cell[], columnsOf: { head: string; match: (c: Record<string, string>) => boolean }[], vocative: boolean): GridSpec {
    const cases = CASE_ORDER.filter(cs => vocative || cs !== 'vocative');
    const rows = cases.map(cs => ({
        label: capital(cs),
        cells: columnsOf.map(col => cells.find(c => { const f = cellFeatures(c); return f.case === cs && col.match(f); }) ?? null),
    }));
    return { columns: columnsOf.map(c => c.head), rows };
}

function buildParadigm(c: Extract<FormsAssignmentConfig, { kind: 'paradigm' }>, rng: () => number): PoolItem[] {
    const out: PoolItem[] = [];
    const sgPl = [
        { head: 'Singular', match: (f: Record<string, string>) => f.number === 'singular' },
        { head: 'Plural', match: (f: Record<string, string>) => f.number === 'plural' },
    ];
    for (const w of c.words) {
        const wk = wordKey(w);
        if (w.kind === 'verb') {
            const cells = verbCells(w.verb);
            const passive = hasPassive(w.verb);
            for (const mood of c.moods) {
                for (const t of TENSE_ROWS.filter(r => c.tenses.includes(r.tense))) {
                    for (const voice of c.voices) {
                        const group = cells.filter(x => x.mood === mood && x.tense === t.tense && x.voice === voice);
                        if (!group.length) continue;
                        const at = (person: number, number: string) =>
                            group.find(x => (x as { person: number }).person === person && (x as { number: string }).number === number) ?? null;
                        const spec: GridSpec = {
                            columns: ['Singular', 'Plural'],
                            rows: ([1, 2, 3] as const).map(p => ({ label: ORD[p], cells: [at(p, 'singular'), at(p, 'plural')] })),
                        };
                        const second = capital(`${tenseName(t.tense)}${passive ? ` ${voice}` : ''} ${mood}`);
                        const it = paradigmItem(w, `par|${wk}|${mood}|${t.tense}|${voice}`, 'CONJUGATION', second, spec, c.given, rng);
                        if (it) out.push(it);
                    }
                }
            }
        } else if (w.kind === 'noun') {
            const it = paradigmItem(w, `par|${wk}`, 'DECLENSION', 'Declension', caseGrid(cellsOf(w), sgPl, c.vocative), c.given, rng);
            if (it) out.push(it);
        } else if (w.kind === 'adjective') {
            for (const degree of c.degrees) {
                const cells = cellsOf(w).filter(x => (x as { degree: Degree }).degree === degree);
                if (!cells.length) continue;
                const cols = (['singular', 'plural'] as const).flatMap(number => (['m', 'f', 'n'] as const).map(g => ({
                    head: `${GENDER_HEAD[g]} ${NUM_HEAD[number]}`,
                    match: (f: Record<string, string>) => f.number === number && f.gender === g,
                })));
                const second = degree === 'positive' ? 'Declension' : `Declension, ${degree}`;
                const it = paradigmItem(w, `par|${wk}|${degree}`, 'DECLENSION', second, caseGrid(cells, cols, c.vocative), c.given, rng);
                if (it) out.push(it);
            }
        } else {
            const cells = cellsOf(w);
            const seen = new Set<string>();
            const cols: { head: string; match: (f: Record<string, string>) => boolean }[] = [];
            for (const x of cells) {
                const f = cellFeatures(x);
                const id = `${f.number}|${f.gender ?? ''}`;
                if (seen.has(id)) continue;
                seen.add(id);
                cols.push({
                    head: f.gender ? `${GENDER_HEAD[f.gender as Gender]} ${NUM_HEAD[f.number as 'singular' | 'plural']}` : capital(f.number),
                    match: g => g.number === f.number && (g.gender ?? '') === (f.gender ?? ''),
                });
            }
            const it = paradigmItem(w, `par|${wk}`, 'DECLENSION', 'Declension', caseGrid(cells, cols, false), c.given, rng);
            if (it) out.push(it);
        }
    }
    return out;
}

// ---- principal parts ----

function buildPrincipalParts(words: MorphWord[]): PoolItem[] {
    const out: PoolItem[] = [];
    for (const w of words) {
        if (w.kind !== 'verb') continue;
        const parts = principalParts(w.verb).split(', ');
        if (parts.length < 2) continue;
        const ids = parts.map((_, i) => `pp${i + 1}`);
        const key: Record<string, string[]> = {};
        parts.forEach((p, i) => { if (i > 0) key[ids[i]] = [p]; });
        const item_key = `pp|${wordKey(w)}`;
        const question: GridQuestion = {
            id: item_key, type: 'grid', badge: 'PRINCIPAL PARTS',
            prompt: promptOf(parts[0], 'Principal parts'),
            hint: escapeHtml(meaningOf(w)),
            columns: parts.map((_, i) => ['1st', '2nd', '3rd', '4th'][i] ?? `${i + 1}th`),
            rows: [{ label: 'Principal parts', cells: parts.map((p, i) => (i === 0 ? { id: ids[0], given: p } : { id: ids[i] })) }],
            key,
        };
        out.push({ item_key, question, points: parts.length - 1 });
    }
    return out;
}

// ---- parse and make ----

const FINITE = new Set(['indicative', 'subjunctive', 'imperative']);

const PARSE_FIELDS: ParseField[] = [
    { id: 'person', label: 'Person', options: [['1', '1st'], ['2', '2nd'], ['3', '3rd']].map(([value, label]) => ({ value, label })) },
    { id: 'number', label: 'Number', options: ['singular', 'plural'].map(v => ({ value: v, label: v })) },
    {
        id: 'tense', label: 'Tense',
        options: ['present', 'imperfect', 'future', 'perfect', 'pluperfect', 'futurePerfect'].map(v => ({ value: v, label: tenseName(v) })),
    },
    { id: 'mood', label: 'Mood', options: ['indicative', 'subjunctive', 'imperative'].map(v => ({ value: v, label: v })) },
    { id: 'voice', label: 'Voice', options: ['active', 'passive'].map(v => ({ value: v, label: v })) },
    { id: 'case', label: 'Case', options: CASE_ORDER.map(v => ({ value: v, label: v })) },
    { id: 'gender', label: 'Gender', options: [['m', 'masculine'], ['f', 'feminine'], ['n', 'neuter']].map(([value, label]) => ({ value, label })) },
    { id: 'degree', label: 'Degree', options: ['positive', 'comparative', 'superlative'].map(v => ({ value: v, label: v })) },
];

function fieldIds(w: MorphWord, cell: Cell): string[] {
    const f = cellFeatures(cell);
    return PARSE_FIELDS.map(p => p.id).filter(id => id in f && !(id === 'voice' && w.kind === 'verb' && !hasPassive(w.verb)));
}

function parseItem(w: MorphWord, cell: Cell): PoolItem {
    const ids = fieldIds(w, cell);
    const restrict = (c: Cell) => Object.fromEntries(ids.map(id => [id, cellFeatures(c)[id]]));
    const form = formsOf(w, cell)[0];
    const sameFields = (c: Cell) => {
        const got = fieldIds(w, c);
        return got.length === ids.length && got.every((id, i) => id === ids[i]);
    };
    const analyses = parse(form, [w]).filter(a => sameFields(a.cell));
    const seen = new Set<string>();
    const key: Record<string, string>[] = [];
    const labels: string[] = [];
    for (const c of [cell, ...analyses.map(a => a.cell)]) {
        const k = restrict(c);
        const sig = JSON.stringify(k);
        if (seen.has(sig)) continue;
        seen.add(sig);
        key.push(k);
        labels.push(cellLabel(w, c));
    }
    const uniqueLabels = [...new Set(labels)];
    const item_key = `parse|${wordKey(w)}|${normalize(form)}`;
    const question: ParseQuestion = {
        id: item_key, type: 'parse', badge: 'PARSE',
        prompt: promptOf(form, `from ${entryOf(w)}`),
        hint: escapeHtml(meaningOf(w)),
        explanation: uniqueLabels.length > 1 ? `${form} can be any of these: ${uniqueLabels.join('; ')}.` : `${form}: ${uniqueLabels[0]}.`,
        fields: ids.map(id => PARSE_FIELDS.find(p => p.id === id)!),
        key,
    };
    return { item_key, question, points: 1 };
}

function makeItem(w: MorphWord, cell: Cell, rng: () => number): PoolItem {
    const item_key = `make|${wordKey(w)}|${cellKey(cell)}`;
    return { item_key, question: { ...makeFormQuestion(w, cell, rng), id: item_key }, points: 1 };
}

/** Parse items need finite verb cells (their fields are person, number, tense, mood, voice); make items take any cell. */
function drawCells(w: MorphWord, filter: FormsConfig, kind: 'parse' | 'make'): Cell[] {
    const cells = candidateCells(w, filter);
    return kind === 'parse' && w.kind === 'verb' ? cells.filter(c => FINITE.has((c as VerbCell).mood)) : cells;
}

function buildDrawn(c: Extract<FormsAssignmentConfig, { kind: 'parse' | 'make' }>, rng: () => number, pools: FormsPools): PoolItem[] {
    const target = Math.max(0, c.count) * 3;
    const out: PoolItem[] = [];
    const seen = new Set<string>();
    const take = (w: MorphWord, cell: Cell): void => {
        const form = formsOf(w, cell)[0];
        if (!form) return;
        const dedupe = c.kind === 'parse' ? `${wordKey(w)}|${normalize(form)}` : `${wordKey(w)}|${cellKey(cell)}`;
        if (seen.has(dedupe)) return;
        seen.add(dedupe);
        out.push(c.kind === 'parse' ? parseItem(w, cell) : makeItem(w, cell, rng));
    };
    if (c.words) {
        const pairs = c.words.flatMap(w => drawCells(w, c.filter, c.kind).map(cell => ({ w, cell })));
        for (const { w, cell } of shuffle(pairs, rng)) {
            if (out.length >= target) break;
            take(w, cell);
        }
    } else {
        const kinds = c.filter.kinds.filter((k: FormsKind) => eligibleWords(k, c.filter, pools).some(w => drawCells(w, c.filter, c.kind).length > 0));
        const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
        for (let i = 0; kinds.length && i < target * 20 && out.length < target; i++) {
            const w = pick(eligibleWords(pick(kinds), c.filter, pools));
            const cells = drawCells(w, c.filter, c.kind);
            if (cells.length) take(w, pick(cells));
        }
    }
    return out;
}

export function buildFormsPool(config: FormsAssignmentConfig, rng: () => number, pools: FormsPools = defaultFormsPools()): PoolItem[] {
    let items: PoolItem[];
    switch (config.kind) {
        case 'synopsis': items = buildSynopsis(config); break;
        case 'paradigm': items = buildParadigm(config, rng); break;
        case 'principalParts': items = buildPrincipalParts(config.words); break;
        default: items = buildDrawn(config, rng, pools);
    }
    const seen = new Set<string>();
    return items.filter(i => !seen.has(i.item_key) && !!seen.add(i.item_key));
}
