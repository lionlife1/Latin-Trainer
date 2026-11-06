export const MACRON_VOWELS = ['ā', 'ē', 'ī', 'ō', 'ū', 'ȳ'] as const;

const LONG: Record<string, string> = {
  a: 'ā', e: 'ē', i: 'ī', o: 'ō', u: 'ū', y: 'ȳ', A: 'Ā', E: 'Ē', I: 'Ī', O: 'Ō', U: 'Ū', Y: 'Ȳ',
};

export interface Edit { value: string; caret: number }

/** Replaces value[start, end) with text; a null caret (field never focused) appends. */
export function insertAt(value: string, start: number | null, end: number | null, text: string): Edit {
  const s = start ?? value.length;
  const e = end ?? s;
  return { value: value.slice(0, s) + text + value.slice(e), caret: s + text.length };
}

/**
 * The "a=" shortcut: called when "=" is typed at `caret` (before it is inserted). If the character
 * before the caret is a plain vowel, it becomes the long vowel and the "=" is swallowed; otherwise
 * returns null and "=" is typed as usual.
 */
export function macronShortcut(value: string, caret: number): Edit | null {
  const long = caret > 0 ? LONG[value[caret - 1]] : undefined;
  if (!long) return null;
  return { value: value.slice(0, caret - 1) + long + value.slice(caret), caret };
}
