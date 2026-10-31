import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { resetPin } from '../auth/api';
import { validatePin } from '../../../supabase/functions/_shared/validate.ts';
import { deleteAssignment, getClass, getRoster, listAssignments, removeStudent, type RosterRow } from './api';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '—');

function ResetPin({ student, onDone }: { student: RosterRow; onDone: () => void }) {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="row"
      onSubmit={async e => {
        e.preventDefault();
        if (!validatePin(pin)) return setMsg('PIN must be 6 digits');
        const res = await resetPin(student.student_id, pin);
        setMsg(res.ok ? `PIN reset for ${student.display_name}` : res.error);
        if (res.ok) setTimeout(onDone, 1200);
      }}
    >
      <input className="input" aria-label={`New PIN for ${student.display_name}`} inputMode="numeric" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} placeholder="New 6-digit PIN" />
      <button className="btn-secondary" type="submit">Save</button>
      {msg && <span className="small">{msg}</span>}
    </form>
  );
}

export function ClassDetail() {
  const { classId = '' } = useParams();
  const cls = useAsync(() => getClass(classId), [classId]);
  const roster = useAsync(() => getRoster(classId), [classId]);
  const assignments = useAsync(() => listAssignments(classId), [classId]);
  const [resetting, setResetting] = useState<string | null>(null);

  if (cls.error) return <p className="form-error">{cls.error}</p>;
  if (!cls.data) return <p className="muted">Loading…</p>;

  return (
    <>
      <div className="crumbs"><Link className="link" to="/t">← Classes</Link></div>
      <h1>{cls.data.name}</h1>
      <div className="card">
        <div className="muted small">Students join at this site → “Join with a class code”</div>
        <div className="join-code" data-testid="join-code">{cls.data.join_code}</div>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>Assignments</h2>
        <div className="row">
          <Link className="btn-secondary" to={`/t/c/${classId}/grades`}>Gradebook</Link>
          <Link className="btn-primary" to={`/t/c/${classId}/new`}>+ New assignment</Link>
        </div>
      </div>
      <table className="table">
        <thead><tr><th>Title</th><th>Mode</th><th>Due</th><th>Questions</th><th /></tr></thead>
        <tbody>
          {assignments.data?.map(a => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td><span className={`pill ${a.mode === 'test' ? 'warn' : 'ok'}`}>{a.mode}</span></td>
              <td>{fmt(a.due_at)}</td>
              <td>{a.question_count}</td>
              <td className="row">
                <Link className="link small" to={`/t/a/${a.id}/analysis`}>Item analysis</Link>
                <button
                  className="btn-ghost small"
                  onClick={async () => {
                    if (window.confirm(`Delete "${a.title}" and all student attempts?`)) {
                      await deleteAssignment(a.id);
                      assignments.reload();
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {assignments.data?.length === 0 && <tr><td colSpan={5} className="muted">No assignments yet.</td></tr>}
        </tbody>
      </table>

      <h2>Roster ({roster.data?.length ?? 0})</h2>
      <table className="table">
        <thead><tr><th>Name</th><th>Joined</th><th /></tr></thead>
        <tbody>
          {roster.data?.map(s => (
            <tr key={s.student_id}>
              <td>{s.display_name}</td>
              <td className="muted small">{fmt(s.joined_at)}</td>
              <td>
                {resetting === s.student_id ? (
                  <ResetPin student={s} onDone={() => setResetting(null)} />
                ) : (
                  <div className="row">
                    <button className="btn-ghost small" onClick={() => setResetting(s.student_id)}>Reset PIN</button>
                    <button
                      className="btn-ghost small"
                      onClick={async () => {
                        if (window.confirm(`Remove ${s.display_name} from this class?`)) {
                          await removeStudent(classId, s.student_id);
                          roster.reload();
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {roster.data?.length === 0 && <tr><td colSpan={3} className="muted">No students yet. Share the class code.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
