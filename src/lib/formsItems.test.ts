import { describe, it, expect } from 'vitest';
import { buildFormsPool, wordKey, type FormsAssignmentConfig } from './formsItems';
import { DEFAULT_FORMS_CONFIG, defaultFormsPools } from './formsQuestions';
import { cellKey, cellsOf, type Cell, type MorphWord } from './morph';
import { grade } from './grading';
import { seededRng } from './shuffle';
import type { GridQuestion, ParseQuestion } from './types';

const pools = defaultFormsPools();
const verbW = (inf: string): MorphWord => ({ kind: 'verb', verb: pools.verbs.find(v => v.inf === inf)! });
const moneo = verbW('monere');
const hortor = verbW('hortari');
const puella: MorphWord = { kind: 'noun', noun: pools.nouns.find(n => n.nom === 'puella')! };
const bonus: MorphWord = { kind: 'adjective', adjective: pools.adjectives.find(a => a.nom === 'bonus')! };
const hic: MorphWord = { kind: 'pronoun', pronoun: pools.pronouns.find(p => p.id === 'hic')! };
const rng = () => seededRng(7);

const synopsis = (words: MorphWord[], extra: Partial<Extract<FormsAssignmentConfig, { kind: 'synopsis' }>> = {}) =>
    buildFormsPool({
        kind: 'synopsis', words, personNumber: { person: 3, number: 'plural' }, parts: ['indicative', 'subjunctive'], giveFirst: false, ...extra,
    }, rng());
const grid = (items: ReturnType<typeof synopsis>, i = 0) => items[i].question as GridQuestion;
const cellIds = (q: GridQuestion, wantGiven: boolean) =>
    q.rows.flatMap(r => r.cells).filter(c => c && (c.given !== undefined) === wantGiven).map(c => c!.id);

describe('synopsis', () => {
    it('moneo 3rd plural: 10 rows x 2 columns, 20 key cells', () => {
        const items = synopsis([moneo]);
        expect(items).toHaveLength(1);
        const q = grid(items);
        expect(q.columns).toEqual(['Active', 'Passive']);
        expect(q.rows).toHaveLength(10);
        expect(q.rows[0].label).toBe('Present');
        expect(q.rows[6].label).toBe('Present subjunctive');
        expect(Object.keys(q.key)).toHaveLength(20);
        expect(items[0].points).toBe(20);
        expect(items[0].item_key).toBe(`syn|${wordKey(moneo)}|3|plural`);
        expect(q.badge).toBe('SYNOPSIS');
        const plpf = cellKey({ mood: 'indicative', tense: 'pluperfect', voice: 'passive', person: 3, number: 'plural' });
        expect(q.key[plpf]).toContain('moniti erant');
        expect(q.key[plpf]).toContain('monitae erant');
    });
    it('a deponent has one column', () => {
        const q = grid(synopsis([hortor]));
        expect(q.columns).toEqual(['Forms']);
        expect(q.rows.every(r => r.cells.length === 1)).toBe(true);
    });
    it('giveFirst moves exactly one cell from key to given', () => {
        const plain = grid(synopsis([moneo]));
        const given = synopsis([moneo], { giveFirst: true });
        const q = grid(given);
        expect(cellIds(q, true)).toHaveLength(1);
        expect(Object.keys(q.key)).toHaveLength(Object.keys(plain.key).length - 1);
        expect(given[0].points).toBe(19);
    });
    it("'all' gives six grids with distinct keys, and non-verbs are skipped", () => {
        const items = synopsis([moneo, puella], { personNumber: 'all' });
        expect(items).toHaveLength(6);
        expect(new Set(items.map(i => i.item_key)).size).toBe(6);
    });
    it('drops rows without any form and uses null for missing cells', () => {
        const items = synopsis([moneo], { parts: ['imperative', 'participle'] });
        const q = grid(items);
        expect(q.rows.map(r => r.label)).toContain('Imperative');
        expect(q.rows.flatMap(r => r.cells).some(c => c === null)).toBe(true);
    });
});

describe('paradigm', () => {
    const paradigm = (words: MorphWord[], extra: Partial<Extract<FormsAssignmentConfig, { kind: 'paradigm' }>> = {}) =>
        buildFormsPool({
            kind: 'paradigm', words, tenses: ['present'], moods: ['indicative'], voices: ['active'], degrees: ['positive'],
            vocative: false, given: 'none', ...extra,
        }, rng());
    it('puella without vocative is 5 x 2, genitive singular key is puellae', () => {
        const [item] = paradigm([puella]);
        const q = item.question as GridQuestion;
        expect(q.rows).toHaveLength(5);
        expect(q.columns).toEqual(['Singular', 'Plural']);
        expect(q.key[cellKey({ case: 'genitive', number: 'singular' } as Cell)]).toEqual(['puellae']);
        expect(item.points).toBe(10);
        expect(q.badge).toBe('DECLENSION');
        expect((paradigm([puella], { vocative: true })[0].question as GridQuestion).rows).toHaveLength(6);
    });
    it('an adjective grid has six columns', () => {
        const [item] = paradigm([bonus]);
        expect((item.question as GridQuestion).columns).toEqual(['M sg.', 'F sg.', 'N sg.', 'M pl.', 'F pl.', 'N pl.']);
    });
    it('a verb gives one grid per mood, tense and voice it has', () => {
        const items = paradigm([moneo], { tenses: ['present', 'imperfect'], moods: ['indicative', 'subjunctive'], voices: ['active', 'passive'] });
        expect(items).toHaveLength(8);
        const q = items[0].question as GridQuestion;
        expect(q.rows.map(r => r.label)).toEqual(['1st', '2nd', '3rd']);
        expect(q.badge).toBe('CONJUGATION');
        expect(q.prompt).toContain('Present active indicative');
        expect(paradigm([hortor], { voices: ['active', 'passive'] })).toHaveLength(1);
    });
    it('a pronoun uses its own columns', () => {
        const q = paradigm([hic])[0].question as GridQuestion;
        expect(q.columns).toHaveLength(6);
    });
    it('given: first gives one cell, n gives n, never all', () => {
        const first = paradigm([puella], { given: 'first' })[0];
        expect(cellIds(first.question as GridQuestion, true)).toHaveLength(1);
        expect(first.points).toBe(9);
        const some = paradigm([puella], { given: 4 })[0];
        expect(cellIds(some.question as GridQuestion, true)).toHaveLength(4);
        const many = paradigm([puella], { given: 99 })[0];
        expect(cellIds(many.question as GridQuestion, false)).toHaveLength(1);
    });
});

describe('principal parts', () => {
    it('moneo has four cells, the first given', () => {
        const [item] = buildFormsPool({ kind: 'principalParts', words: [moneo, puella] }, rng());
        const q = item.question as GridQuestion;
        expect(q.rows).toHaveLength(1);
        expect(q.rows[0].cells).toHaveLength(4);
        expect(q.rows[0].cells[0]).toEqual({ id: 'pp1', given: 'moneo' });
        expect(q.key).toEqual({ pp2: ['monere'], pp3: ['monui'], pp4: ['monitus'] });
        expect(item.points).toBe(3);
        expect(q.badge).toBe('PRINCIPAL PARTS');
    });
});

describe('parse and make', () => {
    const cfg = { ...DEFAULT_FORMS_CONFIG, kinds: ['nouns' as const] };
    it('a parse item for puellae has case and number and its four valid readings', () => {
        const items = buildFormsPool({ kind: 'parse', filter: cfg, words: [puella], count: 20 }, rng());
        const item = items.find(i => i.item_key.endsWith('|puellae'))!;
        const q = item.question as ParseQuestion;
        expect(q.fields.map(f => f.id)).toEqual(['number', 'case']);
        // genitive sg, dative sg, nominative pl and vocative pl (the plan said three; the engine has a plural vocative)
        expect(q.key).toHaveLength(4);
        expect(q.badge).toBe('PARSE');
        expect(item.points).toBe(1);
    });
    it('every parse key entry grades 100%', () => {
        const items = buildFormsPool({ kind: 'parse', filter: { ...DEFAULT_FORMS_CONFIG, kinds: ['verbs', 'nouns', 'adjectives', 'pronouns'] }, count: 15 }, rng());
        expect(items.length).toBeGreaterThanOrEqual(15);
        expect(items.length).toBeLessThanOrEqual(45);
        for (const it of items) {
            const q = it.question as ParseQuestion;
            for (const k of q.key) expect(grade(q, k).right).toBe(q.fields.length);
        }
    });
    it('verbs without a passive get no voice field', () => {
        const items = buildFormsPool({ kind: 'parse', filter: DEFAULT_FORMS_CONFIG, words: [hortor], count: 10 }, rng());
        for (const it of items) expect((it.question as ParseQuestion).fields.map(f => f.id)).not.toContain('voice');
        const withVoice = buildFormsPool({ kind: 'parse', filter: DEFAULT_FORMS_CONFIG, words: [moneo], count: 10 }, rng());
        expect((withVoice[0].question as ParseQuestion).fields.map(f => f.id)).toContain('voice');
    });
    it('make items are typein with stable keys', () => {
        const items = buildFormsPool({ kind: 'make', filter: DEFAULT_FORMS_CONFIG, words: [moneo], count: 5 }, rng());
        expect(items).toHaveLength(15);
        for (const it of items) {
            expect(it.question.type).toBe('typein');
            expect(it.item_key.startsWith(`make|${wordKey(moneo)}|`)).toBe(true);
            expect(it.question.id).toBe(it.item_key);
        }
    });
});

describe('invariants', () => {
    const all = (): ReturnType<typeof buildFormsPool> => [
        ...synopsis([moneo, hortor], { personNumber: 'all', giveFirst: true }),
        ...buildFormsPool({ kind: 'paradigm', words: [moneo, puella, bonus, hic], tenses: ['present', 'perfect'], moods: ['indicative'], voices: ['active', 'passive'], degrees: ['positive', 'comparative'], vocative: true, given: 3 }, rng()),
        ...buildFormsPool({ kind: 'principalParts', words: [moneo, hortor] }, rng()),
    ];
    it("every grid's key ids equal its non-given, non-null cell ids; points are set", () => {
        for (const it of all()) {
            const q = it.question as GridQuestion;
            expect(Object.keys(q.key).sort()).toEqual(cellIds(q, false).sort());
            expect(it.points).toBe(Object.keys(q.key).length);
            expect(it.question.id).toBe(it.item_key);
            for (const r of q.rows) expect(r.cells).toHaveLength(q.columns.length);
        }
    });
    it('item keys are unique and the same seed gives the same pool', () => {
        const cfg: FormsAssignmentConfig = { kind: 'parse', filter: { ...DEFAULT_FORMS_CONFIG, kinds: ['verbs', 'nouns'] }, count: 10 };
        const a = buildFormsPool(cfg, seededRng(3));
        const b = buildFormsPool(cfg, seededRng(3));
        expect(a).toEqual(b);
        expect(new Set(a.map(i => i.item_key)).size).toBe(a.length);
        const keys = all().map(i => i.item_key);
        expect(new Set(keys).size).toBe(keys.length);
    });
    it('cells exist in the engine', () => {
        expect(cellsOf(moneo).length).toBeGreaterThan(0);
    });
});
