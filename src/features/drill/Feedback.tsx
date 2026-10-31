import { useEffect } from 'react';

interface Props {
  correct: boolean;
  answer: string;
  explanation?: string;
  onNext: () => void;
}

export function Feedback({ correct, answer, explanation, onNext }: Props) {
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
          <strong dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
        {explanation && <div className="feedback-explanation">{explanation}</div>}
        <button className="btn-next" onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}
