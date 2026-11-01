import { useParams } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { AttemptReview } from '../student/AttemptResult';
import { getAttempt } from '../student/api';

export function AttemptDetail() {
  const { attemptId = '' } = useParams();
  const attempt = useAsync(() => getAttempt(attemptId), [attemptId]);
  if (attempt.error) return <p className="form-error">{attempt.error}</p>;
  const t = attempt.data;
  if (!t) return <p className="muted">Loading…</p>;
  return (
    <>
      <div className="crumbs"><button className="btn-ghost link" onClick={() => history.back()}>← Back</button></div>
      <h1>Attempt: {t.score ?? 0}/{t.total}</h1>
      <p className="muted small">
        Started {new Date(t.started_at).toLocaleString()}
        {t.submitted_at && ` · submitted ${new Date(t.submitted_at).toLocaleString()}`}
        {t.is_late && ' · late'}
        {t.over_time && ' · over time limit'}
      </p>
      <AttemptReview attemptId={attemptId} />
    </>
  );
}
