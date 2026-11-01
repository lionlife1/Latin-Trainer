import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AssignmentRow, GradebookRow } from './api';

const assignments = [
  { id: 'a1', title: 'Quiz 1', created_at: '2026-10-01T00:00:00Z' },
  { id: 'a2', title: 'Vocab, ch. 2', created_at: '2026-10-02T00:00:00Z' },
] as AssignmentRow[];
const row = (student: string, name: string, a: string, over: Partial<GradebookRow> = {}): GradebookRow => ({
  student_id: student, display_name: name, assignment_id: a, best_score: null, total: null, attempts: 0,
  last_submitted_at: null, any_late: false, latest_attempt_id: null, ...over,
});
const rows: GradebookRow[] = [
  row('s1', 'Marcus', 'a1', { best_score: 7, total: 10, attempts: 1, any_late: true, latest_attempt_id: 't1' }),
  row('s1', 'Marcus', 'a2'),
  row('s2', 'Iulia', 'a1', { best_score: 10, total: 10, attempts: 2, latest_attempt_id: 't2' }),
  row('s2', 'Iulia', 'a2'),
];

vi.mock('./api', () => ({
  getClass: () => Promise.resolve({ id: 'c1', name: 'Latin III', join_code: 'AAAAAA', created_at: '' }),
  listAssignments: () => Promise.resolve([...assignments].reverse()),
  gradebook: () => Promise.resolve(rows),
}));

import { Gradebook, gradebookCsv } from './Gradebook';

describe('Gradebook', () => {
  it('renders the student x assignment grid', async () => {
    render(
      <MemoryRouter initialEntries={['/t/c/c1/grades']}>
        <Routes><Route path="/t/c/:classId/grades" element={<Gradebook />} /></Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText('7/10 ⏰')).toBeInTheDocument();
    expect(screen.getByText('10/10')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
    const names = screen.getAllByRole('rowheader').map(h => h.textContent);
    expect(names).toEqual(['Iulia', 'Marcus']);
    expect(screen.getByRole('link', { name: '7/10 ⏰' })).toHaveAttribute('href', '/t/attempt/t1');
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });

  it('builds CSV with assignment columns in creation order', () => {
    expect(gradebookCsv(rows, assignments)).toBe(
      'Student,Quiz 1,"Vocab, ch. 2"\r\nIulia,10/10,\r\nMarcus,7/10 (late),\r\n',
    );
  });
});
