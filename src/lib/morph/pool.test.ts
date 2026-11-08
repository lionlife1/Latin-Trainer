import { describe, it, expect } from 'vitest';
import { trainerPool } from '../conjugator';
import { CORE_ADJECTIVES } from '../../content/adjectives.generated';
import { CORE_NOUNS } from '../../content/nouns.generated';
import { adjectiveCells, adjectiveForms, adverbForms } from './adjectives';
import { nounCells, nounForms } from './nouns';
import { verbCells, verbForms } from './verbs';
import { legacySubjunctiveForm } from './__fixtures__/legacySubjunctive';

describe('the engine against the whole trainer pool', () => {
    const pool = trainerPool();

    it('matches the frozen subjunctive conjugator on every claimed subjunctive cell', () => {
        for (const v of pool) {
            if (v.semiDeponent) continue; // the frozen legacy conjugator never knew semi-deponents
            const cells = verbCells(v).filter(c => c.mood === 'subjunctive');
            for (const c of cells) {
                if (c.mood !== 'subjunctive') continue;
                expect(verbForms(v, c)[0], `${v.inf} ${c.tense} ${c.voice} ${c.person} ${c.number}`)
                    .toBe(legacySubjunctiveForm(v, c.tense, c.voice, c.person, c.number));
            }
        }
    });

    it('claims all 24 active subjunctive cells for every verb', () => {
        for (const v of pool) {
            const active = verbCells(v).filter(c => c.mood === 'subjunctive' && c.voice === 'active');
            expect(active, v.inf).toHaveLength(24);
        }
    });

    it('builds a well-formed, non-empty answer for every claimed cell', () => {
        for (const v of pool) {
            for (const c of verbCells(v)) {
                const forms = verbForms(v, c);
                expect(forms.length, `${v.inf} ${JSON.stringify(c)}`).toBeGreaterThan(0);
                for (const f of forms) expect(f, `${v.inf} ${JSON.stringify(c)}`).toMatch(/^[a-z]+( [a-z]+)?$/);
            }
        }
    });

    it('builds clean, non-empty noun forms for every claimed cell of every core noun', () => {
        for (const n of CORE_NOUNS) {
            for (const c of nounCells(n)) {
                const forms = nounForms(n, c);
                expect(forms.length, `${n.nom} ${c.case} ${c.number}`).toBeGreaterThan(0);
                for (const f of forms) expect(f, `${n.nom} ${c.case} ${c.number}`).toMatch(/^[a-z]+$/);
            }
        }
    });

    it('builds clean, non-empty adjective forms and adverbs for every core adjective', () => {
        for (const a of CORE_ADJECTIVES) {
            for (const c of adjectiveCells(a)) {
                const forms = adjectiveForms(a, c);
                expect(forms.length, `${a.nom} ${JSON.stringify(c)}`).toBeGreaterThan(0);
                for (const f of forms) expect(f, `${a.nom} ${JSON.stringify(c)}`).toMatch(/^[a-z]+$/);
            }
            if (a.comp && !a.consonantStem) {
                for (const d of ['positive', 'comparative', 'superlative'] as const) {
                    const forms = adverbForms(a, d);
                    expect(forms.length, `${a.nom} adverb ${d}`).toBeGreaterThan(0);
                    for (const f of forms) expect(f, `${a.nom} adverb ${d}`).toMatch(/^[a-z]+$/);
                }
            }
        }
    });
});
