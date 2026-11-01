import { groupAssignments } from './MyAssignments';

type Rows = Parameters<typeof groupAssignments>[0];
const row = (id: string, due_at: string | null, best = false): Rows[number] => ({
  assignment: {
    id, title: id, mode: 'practice', question_count: 1, due_at, time_limit_sec: null, max_attempts: null,
    reveal_answers: true, created_at: '',
  },
  attempts: [],
  best: best ? { id: 't', assignment_id: id, started_at: '', submitted_at: 'x', score: 1, total: 1, is_late: false, over_time: false } : null,
  open: null,
  latest: null,
});

describe('groupAssignments', () => {
  it('splits overdue, to do (soonest first, undated last) and done', () => {
    const now = new Date('2026-10-10T12:00:00Z');
    const g = groupAssignments([
      row('late', '2026-10-09T00:00:00Z'),
      row('later', '2026-10-20T00:00:00Z'),
      row('nodue', null),
      row('soon', '2026-10-11T00:00:00Z'),
      row('done-late', '2026-10-01T00:00:00Z', true),
    ], now);
    expect(g.overdue.map(r => r.assignment.id)).toEqual(['late']);
    expect(g.todo.map(r => r.assignment.id)).toEqual(['soon', 'later', 'nodue']);
    expect(g.done.map(r => r.assignment.id)).toEqual(['done-late']);
  });
});
