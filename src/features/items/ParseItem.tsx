import { useState } from 'react';
import { correctDisplay, grade, type PartResult } from '../../lib/grading';
import type { PrintQuestion } from '../../lib/print';
import type { DrillQuestion, Given, ParseField, ParseQuestion, PublicQuestion } from '../../lib/types';

type Picks = Record<string, string>;
type ParseLike = { fields: ParseField[]; key?: ParseQuestion['key'] };

const asPicks = (given: Given | undefined): Picks => (given && typeof given === 'object' ? given : {});
const asParse = (q: DrillQuestion | PublicQuestion | PrintQuestion['question']): ParseLike => q as unknown as ParseLike;
const optionLabel = (f: ParseField, value: string | undefined) => f.options.find(o => o.value === value)?.label ?? value ?? '';

/** The valid parse that matches the most fields (ties: the first), as grade() chooses it. */
function bestParse(q: ParseLike, picks: Picks): Picks | undefined {
  let best: Picks | undefined;
  let bestN = -1;
  for (const parse of q.key ?? []) {
    const n = q.fields.filter(f => picks[f.id] !== undefined && picks[f.id] === parse[f.id]).length;
    if (n > bestN) { best = parse; bestN = n; }
  }
  return best;
}

const parseText = (q: ParseLike, parse: Picks) =>
  q.fields.map(f => optionLabel(f, parse[f.id])).filter(l => l !== '').join(' ');

function Fields({ q, picks, onPick, disabled, verdict, shownCorrect }: {
  q: ParseLike;
  picks: Picks;
  onPick?: (id: string, value: string) => void;
  disabled?: boolean;
  verdict?: (id: string) => boolean | undefined;
  shownCorrect?: Picks;
}) {
  return (
    <div className="parse-item">
      {q.fields.map(f => {
        const ok = verdict?.(f.id);
        return (
          <div key={f.id} className={`parse-field ${ok === true ? 'right' : ok === false ? 'wrong' : ''}`}>
            <span className="parse-label" aria-hidden="true">{f.label}</span>
            <div role="radiogroup" aria-label={f.label} className="parse-options">
              {f.options.map(o => (
                <button
                  key={o.value}
                  type="button"
                  className={`parse-option ${picks[f.id] === o.value ? 'picked' : ''}`}
                  aria-pressed={picks[f.id] === o.value}
                  disabled={disabled}
                  onClick={() => onPick?.(f.id, o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {ok !== undefined && <span className={`tag ${ok ? 'ok' : 'bad'}`}>{ok ? 'Right' : 'Wrong'}</span>}
            {ok === false && shownCorrect && <span className="parse-correct">Correct: {optionLabel(f, shownCorrect[f.id])}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function ParsePractice({ q, result, onSubmit }: {
  q: DrillQuestion;
  result?: { given: Given; grade: { parts: PartResult[] } };
  onSubmit: (given: Given) => void;
}) {
  const p = asParse(q);
  const [picks, setPicks] = useState<Picks>({});
  const shown = result ? asPicks(result.given) : picks;
  const complete = p.fields.every(f => picks[f.id]);
  const best = result ? bestParse(p, shown) : undefined;
  const others = (p.key ?? []).filter(k => k !== best);
  return (
    <div className="answer-area">
      <Fields
        q={p}
        picks={shown}
        disabled={!!result}
        onPick={(id, v) => setPicks(s => ({ ...s, [id]: v }))}
        verdict={result ? id => result.grade.parts.find(x => x.id === id)?.ok : undefined}
        shownCorrect={best}
      />
      {result && others.length > 0 && (
        <p className="parse-also muted">Also correct: {others.map(k => parseText(p, k)).join(' / ')}</p>
      )}
      <div className="grid-actions">
        <button className="btn-submit" disabled={!!result || !complete} onClick={() => onSubmit(picks)}>Check</button>
      </div>
    </div>
  );
}

export function ParseTest({ q, value, onChange }: {
  q: PublicQuestion;
  value: Given | undefined;
  onChange: (given: Given) => void;
}) {
  const picks = asPicks(value);
  return (
    <div className="answer-area">
      <Fields q={asParse(q)} picks={picks} onPick={(id, v) => onChange({ ...picks, [id]: v })} />
    </div>
  );
}

export function ParseReview({ q, given, parts, correct, revealed }: {
  q: DrillQuestion | PublicQuestion;
  given: Given | undefined;
  parts?: PartResult[];
  correct?: boolean;
  revealed: boolean;
}) {
  const p = asParse(q);
  const picks = asPicks(given);
  const effective = parts ?? (p.key ? grade(q as DrillQuestion, picks).parts : undefined);
  const ok = effective ? effective.every(x => x.ok) : correct;
  return (
    <>
      <p>
        <span className={`tag ${ok ? 'ok' : 'bad'}`}>{ok ? 'Right' : 'Wrong'}</span>{' '}
        {effective && <strong>{effective.filter(x => x.ok).length}/{effective.length} correct</strong>}
      </p>
      <ul className="parse-review">
        {p.fields.map(f => {
          const v = effective?.find(x => x.id === f.id)?.ok;
          return (
            <li key={f.id}>
              {f.label}: <strong>{picks[f.id] ? optionLabel(f, picks[f.id]) : '(blank)'}</strong>
              {v !== undefined && <> <span className={`tag ${v ? 'ok' : 'bad'}`}>{v ? 'Right' : 'Wrong'}</span></>}
            </li>
          );
        })}
      </ul>
      {revealed && p.key && (
        <p className="muted">
          {p.key.length > 1 ? 'Valid parses: ' : 'Correct: '}
          <strong>{p.key.map(k => parseText(p, k)).join(' / ')}</strong>
        </p>
      )}
    </>
  );
}

export function parseAnswered(q: PublicQuestion, given: Given | undefined): 'none' | 'partial' | 'full' {
  const p = asParse(q);
  const picks = asPicks(given);
  const n = p.fields.filter(f => picks[f.id]).length;
  return n === 0 ? 'none' : n === p.fields.length ? 'full' : 'partial';
}

export const ParsePrintCopy = ({ pq }: { pq: PrintQuestion }) => (
  <div className="print-parse">
    {asParse(pq.question).fields.map(f => (
      <div key={f.id} className="print-parse-field">{f.label}: <span className="print-line short" /></div>
    ))}
  </div>
);

export const ParsePrintKey = ({ pq }: { pq: PrintQuestion }) => <>{correctDisplay(pq.question)}</>;
