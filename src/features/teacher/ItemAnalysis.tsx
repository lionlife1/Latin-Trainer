import { Link, useParams } from 'react-router-dom';
import { correctDisplay } from '../../lib/grading';
import { useAsync } from '../../lib/useAsync';
import { getAssignment, itemAnalysis } from './api';

export function ItemAnalysis() {
  const { assignmentId = '' } = useParams();
  const data = useAsync(async () => {
    const [assignment, rows] = await Promise.all([getAssignment(assignmentId), itemAnalysis(assignmentId)]);
    // Hardest first; unanswered items last.
    rows.sort((a, b) => (a.pct_correct ?? 101) - (b.pct_correct ?? 101));
    return { assignment, rows };
  }, [assignmentId]);

  if (data.error) return <p className="form-error">{data.error}</p>;
  if (!data.data) return <p className="muted">Loading…</p>;
  const { assignment, rows } = data.data;

  return (
    <>
      <div className="crumbs"><Link className="link" to={`/t/c/${assignment.class_id}`}>← Class</Link></div>
      <h1>{assignment.title}: item analysis</h1>
      <p className="muted small">Hardest questions first. Common wrong answers show which misconception to reteach.</p>
      <table className="table">
        <thead><tr><th>Question</th><th>Answer</th><th>% correct</th><th>Responses</th><th>Common wrong answers</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.pool_id}>
              <td><div className="small" dangerouslySetInnerHTML={{ __html: r.question.prompt }} /></td>
              <td className="small">
                {r.question.type === 'mc' ? <span dangerouslySetInnerHTML={{ __html: correctDisplay(r.question) }} /> : correctDisplay(r.question)}
              </td>
              <td>
                {r.pct_correct === null ? (
                  <span className="muted">—</span>
                ) : (
                  <>
                    {r.pct_correct}%
                    <div className="bar"><div style={{ width: `${r.pct_correct}%` }} /></div>
                  </>
                )}
              </td>
              <td>{r.n}</td>
              <td className="small">
                {r.top_wrong.map(w => (
                  <div key={w.answer}>
                    <code>{w.answer}</code> × {w.count}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
