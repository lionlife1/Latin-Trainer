import { Link } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { listMyAssignments } from './api';

type Row = Awaited<ReturnType<typeof listMyAssignments>>[number];

const fmtDue = (iso: string | null) =>
  iso ? `Due ${new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'No due date';

/** Overdue: past due with nothing submitted. Done: has a submitted attempt. To do: the rest, soonest due first. */
export function groupAssignments(rows: Row[], now = new Date()) {
  const overdue: Row[] = [];
  const todo: Row[] = [];
  const done: Row[] = [];
  for (const r of rows) {
    if (r.best) done.push(r);
    else if (r.assignment.due_at && new Date(r.assignment.due_at) < now) overdue.push(r);
    else todo.push(r);
  }
  const due = (r: Row) => (r.assignment.due_at ? new Date(r.assignment.due_at).getTime() : Infinity);
  todo.sort((a, b) => due(a) - due(b));
  return { overdue, todo, done };
}

function AssignmentRow({ row }: { row: Row }) {
  const { assignment: a, best, open, attempts } = row;
  const outOfAttempts = a.max_attempts !== null && attempts.length >= a.max_attempts && !open;
  const p = best && best.total ? Math.round(((best.score ?? 0) / best.total) * 100) : null;
  return (
    <li>
      <div className="row-item">
        <span className="row-main">
          <span className="row-title" style={{ display: 'block' }}>{a.title}</span>
          <span className="row-sub">
            <span className={`tag ${a.mode === 'test' ? 'warn' : 'info'}`}>{a.mode === 'test' ? 'Test' : 'Practice'}</span>{' '}
            {fmtDue(a.due_at)}
            {open && ' · In progress'}
          </span>
        </span>
        <span className="row-side">
          {best && (
            <span className="score">
              {best.score}/{best.total}{p !== null && ` · ${p}%`}
              {best.is_late && <> <span className="tag warn">Late</span></>}
            </span>
          )}
          {best && <Link className="link small" to={`/s/attempt/${best.id}`}>Results</Link>}
          {!outOfAttempts && (
            <Link className={best ? 'btn-secondary btn-small' : 'btn-primary btn-small'} to={`/s/a/${a.id}`}>
              {open ? 'Resume' : best ? 'Try again' : 'Start'}
            </Link>
          )}
        </span>
      </div>
    </li>
  );
}

function Group({ title, rows }: { title: string; rows: Row[] }) {
  if (!rows.length) return null;
  return (
    <section className="section">
      <h2>{title} <span className="muted small">({rows.length})</span></h2>
      <div className="panel"><ul className="rows">{rows.map(r => <AssignmentRow key={r.assignment.id} row={r} />)}</ul></div>
    </section>
  );
}

export function MyAssignments() {
  const { data, error, loading } = useAsync(listMyAssignments, []);
  const groups = groupAssignments(data ?? []);
  const scored = groups.done.filter(r => r.best?.total);
  const avg = scored.length
    ? Math.round(scored.reduce((s, r) => s + (r.best!.score ?? 0) / r.best!.total, 0) / scored.length * 100)
    : null;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Class</h1>
          <p>Work your teacher has assigned.</p>
        </div>
      </div>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {data && (
        <>
          <div className="stats">
            <div className="stat"><div className="stat-val">{groups.todo.length + groups.overdue.length}</div><div className="stat-label">To do</div></div>
            <div className="stat"><div className="stat-val">{groups.done.length}</div><div className="stat-label">Done</div></div>
            <div className="stat"><div className="stat-val">{avg === null ? '–' : `${avg}%`}</div><div className="stat-label">Average score</div></div>
          </div>
          {data.length === 0 && <div className="panel section"><p className="empty">Nothing assigned yet.</p></div>}
          <Group title="Overdue" rows={groups.overdue} />
          <Group title="To do" rows={groups.todo} />
          <Group title="Done" rows={groups.done} />
        </>
      )}
    </>
  );
}
