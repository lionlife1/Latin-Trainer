import { useState, type ReactNode } from 'react';
import { grade, type PartResult } from '../../lib/grading';
import type { PrintQuestion } from '../../lib/print';
import type { DrillQuestion, GridQuestion, Given, PublicQuestion } from '../../lib/types';

type GridLike = Pick<GridQuestion, 'columns' | 'rows'> & { key?: GridQuestion['key'] };
type Values = Record<string, string>;

const asValues = (given: Given | undefined): Values => (given && typeof given === 'object' ? given : {});
const asGrid = (q: DrillQuestion | PublicQuestion | PrintQuestion['question']): GridLike => q as unknown as GridLike;

const isAnswerCell = (c: { id: string; given?: string } | null): c is { id: string; given?: string } =>
  c !== null && c.given === undefined;

/** The shared table. `renderCell` draws the cells the student is asked for. */
function GridTable({ q, renderCell, className = 'grid-item' }: {
  q: GridLike;
  renderCell: (id: string, column: string) => ReactNode;
  className?: string;
}) {
  return (
    <table className={className}>
      <thead>
        <tr>
          <td />
          {q.columns.map(c => <th key={c} scope="col">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {q.rows.map(row => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {row.cells.map((cell, i) => {
              const col = q.columns[i];
              if (cell === null) return <td key={i} data-col={col} className="grid-none">–</td>;
              if (cell.given !== undefined) return <td key={i} data-col={col} className="grid-given">{cell.given}</td>;
              return <td key={i} data-col={col}>{renderCell(cell.id, col)}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const answerCellIds = (q: GridLike): string[] => q.rows.flatMap(r => r.cells.filter(isAnswerCell).map(c => c.id));
const rowLabelOf = (q: GridLike, id: string) => q.rows.find(r => r.cells.some(c => c?.id === id))?.label ?? '';

function GridInput({ q, values, onChange, onEnter, readOnly, parts, firstAccepted }: {
  q: GridLike;
  values: Values;
  onChange?: (v: Values) => void;
  onEnter?: () => void;
  readOnly?: boolean;
  parts?: PartResult[];
  firstAccepted?: (id: string) => string | undefined;
}) {
  const verdict = (id: string) => parts?.find(p => p.id === id)?.ok;
  return (
    <GridTable
      q={q}
      renderCell={(id, column) => {
        const ok = verdict(id);
        return (
          <>
            <input
              type="text"
              className={`grid-input ${ok === true ? 'correct' : ok === false ? 'wrong' : ''}`}
              aria-label={`${rowLabelOf(q, id)}, ${column}`}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              readOnly={readOnly}
              value={values[id] ?? ''}
              onChange={e => onChange?.({ ...values, [id]: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  onEnter?.();
                }
              }}
            />
            {ok === false && firstAccepted && <span className="grid-correct">{firstAccepted(id)}</span>}
          </>
        );
      }}
    />
  );
}

export function GridPractice({ q, result, onSubmit }: {
  q: DrillQuestion;
  result?: { given: Given; grade: { parts: PartResult[] } };
  onSubmit: (given: Given) => void;
}) {
  const g = asGrid(q);
  const [values, setValues] = useState<Values>({});
  const shown = result ? asValues(result.given) : values;
  const canCheck = !result && Object.values(values).some(v => v.trim() !== '');
  const submit = () => {
    if (canCheck) onSubmit(values);
  };
  return (
    <div className="answer-area">
      <GridInput
        q={g}
        values={shown}
        onChange={setValues}
        onEnter={submit}
        readOnly={!!result}
        parts={result?.grade.parts}
        firstAccepted={id => g.key?.[id]?.[0]}
      />
      <div className="grid-actions">
        <button className="btn-submit" onClick={submit} disabled={!canCheck}>Check</button>
      </div>
      <div className="macron-toolbar"><span className="macron-hint">Macrons are optional.</span></div>
    </div>
  );
}

export function GridTest({ q, value, onChange, onEnter }: {
  q: PublicQuestion;
  value: Given | undefined;
  onChange: (given: Given) => void;
  onEnter?: () => void;
}) {
  return (
    <div className="answer-area">
      <GridInput q={asGrid(q)} values={asValues(value)} onChange={onChange} onEnter={onEnter} />
      <div className="macron-toolbar"><span className="macron-hint">Macrons optional</span></div>
    </div>
  );
}

export function GridReview({ q, given, parts, correct, revealed }: {
  q: DrillQuestion | PublicQuestion;
  given: Given | undefined;
  parts?: PartResult[];
  correct?: boolean;
  revealed: boolean;
}) {
  const g = asGrid(q);
  const values = asValues(given);
  const effective = parts ?? (g.key ? grade(q as DrillQuestion, given ?? {}).parts : undefined);
  const right = effective?.filter(p => p.ok).length;
  const ok = effective ? effective.every(p => p.ok) : correct;
  const verdict = (id: string) => effective?.find(p => p.id === id)?.ok;
  return (
    <>
      <p>
        <span className={`tag ${ok ? 'ok' : 'bad'}`}>{ok ? 'Right' : 'Wrong'}</span>{' '}
        {effective && <strong>{right}/{effective.length} correct</strong>}
      </p>
      <GridTable
        q={g}
        renderCell={id => {
          const v = verdict(id);
          return (
            <>
              <span className={`grid-answer ${v === true ? 'correct' : v === false ? 'wrong' : ''}`}>{values[id] || '(blank)'}</span>
              {revealed && v === false && g.key?.[id] && <span className="grid-correct">{g.key[id][0]}</span>}
            </>
          );
        }}
      />
    </>
  );
}

export function gridAnswered(q: PublicQuestion, given: Given | undefined): 'none' | 'partial' | 'full' {
  const ids = answerCellIds(asGrid(q));
  const v = asValues(given);
  const filled = ids.filter(id => (v[id] ?? '').trim() !== '').length;
  return filled === 0 ? 'none' : filled === ids.length ? 'full' : 'partial';
}

function PrintGrid({ pq, filled }: { pq: PrintQuestion; filled: boolean }) {
  const g = asGrid(pq.question);
  return (
    <GridTable
      q={g}
      className="print-grid"
      renderCell={id => (filled ? <>{(g.key?.[id] ?? []).join(' / ')}</> : <span className="print-grid-blank" />)}
    />
  );
}

export const GridPrintCopy = ({ pq }: { pq: PrintQuestion }) => <PrintGrid pq={pq} filled={false} />;
export const GridPrintKey = ({ pq }: { pq: PrintQuestion }) => <PrintGrid pq={pq} filled />;
