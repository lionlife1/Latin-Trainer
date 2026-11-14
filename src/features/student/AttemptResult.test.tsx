import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const getAttempt = vi.fn();
const getAttemptItems = vi.fn();
const getResponses = vi.fn();
vi.mock('./api', () => ({
  getAttempt: (...a: unknown[]) => getAttempt(...a),
  getAttemptItems: (...a: unknown[]) => getAttemptItems(...a),
  getResponses: (...a: unknown[]) => getResponses(...a),
}));

import { AttemptResult } from './AttemptResult';

it('shows fractional scores, the percentage, and per-item points', async () => {
  getAttempt.mockResolvedValue({
    id: 't', assignment_id: 'a', started_at: '', submitted_at: 'x', score: 18.5, total: 24, is_late: false, over_time: false,
  });
  getAttemptItems.mockResolvedValue([
    {
      pool_id: 'p1', position: 0, points: 4,
      question: {
        id: 'q', type: 'grid', badge: 'B', prompt: 'Grid prompt', columns: ['Sg'],
        rows: [{ label: 'Nom', cells: [{ id: 'c1' }] }, { label: 'Acc', cells: [{ id: 'c2' }] }],
        key: { c1: ['rosa'], c2: ['rosam'] },
      },
    },
    { pool_id: 'p2', position: 1, points: 1, question: { id: 'q2', type: 'typein', badge: 'B', prompt: 'Plain', answers: ['x'] } },
  ]);
  getResponses.mockResolvedValue([
    {
      pool_id: 'p1', given: null, given_json: { c1: 'rosa', c2: 'rosae' }, correct: false, earned: 2, possible: 4,
      parts: [{ id: 'c1', ok: true }, { id: 'c2', ok: false }],
    },
    { pool_id: 'p2', given: 'x', given_json: null, correct: true, earned: 1, possible: 1, parts: null },
  ]);
  render(
    <MemoryRouter initialEntries={['/s/attempt/t']}>
      <Routes><Route path="/s/attempt/:attemptId" element={<AttemptResult />} /></Routes>
    </MemoryRouter>,
  );
  expect(await screen.findByText('18.5/24')).toBeInTheDocument();
  expect(screen.getByText('77%')).toBeInTheDocument();
  expect(await screen.findByText('2/4 points')).toBeInTheDocument();
  expect(screen.getAllByText(/points$/)).toHaveLength(1);
  expect(screen.getByText('1/2 correct')).toBeInTheDocument();
});
