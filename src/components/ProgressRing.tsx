import type { ReactNode } from 'react';

type Props = {
  /** 0..1, clamped. */
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  /** A CSS var such as `var(--success)`; defaults to `var(--primary)`. */
  color?: `var(--${string})`;
  children?: ReactNode;
};

export function ProgressRing({ value, size = 64, stroke = 6, label, color, children }: Props) {
  const v = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring-track" cx={mid} cy={mid} r={r} strokeWidth={stroke} fill="none" />
        <circle
          className="ring-arc"
          cx={mid}
          cy={mid}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform={`rotate(-90 ${mid} ${mid})`}
          style={color ? { stroke: color } : undefined}
        />
      </svg>
      {children !== undefined && <div className="ring-inner">{children}</div>}
    </div>
  );
}
