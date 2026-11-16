import { act, fireEvent, render, screen } from '@testing-library/react';
import { Feedback } from './Feedback';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup() {
  const onNext = vi.fn();
  const outside = document.createElement('button');
  document.body.appendChild(outside);
  render(<Feedback correct answer="amat" onNext={onNext} />);
  // Let the deferred listener attach.
  act(() => { vi.advanceTimersByTime(1); });
  return { onNext, outside };
}

describe('Feedback Enter shortcut', () => {
  it('advances once on a plain Enter', () => {
    const { onNext } = setup();
    fireEvent.keyDown(document.body, { key: 'Enter' });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const { onNext } = setup();
    fireEvent.keyDown(document.body, { key: 'a' });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('ignores auto-repeated Enter', () => {
    const { onNext } = setup();
    fireEvent.keyDown(document.body, { key: 'Enter', repeat: true });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('leaves Enter on the Continue button to the button itself', () => {
    const { onNext } = setup();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Continue' }), { key: 'Enter' });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('ignores Enter on a button outside the card', () => {
    const { onNext, outside } = setup();
    fireEvent.keyDown(outside, { key: 'Enter' });
    expect(onNext).not.toHaveBeenCalled();
    outside.remove();
  });
});
