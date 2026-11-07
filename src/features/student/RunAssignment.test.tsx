import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

let resolveRecord: () => void = () => {};
const finishPractice = vi.fn();
const flushPracticeQueue = vi.fn();
const submitTest = vi.fn();
const getResponses = vi.fn();
let mode: 'practice' | 'test' = 'practice';
const item = (n: number) => ({ pool_id: `p${n}`, position: n - 1, question: { id: `q${n}`, type: 'typein', badge: 'B', prompt: `Q${n}`, answers: ['amem'] } });
let items = [item(1)];
vi.mock('./api', () => ({
  getAssignment: () => Promise.resolve({ id: 'x', title: 'HW', mode, question_count: items.length, due_at: null, time_limit_sec: null, max_attempts: null }),
  startAttempt: () => Promise.resolve('att'),
  getAttempt: () => Promise.resolve({ id: 'att', started_at: new Date().toISOString() }),
  getAttemptItems: () => Promise.resolve(items),
  getResponses: (...a: unknown[]) => getResponses(...a),
  recordPractice: () => new Promise<void>(r => (resolveRecord = r)),
  flushPracticeQueue: (...a: unknown[]) => flushPracticeQueue(...a),
  finishPractice: (...a: unknown[]) => finishPractice(...a),
  submitTest: (...a: unknown[]) => submitTest(...a),
}));
vi.mock('../auth/AuthProvider', () => ({ useAuth: () => ({ profile: { id: 'u1', role: 'student', display_name: 'M' } }) }));

import { RunAssignment } from './RunAssignment';

function renderRun() {
  render(
    <MemoryRouter initialEntries={['/s/a/x']}>
      <Routes>
        <Route path="/s/a/:assignmentId" element={<RunAssignment />} />
        <Route path="/s/attempt/:id" element={<>RESULT</>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function answerOnlyQuestion() {
  renderRun();
  await userEvent.click(await screen.findByRole('button', { name: /begin/i }));
  await userEvent.type(await screen.findByPlaceholderText(/type your answer/i), 'amem{Enter}');
  await userEvent.click(screen.getByRole('button', { name: /continue/i }));
}

beforeEach(() => {
  mode = 'practice';
  items = [item(1)];
  sessionStorage.clear();
  getResponses.mockReset().mockResolvedValue([]);
  submitTest.mockReset();
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

it('resumes a practice attempt at the first unanswered question', async () => {
  items = [item(1), item(2), item(3)];
  getResponses.mockResolvedValue([{ pool_id: 'p1', given: 'x', correct: false }]);
  renderRun();
  await userEvent.click(await screen.findByRole('button', { name: /begin/i }));
  expect(await screen.findByText('Q2')).toBeInTheDocument();
  expect(screen.getByText('1 / 2')).toBeInTheDocument();
  expect(getResponses).toHaveBeenCalledWith('att');
});

it('finishes straight away when every practice question was already answered', async () => {
  getResponses.mockResolvedValue([{ pool_id: 'p1', given: 'amem', correct: true }]);
  renderRun();
  await userEvent.click(await screen.findByRole('button', { name: /begin/i }));
  expect(await screen.findByText('RESULT')).toBeInTheDocument();
  expect(finishPractice).toHaveBeenCalledWith('att');
});

it('tells the student their practice answers are kept when they exit', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  renderRun();
  await userEvent.click(await screen.findByRole('button', { name: /begin/i }));
  await userEvent.click(await screen.findByRole('button', { name: /exit session/i }));
  expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/answers are saved/i));
  confirm.mockRestore();
});

it('shows the error on the test screen when submitting fails', async () => {
  mode = 'test';
  submitTest.mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce({ score: 1, total: 1 });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  renderRun();
  await userEvent.click(await screen.findByRole('button', { name: /begin/i }));
  await userEvent.type(await screen.findByPlaceholderText(/type your answer/i), 'amem');
  await userEvent.click(screen.getByRole('button', { name: /submit test/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not submit: network down/i);
  await userEvent.click(screen.getByRole('button', { name: /submit test/i }));
  expect(await screen.findByText('RESULT')).toBeInTheDocument();
  vi.mocked(window.confirm).mockRestore();
});
