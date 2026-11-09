// Remembered Forms setup. Every read tolerates missing or corrupt data.
import { DEFAULT_FORMS_CONFIG, type FormsConfig } from '../../../lib/formsQuestions';

export type FormsLength = 10 | 20 | 'endless';
export interface FormsSettings { config: FormsConfig; length: FormsLength }

const KEY = 'latiniq_forms_settings';

export const DEFAULT_FORMS_SETTINGS: FormsSettings = { config: DEFAULT_FORMS_CONFIG, length: 10 };

/** Keeps the known values of an array field; falls back to the default when nothing usable is left. */
function pick<T>(raw: unknown, known: readonly T[], fallback: T[]): T[] {
  if (!Array.isArray(raw)) return fallback;
  const kept = known.filter(k => raw.includes(k));
  return kept.length ? kept : fallback;
}

export function loadFormsSettings(): FormsSettings {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!v || typeof v !== 'object') return DEFAULT_FORMS_SETTINGS;
    const d = DEFAULT_FORMS_CONFIG;
    const c = (v.config && typeof v.config === 'object' ? v.config : {}) as Record<string, unknown>;
    const config: FormsConfig = {
      kinds: pick(c.kinds, ['verbs', 'nouns', 'adjectives', 'pronouns'], d.kinds),
      styles: pick(c.styles, ['make', 'identify'], d.styles),
      verbGroups: pick(c.verbGroups, ['1', '2', '3', '3io', '4', 'irregular', 'deponent'], d.verbGroups),
      moods: pick(c.moods, ['indicative', 'subjunctive', 'imperative', 'infinitive', 'participle'], d.moods),
      tenses: pick(c.tenses, ['present', 'imperfect', 'future', 'perfect', 'pluperfect', 'futurePerfect'], d.tenses),
      voices: pick(c.voices, ['active', 'passive'], d.voices),
      declensions: pick(c.declensions, [1, 2, 3, 4, 5], d.declensions),
      adjTypes: pick(c.adjTypes, ['12', '3'], d.adjTypes),
      degrees: pick(c.degrees, ['positive', 'comparative', 'superlative'], d.degrees),
    };
    const length: FormsLength = v.length === 10 || v.length === 20 || v.length === 'endless' ? v.length : 10;
    return { config, length };
  } catch {
    return DEFAULT_FORMS_SETTINGS;
  }
}

export function saveFormsSettings(s: FormsSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch { /* storage full or blocked: settings just won't be remembered */ }
}
