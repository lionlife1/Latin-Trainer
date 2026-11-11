import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { MODULES } from '../../content/modules';
import { shuffle } from '../../lib/shuffle';
import type { DrillQuestion } from '../../lib/types';
import { DrillSession } from '../drill/DrillSession';
import { SessionSummary } from '../drill/SessionSummary';
import type { DrillResult } from '../drill/useDrill';
import { ModuleIntro } from '../solo/ModuleIntro';
import { loadProgress, recordSession, todayISO, updateStreak } from '../solo/progressStore';
import { requestSync } from './useSessionSync';

type View =
  | { kind: 'intro' }
  | { kind: 'drill'; questions: DrillQuestion[]; run: number }
  | { kind: 'done'; results: DrillResult[]; note: string };

/** One grammar module: intro, then drill, then summary. Rendered without the shell (focus mode). */
export function ModuleRoute() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const mod = MODULES.find(m => m.id === moduleId);
  const [view, setView] = useState<View>({ kind: 'intro' });
  if (!mod) return <Navigate to="/practice/grammar" replace />;

  const toPath = () => navigate('/practice/grammar');
  const start = (questions: DrillQuestion[]) => setView({ kind: 'drill', questions, run: Date.now() });

  if (view.kind === 'drill') {
    return (
      <DrillSession
        key={view.run}
        questions={view.questions}
        mode="practice"
        onExit={() => setView({ kind: 'intro' })}
        onFinish={results => {
          const out = recordSession(mod, results);
          updateStreak(todayISO());
          requestSync();
          const min = Math.min(10, mod.questions.length);
          const note = out.completed
            ? `Module complete. You earned ${out.earnedXP} XP.`
            : `Score 70% or more on ${min}+ questions to complete this module.`;
          setView({ kind: 'done', results, note });
        }}
      />
    );
  }

  if (view.kind === 'done') {
    const wrong = view.results.filter(r => !r.correct).map(r => r.q);
    return (
      <SessionSummary results={view.results} onRetryWrong={() => start(shuffle(wrong))} onBack={toPath}>
        {view.note}
      </SessionSummary>
    );
  }

  return (
    <div className="screen active" style={{ padding: '0 16px' }}>
      <ModuleIntro
        mod={mod}
        progress={loadProgress()[mod.id]}
        onBack={toPath}
        onLesson={() => navigate(`/practice/grammar/${mod.id}/lesson`)}
        onStart={count => {
          const qs = shuffle(mod.questions);
          start(count === 'all' ? qs : qs.slice(0, count));
        }}
      />
    </div>
  );
}
