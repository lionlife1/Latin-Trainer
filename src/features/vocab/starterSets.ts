import { CORE_ADJECTIVES } from '../../content/adjectives.generated';
import { CORE_NOUNS } from '../../content/nouns.generated';
import { CORE_VERBS } from '../../content/verbs.generated';
import { normalize } from '../../lib/grading';
import { adjectiveEntry, nounEntry, principalParts, type Verb } from '../../lib/morph';
import { MAX_CARDS, type CardInput } from './storage';

export interface StarterSet { id: string; name: string; cards: CardInput[] }

const DECLENSIONS = ['1st', '2nd', '3rd', '4th', '5th'];

function verbSetId(v: Verb): string {
  if (v.irregular) return 'verbs-irr';
  if (v.deponent || v.semiDeponent) return 'verbs-dep';
  return v.conj === 3.5 ? 'verbs-3io' : `verbs-${v.conj}`;
}

const byLatin = (a: CardInput, b: CardInput) => a.latin.localeCompare(b.latin);

/** Sorted alphabetically, deduped on normalized Latin + English, cut to the set limit. */
function tidy(cards: CardInput[]): CardInput[] {
  const seen = new Set<string>();
  const out: CardInput[] = [];
  for (const c of [...cards].sort(byLatin)) {
    const key = `${normalize(c.latin)}|${normalize(c.english)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out.slice(0, MAX_CARDS);
}

function build(): StarterSet[] {
  const groups: { id: string; name: string; cards: CardInput[] }[] = [
    { id: 'verbs-1', name: 'Verbs: 1st conjugation', cards: [] },
    { id: 'verbs-2', name: 'Verbs: 2nd conjugation', cards: [] },
    { id: 'verbs-3', name: 'Verbs: 3rd conjugation', cards: [] },
    { id: 'verbs-3io', name: 'Verbs: 3rd conjugation -iō', cards: [] },
    { id: 'verbs-4', name: 'Verbs: 4th conjugation', cards: [] },
    { id: 'verbs-dep', name: 'Verbs: deponent', cards: [] },
    { id: 'verbs-irr', name: 'Verbs: irregular', cards: [] },
    ...DECLENSIONS.map((d, i) => ({ id: `nouns-${i + 1}`, name: `Nouns: ${d} declension`, cards: [] as CardInput[] })),
    { id: 'adj-12', name: 'Adjectives: 1st and 2nd declension', cards: [] },
    { id: 'adj-3', name: 'Adjectives: 3rd declension', cards: [] },
  ];
  const into = (id: string, card: CardInput) => groups.find(g => g.id === id)?.cards.push(card);
  for (const v of CORE_VERBS) into(verbSetId(v), { latin: principalParts(v), english: v.trans });
  for (const n of CORE_NOUNS) into(`nouns-${n.decl}`, { latin: nounEntry(n), english: n.trans });
  for (const a of CORE_ADJECTIVES) into(a.decl === '12' ? 'adj-12' : 'adj-3', { latin: adjectiveEntry(a), english: a.trans });
  return groups.map(g => ({ ...g, cards: tidy(g.cards) })).filter(g => g.cards.length > 0);
}

let cache: StarterSet[] | undefined;
export const starterSets = (): StarterSet[] => (cache ??= build());
