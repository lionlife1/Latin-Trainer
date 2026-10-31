import { useMemo } from 'react';
import { normalize } from '../../lib/grading';
import { shuffle } from '../../lib/shuffle';

interface Props {
  choices: string[];
  /** Known only in practice mode; when set, choices are colored after answering. */
  correct?: string;
  picked?: string;
  onPick: (choice: string) => void;
}

export function MCAnswer({ choices, correct, picked, onPick }: Props) {
  const order = useMemo(() => shuffle(choices), [choices]);
  const answered = picked !== undefined;

  const classFor = (c: string) => {
    if (!answered) return 'mc-btn';
    if (correct === undefined) return c === picked ? 'mc-btn selected-choice' : 'mc-btn';
    if (normalize(c) === normalize(correct)) return 'mc-btn correct-choice';
    if (c === picked) return 'mc-btn wrong-choice';
    return 'mc-btn';
  };

  return (
    <div className="answer-area">
      <div className="mc-grid">
        {order.map(c => (
          <button
            key={c}
            className={classFor(c)}
            disabled={answered && correct !== undefined}
            onClick={() => onPick(c)}
            dangerouslySetInnerHTML={{ __html: c }}
          />
        ))}
      </div>
    </div>
  );
}
