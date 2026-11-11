import { MODULES } from '../modules';
import { LESSONS, lessonFor } from './index';
import type { Lesson, LessonBlock } from './types';

function blockStrings(b: LessonBlock): string[] {
  switch (b.kind) {
    case 'p': return [b.text];
    case 'table': return [...(b.caption ? [b.caption] : []), ...b.head, ...b.rows.flat()];
    case 'examples': return b.items.flatMap((i) => [i.la, i.en, ...(i.note ? [i.note] : [])]);
    case 'tip': return [...(b.title ? [b.title] : []), b.text];
  }
}

function allText(l: Lesson): string[] {
  return [l.title, l.summary, ...l.sections.flatMap((s) => [s.heading, ...s.blocks.flatMap(blockStrings)])];
}

function balanced(s: string): boolean {
  const doubles = s.split('**').length - 1;
  if (doubles % 2) return false;
  return (s.replaceAll('**', '').split('*').length - 1) % 2 === 0;
}

// Returns a list of problems; empty means the lesson is valid.
function lessonProblems(l: Lesson, lessons: Record<string, Lesson>, modules = MODULES): string[] {
  const p: string[] = [];
  const mod = modules.find((m) => m.id === l.moduleId);
  if (lessons[l.moduleId] !== l) p.push('moduleId is not its own key in LESSONS');
  if (!mod) p.push('moduleId not in MODULES');
  if (!l.title.trim()) p.push('empty title');
  if (!l.summary.trim()) p.push('empty summary');
  if (l.sections.length < 4 || l.sections.length > 7) p.push('needs 4-7 sections');
  for (const s of l.sections) {
    if (!s.heading.trim()) p.push('section without heading');
    if (s.blocks.length < 1) p.push(`section "${s.heading}" has no blocks`);
    for (const b of s.blocks) {
      if (b.kind === 'table') {
        if (b.head.length > 5) p.push('table wider than 5 columns');
        if (b.rows.some((r) => r.length !== b.head.length)) p.push('table row width differs from head');
      }
      if (b.kind === 'examples') {
        if (b.items.some((i) => !i.la.trim() || !i.en.trim())) p.push('example with empty la or en');
      }
    }
  }
  if (!l.sections.some((s) => s.blocks.some((b) => b.kind === 'tip'))) p.push('no tip block');
  if (l.check.length < 3 || l.check.length > 5) p.push('check needs 3-5 ids');
  const ids = new Set(mod?.questions.map((q) => q.id));
  for (const id of l.check) if (!ids.has(id)) p.push(`check id ${id} is not a question of this module`);
  const text = allText(l);
  if (text.some((t) => /\p{Extended_Pictographic}/u.test(t))) p.push('contains emoji');
  const dashes = text.join('').split('—').length - 1;
  if (dashes > 3) p.push(`${dashes} em dashes (max 3)`);
  if (text.some((t) => !balanced(t))) p.push('unbalanced * or ** markup');
  return p;
}

describe('lessons', () => {
  it('has a lesson list', () => {
    expect(typeof LESSONS).toBe('object');
    expect(lessonFor('no-such-module')).toBeUndefined();
  });

  for (const lesson of Object.values(LESSONS)) {
    it(`lesson ${lesson.moduleId} is valid`, () => {
      expect(lessonProblems(lesson, LESSONS)).toEqual([]);
    });
  }
});

describe('lesson checks (fixture)', () => {
  const mod = MODULES[0];
  const qs = mod.questions.map((q) => q.id);
  const make = (over: Partial<Lesson> = {}): Lesson => ({
    moduleId: mod.id,
    title: 'A title',
    summary: 'A summary.',
    sections: [1, 2, 3, 4].map((n) => ({
      heading: `Section ${n}`,
      blocks: [
        { kind: 'p', text: 'Plain with *em* and **strong**.' },
        { kind: 'table', head: ['a', 'b'], rows: [['1', '2']] },
        { kind: 'examples', items: [{ la: 'amō', en: 'I love' }] },
        { kind: 'tip', text: 'Remember this.' },
      ],
    })),
    check: qs.slice(0, 3),
    ...over,
  });
  const run = (l: Lesson) => lessonProblems(l, { [l.moduleId]: l });

  it('accepts a valid lesson', () => {
    expect(qs.length).toBeGreaterThanOrEqual(3);
    expect(run(make())).toEqual([]);
  });

  it('flags a wrong table row width', () => {
    const l = make();
    l.sections[0].blocks = [{ kind: 'table', head: ['a', 'b'], rows: [['1']] }, { kind: 'tip', text: 'x' }];
    expect(run(l)).toContain('table row width differs from head');
  });

  it('flags unbalanced markup', () => {
    const l = make();
    l.sections[0].blocks = [{ kind: 'p', text: 'a *b' }, { kind: 'tip', text: 'x' }];
    expect(run(l)).toContain('unbalanced * or ** markup');
    l.sections[0].blocks = [{ kind: 'p', text: 'a **b' }, { kind: 'tip', text: 'x' }];
    expect(run(l)).toContain('unbalanced * or ** markup');
  });

  it('flags a check id from another module', () => {
    const other = MODULES.find((m) => m.id !== mod.id)!.questions[0].id;
    expect(run(make({ check: [qs[0], qs[1], other] })).join()).toContain(`check id ${other}`);
  });

  it('flags four em dashes', () => {
    expect(run(make({ summary: 'a — b — c — d — e' })).join()).toContain('em dashes');
  });

  it('flags emoji', () => {
    expect(run(make({ title: 'Hi 😀' }))).toContain('contains emoji');
  });
});
