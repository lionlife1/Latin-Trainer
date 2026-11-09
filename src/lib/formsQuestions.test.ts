import { describe, it, expect } from 'vitest';
import { VERBS } from './conjugator';
import { seededRng } from './shuffle';
import { cellFeatures, cellLabel, cellsOf, type Cell, type MorphWord, type Noun, type Verb } from './morph';
import {
    DEFAULT_FORMS_CONFIG, buildFormsSession, candidateCells, formsConfigHasQuestions, generateFormsQuestion,
    identifyFormQuestion, makeFormQuestion, pickDistractorCells, type FormsConfig,
} from './formsQuestions';

const verb = (v: Verb): MorphWord => ({ kind: 'verb', verb: v });
const amo = verb({ inf: 'amare', conj: 1, pres: 'am', perf: 'amav', ppp: 'amat', trans: 'to love' });
const moneo = verb({ inf: 'monere', conj: 2, pres: 'mon', perf: 'monu', ppp: 'monit', trans: 'to warn' });
const hortor = verb({ inf: 'hortari', conj: 1, pres: 'hort', perf: 'hortat', deponent: true, impfBase: 'hortare', trans: 'to urge' });
const ire = verb(VERBS.find(v => v.inf === 'ire')!);
const puella: MorphWord = { kind: 'noun', noun: { nom: 'puella', stem: 'puell', decl: 1, gender: 'f', trans: 'girl' } as Noun };

const find = (w: MorphWord, f: (c: Record<string, unknown>) => boolean): Cell => {
    return cellsOf(w).find(c => f(c as unknown as Record<string, unknown>))!;
};

const genSg = find(puella, c => c.case === 'genitive' && c.number === 'singular');
const dist = (a: Cell, b: Cell) => {
    const fa = cellFeatures(a), fb = cellFeatures(b);
    return [...new Set([...Object.keys(fa), ...Object.keys(fb)])].filter(k => fa[k] !== fb[k]).length;
};

describe('identifyFormQuestion', () => {
    it('never offers another valid parse as a distractor', () => {
        const q = identifyFormQuestion(puella, genSg, seededRng(1))!;
        expect(new Set(q.choices).size).toBe(4);
        expect(q.choices).toContain('genitive singular');
        for (const bad of ['dative singular', 'nominative plural', 'vocative plural']) expect(q.choices).not.toContain(bad);
        for (const good of ['genitive singular', 'dative singular', 'nominative plural', 'vocative plural']) expect(q.explanation).toContain(good);

        const inf = find(amo, c => c.mood === 'infinitive' && c.tense === 'present' && c.voice === 'active');
        for (let n = 1; n < 10; n++) {
            const q2 = identifyFormQuestion(amo, inf, seededRng(n))!;
            expect(q2.choices).not.toContain('2nd sg. present passive imperative');
            expect(q2.correct).toBe('present active infinitive');
        }
    });

    it('prefers distractors that differ in one feature', () => {
        for (let n = 1; n < 6; n++) {
            const ds = pickDistractorCells(puella, genSg, [], seededRng(n));
            expect(ds).toHaveLength(3);
            ds.forEach(d => expect(dist(d, genSg)).toBe(1));
        }
        const pp = find(moneo, c => c.mood === 'indicative' && c.tense === 'pluperfect' && c.voice === 'passive' && c.person === 3 && c.number === 'plural');
        for (let n = 1; n < 6; n++) {
            const ds = pickDistractorCells(moneo, pp, [], seededRng(n));
            expect(ds).toHaveLength(3);
            ds.forEach(d => expect(dist(d, pp)).toBe(1));
        }
    });
});

describe('makeFormQuestion', () => {
    it('accepts every gender of a perfect passive', () => {
        const c = find(amo, c => c.mood === 'indicative' && c.tense === 'perfect' && c.voice === 'passive' && c.person === 3 && c.number === 'singular');
        const q = makeFormQuestion(amo, c, seededRng(1));
        expect(q.answers).toEqual(['amatus est', 'amata est', 'amatum est']);
        expect(q.prompt).toContain('amo, amare, amavi, amatus');
        expect(q.prompt).toContain('3rd sg. perfect passive indicative');
        const fut = find(amo, c => c.mood === 'infinitive' && c.tense === 'future' && c.voice === 'passive');
        expect(makeFormQuestion(amo, fut, seededRng(1)).answers).toEqual(['amatum iri']);
        const ip = find(ire, c => c.mood === 'indicative' && c.tense === 'perfect' && c.voice === 'active' && c.person === 3 && c.number === 'singular');
        expect(makeFormQuestion(ire, ip, seededRng(1)).answers).toContain('iit');
    });
});

describe('candidateCells', () => {
    it('filters cells', () => {
        const cfg: FormsConfig = { ...DEFAULT_FORMS_CONFIG, moods: ['infinitive'], tenses: ['perfect'], voices: ['passive'] };
        expect(candidateCells(amo, cfg).map(c => cellLabel(amo, c))).toEqual(['perfect passive infinitive']);
        expect(candidateCells(hortor, { ...DEFAULT_FORMS_CONFIG, verbGroups: ['deponent'], voices: ['passive'] }).length).toBeGreaterThan(0);
        const g = candidateCells(amo, { ...DEFAULT_FORMS_CONFIG, moods: ['participle'], tenses: ['imperfect'] });
        expect(g.length).toBeGreaterThan(0);
        expect(g.every(c => (c as { mood: string }).mood === 'gerund')).toBe(true);
    });
});

describe('generateFormsQuestion', () => {
    it('returns null when no cell matches', () => {
        const cfg: FormsConfig = { ...DEFAULT_FORMS_CONFIG, kinds: ['verbs'], moods: ['imperative'], tenses: ['pluperfect'] };
        expect(generateFormsQuestion(cfg, seededRng(1))).toBeNull();
        expect(formsConfigHasQuestions(cfg)).toBe(false);
        expect(generateFormsQuestion({ ...DEFAULT_FORMS_CONFIG, styles: [] }, seededRng(1))).toBeNull();
        expect(formsConfigHasQuestions(DEFAULT_FORMS_CONFIG)).toBe(true);
    });

    it('generates 600 well-formed questions across every kind', () => {
        const cfg: FormsConfig = {
            ...DEFAULT_FORMS_CONFIG,
            kinds: ['verbs', 'nouns', 'adjectives', 'pronouns'],
            moods: ['indicative', 'subjunctive', 'imperative', 'infinitive', 'participle'],
            degrees: ['positive', 'comparative', 'superlative'],
        };
        const rng = seededRng(42);
        for (let i = 0; i < 600; i++) {
            const q = generateFormsQuestion(cfg, rng)!;
            expect(q).not.toBeNull();
            expect(q.prompt).not.toBe('');
            if (q.type === 'typein') {
                expect(q.answers.length).toBeGreaterThanOrEqual(1);
                for (const a of q.answers) expect(a).toMatch(/^[a-z]+( [a-z]+)?$/);
            } else {
                expect(new Set(q.choices).size).toBe(4);
                expect(q.choices).toContain(q.correct);
            }
        }
    });

    it('buildFormsSession returns unique prompts', () => {
        const qs = buildFormsSession({ ...DEFAULT_FORMS_CONFIG, kinds: ['verbs', 'nouns'] }, 10, seededRng(3));
        expect(qs).toHaveLength(10);
        expect(new Set(qs.map(q => q.type + q.prompt)).size).toBe(10);
    });
});
