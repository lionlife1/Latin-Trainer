import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DrillSession } from './DrillSession';
import type { DrillQuestion } from '../../lib/types';

const typein: DrillQuestion = { id: 'a', type: 'typein', badge: 'CONJUGATE', prompt: 'Give <b>amem</b>', answers: ['amem'], explanation: 'Because.' };
const mc: DrillQuestion = { id: 'b', type: 'mc', badge: 'IDENTIFY', prompt: 'Pick', choices: ['x', 'y'], correct: 'y' };

describe('DrillSession', () => {
  it('submits typein on Enter and shows correct feedback', async () => {
    render(<DrillSession questions={[typein]} mode="practice" onFinish={() => {}} onExit={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/type your answer/i), 'amēm{Enter}');
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Because.')).toBeInTheDocument();
  });

  it('marks a wrong mc choice and reveals the correct one', async () => {
    render(<DrillSession questions={[mc]} mode="practice" onFinish={() => {}} onExit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'x' }));
    expect(screen.getByRole('button', { name: 'x' })).toHaveClass('wrong-choice');
    expect(screen.getByRole('button', { name: 'y' })).toHaveClass('correct-choice');
    expect(screen.getByText('Not quite')).toBeInTheDocument();
  });

  it('calls onFinish with results after the last question', async () => {
    const onFinish = vi.fn();
    render(<DrillSession questions={[mc]} mode="practice" onFinish={onFinish} onExit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'y' }));
    await userEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(onFinish).toHaveBeenCalledWith([expect.objectContaining({ correct: true, given: 'y' })]);
  });
});

describe('DrillSession onEasy', () => {
  it('offers That was easy only after a right answer', async () => {
    const onEasy = vi.fn();
    const { unmount } = render(<DrillSession questions={[typein]} mode="practice" onEasy={onEasy} onFinish={() => {}} onExit={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/type your answer/i), 'nope{Enter}');
    expect(screen.queryByRole('button', { name: 'That was easy' })).not.toBeInTheDocument();
    unmount();

    const onFinish = vi.fn();
    render(<DrillSession questions={[typein]} mode="practice" onEasy={onEasy} onFinish={onFinish} onExit={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/type your answer/i), 'amem{Enter}');
    await userEvent.click(screen.getByRole('button', { name: 'That was easy' }));
    expect(onEasy).toHaveBeenCalledWith(typein);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('never shows That was easy without the prop', async () => {
    render(<DrillSession questions={[typein]} mode="practice" onFinish={() => {}} onExit={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText(/type your answer/i), 'amem{Enter}');
    expect(screen.queryByRole('button', { name: 'That was easy' })).not.toBeInTheDocument();
  });
});
