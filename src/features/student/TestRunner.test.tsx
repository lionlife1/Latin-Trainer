import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestRunner, type TestItem } from './TestRunner';

const items: TestItem[] = [
  { pool_id: 'p1', question: { id: 'q1', type: 'typein', badge: 'B', prompt: 'First' } },
  { pool_id: 'p2', question: { id: 'q2', type: 'mc', badge: 'B', prompt: 'Second', choices: ['x', 'y'] } },
];

beforeEach(() => sessionStorage.clear());
afterEach(() => vi.useRealTimers());

describe('TestRunner', () => {
  it('restores typed answers after a remount (page refresh)', async () => {
    const props = { attemptId: 'att1', startedAt: new Date().toISOString(), timeLimitSec: null, items, onSubmit: vi.fn() };
    const { unmount } = render(<TestRunner {...props} />);
    await userEvent.type(screen.getByPlaceholderText(/type your answer/i), 'amem');
    expect(JSON.parse(sessionStorage.getItem('latiniq_test_att1')!)).toEqual({ p1: 'amem' });
    unmount();
    render(<TestRunner {...props} />);
    expect(screen.getByPlaceholderText(/type your answer/i)).toHaveValue('amem');
  });

  it('never shows correctness feedback while answering', async () => {
    render(<TestRunner attemptId="att2" startedAt={new Date().toISOString()} timeLimitSec={null} items={items} onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/type your answer/i), 'amem{Enter}');
    expect(screen.getByText('Second')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'y' }));
    expect(screen.queryByText(/correct!|not quite/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'y' })).toHaveClass('selected-choice');
  });

  it('auto-submits when the server-based timer runs out', async () => {
    vi.useFakeTimers();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    sessionStorage.setItem('latiniq_test_att3', JSON.stringify({ p2: 'x' }));
    const startedAt = new Date(Date.now() - 58_000).toISOString();
    render(<TestRunner attemptId="att3" startedAt={startedAt} timeLimitSec={60} items={items} onSubmit={onSubmit} />);
    expect(screen.getByText(/0:0[12]/)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith([{ pool_id: 'p2', given: 'x' }]);
  });
});
