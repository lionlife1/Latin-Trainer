import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let resolveRecord: () => void = () => {};
const finishPractice = vi.fn();
const flushPracticeQueue = vi.fn();
vi.mock('./api', () => ({
  getAssignment: () => Promise.resolve({ id: 'x', title: 'HW', mode: 'practice', question_count: 1, due_at: null, time_limit_sec: null, max_attempts: null }),
  startAttempt: () => Promise.resolve('att'),
  getAttempt: () => Promise.resolve({ id: 'att', started_at: new Date().toISOString() }),
  getAttemptItems: () => Promise.resolve([{ pool_id: 'p1', position: 0, question: { id: 'q', type: 'typein', badge: 'B', prompt: 'Q', answers: ['amem'] } }]),
  recordPractice: () => new Promise<void>(r => (resolveRecord = r)),
  flushPracticeQueue: (...a: unknown[]) => flushPracticeQueue(...a),
  finishPractice: (...a: unknown[]) => finishPractice(...a),
  submitTest: vi.fn(),
}));
vi.mock('../auth/AuthProvider', () => ({ useAuth: () => ({ profile: { id: 'u1', role: 'student', display_name: 'M' } }) }));

import { RunAssignment } from './RunAssignment';

async function answerOnlyQuestion() {
  render(
    <MemoryRouter initialEntries={['/s/a/x']}>
      <Routes>
        <Route path="/s/a/:assignmentId" element={<RunAssignment />} />
        <Route path="/s/attempt/:id" element={<>RESULT</>} />
      </Routes>
    </MemoryRouter>,
  );
  await userEvent.click(await screen.findByRole('button', { name: /begin/i }));
  await userEvent.type(await screen.findByPlaceholderText(/type your answer/i), 'amem{Enter}');
  await userEvent.click(screen.getByRole('button', { name: /continue/i }));
}

beforeEach(() => {
  finishPractice.mockReset().mockResolvedValue({ score: 1, total: 1 });
  flushPracticeQueue.mockReset().mockResolvedValue({ sent: 0, remaining: 0 });
});

it('waits for in-flight answers before finishing the practice', async () => {
  await answerOnlyQuestion();
  expect(finishPractice).not.toHaveBeenCalled();
  await act(async () => resolveRecord());
  expect(await screen.findByText('RESULT')).toBeInTheDocument();
  expect(finishPractice).toHaveBeenCalledWith('att');
  expect(flushPracticeQueue).toHaveBeenLastCalledWith('u1', 'att');
});

it('shows a retry screen when answers could not be saved', async () => {
  flushPracticeQueue.mockResolvedValue({ sent: 0, remaining: 1 });
  await answerOnlyQuestion();
  await act(async () => resolveRecord());
  expect(await screen.findByText(/have not reached the server/i)).toBeInTheDocument();
  expect(finishPractice).not.toHaveBeenCalled();
  flushPracticeQueue.mockResolvedValue({ sent: 1, remaining: 0 });
  await userEvent.click(screen.getByRole('button', { name: /try again/i }));
  expect(await screen.findByText('RESULT')).toBeInTheDocument();
});
