import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import { MODULES } from '../../content/modules';
import { generateRandomQuestion } from '../../lib/conjugator';
import { shuffle } from '../../lib/shuffle';
import type { DrillQuestion, EndlessConfig, ModuleContent } from '../../lib/types';
import { DrillSession } from '../drill/DrillSession';
import { SessionSummary } from '../drill/SessionSummary';
import type { DrillResult } from '../drill/useDrill';
import { hasBackend } from '../../lib/supabase';
import { EndlessModal } from './EndlessModal';
import { ModuleIntro } from './ModuleIntro';
import { ModuleMap } from './ModuleMap';
import { loadProgress, loadStreak, loadTotalXP, recordSession, resetAll, todayISO, updateStreak } from './progressStore';

type View =
  | { kind: 'map' }
  | { kind: 'intro'; mod: ModuleContent }
  | { kind: 'drill'; mod?: ModuleContent; questions: DrillQuestion[]; endless?: EndlessConfig; run: number }
  | { kind: 'done'; mod?: ModuleContent; results: DrillResult[]; note?: string };

export function SoloHome() {
  const [view, setView] = useState<View>({ kind: 'map' });
  const [showEndless, setShowEndless] = useState(false);
  const [, rerender] = useState(0);
  const progress = loadProgress();

  const startDrill = (questions: DrillQuestion[], mod?: ModuleContent, endless?: EndlessConfig) =>
    setView({ kind: 'drill', questions, mod, endless, run: Date.now() });

  if (view.kind === 'intro') {
    return (
      <ModuleIntro
        mod={view.mod}
        progress={progress[view.mod.id]}
        onBack={() => setView({ kind: 'map' })}
        onStart={count => {
          const qs = shuffle(view.mod.questions);
          startDrill(count === 'all' ? qs : qs.slice(0, count), view.mod);
        }}
      />
    );
  }

  if (view.kind === 'drill') {
    const cfg = view.endless;
    return (
      <DrillSession
        key={view.run}
        questions={view.questions}
        mode="practice"
        generate={cfg ? () => generateRandomQuestion(cfg) : undefined}
        onExit={() => setView({ kind: 'map' })}
        onFinish={results => {
          let note: string | undefined;
          if (view.mod) {
            const out = recordSession(view.mod, results);
            const streak = updateStreak(todayISO());
            note = out.completed
              ? `✓ Module marked complete (+${out.earnedXP} XP)`
              : out.pct < 70
                ? '⚠ Score below 70% — module not marked complete'
                : '⚠ Session too short to mark complete (need 10+)';
            note += ` · 🔥 Streak: ${streak.count} day${streak.count !== 1 ? 's' : ''}`;
          }
          setView({ kind: 'done', mod: view.mod, results, note });
        }}
      />
    );
  }

  if (view.kind === 'done') {
    const wrong = view.results.filter(r => !r.correct).map(r => r.q);
    return (
      <SessionSummary
        results={view.results}
        onRetryWrong={() => startDrill(shuffle(wrong), view.mod)}
        onBack={() => setView({ kind: 'map' })}
      >
        {view.note}
      </SessionSummary>
    );
  }

  return (
    <div className="screen active">
      <AppHeader subtitle="TSJCL Advanced Grammar · Subjunctive Mastery">
        <button className="btn-primary btn-small" onClick={() => setShowEndless(true)}>⚡ Endless Train</button>
        <span className="streak-badge">🔥 {loadStreak().count} day streak</span>
        <span className="xp-badge">⚡ {loadTotalXP()} XP</span>
      </AppHeader>
      {hasBackend && (
        <nav className="class-links">
          <span>In a class?</span>
          <Link to="/join">Join with a class code</Link>
          <Link to="/student/login">Student sign in</Link>
          <Link to="/teacher/login">Teacher sign in</Link>
        </nav>
      )}
      <ModuleMap modules={MODULES} progress={progress} onOpen={mod => setView({ kind: 'intro', mod })} />
      <footer className="app-footer">
        <button
          className="btn-ghost"
          onClick={() => {
            if (window.confirm('Reset ALL progress, XP, and streak? This cannot be undone.')) {
              resetAll();
              rerender(n => n + 1);
            }
          }}
        >
          ↺ Reset Progress
        </button>
        <span className="footer-note">Solo practice is saved on this device only</span>
      </footer>
      {showEndless && (
        <EndlessModal
          onCancel={() => setShowEndless(false)}
          onStart={cfg => {
            setShowEndless(false);
            const first = generateRandomQuestion(cfg);
            if (first) startDrill([first], undefined, cfg);
          }}
        />
      )}
    </div>
  );
}
