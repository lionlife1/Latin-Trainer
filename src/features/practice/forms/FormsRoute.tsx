import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildFormsSession, generateFormsQuestion } from '../../../lib/formsQuestions';
import { shuffle } from '../../../lib/shuffle';
import type { DrillQuestion } from '../../../lib/types';
import { DrillSession } from '../../drill/DrillSession';
import { SessionSummary } from '../../drill/SessionSummary';
import type { DrillResult } from '../../drill/useDrill';
import { todayISO, updateStreak } from '../../solo/progressStore';
import { appendSession } from '../sessionLog';
import { FormsSetup } from './FormsSetup';
import { loadFormsSettings, saveFormsSettings, type FormsSettings } from './formsSettings';

/** Logs a Forms run if the learner answered anything. Forms sessions stay on this device, so no sync request. */
export function logForms(results: DrillResult[]): boolean {
  if (!results.length) return false;
  appendSession({
    kind: 'forms', module_id: null, correct: results.filter(r => r.correct).length, total: results.length,
    xp: 0, completed: false,
  });
  updateStreak(todayISO());
  return true;
}

type View =
  | { kind: 'setup' }
  | { kind: 'drill'; settings: FormsSettings; questions: DrillQuestion[]; run: number }
  | { kind: 'done'; settings: FormsSettings; results: DrillResult[] };

/** Forms trainer: setup, then drill, then summary. Rendered without the shell (focus mode). */
export default function FormsRoute() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<FormsSettings>(loadFormsSettings);
  const [view, setView] = useState<View>({ kind: 'setup' });
  const toPractice = () => navigate('/practice');

  const begin = (s: FormsSettings, questions: DrillQuestion[]) => setView({ kind: 'drill', settings: s, questions, run: Date.now() });

  if (view.kind === 'drill') {
    const { config, length } = view.settings;
    const endless = length === 'endless';
    return (
      <DrillSession
        key={view.run}
        questions={view.questions}
        mode="practice"
        generate={endless ? () => generateFormsQuestion(config) : undefined}
        onFinish={results => {
          if (endless) return;
          logForms(results);
          setView({ kind: 'done', settings: view.settings, results });
        }}
        onExit={results => {
          if (endless) {
            logForms(results);
            toPractice();
          } else {
            setView({ kind: 'setup' });
          }
        }}
      />
    );
  }

  if (view.kind === 'done') {
    const wrong = view.results.filter(r => !r.correct).map(r => r.q);
    return (
      <SessionSummary
        results={view.results}
        onRetryWrong={() => begin(view.settings, shuffle(wrong))}
        onBack={toPractice}
        backLabel="Back to Practice"
      />
    );
  }

  return (
    <FormsSetup
      initial={settings}
      onBack={toPractice}
      onStart={s => {
        saveFormsSettings(s);
        setSettings(s);
        if (s.length === 'endless') {
          const first = generateFormsQuestion(s.config);
          if (first) begin(s, [first]);
        } else {
          begin(s, buildFormsSession(s.config, s.length));
        }
      }}
    />
  );
}
