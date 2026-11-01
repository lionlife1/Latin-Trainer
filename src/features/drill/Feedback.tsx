import { useEffect } from 'react';

interface Props {
  correct: boolean;
  answer: string;
  /** MC choices may contain markup from built-in content; typed answers are plain text. */
  answerIsHtml?: boolean;
  explanation?: string;
  onNext: () => void;
}

export function Feedback({ correct, answer, answerIsHtml, explanation, onNext }: Props) {
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
        <div className="feedback-icon">{correct ? '✓' : '✗'}</div>
        <div className="feedback-verdict">{correct ? 'Correct!' : 'Not quite.'}</div>
        <div className="feedback-correct">
          {correct ? 'Answer: ' : 'Correct answer: '}
          {answerIsHtml ? <strong dangerouslySetInnerHTML={{ __html: answer }} /> : <strong>{answer}</strong>}
        </div>
        {explanation && <div className="feedback-explanation">{explanation}</div>}
        <button className="btn-next" onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}
