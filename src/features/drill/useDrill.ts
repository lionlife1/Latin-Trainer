import { useCallback, useRef, useState } from 'react';
import { isCorrect } from '../../lib/grading';
import type { AssignmentMode, DrillQuestion } from '../../lib/types';

export interface DrillResult {
  q: DrillQuestion;
  given: string;
  /** undefined in test mode: grading happens on the server. */
  correct: boolean | undefined;
}

export interface DrillOptions {
  mode: AssignmentMode;
  onAnswer?: (q: DrillQuestion, given: string, correct: boolean | undefined, ms: number) => void;
  /** Endless mode: called to append a new question whenever the learner advances. */
  generate?: () => DrillQuestion | null;
}

export function useDrill(initial: DrillQuestion[], opts: DrillOptions) {
  const [questions, setQuestions] = useState(initial);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<DrillResult[]>([]);
  const shownAt = useRef(Date.now());

  const current = questions[index] as DrillQuestion | undefined;
  const lastResult = results.length > index ? results[index] : undefined;
  const finished = !opts.generate && index >= questions.length;
  const score = results.filter(r => r.correct === true).length;

  const answer = useCallback(
    (given: string) => {
      if (!current || results.length > index) return;
      const correct = opts.mode === 'practice' ? isCorrect(current, given) : undefined;
      setResults(r => [...r, { q: current, given, correct }]);
      opts.onAnswer?.(current, given, correct, Date.now() - shownAt.current);
    },
    [current, index, results.length, opts],
  );

  const next = useCallback(() => {
    if (results.length <= index) return;
    if (opts.generate) {
      const q = opts.generate();
      if (q) setQuestions(qs => [...qs, q]);
    }
    shownAt.current = Date.now();
    setIndex(i => i + 1);
  }, [index, results.length, opts]);

  return { current, index, total: questions.length, answer, next, finished, results, score, lastResult };
}
