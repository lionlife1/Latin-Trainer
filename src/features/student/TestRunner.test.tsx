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

describe('TestRunner structured answers', () => {
  const gridItem: TestItem = {
    pool_id: 'g1',
    question: {
      id: 'qg', type: 'grid', badge: 'B', prompt: 'Fill the grid', columns: ['Sg'],
      rows: [{ label: 'Nom', cells: [{ id: 'c1' }] }, { label: 'Acc', cells: [{ id: 'c2' }] }],
    } as TestItem['question'],
  };
  const props = (attemptId: string, onSubmit = vi.fn()) =>
    ({ attemptId, startedAt: new Date().toISOString(), timeLimitSec: null, items: [gridItem], onSubmit });

  it('saves a cell map to sessionStorage, marks the item partial, and submits an object', async () => {
    const onSubmit = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<TestRunner {...props('att4', onSubmit)} />);
    await userEvent.type(screen.getByLabelText('Nom, Sg'), 'rosa');
    expect(JSON.parse(sessionStorage.getItem('latiniq_test_att4')!)).toEqual({ g1: { c1: 'rosa' } });
    expect(screen.getByRole('button', { name: 'Question 1' })).toHaveClass('partial');
    expect(screen.getByRole('button', { name: 'Question 1' })).not.toHaveClass('answered');
    await userEvent.type(screen.getByLabelText('Acc, Sg'), 'rosam');
    expect(screen.getByRole('button', { name: 'Question 1' })).toHaveClass('answered');
    await userEvent.click(screen.getByRole('button', { name: /submit test/i }));
    expect(onSubmit).toHaveBeenCalledWith([{ pool_id: 'g1', given: { c1: 'rosa', c2: 'rosam' } }]);
    vi.mocked(window.confirm).mockRestore();
  });

  it('still loads answers an older client saved as strings', () => {
    sessionStorage.setItem('latiniq_test_att5', JSON.stringify({ p1: 'amem' }));
    render(<TestRunner {...{ ...props('att5'), items }} />);
    expect(screen.getByPlaceholderText(/type your answer/i)).toHaveValue('amem');
  });
});
