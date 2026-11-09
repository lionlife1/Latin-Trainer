import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { DrillSession } from '../drill/DrillSession';
import { SessionSummary } from '../drill/SessionSummary';
import type { DrillResult } from '../drill/useDrill';
import { appendSession } from '../practice/sessionLog';
import { todayISO, updateStreak } from '../solo/progressStore';
import type { DrillQuestion, TypeInQuestion } from '../../lib/types';
import { FlashcardSession } from './FlashcardSession';
import { flashcardQuestion, learnSession, reviewQuestion } from './questions';
import { REVIEW_MAX, rate, reviewQueue, setCounts, type Rate } from './scheduler';
import { getSet, loadSrs, saveSrsRecord, type SrsRecord, type StudySet } from './storage';

export type StudyMode = 'review' | 'learn' | 'flashcards';
const MODES: readonly string[] = ['review', 'learn', 'flashcards'];
const EXIT_WARNING = "Stop now? What you've answered so far is saved.";
const LEARN_NOTE = "Learn is extra practice. It doesn't change when words come back for review.";

/** Logs a vocab session if anything was answered. Vocab sessions stay on this device, so no sync request. */
export function logVocab(setId: string, results: DrillResult[]): boolean {
  if (!results.length) return false;
  appendSession({
    kind: 'vocab', module_id: null, set_id: setId,
    correct: results.filter(r => r.correct).length, total: results.length, xp: 0, completed: false,
  });
  updateStreak(todayISO());
  return true;
}

export function StudyRoute() {
  const { setId = '', mode = '' } = useParams();
  const set = getSet(setId);
  if (!set) return <Navigate to="/practice/vocab" replace />;
  if (!MODES.includes(mode)) return <Navigate to={`/practice/vocab/${set.id}`} replace />;
  return <Study key={`${set.id}:${mode}`} set={set} mode={mode as StudyMode} />;
}

function Notice({ title, children, onBack }: { title: string; children: string; onBack: () => void }) {
  return (
    <div className="screen active">
      <div className="complete-card">
        <h1 className="complete-title">{title}</h1>
        <p className="muted">{children}</p>
        <div className="complete-buttons">
          <button className="btn-secondary" onClick={onBack}>Back to set</button>
        </div>
      </div>
    </div>
  );
}

function Study({ set, mode }: { set: StudySet; mode: StudyMode }) {
  const navigate = useNavigate();
  const back = () => navigate(`/practice/vocab/${set.id}`);
  const [questions] = useState<DrillQuestion[]>(() => {
    const srs = loadSrs();
    if (mode === 'learn') return learnSession(set, srs);
    const queue = reviewQueue(set, srs, new Date(), REVIEW_MAX);
    return mode === 'review' ? queue.map(i => reviewQuestion(i, set)) : queue.map(flashcardQuestion);
  });
  const [summary, setSummary] = useState<DrillResult[] | null>(null);
  const [retry, setRetry] = useState<{ qs: DrillQuestion[]; key: number } | null>(null);
  const before = useRef(new Map<string, SrsRecord | undefined>());

  if (!questions.length) {
    return mode === 'learn' ? (
      <Notice title="Not enough cards" onBack={back}>Learn needs at least two cards in the set.</Notice>
    ) : (
      <Notice title="All caught up" onBack={back}>Nothing in this set is due right now. Come back tomorrow, or use Learn for extra practice.</Notice>
    );
  }

  const finish = (results: DrillResult[]) => {
    logVocab(set.id, results);
    setSummary(results);
  };
  const exit = (results: DrillResult[]) => {
    logVocab(set.id, results);
    back();
  };

  if (summary) {
    const wrong = summary.filter(r => !r.correct).map(r => r.q);
    const counts = setCounts(set, loadSrs(), new Date());
    return (
      <SessionSummary
        results={summary}
        backLabel="Back to set"
        onBack={back}
        onRetryWrong={mode === 'flashcards' ? undefined : () => { setRetry({ qs: wrong, key: Date.now() }); setSummary(null); }}
      >
        {mode === 'learn' ? LEARN_NOTE : `${counts.due} still due today · ${counts.learned} learned`}
      </SessionSummary>
    );
  }

  if (retry) {
    return (
      <DrillSession
        key={retry.key}
        questions={retry.qs}
        mode="practice"
        exitWarning={EXIT_WARNING}
        onFinish={setSummary}
        onExit={() => back()}
      />
    );
  }

  if (mode === 'flashcards') {
    return (
      <FlashcardSession
        questions={questions as TypeInQuestion[]}
        exitWarning={EXIT_WARNING}
        onRate={(q, r: Rate) => { saveSrsRecord(q.id, rate(loadSrs()[q.id], r, new Date())); }}
        onFinish={finish}
        onExit={exit}
      />
    );
  }

  return (
    <DrillSession
      questions={questions}
      mode="practice"
      exitWarning={EXIT_WARNING}
      onAnswer={mode === 'review' ? (q, _given, correct) => {
        const prev = loadSrs()[q.id];
        before.current.set(q.id, prev);
        saveSrsRecord(q.id, rate(prev, correct ? 'good' : 'again', new Date()));
      } : undefined}
      onEasy={mode === 'review' ? q => { saveSrsRecord(q.id, rate(before.current.get(q.id), 'easy', new Date())); } : undefined}
      onFinish={finish}
      onExit={exit}
    />
  );
}
