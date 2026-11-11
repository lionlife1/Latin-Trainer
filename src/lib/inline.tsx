import type { ReactNode } from 'react';

// `**x**` -> <strong>, `*x*` -> <em>, everything else plain text. No nesting;
// an unmatched `*` stays literal.
const PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(m[1] !== undefined ? <strong key={out.length}>{m[1]}</strong> : <em key={out.length}>{m[2]}</em>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
