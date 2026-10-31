import { Link } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { listMyAssignments } from './api';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : 'No due date');

export function MyAssignments() {
  const { data, error, loading } = useAsync(listMyAssignments, []);
  return (
    <>
      <h1>My assignments</h1>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      <table className="table">
        <thead><tr><th>Assignment</th><th>Due</th><th>Status</th><th /></tr></thead>
        <tbody>
          {data?.map(({ assignment: a, best, open, latest, attempts }) => {
            const overdue = a.due_at && new Date(a.due_at) < new Date() && !best;
            const outOfAttempts = a.max_attempts !== null && attempts.length >= a.max_attempts && !open;
            return (
              <tr key={a.id}>
                <td>
                  {a.title} <span className={`pill ${a.mode === 'test' ? 'warn' : 'ok'}`}>{a.mode}</span>
                </td>
                <td className="small">{fmt(a.due_at)}</td>
                <td>
                  {best ? (
                    <span className="pill ok">Done {best.score}/{best.total}{best.is_late ? ' · late' : ''}</span>
                  ) : open ? (
                    <span className="pill warn">In progress</span>
                  ) : overdue ? (
                    <span className="pill bad">Overdue</span>
                  ) : (
                    <span className="pill">Not started</span>
                  )}
                </td>
                <td className="row">
                  {!outOfAttempts && (
                    <Link className="link" to={`/s/a/${a.id}`}>{open ? 'Resume' : best ? 'Try again' : 'Start'}</Link>
                  )}
                  {latest && <Link className="link small" to={`/s/attempt/${latest.id}`}>Results</Link>}
                </td>
              </tr>
            );
          })}
          {data?.length === 0 && <tr><td colSpan={4} className="muted">Nothing assigned yet.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
