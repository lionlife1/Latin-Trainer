import { Link, useParams } from 'react-router-dom';
import { downloadCsv, toCsv } from '../../lib/csv';
import { useAsync } from '../../lib/useAsync';
import { getClass, gradebook, listAssignments, type AssignmentRow, type GradebookRow } from './api';

const byCreated = (a: AssignmentRow, b: AssignmentRow) => a.created_at.localeCompare(b.created_at);

function students(rows: GradebookRow[]) {
  const m = new Map<string, string>();
  rows.forEach(r => m.set(r.student_id, r.display_name));
  return [...m].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}

const cellOf = (rows: GradebookRow[], studentId: string, assignmentId: string) =>
  rows.find(r => r.student_id === studentId && r.assignment_id === assignmentId);

export function gradebookCsv(rows: GradebookRow[], assignments: AssignmentRow[]): string {
  const cols = [...assignments].sort(byCreated);
  return toCsv([
    ['Student', ...cols.map(a => a.title)],
    ...students(rows).map(s => [
      s.name,
      ...cols.map(a => {
        const c = cellOf(rows, s.id, a.id);
        return c && c.attempts > 0 ? `${c.best_score}/${c.total}${c.any_late ? ' (late)' : ''}` : null;
      }),
    ]),
  ]);
}

export function Gradebook() {
  const { classId = '' } = useParams();
  const data = useAsync(async () => {
    const [cls, assignments, rows] = await Promise.all([getClass(classId), listAssignments(classId), gradebook(classId)]);
    return { cls, assignments: [...assignments].sort(byCreated), rows };
  }, [classId]);

  if (data.error) return <p className="form-error">{data.error}</p>;
  if (!data.data) return <p className="muted">Loading…</p>;
  const { cls, assignments, rows } = data.data;

  return (
    <>
      <div className="crumbs"><Link className="link" to={`/t/c/${classId}`}>← {cls.name}</Link></div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Gradebook</h1>
        <button className="btn-secondary" onClick={() => downloadCsv(`${cls.name} grades.csv`, gradebookCsv(rows, assignments))}>
          Export CSV
        </button>
      </div>
      <p className="muted small">Best submitted score per student. ⏰ = late or over the time limit. Click a score to see that attempt's answers.</p>
      <div className="scroll-x">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              {assignments.map(a => (
                <th key={a.id}>
                  <Link className="link" to={`/t/a/${a.id}/analysis`}>{a.title}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students(rows).map(s => (
              <tr key={s.id}>
                <th scope="row">{s.name}</th>
                {assignments.map(a => {
                  const c = cellOf(rows, s.id, a.id);
                  if (!c || c.attempts === 0) return <td key={a.id} className="muted">—</td>;
                  const label = `${c.best_score}/${c.total}${c.any_late ? ' ⏰' : ''}`;
                  const attemptId = c.best_attempt_id ?? c.latest_attempt_id;
                  return (
                    <td key={a.id}>
                      {attemptId ? <Link className="link" to={`/t/attempt/${attemptId}`}>{label}</Link> : label}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
