import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { enqueue, PermanentError, type QueueJob } from '../../lib/offlineQueue';
import type { DrillQuestion } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../auth/AuthProvider';
import { DrillSession } from '../drill/DrillSession';
import {
  finishPractice, flushPracticeQueue, getAssignment, getAttempt, getAttemptItems, recordPractice, startAttempt,
  submitTest, type AttemptItem, type AttemptRow,
} from './api';
import { clearSavedAnswers, TestRunner, type TestItem } from './TestRunner';

type Run = { attempt: AttemptRow; items: AttemptItem[] };

export function RunAssignment() {
  const { assignmentId = '' } = useParams();
  const navigate = useNavigate();
  const assignment = useAsync(() => getAssignment(assignmentId), [assignmentId]);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState<'no' | 'saving' | 'failed'>('no');
  const inFlight = useRef(new Set<Promise<void>>());
  const userId = useAuth().profile?.id ?? '';

  useEffect(() => {
    if (!userId) return;
    const retry = () => void flushPracticeQueue(userId);
    retry();
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [userId]);

  const savePractice = (job: QueueJob) => {
    const p = recordPractice(job).catch(e => {
      if (!(e instanceof PermanentError)) enqueue(job);
    });
    inFlight.current.add(p);
    void p.finally(() => inFlight.current.delete(p));
  };

  const finishRun = async (attemptId: string) => {
    setFinishing('saving');
    setError(null);
    try {
      await Promise.all([...inFlight.current]);
      const { remaining } = await flushPracticeQueue(userId, attemptId);
      if (remaining > 0) throw new Error('Some answers have not reached the server yet. Check your connection.');
      await finishPractice(attemptId);
      navigate(`/s/attempt/${attemptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setFinishing('failed');
    }
  };

  const begin = async () => {
    setBusy(true);
    setError(null);
    try {
      const attemptId = await startAttempt(assignmentId);
      const [attempt, items] = await Promise.all([getAttempt(attemptId), getAttemptItems(attemptId)]);
      setRun({ attempt, items });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setBusy(false);
  };

  if (assignment.error) return <p className="form-error">{assignment.error}</p>;
  const a = assignment.data;
  if (!a) return <p className="muted">Loading…</p>;

  if (run && a.mode === 'practice' && finishing !== 'no') {
    return (
      <div className="complete-card" style={{ margin: '0 auto' }}>
        {finishing === 'saving' ? (
          <p className="muted">Saving your answers…</p>
        ) : (
          <>
            <p className="form-error" role="alert">{error}</p>
            <button className="btn-primary" onClick={() => finishRun(run.attempt.id)}>Try again</button>
          </>
        )}
      </div>
    );
  }

  if (run && a.mode === 'practice') {
    const poolIdOf = new Map<DrillQuestion, string>(run.items.map(i => [i.question as DrillQuestion, i.pool_id]));
    return (
      <DrillSession
        questions={run.items.map(i => i.question as DrillQuestion)}
        mode="practice"
        onAnswer={(q, given, _correct, ms) =>
          savePractice({ userId, attemptId: run.attempt.id, poolId: poolIdOf.get(q)!, given, ms })
        }
        onExit={() => navigate('/s')}
        onFinish={() => void finishRun(run.attempt.id)}
      />
    );
  }

  if (run && a.mode === 'test') {
    return (
      <TestRunner
        attemptId={run.attempt.id}
        startedAt={run.attempt.started_at}
        timeLimitSec={a.time_limit_sec}
        items={run.items as TestItem[]}
        onSubmit={async responses => {
          try {
            await submitTest(run.attempt.id, responses);
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            // Already submitted (e.g. from another tab): just show the result.
            if (!/already submitted/i.test(msg)) {
              setError(`Could not submit: ${msg}. Your answers are saved; try again.`);
              throw e;
            }
          }
          clearSavedAnswers(run.attempt.id);
          navigate(`/s/attempt/${run.attempt.id}`);
        }}
      />
    );
  }

  return (
    <>
      <div className="crumbs"><Link className="link" to="/s">← Assignments</Link></div>
      <div className="intro-card" style={{ margin: '0 auto' }}>
        <div className="intro-module-badge">{a.mode === 'test' ? 'TEST' : 'PRACTICE'}</div>
        <h1 className="intro-title">{a.title}</h1>
        <div className="intro-stats">
          <div className="intro-stat"><div className="intro-stat-val">{a.question_count}</div><div className="intro-stat-label">Questions</div></div>
          {a.time_limit_sec && (
            <div className="intro-stat"><div className="intro-stat-val">{Math.round(a.time_limit_sec / 60)}m</div><div className="intro-stat-label">Time limit</div></div>
          )}
          {a.max_attempts && (
            <div className="intro-stat"><div className="intro-stat-val">{a.max_attempts}</div><div className="intro-stat-label">Attempts allowed</div></div>
          )}
        </div>
        <p className="intro-desc">
          {a.mode === 'test'
            ? 'You will not see whether answers are right until you submit. You can move between questions freely.'
            : 'You get feedback after every answer.'}
          {a.due_at && ` Due ${new Date(a.due_at).toLocaleString()}.`}
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn-primary" disabled={busy} onClick={begin}>{busy ? 'Starting…' : 'Begin →'}</button>
      </div>
    </>
  );
}
