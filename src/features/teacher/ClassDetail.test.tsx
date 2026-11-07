import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const deleteAssignment = vi.fn();
const removeStudent = vi.fn();
vi.mock('./api', () => ({
  getClass: () => Promise.resolve({ id: 'c1', name: 'Latin III', join_code: 'AAAAAA', created_at: '' }),
  getRoster: () => Promise.resolve([{ student_id: 's1', display_name: 'Marcus', joined_at: '2026-10-01T00:00:00Z' }]),
  listAssignments: () => Promise.resolve([{ id: 'a1', title: 'Quiz 1', mode: 'test', due_at: null, question_count: 10 }]),
  deleteAssignment: (...a: unknown[]) => deleteAssignment(...a),
  removeStudent: (...a: unknown[]) => removeStudent(...a),
}));

import { ClassDetail } from './ClassDetail';

const renderClass = () =>
  render(
    <MemoryRouter initialEntries={['/t/c/c1']}>
      <Routes><Route path="/t/c/:classId" element={<ClassDetail />} /></Routes>
    </MemoryRouter>,
  );

describe('ClassDetail', () => {
  beforeEach(() => { vi.spyOn(window, 'confirm').mockReturnValue(true); });
  afterEach(() => vi.mocked(window.confirm).mockRestore());

  it('shows an error when deleting an assignment fails', async () => {
    deleteAssignment.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderClass();
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete "Quiz 1": Failed to fetch');
  });

  it('shows an error when removing a student fails', async () => {
    removeStudent.mockRejectedValueOnce(new Error('permission denied'));
    renderClass();
    await userEvent.click(await screen.findByRole('button', { name: 'Remove' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not remove Marcus: permission denied');
  });
});
