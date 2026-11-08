/** First sense of a definition: cut at the first ';' then ',', drop (…) and […], trim, strip trailing '.:'. */
export function firstSense(definition: string): string {
  return definition.split(';')[0].split(',')[0]
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\s.:]+$/, '')
    .trim();
}

/** Cuts a gloss longer than 40 chars back to the last space or '/' before char 40. */
export function clipGloss(gloss: string, max = 40): string {
  if (gloss.length <= max) return gloss;
  const head = gloss.slice(0, max + 1);
  const cut = Math.max(head.lastIndexOf(' '), head.lastIndexOf('/'));
  return cut > 3 ? gloss.slice(0, cut) : gloss.slice(0, max);
}
