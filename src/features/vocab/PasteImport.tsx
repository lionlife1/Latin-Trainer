import { useMemo, useState } from 'react';
import { normalize } from '../../lib/grading';
import { parseVocabImport } from '../../lib/vocabImport';
import { LatinField } from '../teacher/LatinField';
import { MAX_CARDS, addCards, type StudySet } from './storage';

const SAVE_FAILED = "Couldn't save. Your browser's storage may be full.";
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const key = (latin: string, english: string) => `${normalize(latin)}\t${normalize(english)}`;

export function PasteImport({ set, onAdded }: { set: StudySet; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [previewed, setPreviewed] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const plan = useMemo(() => {
    if (previewed === null) return null;
    const { rows, skipped } = parseVocabImport(previewed);
    const have = new Set(set.cards.map(c => key(c.latin, c.english)));
    const fresh = rows.filter(r => !have.has(key(r.latin, r.english)));
    const room = Math.max(0, MAX_CARDS - set.cards.length);
    return { toAdd: fresh.slice(0, room), existing: rows.length - fresh.length, overflow: Math.max(0, fresh.length - room), skipped };
  }, [previewed, set.cards]);

  const close = () => {
    setOpen(false);
    setText('');
    setPreviewed(null);
    setError('');
  };

  const add = () => {
    if (!plan) return;
    const r = addCards(set.id, plan.toAdd.map(({ latin, english }) => ({ latin, english })));
    if (!r.ok) return setError(SAVE_FAILED);
    close();
    setMessage(
      `Added ${r.added} cards.` + (plan.overflow > 0 || r.overflow > 0 ? ` This set is full (${MAX_CARDS} cards).` : ''),
    );
    onAdded();
  };

  if (!open) {
    return (
      <div style={{ marginTop: 12 }}>
        <button className="btn-secondary" onClick={() => { setMessage(''); setOpen(true); }}>Import cards</button>
        {message && <p className="muted small" role="status">{message}</p>}
      </div>
    );
  }

  return (
    <div className="panel" style={{ marginTop: 12, padding: 16 }}>
      <h3>Import cards</h3>
      <p className="muted small">
        Paste one card per line: the Latin, then the English. Separate them with a tab (as Quizlet exports), a spaced dash ( - ), an equals sign ( = ) or a comma. If the Latin has commas in it, use a tab or a dash, or put the Latin in quotes.
      </p>
      <label className="field">
        <span>Cards to import</span>
        <LatinField
          multiline
          block
          shortcut={false}
          rows={6}
          aria-label="Cards to import"
          value={text}
          onValueChange={v => { setText(v); setPreviewed(null); }}
        />
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn-primary" onClick={() => setPreviewed(text)}>Preview</button>
        <button className="btn-ghost" onClick={close}>Cancel</button>
      </div>
      {plan && (
        <div style={{ marginTop: 12 }}>
          <p>{plural(plan.toAdd.length, 'card', 'cards')} ready to add</p>
          {plan.existing > 0 && <p className="muted">{plan.existing} already in the set</p>}
          {plan.overflow > 0 && <p className="form-error">This set is full ({MAX_CARDS} cards).</p>}
          {plan.skipped.map(s => (
            <p key={s.line} className="muted small">Line {s.line}: {s.reason}</p>
          ))}
          {plan.toAdd.length > 0 && (
            <button className="btn-primary" onClick={add}>Add {plural(plan.toAdd.length, 'card', 'cards')}</button>
          )}
        </div>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
