import { Link, useParams } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { rendererFor } from '../items/registry';
import { getAttempt, getAttemptItems, getResponses } from './api';

export function AttemptReview({ attemptId }: { attemptId: string }) {
  const data = useAsync(async () => {
    const [items, responses] = await Promise.all([getAttemptItems(attemptId), getResponses(attemptId)]);
    return { items, responses: new Map(responses.map(r => [r.pool_id, r])) };
  }, [attemptId]);
  if (data.error) return <p className="form-error">{data.error}</p>;
  if (!data.data) return <p className="muted">Loading…</p>;
  return (
    <ol>
      {data.data.items.map(i => {
        const r = data.data!.responses.get(i.pool_id);
        const q = i.question;
        const { Review } = rendererFor(q);
        const revealed = 'answers' in q || 'correct' in q;
        return (
          <li key={i.pool_id} className="card">
            <div className="q-prompt small" dangerouslySetInnerHTML={{ __html: q.prompt }} />
            <Review q={q} given={r?.given} correct={r?.correct} revealed={revealed} />
          </li>
        );
      })}
    </ol>
  );
}

export function AttemptResult() {
  const { attemptId = '' } = useParams();
  const attempt = useAsync(() => getAttempt(attemptId), [attemptId]);
  if (attempt.error) return <p className="form-error">{attempt.error}</p>;
  const t = attempt.data;
  if (!t) return <p className="muted">Loading…</p>;
  const pct = t.total ? Math.round(((t.score ?? 0) / t.total) * 100) : 0;
  return (
    <>
      <div className="crumbs"><Link className="link" to="/s">Class</Link></div>
      <div className="complete-card" style={{ margin: '0 auto 24px' }}>
        <h1 className="complete-title">{t.submitted_at ? 'Submitted' : 'In progress'}</h1>
        <div className="complete-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="c-stat"><div className="c-stat-val">{t.score ?? 0}/{t.total}</div><div className="c-stat-label">Score</div></div>
          <div className="c-stat"><div className="c-stat-val">{pct}%</div><div className="c-stat-label">Accuracy</div></div>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          {t.is_late && <span className="pill warn">Submitted late</span>}
          {t.over_time && <span className="pill warn">Over time limit</span>}
        </div>
      </div>
      {t.submitted_at && <AttemptReview attemptId={attemptId} />}
    </>
  );
}
