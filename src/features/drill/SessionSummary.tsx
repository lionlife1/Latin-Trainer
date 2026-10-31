import type { ReactNode } from 'react';
import type { DrillResult } from './useDrill';

interface Props {
  results: DrillResult[];
  children?: ReactNode;
  onRetryWrong?: () => void;
  onBack: () => void;
  backLabel?: string;
}

export function SessionSummary({ results, children, onRetryWrong, onBack, backLabel = '← Module Map' }: Props) {
  const correct = results.filter(r => r.correct).length;
  const wrong = results.length - correct;
  const pct = results.length ? Math.round((correct / results.length) * 100) : 0;
  return (
    <div className="screen active">
      <div className="complete-card">
        <div className="complete-trophy">🏆</div>
        <h1 className="complete-title">Session Complete!</h1>
        <div className="complete-stats">
          <div className="c-stat"><div className="c-stat-val" style={{ color: 'var(--green)' }}>{correct}</div><div className="c-stat-label">Correct</div></div>
          <div className="c-stat"><div className="c-stat-val" style={{ color: 'var(--red)' }}>{wrong}</div><div className="c-stat-label">Wrong</div></div>
          <div className="c-stat"><div className="c-stat-val">{pct}%</div><div className="c-stat-label">Accuracy</div></div>
          <div className="c-stat"><div className="c-stat-val" style={{ color: 'var(--gold)' }}>{correct * 10}</div><div className="c-stat-label">Points</div></div>
        </div>
        {children && <div className="complete-breakdown">{children}</div>}
        <div className="complete-buttons">
          {onRetryWrong && (
            <button className="btn-primary" disabled={wrong === 0} onClick={onRetryWrong}>
              {wrong === 0 ? 'No wrong answers!' : `Drill ${wrong} Wrong Answer${wrong !== 1 ? 's' : ''}`}
            </button>
          )}
          <button className="btn-secondary" onClick={onBack}>{backLabel}</button>
        </div>
      </div>
    </div>
  );
}
