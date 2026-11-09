// Latin pronouns (A&G §§143-151): personal, reflexive, demonstrative, intensive, relative and interrogative.
import type { Case, Gender, GrammaticalNumber } from './types';

export type PronounCase = Exclude<Case, 'vocative'>;

export interface PronounCell {
    case: PronounCase;
    number: GrammaticalNumber;
    gender?: Gender;
}

export interface Pronoun {
    id: 'ego' | 'tu' | 'sui' | 'is' | 'hic' | 'ille' | 'iste' | 'ipse' | 'idem' | 'qui' | 'quis';
    /** Dictionary line shown to students. */
    entry: string;
    trans: string;
    /** False for ego, tu, sui. */
    gendered: boolean;
    /** Key `${case}.${number}` or `${case}.${number}.${gender}`; value: main form, then variants. */
    table: Readonly<Record<string, readonly string[]>>;
}

const CASES: PronounCase[] = ['nominative', 'genitive', 'dative', 'accusative', 'ablative'];
const NUMBERS: GrammaticalNumber[] = ['singular', 'plural'];
const GENDERS: Gender[] = ['m', 'f', 'n'];

/** Five space-separated cells (nom gen dat acc abl); `a/b` is main form `a` with variant `b`; `-` is no form. */
function row(text: string): string[][] {
    return text.split(' ').map(c => c.split('/'));
}

function ungendered(rows: Partial<Record<GrammaticalNumber, string>>): Pronoun['table'] {
    const table: Record<string, readonly string[]> = {};
    for (const number of NUMBERS) {
        const text = rows[number];
        if (!text) continue;
        row(text).forEach((forms, i) => {
            if (forms[0] !== '-') table[`${CASES[i]}.${number}`] = forms;
        });
    }
    return table;
}

function gendered(rows: Record<`${GrammaticalNumber}.${Gender}`, string>): Pronoun['table'] {
    const table: Record<string, readonly string[]> = {};
    for (const number of NUMBERS) {
        for (const gender of GENDERS) {
            row(rows[`${number}.${gender}`]).forEach((forms, i) => {
                table[`${CASES[i]}.${number}.${gender}`] = forms;
            });
        }
    }
    return table;
}

const pl = (p: string) => ({
    m: `${p}i ${p}orum ${p}is ${p}os ${p}is`,
    f: `${p}ae ${p}arum ${p}is ${p}as ${p}is`,
    n: `${p}a ${p}orum ${p}is ${p}a ${p}is`,
});
const ille = pl('ill'), iste = pl('ist'), ipse = pl('ips');

export const PRONOUNS: readonly Pronoun[] = [
    {
        id: 'ego', entry: 'ego, mei (pl. nos)', trans: 'I; we', gendered: false,
        table: ungendered({ singular: 'ego mei mihi/mi me me', plural: 'nos nostrum/nostri nobis nos nobis' }),
    },
    {
        id: 'tu', entry: 'tu, tui (pl. vos)', trans: 'you', gendered: false,
        table: ungendered({ singular: 'tu tui tibi te te', plural: 'vos vestrum/vestri vobis vos vobis' }),
    },
    {
        id: 'sui', entry: 'sui, sibi, se', trans: 'himself, herself, itself, themselves', gendered: false,
        table: ungendered({ singular: '- sui sibi se/sese se/sese' }),
    },
    {
        id: 'is', entry: 'is, ea, id', trans: 'he, she, it; this, that', gendered: true,
        table: gendered({
            'singular.m': 'is eius ei eum eo', 'singular.f': 'ea eius ei eam ea', 'singular.n': 'id eius ei id eo',
            'plural.m': 'ei/ii eorum eis/iis eos eis/iis', 'plural.f': 'eae earum eis/iis eas eis/iis', 'plural.n': 'ea eorum eis/iis ea eis/iis',
        }),
    },
    {
        id: 'hic', entry: 'hic, haec, hoc', trans: 'this', gendered: true,
        table: gendered({
            'singular.m': 'hic huius huic hunc hoc', 'singular.f': 'haec huius huic hanc hac', 'singular.n': 'hoc huius huic hoc hoc',
            'plural.m': 'hi horum his hos his', 'plural.f': 'hae harum his has his', 'plural.n': 'haec horum his haec his',
        }),
    },
    {
        id: 'ille', entry: 'ille, illa, illud', trans: 'that', gendered: true,
        table: gendered({
            'singular.m': 'ille illius illi illum illo', 'singular.f': 'illa illius illi illam illa', 'singular.n': 'illud illius illi illud illo',
            'plural.m': ille.m, 'plural.f': ille.f, 'plural.n': ille.n,
        }),
    },
    {
        id: 'iste', entry: 'iste, ista, istud', trans: 'that (of yours)', gendered: true,
        table: gendered({
            'singular.m': 'iste istius isti istum isto', 'singular.f': 'ista istius isti istam ista', 'singular.n': 'istud istius isti istud isto',
            'plural.m': iste.m, 'plural.f': iste.f, 'plural.n': iste.n,
        }),
    },
    {
        id: 'ipse', entry: 'ipse, ipsa, ipsum', trans: '-self, the very', gendered: true,
        table: gendered({
            'singular.m': 'ipse ipsius ipsi ipsum ipso', 'singular.f': 'ipsa ipsius ipsi ipsam ipsa', 'singular.n': 'ipsum ipsius ipsi ipsum ipso',
            'plural.m': ipse.m, 'plural.f': ipse.f, 'plural.n': ipse.n,
        }),
    },
    {
        id: 'idem', entry: 'idem, eadem, idem', trans: 'the same', gendered: true,
        table: gendered({
            'singular.m': 'idem eiusdem eidem eundem eodem', 'singular.f': 'eadem eiusdem eidem eandem eadem', 'singular.n': 'idem eiusdem eidem idem eodem',
            'plural.m': 'eidem/idem/iidem eorundem eisdem/isdem/iisdem eosdem eisdem/isdem/iisdem',
            'plural.f': 'eaedem earundem eisdem/isdem/iisdem easdem eisdem/isdem/iisdem',
            'plural.n': 'eadem eorundem eisdem/isdem/iisdem eadem eisdem/isdem/iisdem',
        }),
    },
    {
        id: 'qui', entry: 'qui, quae, quod', trans: 'who, which (relative)', gendered: true,
        table: gendered({
            'singular.m': 'qui cuius cui quem quo', 'singular.f': 'quae cuius cui quam qua', 'singular.n': 'quod cuius cui quod quo',
            'plural.m': 'qui quorum quibus/quis quos quibus/quis', 'plural.f': 'quae quarum quibus/quis quas quibus/quis',
            'plural.n': 'quae quorum quibus/quis quae quibus/quis',
        }),
    },
    {
        id: 'quis', entry: 'quis, quid', trans: 'who? what?', gendered: true,
        table: gendered({
            'singular.m': 'quis cuius cui quem quo', 'singular.f': 'quis cuius cui quem quo', 'singular.n': 'quid cuius cui quid quo',
            'plural.m': 'qui quorum quibus/quis quos quibus/quis', 'plural.f': 'quae quarum quibus/quis quas quibus/quis',
            'plural.n': 'quae quorum quibus/quis quae quibus/quis',
        }),
    },
];

function keyOf(cell: PronounCell): string {
    return cell.gender ? `${cell.case}.${cell.number}.${cell.gender}` : `${cell.case}.${cell.number}`;
}

/** The table's cells, in case/number/gender order (number, then gender, then case, as the tables read). */
export function pronounCells(p: Pronoun): PronounCell[] {
    const cells: PronounCell[] = [];
    for (const number of NUMBERS) {
        for (const gender of p.gendered ? GENDERS : [undefined]) {
            for (const c of CASES) {
                const cell: PronounCell = gender ? { case: c, number, gender } : { case: c, number };
                if (keyOf(cell) in p.table) cells.push(cell);
            }
        }
    }
    return cells;
}

export function pronounForms(p: Pronoun, cell: PronounCell): string[] {
    return [...(p.table[keyOf(cell)] ?? [])];
}
