// One-off: converts legacy data.js (APP_MODULES + MODULE_DB) to src/content/modules.ts.
// Usage: npm run port-data -- path/to/data.js
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const src = process.argv[2] ?? 'data.js';
const ctx: Record<string, unknown> = {};
vm.createContext(ctx);
vm.runInContext(readFileSync(src, 'utf8') + '\n;globalThis.__out = { APP_MODULES, MODULE_DB };', ctx);
const { APP_MODULES, MODULE_DB } = (ctx as { __out: { APP_MODULES: any[]; MODULE_DB: Record<string, any> } }).__out;

const modules = APP_MODULES.map(meta => {
  const db = MODULE_DB[meta.id];
  if (!db) throw new Error(`No MODULE_DB entry for ${meta.id}`);
  return {
    id: meta.id,
    badge: meta.badge,
    title: meta.title,
    tagline: meta.tagline,
    description: db.description ?? '',
    concepts: db.concepts ?? [],
    prerequisites: meta.prerequisites ?? [],
    xp_reward: meta.xp_reward,
    questions: db.questions.map((q: any) => {
      const base = { id: q.id, type: q.type, badge: q.badge, prompt: q.prompt, hint: q.hint, explanation: q.explanation };
      return q.type === 'mc' ? { ...base, choices: q.choices, correct: q.correct } : { ...base, answers: q.answers };
    }),
  };
});

const out =
  '// Generated from legacy data.js by scripts/port-data.ts. Edit freely; this is now the source of truth.\n' +
  "import type { ModuleContent } from '../lib/types';\n\n" +
  `export const MODULES: ModuleContent[] = ${JSON.stringify(modules, null, 2)};\n`;
writeFileSync('src/content/modules.ts', out);
console.log(`Wrote ${modules.length} modules, ${modules.reduce((n, m) => n + m.questions.length, 0)} questions`);
