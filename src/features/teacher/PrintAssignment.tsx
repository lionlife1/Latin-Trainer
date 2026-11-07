import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buildPrintVersions, type PrintVersion } from '../../lib/print';
import { useAsync } from '../../lib/useAsync';
import { getAssignment, getAssignmentPool } from './api';

/** Stable default seed per assignment, so reprinting gives the same versions. */
function seedFrom(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

function StudentCopy({ title, version, header, multi }: { title: string; version: PrintVersion; header: boolean; multi: boolean }) {
  return (
    <section className="print-sheet" aria-label={`Student copy${multi ? `, version ${version.label}` : ''}`}>
      <div className="print-title">
        <h2>{title}</h2>
        {multi && <span className="print-version">Version {version.label}</span>}
      </div>
      {header && (
        <div className="print-header">
          <span>Name <span className="print-line" /></span>
          <span>Date <span className="print-line short" /></span>
          <span>Class <span className="print-line short" /></span>
        </div>
      )}
      <ol className="print-questions">
        {version.questions.map(pq => (
          <li key={pq.question.id} className="print-q">
            {/* Prompt and choice HTML is escaped at generation, as in the student runner. */}
            <div className="print-prompt" dangerouslySetInnerHTML={{ __html: pq.question.prompt }} />
            {pq.question.type === 'mc' ? (
              <ol className="print-choices" type="A">
                {pq.question.choices.map(c => <li key={c} dangerouslySetInnerHTML={{ __html: c }} />)}
              </ol>
            ) : (
              <div className="print-answer-line" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function AnswerKey({ title, version, multi }: { title: string; version: PrintVersion; multi: boolean }) {
  return (
    <section className="print-sheet" aria-label={`Answer key${multi ? `, version ${version.label}` : ''}`}>
      <div className="print-title">
        <h2>{title}: answer key</h2>
        {multi && <span className="print-version">Version {version.label}</span>}
      </div>
      <ol className="print-key">
        {version.questions.map(pq => (
          <li key={pq.question.id}>
            {pq.question.type === 'mc' ? (
              <>
                <strong>{pq.keyLetter}</strong> <span dangerouslySetInnerHTML={{ __html: pq.keyHtml ?? '' }} />
              </>
            ) : (
              pq.keyText
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PrintAssignment() {
  const { assignmentId = '' } = useParams();
  const data = useAsync(async () => {
    const [assignment, pool] = await Promise.all([getAssignment(assignmentId), getAssignmentPool(assignmentId)]);
    return { assignment, pool };
  }, [assignmentId]);
  const [versions, setVersions] = useState(1);
  const [header, setHeader] = useState(true);
  const [copies, setCopies] = useState(true);
  const [keys, setKeys] = useState(true);
  const [seed, setSeed] = useState(() => seedFrom(assignmentId));

  const printed = useMemo(
    () => (data.data ? buildPrintVersions(data.data.pool, data.data.assignment.question_count, versions, seed) : []),
    [data.data, versions, seed],
  );

  if (data.error) return <p className="form-error">{data.error}</p>;
  if (!data.data) return <p className="muted">Loading…</p>;
  const { assignment, pool } = data.data;
  const multi = versions > 1;
  const n = printed[0]?.questions.length ?? 0;

  return (
    <>
      <div className="no-print">
        <div className="crumbs"><Link className="link" to={`/t/c/${assignment.class_id}`}>← Class</Link></div>
        <h1>{assignment.title}: print</h1>
        <p className="muted small">
          {n} of {pool.length} questions, the same count as online. Versions have the same questions in a different
          order, with MC choices shuffled. Use your browser's print dialog to print or save as PDF.
        </p>
        <div className="card print-options">
          <label>
            Versions{' '}
            <select className="select" value={versions} onChange={e => setVersions(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>A, B</option>
              <option value={3}>A, B, C</option>
            </select>
          </label>
          <label><input type="checkbox" checked={header} onChange={e => setHeader(e.target.checked)} /> Name, date and class lines</label>
          <label><input type="checkbox" checked={copies} onChange={e => setCopies(e.target.checked)} /> Student copies</label>
          <label><input type="checkbox" checked={keys} onChange={e => setKeys(e.target.checked)} /> Answer keys</label>
          <button className="btn-ghost small" onClick={() => setSeed(s => (s + 1) >>> 0)}>Reshuffle</button>
          <button className="btn-primary" onClick={() => window.print()} disabled={n === 0 || (!copies && !keys)}>Print</button>
        </div>
        {n === 0 && <p className="form-error">This assignment has no questions to print.</p>}
      </div>
      {copies && printed.map(v => <StudentCopy key={`s${v.label}`} title={assignment.title} version={v} header={header} multi={multi} />)}
      {keys && printed.map(v => <AnswerKey key={`k${v.label}`} title={assignment.title} version={v} multi={multi} />)}
    </>
  );
}
