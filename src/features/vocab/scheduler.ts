// The only file that imports ts-fsrs. Turns ratings into stored records and builds the review queue.
// Dates are compared in the device's local day, never UTC.
import { createEmptyCard, fsrs, Rating, type CardInput, type Grade } from 'ts-fsrs';
import type { VocabDirection } from '../../lib/vocab';
import { itemKey, type SrsRecord, type StudyCard, type StudySet } from './storage';

export type Rate = 'again' | 'hard' | 'good' | 'easy';
export const REVIEW_MAX = 50;
export interface StudyItem { key: string; card: StudyCard; dir: VocabDirection }
export interface SetCounts { new: number; due: number; learned: number; newToday: number }

// With short-term steps off, every interval is at least a day, so a rated item is not due again today.
const scheduler = fsrs({ enable_short_term: false, enable_fuzz: false });
const GRADE: Record<Rate, Grade> = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };

const pad = (n: number) => String(n).padStart(2, '0');
export const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const endOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export function rate(prev: SrsRecord | undefined, r: Rate, now: Date): SrsRecord {
  const card = prev ? ({ ...prev, due: prev.due, last_review: prev.last_review } as CardInput) : createEmptyCard(now);
  const { card: next } = scheduler.next(card, now, GRADE[r]);
  const out: SrsRecord = {
    due: next.due.toISOString(),
    stability: next.stability,
    difficulty: next.difficulty,
    elapsed_days: next.elapsed_days,
    scheduled_days: next.scheduled_days,
    learning_steps: next.learning_steps,
    reps: next.reps,
    lapses: next.lapses,
    state: next.state as SrsRecord['state'],
    introduced: prev?.introduced || localDay(now),
  };
  if (next.last_review) out.last_review = next.last_review.toISOString();
  return out;
}

export const isDue = (rec: SrsRecord, now: Date) => Date.parse(rec.due) <= endOfLocalDay(now).getTime();

export function setItems(set: StudySet): StudyItem[] {
  return set.cards.flatMap(card => set.directions.map(dir => ({ key: itemKey(set.id, card.id, dir), card, dir })));
}

export function reviewQueue(set: StudySet, srs: Record<string, SrsRecord>, now: Date, max: number = REVIEW_MAX): StudyItem[] {
  const today = localDay(now);
  const items = setItems(set);
  const due = items
    .filter(i => srs[i.key] && isDue(srs[i.key], now))
    .sort((a, b) => Date.parse(srs[a.key].due) - Date.parse(srs[b.key].due) || (a.key < b.key ? -1 : 1));
  const introducedToday = items.filter(i => srs[i.key]?.introduced === today).length;
  let allowance = Math.max(0, set.newPerDay - introducedToday);
  const fresh: StudyItem[] = [];
  for (const i of items) {
    if (allowance <= 0) break;
    if (srs[i.key]) continue;
    if (i.dir === 'e2l' && set.directions.includes('l2e')) {
      const l = srs[itemKey(set.id, i.card.id, 'l2e')];
      if (!l || !(l.introduced && l.introduced < today)) continue;
    }
    fresh.push(i);
    allowance--;
  }
  return [...due, ...fresh].slice(0, max);
}

export function setCounts(set: StudySet, srs: Record<string, SrsRecord>, now: Date): SetCounts {
  const counts: SetCounts = { new: 0, due: 0, learned: 0, newToday: 0 };
  for (const i of setItems(set)) {
    const r = srs[i.key];
    if (!r) counts.new++;
    else if (isDue(r, now)) counts.due++;
    else counts.learned++;
  }
  counts.newToday = reviewQueue(set, srs, now, Infinity).filter(i => !srs[i.key]).length;
  return counts;
}
