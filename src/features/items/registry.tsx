import type { FC } from 'react';
import { correctDisplay, type Grade, type PartResult } from '../../lib/grading';
import type { DrillQuestion, Given, MCQuestion, PublicQuestion } from '../../lib/types';
import type { PrintQuestion } from '../../lib/print';
import { MCAnswer } from '../drill/MCAnswer';
import { TypeInAnswer } from '../drill/TypeInAnswer';

type Answered = 'none' | 'partial' | 'full';

export interface ItemRenderer {
  /** Practice: collects one answer and calls onSubmit; once `result` is set it shows the outcome. */
  Practice: FC<{ q: DrillQuestion; result?: { given: Given; grade: Grade }; onSubmit: (given: Given) => void }>;
  /** Test: controlled; the question has no answers. */
  Test: FC<{ q: PublicQuestion; value: Given | undefined; onChange: (given: Given) => void; onEnter?: () => void }>;
  /** Result review. `revealed` is false when the server withheld the key. */
  Review: FC<{ q: DrillQuestion | PublicQuestion; given: Given | undefined; parts?: PartResult[]; correct?: boolean; revealed: boolean }>;
  /** The correct answer, for the item analysis table. */
  Answer: FC<{ q: DrillQuestion }>;
  /** True when the correct answer (from correctDisplay) is HTML rather than plain text. */
  answerIsHtml: boolean;
  PrintCopy: FC<{ pq: PrintQuestion }>;
  PrintKey: FC<{ pq: PrintQuestion }>;
  /** For the test runner's progress and question grid. */
  answered: (q: PublicQuestion, given: Given | undefined) => Answered;
}

const text = (given: Given | undefined): string => (typeof given === 'string' ? given : given ? JSON.stringify(given) : '');
const stringAnswered = (_q: PublicQuestion, given: Given | undefined): Answered => (text(given).trim() ? 'full' : 'none');

function ReviewBody({ q, given, correct, revealed, html }: { q: DrillQuestion | PublicQuestion; given: Given | undefined; correct?: boolean; revealed: boolean; html: boolean }) {
  const shown = correctDisplay(q as DrillQuestion);
  return (
    <>
      <p>
        <span className={`tag ${correct ? 'ok' : 'bad'}`}>{correct ? 'Right' : 'Wrong'}</span> Your answer: <strong>{text(given) || '(blank)'}</strong>
      </p>
      {revealed && !correct && (
        <p className="muted">
          Correct:{' '}
          {html ? <strong dangerouslySetInnerHTML={{ __html: shown }} /> : <strong>{shown}</strong>}
        </p>
      )}
    </>
  );
}

const mc: ItemRenderer = {
  Practice: ({ q, result, onSubmit }) => {
    const m = q as MCQuestion;
    return <MCAnswer choices={m.choices} correct={m.correct} picked={result?.given as string | undefined} onPick={onSubmit} />;
  },
  Test: ({ q, value, onChange }) => (
    <MCAnswer choices={(q as Omit<MCQuestion, 'correct' | 'explanation'>).choices} picked={value as string | undefined} onPick={onChange} />
  ),
  Review: p => <ReviewBody {...p} html />,
  Answer: ({ q }) => <span dangerouslySetInnerHTML={{ __html: correctDisplay(q) }} />,
  answerIsHtml: true,
  PrintCopy: ({ pq }) => (
    <ol className="print-choices" type="A">
      {(pq.question as MCQuestion).choices.map(c => <li key={c} dangerouslySetInnerHTML={{ __html: c }} />)}
    </ol>
  ),
  PrintKey: ({ pq }) => (
    <>
      <strong>{pq.keyLetter}</strong> <span dangerouslySetInnerHTML={{ __html: pq.keyHtml ?? '' }} />
    </>
  ),
  answered: stringAnswered,
};

const typein: ItemRenderer = {
  Practice: ({ result, onSubmit }) => (
    <TypeInAnswer
      disabled={!!result}
      verdict={result ? result.grade.right === result.grade.outOf : undefined}
      onSubmit={onSubmit}
    />
  ),
  Test: ({ value, onChange, onEnter }) => (
    <div className="answer-area">
      <div className="input-wrap">
        <input
          className="answer-input"
          placeholder="Type your answer…"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={text(value)}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onEnter?.();
          }}
        />
      </div>
      <div className="macron-toolbar"><span className="macron-hint">Macrons optional</span></div>
    </div>
  ),
  Review: p => <ReviewBody {...p} html={false} />,
  Answer: ({ q }) => <>{correctDisplay(q)}</>,
  answerIsHtml: false,
  PrintCopy: () => <div className="print-answer-line" />,
  PrintKey: ({ pq }) => <>{pq.keyText}</>,
  answered: stringAnswered,
};

const Unsupported: FC = () => <p className="muted">This question type is not supported yet.</p>;

const placeholder: ItemRenderer = {
  Practice: Unsupported,
  Test: Unsupported,
  Review: Unsupported,
  Answer: ({ q }) => <>{correctDisplay(q)}</>,
  answerIsHtml: false,
  PrintCopy: Unsupported,
  PrintKey: Unsupported,
  answered: () => 'none',
};

export const ITEM_RENDERERS: Record<DrillQuestion['type'], ItemRenderer> = {
  mc,
  typein,
  grid: placeholder,
  parse: placeholder,
};

export const rendererFor = (q: { type: DrillQuestion['type'] }): ItemRenderer => ITEM_RENDERERS[q.type];
