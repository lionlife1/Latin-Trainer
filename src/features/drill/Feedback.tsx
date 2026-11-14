import { useEffect } from 'react';

interface Props {
  correct: boolean;
  answer: string;
  /** MC choices may contain markup from built-in content; typed answers are plain text. */
  answerIsHtml?: boolean;
  explanation?: string;
  /** Grid and parse items: "7/10 correct", shown instead of the answer. */
  summary?: string;
  onNext: () => void;
  /** Vocab review only: re-rate the answer as easy and move on. */
  onEasy?: () => void;
}

export function Feedback({ correct, answer, answerIsHtml, explanation, summary, onNext, onEasy }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onNext();
    };
    // Defer so the Enter that submitted the answer doesn't also advance.
    const t = setTimeout(() => document.addEventListener('keydown', onKey), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [onNext]);

  return (
    <div className="feedback-overlay" role="dialog" aria-live="polite">
      <div className={`feedback-card ${correct ? 'is-correct' : 'is-wrong'}`}>
        <div className="feedback-verdict">{correct ? 'Correct' : 'Not quite'}</div>
        <div className="feedback-correct">
          {summary !== undefined ? (
            <strong>{summary}</strong>
          ) : (
            <>
              {correct ? 'Answer: ' : 'Correct answer: '}
              {answerIsHtml ? <strong dangerouslySetInnerHTML={{ __html: answer }} /> : <strong>{answer}</strong>}
            </>
          )}
        </div>
        {explanation && <div className="feedback-explanation">{explanation}</div>}
        {onEasy ? (
          <div className="feedback-actions">
            <button className="btn-secondary" onClick={onEasy}>That was easy</button>
            <button className="btn-next" onClick={onNext}>Continue</button>
          </div>
        ) : (
          <button className="btn-next" onClick={onNext}>Continue</button>
        )}
      </div>
    </div>
  );
}
