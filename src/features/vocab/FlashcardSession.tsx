import { useEffect, useState } from 'react';
import { Close } from '../../components/icons';
import type { DrillResult } from '../drill/useDrill';
import type { TypeInQuestion } from '../../lib/types';
import type { Rate } from './scheduler';
import { Flashcard } from './Flashcard';

interface Props {
  questions: TypeInQuestion[];
  onRate: (q: TypeInQuestion, r: Rate) => void;
  onFinish: (results: DrillResult[]) => void;
  onExit: (results: DrillResult[]) => void;
  exitWarning?: string;
}

const RATES: { rate: Rate; label: string }[] = [
  { rate: 'again', label: 'Again' },
  { rate: 'hard', label: 'Hard' },
  { rate: 'good', label: 'Good' },
  { rate: 'easy', label: 'Easy' },
];

export function FlashcardSession({ questions, onRate, onFinish, onExit, exitWarning = "Exit this session? Your answers so far won't be saved." }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<DrillResult[]>([]);
  const q = questions[index] as TypeInQuestion | undefined;
  const known = results.filter(r => r.correct).length;

  const rateCurrent = (r: Rate) => {
    if (!q || !flipped) return;
    const next = [...results, { q, given: r, correct: r !== 'again' }];
    onRate(q, r);
    setResults(next);
    setFlipped(false);
    setIndex(i => i + 1);
    if (index + 1 >= questions.length) onFinish(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped(f => !f);
      } else if (flipped && e.key >= '1' && e.key <= '4') {
        rateCurrent(RATES[Number(e.key) - 1].rate);
      }
    };
    // A focused card button would also flip on Space's keyup (Firefox), undoing our flip.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKeyUp);
    };
  }); // re-bind each render so the handler sees current state

  if (!q) return null;

  return (
    <div className="screen active">
      <div className="drill-topbar">
        <button
          className="btn-back-small"
          aria-label="Exit session"
          onClick={() => {
            if (window.confirm(exitWarning)) onExit(results);
          }}
        >
          <Close />
        </button>
        <div className="drill-progress-wrap">
          <div className="drill-progress-bar">
            <div className="drill-progress-fill" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <span className="drill-progress-label">{`${index + 1} / ${questions.length}`}</span>
        </div>
        <div className="drill-score">{known} known</div>
      </div>

      <div className="drill-body" key={q.id + index}>
        <Flashcard front={q.prompt} back={q.answers[0]} flipped={flipped} onFlip={() => setFlipped(f => !f)} />
        {flipped ? (
          <div className="rate-row">
            {RATES.map(r => (
              <button key={r.rate} className="btn-secondary" onClick={() => rateCurrent(r.rate)}>{r.label}</button>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ textAlign: 'center', marginTop: 16 }}>Tap the card to see the answer</p>
        )}
        <p className="muted small" style={{ textAlign: 'center' }}>Space flips the card. Keys 1 to 4 rate it.</p>
      </div>
    </div>
  );
}
