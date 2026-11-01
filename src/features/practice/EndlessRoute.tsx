import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRandomQuestion } from '../../lib/conjugator';
import type { DrillQuestion, EndlessConfig } from '../../lib/types';
import { DrillSession } from '../drill/DrillSession';
import type { DrillResult } from '../drill/useDrill';
import { EndlessModal } from '../solo/EndlessModal';
import { todayISO, updateStreak } from '../solo/progressStore';
import { appendSession } from './sessionLog';
import { requestSync } from './useSessionSync';

/** Logs an endless run if the learner answered anything. Returns whether it was logged. */
export function logEndless(results: DrillResult[]): boolean {
  if (!results.length) return false;
  appendSession({
    kind: 'endless', module_id: null, correct: results.filter(r => r.correct).length, total: results.length,
    xp: 0, completed: false,
  });
  updateStreak(todayISO());
  requestSync();
  return true;
}

export function EndlessRoute() {
  const navigate = useNavigate();
  const [run, setRun] = useState<{ cfg: EndlessConfig; first: DrillQuestion; key: number } | null>(null);

  if (!run) {
    return (
      <div className="screen active">
        <EndlessModal
          onCancel={() => navigate('/practice')}
          onStart={cfg => {
            const first = generateRandomQuestion(cfg);
            if (first) setRun({ cfg, first, key: Date.now() });
          }}
        />
      </div>
    );
  }

  return (
    <DrillSession
      key={run.key}
      questions={[run.first]}
      mode="practice"
      generate={() => generateRandomQuestion(run.cfg)}
      onFinish={() => {}}
      onExit={results => {
        logEndless(results);
        navigate('/practice');
      }}
    />
  );
}
