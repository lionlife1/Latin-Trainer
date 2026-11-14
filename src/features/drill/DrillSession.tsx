import { useEffect } from 'react';
import { Close } from '../../components/icons';
import { correctDisplay } from '../../lib/grading';
import type { DrillQuestion } from '../../lib/types';
import { Feedback } from './Feedback';
import { MCAnswer } from './MCAnswer';
import { QuestionCard } from './QuestionCard';
import { TypeInAnswer } from './TypeInAnswer';
import { useDrill, type DrillOptions, type DrillResult } from './useDrill';

interface Props {
  questions: DrillQuestion[];
  mode: 'practice';
  onAnswer?: DrillOptions['onAnswer'];
  generate?: DrillOptions['generate'];
  /** Vocab review: offered after a right answer; re-rates that question as easy. */
  onEasy?: (q: DrillQuestion) => void;
  onFinish: (results: DrillResult[]) => void;
  /** Gets the answers so far, so endless sessions can be logged on exit. */
  onExit: (results: DrillResult[]) => void;
  /** Confirm text for the exit button. Endless sessions exit without asking. */
  exitWarning?: string;
}

const LOSE_ANSWERS = 'Exit this session? Your answers so far won\'t be saved.';

/** Practice-mode drill with instant feedback. Test mode uses TestRunner instead. */
export function DrillSession({ questions, mode, onAnswer, generate, onEasy, onFinish, onExit, exitWarning = LOSE_ANSWERS }: Props) {
  const drill = useDrill(questions, { mode, onAnswer, generate });
  const { current, index, total, finished, results, score, lastResult } = drill;

  useEffect(() => {
    if (finished) onFinish(results);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;
  const endless = Boolean(generate);

  return (
    <div className="screen active">
      <div className="drill-topbar">
        <button
          className="btn-back-small"
          aria-label="Exit session"
          onClick={() => {
            if (endless || window.confirm(exitWarning)) onExit(results);
          }}
        >
          <Close />
        </button>
        <div className="drill-progress-wrap">
          <div className="drill-progress-bar">
            <div
              className="drill-progress-fill"
              style={{ width: endless ? '100%' : `${(index / total) * 100}%` }}
            />
          </div>
          <span className="drill-progress-label">{endless ? `Endless · ${results.length} answered` : `${index + 1} / ${total}`}</span>
        </div>
        <div className="drill-score">{score} correct</div>
      </div>

      <div className="drill-body" key={current.id + index}>
        <QuestionCard badge={current.badge} prompt={current.prompt} hint={current.hint} />
        {current.type === 'typein' ? (
          <TypeInAnswer disabled={!!lastResult} verdict={lastResult?.correct} onSubmit={drill.answer} />
        ) : current.type === 'mc' ? (
          <MCAnswer choices={current.choices} correct={current.correct} picked={lastResult?.given} onPick={drill.answer} />
        ) : null}
      </div>

      {lastResult && (
        <Feedback
          correct={lastResult.correct === true}
          answer={correctDisplay(current)}
          answerIsHtml={current.type === 'mc'}
          explanation={current.explanation}
          onNext={drill.next}
          onEasy={onEasy && lastResult.correct ? () => { onEasy(current); drill.next(); } : undefined}
        />
      )}
    </div>
  );
}
