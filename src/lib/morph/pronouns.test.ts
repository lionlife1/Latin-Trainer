import { describe, it, expect } from 'vitest';
import { PRONOUNS, pronounCells, pronounForms, type Pronoun } from './pronouns';

const CASES = ['nominative', 'genitive', 'dative', 'accusative', 'ablative'] as const;
const split = (s: string) => s.split(' ').map(x => x.split('/'));

/** Each row: five cells (nom gen dat acc abl); `a/b` is main form `a` with variant `b`. */
const GOLDEN: Record<string, Record<string, string>> = {
    ego: { singular: 'ego mei mihi/mi me me', plural: 'nos nostrum/nostri nobis nos nobis' },
    tu: { singular: 'tu tui tibi te te', plural: 'vos vestrum/vestri vobis vos vobis' },
    sui: { singular: '- sui sibi se/sese se/sese' },
    is: {
        'singular.m': 'is eius ei eum eo', 'singular.f': 'ea eius ei eam ea', 'singular.n': 'id eius ei id eo',
        'plural.m': 'ei/ii eorum eis/iis eos eis/iis', 'plural.f': 'eae earum eis/iis eas eis/iis', 'plural.n': 'ea eorum eis/iis ea eis/iis',
    },
    hic: {
        'singular.m': 'hic huius huic hunc hoc', 'singular.f': 'haec huius huic hanc hac', 'singular.n': 'hoc huius huic hoc hoc',
        'plural.m': 'hi horum his hos his', 'plural.f': 'hae harum his has his', 'plural.n': 'haec horum his haec his',
    },
    ille: {
        'singular.m': 'ille illius illi illum illo', 'singular.f': 'illa illius illi illam illa', 'singular.n': 'illud illius illi illud illo',
        'plural.m': 'illi illorum illis illos illis', 'plural.f': 'illae illarum illis illas illis', 'plural.n': 'illa illorum illis illa illis',
    },
    iste: {
        'singular.m': 'iste istius isti istum isto', 'singular.f': 'ista istius isti istam ista', 'singular.n': 'istud istius isti istud isto',
        'plural.m': 'isti istorum istis istos istis', 'plural.f': 'istae istarum istis istas istis', 'plural.n': 'ista istorum istis ista istis',
    },
    ipse: {
        'singular.m': 'ipse ipsius ipsi ipsum ipso', 'singular.f': 'ipsa ipsius ipsi ipsam ipsa', 'singular.n': 'ipsum ipsius ipsi ipsum ipso',
        'plural.m': 'ipsi ipsorum ipsis ipsos ipsis', 'plural.f': 'ipsae ipsarum ipsis ipsas ipsis', 'plural.n': 'ipsa ipsorum ipsis ipsa ipsis',
    },
    idem: {
        'singular.m': 'idem eiusdem eidem eundem eodem', 'singular.f': 'eadem eiusdem eidem eandem eadem', 'singular.n': 'idem eiusdem eidem idem eodem',
        'plural.m': 'eidem/idem/iidem eorundem eisdem/isdem/iisdem eosdem eisdem/isdem/iisdem',
        'plural.f': 'eaedem earundem eisdem/isdem/iisdem easdem eisdem/isdem/iisdem',
        'plural.n': 'eadem eorundem eisdem/isdem/iisdem eadem eisdem/isdem/iisdem',
    },
    qui: {
        'singular.m': 'qui cuius cui quem quo', 'singular.f': 'quae cuius cui quam qua', 'singular.n': 'quod cuius cui quod quo',
        'plural.m': 'qui quorum quibus/quis quos quibus/quis', 'plural.f': 'quae quarum quibus/quis quas quibus/quis', 'plural.n': 'quae quorum quibus/quis quae quibus/quis',
    },
    quis: {
        'singular.m': 'quis cuius cui quem quo', 'singular.f': 'quis cuius cui quem quo', 'singular.n': 'quid cuius cui quid quo',
        'plural.m': 'qui quorum quibus/quis quos quibus/quis', 'plural.f': 'quae quarum quibus/quis quas quibus/quis', 'plural.n': 'quae quorum quibus/quis quae quibus/quis',
    },
};

const byId = (id: string): Pronoun => PRONOUNS.find(p => p.id === id)!;

describe('pronoun tables', () => {
    it('has all 11 pronouns', () => {
        expect(PRONOUNS.map(p => p.id).sort()).toEqual(Object.keys(GOLDEN).sort());
    });

    for (const [id, rows] of Object.entries(GOLDEN)) {
        it(`${id} matches the golden table`, () => {
            const p = byId(id);
            for (const [rowKey, text] of Object.entries(rows)) {
                const [number, gender] = rowKey.split('.');
                split(text).forEach((variants, i) => {
                    if (variants[0] === '-') {
                        expect(pronounForms(p, { case: CASES[i], number: number as 'singular', gender: gender as 'm' | undefined })).toEqual([]);
                        return;
                    }
                    const cell = { case: CASES[i], number: number as 'singular' | 'plural', ...(gender ? { gender: gender as 'm' | 'f' | 'n' } : {}) };
                    expect(pronounForms(p, cell), `${id} ${rowKey} ${CASES[i]}`).toEqual(variants);
                });
            }
        });
    }

    it('counts cells', () => {
        for (const p of PRONOUNS) {
            const n = ['ego', 'tu'].includes(p.id) ? 10 : p.id === 'sui' ? 4 : 30;
            expect(pronounCells(p).length, p.id).toBe(n);
            expect(p.gendered).toBe(n === 30);
        }
    });

    it('sui has no number or nominative; cells have no vocative', () => {
        expect(pronounCells(byId('sui')).map(c => c.case)).toEqual(['genitive', 'dative', 'accusative', 'ablative']);
        expect(PRONOUNS.every(p => pronounCells(p).every(c => (c.case as string) !== 'vocative'))).toBe(true);
    });

    it('carries entry and trans', () => {
        expect(byId('quis').entry).toBe('quis, quid');
        expect(byId('ego').trans).toBe('I; we');
        expect(byId('idem').entry).toBe('idem, eadem, idem');
    });
});
