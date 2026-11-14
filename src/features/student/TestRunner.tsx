import { useCallback, useEffect, useRef, useState } from 'react';
import type { PublicQuestion } from '../../lib/types';
import { MCAnswer } from '../drill/MCAnswer';
import { QuestionCard } from '../drill/QuestionCard';

export interface TestItem {
  pool_id: string;
  question: PublicQuestion;
}
export interface TestResponse {
  pool_id: string;
  given: string;
}

interface Props {
  attemptId: string;
  /** Server start time: the timer is derived from it so a refresh can't reset the clock. */
  startedAt: string;
  timeLimitSec: number | null;
  items: TestItem[];
  onSubmit: (responses: TestResponse[]) => Promise<void> | void;
  /** Shown above the submit button, e.g. when the last submit failed. */
  error?: string | null;
}

const storageKey = (attemptId: string) => `latiniq_test_${attemptId}`;

function loadAnswers(attemptId: string): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(attemptId)) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

export function clearSavedAnswers(attemptId: string) {
  sessionStorage.removeItem(storageKey(attemptId));
}

function remainingSec(startedAt: string, limit: number | null): number | null {
  if (!limit) return null;
  return Math.max(0, Math.ceil((new Date(startedAt).getTime() + limit * 1000 - Date.now()) / 1000));
}

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function TestRunner({ attemptId, startedAt, timeLimitSec, items, onSubmit, error }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => loadAnswers(attemptId));
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(() => remainingSec(startedAt, timeLimitSec));
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  const submit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    const responses = items.filter(i => answers[i.pool_id]?.trim()).map(i => ({ pool_id: i.pool_id, given: answers[i.pool_id] }));
    try {
      await onSubmit(responses);
    } catch {
      submitted.current = false;
      setSubmitting(false);
    }
  }, [answers, items, onSubmit]);

  useEffect(() => {
    sessionStorage.setItem(storageKey(attemptId), JSON.stringify(answers));
  }, [attemptId, answers]);

  useEffect(() => {
    if (!timeLimitSec) return;
    const t = setInterval(() => setLeft(remainingSec(startedAt, timeLimitSec)), 1000);
    return () => clearInterval(t);
  }, [startedAt, timeLimitSec]);

  useEffect(() => {
    if (left === 0) void submit();
  }, [left, submit]);

  const item = items[index];
  if (!item) return null;
  const q = item.question;
  const setAnswer = (v: string) => setAnswers(a => ({ ...a, [item.pool_id]: v }));
  const answeredCount = items.filter(i => answers[i.pool_id]?.trim()).length;

  return (
    <div className="screen active">
      <div className="drill-topbar">
        <div className="drill-progress-wrap">
          <div className="drill-progress-bar">
            <div className="drill-progress-fill" style={{ width: `${(answeredCount / items.length) * 100}%` }} />
          </div>
          <span className="drill-progress-label">{index + 1} / {items.length}</span>
        </div>
        {left !== null && <div className={`timer ${left < 60 ? 'low' : ''}`} aria-label="Time left">{fmtClock(left)}</div>}
      </div>

      <div className="drill-body" key={item.pool_id}>
        <QuestionCard badge={q.badge} prompt={q.prompt} hint={q.hint} />
        {q.type === 'typein' ? (
          <div className="answer-area">
            <div className="input-wrap">
              <input
                className="answer-input"
                placeholder="Type your answer…"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={answers[item.pool_id] ?? ''}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && index < items.length - 1) setIndex(index + 1);
                }}
              />
            </div>
            <div className="macron-toolbar"><span className="macron-hint">Macrons optional</span></div>
          </div>
        ) : q.type === 'mc' ? (
          <MCAnswer choices={q.choices} picked={answers[item.pool_id]} onPick={setAnswer} />
        ) : null}

        <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
          <button className="btn-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>Previous</button>
          {index < items.length - 1 ? (
            <button className="btn-secondary" onClick={() => setIndex(index + 1)}>Next</button>
          ) : (
            <span />
          )}
        </div>

        <div className="q-nav" aria-label="Questions">
          {items.map((it, i) => (
            <button
              key={it.pool_id}
              className={`${answers[it.pool_id]?.trim() ? 'answered' : ''} ${i === index ? 'current' : ''}`}
              aria-label={`Question ${i + 1}`}
              onClick={() => setIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button
          className="btn-primary"
          disabled={submitting}
          onClick={() => {
            const missing = items.length - answeredCount;
            const msg = missing ? `${missing} question${missing === 1 ? '' : 's'} unanswered. Submit anyway?` : 'Submit your test?';
            if (window.confirm(msg)) void submit();
          }}
        >
          {submitting ? 'Submitting…' : `Submit test (${answeredCount}/${items.length} answered)`}
        </button>
      </div>
    </div>
  );
}
