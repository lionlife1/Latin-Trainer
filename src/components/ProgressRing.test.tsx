import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

const arc = (c: HTMLElement) => c.querySelector('.ring-arc') as SVGCircleElement;
const offset = (c: HTMLElement) => Number(arc(c).getAttribute('stroke-dashoffset'));
const circ = (c: HTMLElement) => Number(arc(c).getAttribute('stroke-dasharray'));

describe('ProgressRing', () => {
  it('clamps value above 1', () => {
    const a = render(<ProgressRing value={1.4} label="a" />);
    const b = render(<ProgressRing value={1} label="b" />);
    expect(offset(a.container)).toBe(offset(b.container));
    expect(offset(a.container)).toBe(0);
  });
  it('clamps value below 0', () => {
    const a = render(<ProgressRing value={-2} label="a" />);
    expect(offset(a.container)).toBe(circ(a.container));
  });
  it('half value leaves half the circumference', () => {
    const { container } = render(<ProgressRing value={0.5} label="half" />);
    expect(offset(container)).toBeCloseTo(circ(container) / 2);
  });
  it('exposes the label and renders children', () => {
    render(
      <ProgressRing value={0.7} label="7 of 10 today">
        <span>7</span>
      </ProgressRing>,
    );
    expect(screen.getByRole('img', { name: '7 of 10 today' })).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
  });
});
