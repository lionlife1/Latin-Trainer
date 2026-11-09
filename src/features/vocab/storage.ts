// Student study sets and their spaced-repetition records, kept in localStorage.
// Both keys are versioned; bad entries are dropped one by one, and data from a newer build is never overwritten.
import { normalize } from '../../lib/grading';
import type { VocabDirection } from '../../lib/vocab';
import { MAX_DEFINITION, MAX_HEADWORD } from '../../lib/vocabImport';

export const SETS_KEY = 'latiniq_vocab_sets';
export const SRS_KEY = 'latiniq_vocab_srs';
export const STORE_VERSION = 1;
export const MAX_CARDS = 1000;
export const MAX_NAME = 80;
export const DEFAULT_NEW_PER_DAY = 10;

export interface StudyCard { id: string; latin: string; english: string }
export interface StudySet {
  id: string;
  name: string;
  cards: StudyCard[];
  /** Canonical order, never empty. */
  directions: VocabDirection[];
  /** Integer 1..100. */
  newPerDay: number;
  createdAt: string;
  updatedAt: string;
  /** Starter set id this set was copied from. */
  source?: string;
}
/** A serialized ts-fsrs Card plus the local day it was first rated. */
export interface SrsRecord {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: 0 | 1 | 2 | 3;
  last_review?: string;
  /** Local YYYY-MM-DD of the first rating. */
  introduced: string;
}
export interface CardInput { latin: string; english: string }
export interface AddResult { added: number; duplicates: number; invalid: number; overflow: number; ok: boolean }

const DIRECTIONS: VocabDirection[] = ['l2e', 'e2l'];

export const itemKey = (setId: string, cardId: string, dir: VocabDirection) => `${setId}:${cardId}:${dir}`;

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isDate = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v));

function read(key: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const v = JSON.parse(raw);
    return isObj(v) ? v : null;
  } catch {
    return null;
  }
}

/** A stored version above ours means a newer build wrote it. */
function fromNewerBuild(key: string): boolean {
  const v = read(key)?.v;
  return typeof v === 'number' && v > STORE_VERSION;
}

function write(key: string, value: unknown): boolean {
  try {
    if (fromNewerBuild(key)) return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const cleanDirections = (v: unknown): VocabDirection[] => {
  const list = Array.isArray(v) ? DIRECTIONS.filter(d => v.includes(d)) : [];
  return list.length ? list : ['l2e'];
};
const cleanNewPerDay = (v: unknown): number => (isNum(v) ? Math.min(100, Math.max(1, Math.round(v))) : DEFAULT_NEW_PER_DAY);
const cleanName = (v: string) => v.trim().slice(0, MAX_NAME);

function sanitizeCard(x: unknown): StudyCard | null {
  if (!isObj(x) || !isStr(x.id) || !isStr(x.latin) || !isStr(x.english)) return null;
  return { id: x.id, latin: x.latin, english: x.english };
}

function sanitizeSet(x: unknown): StudySet | null {
  if (!isObj(x) || !isStr(x.id) || !isStr(x.name) || !Array.isArray(x.cards)) return null;
  const out: StudySet = {
    id: x.id,
    name: x.name,
    cards: x.cards.map(sanitizeCard).filter((c): c is StudyCard => c !== null),
    directions: cleanDirections(x.directions),
    newPerDay: cleanNewPerDay(x.newPerDay),
    createdAt: isDate(x.createdAt) ? x.createdAt : new Date(0).toISOString(),
    updatedAt: isDate(x.updatedAt) ? x.updatedAt : new Date(0).toISOString(),
  };
  if (isStr(x.source)) out.source = x.source;
  return out;
}

function sanitizeRecord(x: unknown): SrsRecord | null {
  if (!isObj(x)) return null;
  if (!isDate(x.due) || !isNum(x.stability) || !isNum(x.difficulty) || !isNum(x.scheduled_days)) return null;
  if (!isNum(x.reps) || !isNum(x.lapses) || !isNum(x.state) || ![0, 1, 2, 3].includes(x.state)) return null;
  const out: SrsRecord = {
    due: x.due,
    stability: x.stability,
    difficulty: x.difficulty,
    elapsed_days: isNum(x.elapsed_days) ? x.elapsed_days : 0,
    scheduled_days: x.scheduled_days,
    learning_steps: isNum(x.learning_steps) ? x.learning_steps : 0,
    reps: x.reps,
    lapses: x.lapses,
    state: x.state as SrsRecord['state'],
    introduced: isStr(x.introduced) && /^\d{4}-\d{2}-\d{2}$/.test(x.introduced) ? x.introduced : '',
  };
  if (isDate(x.last_review)) out.last_review = x.last_review;
  return out;
}

export function loadSets(): StudySet[] {
  const data = read(SETS_KEY);
  if (!data || data.v !== STORE_VERSION || !Array.isArray(data.sets)) return [];
  const seen = new Set<string>();
  const out: StudySet[] = [];
  for (const raw of data.sets) {
    const s = sanitizeSet(raw);
    if (s && !seen.has(s.id)) {
      seen.add(s.id);
      out.push(s);
    }
  }
  return out;
}

export const saveSets = (sets: StudySet[]): boolean => write(SETS_KEY, { v: STORE_VERSION, sets });

export const getSet = (id: string): StudySet | undefined => loadSets().find(s => s.id === id);

export function loadSrs(): Record<string, SrsRecord> {
  const data = read(SRS_KEY);
  if (!data || data.v !== STORE_VERSION || !isObj(data.items)) return {};
  const out: Record<string, SrsRecord> = {};
  for (const [k, raw] of Object.entries(data.items)) {
    const r = sanitizeRecord(raw);
    if (r) out[k] = r;
  }
  return out;
}

export function saveSrsRecord(key: string, rec: SrsRecord): boolean {
  return write(SRS_KEY, { v: STORE_VERSION, items: { ...loadSrs(), [key]: rec } });
}

/** Drops review records whose key starts with the prefix. Returns false only if a save was needed and failed. */
function deleteSrsWithPrefix(prefix: string): boolean {
  const items = loadSrs();
  const keys = Object.keys(items).filter(k => k.startsWith(prefix));
  if (!keys.length) return true;
  for (const k of keys) delete items[k];
  return write(SRS_KEY, { v: STORE_VERSION, items });
}

const sameCard = (a: CardInput, b: CardInput) => normalize(a.latin) === normalize(b.latin) && normalize(a.english) === normalize(b.english);
const validCard = (c: CardInput) =>
  c.latin.length > 0 && c.english.length > 0 && c.latin.length <= MAX_HEADWORD && c.english.length <= MAX_DEFINITION;
const trimmed = (c: CardInput): CardInput => ({ latin: c.latin.trim(), english: c.english.trim() });

export function createSet(name: string, cards: CardInput[] = [], source?: string): StudySet | null {
  const now = new Date().toISOString();
  const set: StudySet = {
    id: crypto.randomUUID(),
    name: cleanName(name) || 'Untitled set',
    cards: [],
    directions: ['l2e'],
    newPerDay: DEFAULT_NEW_PER_DAY,
    createdAt: now,
    updatedAt: now,
  };
  if (source) set.source = source;
  for (const raw of cards) {
    const c = trimmed(raw);
    if (set.cards.length >= MAX_CARDS) break;
    if (validCard(c) && !set.cards.some(x => sameCard(x, c))) set.cards.push({ id: crypto.randomUUID(), ...c });
  }
  return saveSets([...loadSets(), set]) ? set : null;
}

function patchSet(id: string, fn: (s: StudySet) => StudySet | null): boolean {
  const sets = loadSets();
  const i = sets.findIndex(s => s.id === id);
  if (i === -1) return false;
  const next = fn(sets[i]);
  if (!next) return false;
  sets[i] = { ...next, updatedAt: new Date().toISOString() };
  return saveSets(sets);
}

export function updateSet(id: string, patch: Partial<Pick<StudySet, 'name' | 'directions' | 'newPerDay'>>): boolean {
  return patchSet(id, s => {
    const next = { ...s };
    if (patch.name !== undefined) {
      const name = cleanName(patch.name);
      if (!name) return null;
      next.name = name;
    }
    if (patch.directions !== undefined) next.directions = cleanDirections(patch.directions);
    if (patch.newPerDay !== undefined) next.newPerDay = cleanNewPerDay(patch.newPerDay);
    return next;
  });
}

export function deleteSet(id: string): boolean {
  const sets = loadSets();
  if (!sets.some(s => s.id === id)) return false;
  if (!saveSets(sets.filter(s => s.id !== id))) return false;
  deleteSrsWithPrefix(`${id}:`);
  return true;
}

export function addCards(setId: string, cards: CardInput[]): AddResult {
  const result: AddResult = { added: 0, duplicates: 0, invalid: 0, overflow: 0, ok: true };
  const found = patchSet(setId, s => {
    const list = [...s.cards];
    for (const raw of cards) {
      const c = trimmed(raw);
      if (!validCard(c)) result.invalid++;
      else if (list.some(x => sameCard(x, c))) result.duplicates++;
      else if (list.length >= MAX_CARDS) result.overflow++;
      else {
        list.push({ id: crypto.randomUUID(), ...c });
        result.added++;
      }
    }
    return { ...s, cards: list };
  });
  if (!found) return { added: 0, duplicates: 0, invalid: 0, overflow: 0, ok: false };
  return result;
}

export function updateCard(setId: string, cardId: string, card: CardInput): 'ok' | 'duplicate' | 'invalid' | 'failed' {
  const c = trimmed(card);
  if (!validCard(c)) return 'invalid';
  const set = getSet(setId);
  if (!set?.cards.some(x => x.id === cardId)) return 'failed';
  if (set.cards.some(x => x.id !== cardId && sameCard(x, c))) return 'duplicate';
  return patchSet(setId, s => ({ ...s, cards: s.cards.map(x => (x.id === cardId ? { ...x, ...c } : x)) })) ? 'ok' : 'failed';
}

export function removeCard(setId: string, cardId: string): boolean {
  const ok = patchSet(setId, s => ({ ...s, cards: s.cards.filter(c => c.id !== cardId) }));
  if (ok) deleteSrsWithPrefix(`${setId}:${cardId}:`);
  return ok;
}
