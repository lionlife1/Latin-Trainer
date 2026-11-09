import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from '../../components/icons';
import type { VocabDirection } from '../../lib/vocab';
import { LatinField } from '../teacher/LatinField';
import { PasteImport } from './PasteImport';
import { MAX_CARDS, addCards, deleteSet, getSet, removeCard, updateCard, updateSet, type StudyCard } from './storage';

const SAVE_FAILED = "Couldn't save. Your browser's storage may be full.";
const DIRECTION_LABEL: Record<VocabDirection, string> = { l2e: 'Latin to English', e2l: 'English to Latin' };

export function SetEditor() {
  const { setId = '' } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(() => getSet(setId));
  const [name, setName] = useState(set?.name ?? '');
  const [perDay, setPerDay] = useState(String(set?.newPerDay ?? ''));
  const [latin, setLatin] = useState('');
  const [english, setEnglish] = useState('');
  const [editing, setEditing] = useState<{ id: string; latin: string; english: string } | null>(null);
  const [error, setError] = useState('');
  const latinWrap = useRef<HTMLSpanElement>(null);

  if (!set) return <Navigate to="/practice/vocab" replace />;

  const refresh = () => setSet(getSet(setId));

  const saveName = () => {
    if (name.trim() === set.name) return setName(set.name);
    if (!name.trim()) {
      setName(set.name);
      return setError('Give the set a name.');
    }
    if (!updateSet(setId, { name })) return setError(SAVE_FAILED);
    setError('');
    refresh();
    setName(getSet(setId)?.name ?? name);
  };
  const saveDirections = (dir: VocabDirection, on: boolean) => {
    const next = (['l2e', 'e2l'] as VocabDirection[]).filter(d => (d === dir ? on : set.directions.includes(d)));
    if (!next.length) return;
    setError(updateSet(setId, { directions: next }) ? '' : SAVE_FAILED);
    refresh();
  };
  const savePerDay = () => {
    const n = Number(perDay);
    if (!updateSet(setId, { newPerDay: Number.isFinite(n) ? n : set.newPerDay })) setError(SAVE_FAILED);
    else setError('');
    refresh();
    setPerDay(String(getSet(setId)?.newPerDay ?? set.newPerDay));
  };

  const add = () => {
    if (!latin.trim() || !english.trim()) return setError('Fill in both Latin and English.');
    if (set.cards.length >= MAX_CARDS) return setError(`This set is full (${MAX_CARDS} cards).`);
    const r = addCards(setId, [{ latin, english }]);
    if (!r.ok) return setError(SAVE_FAILED);
    if (r.duplicates) return setError('That card is already in the set.');
    if (r.invalid) return setError('Fill in both Latin and English.');
    if (r.overflow) return setError(`This set is full (${MAX_CARDS} cards).`);
    setError('');
    setLatin('');
    setEnglish('');
    refresh();
    latinWrap.current?.querySelector('input')?.focus();
  };

  const saveEdit = () => {
    if (!editing) return;
    const r = updateCard(setId, editing.id, editing);
    if (r === 'ok') {
      setError('');
      setEditing(null);
      refresh();
    } else {
      setError(
        r === 'duplicate' ? 'That card is already in the set.' : r === 'invalid' ? 'Fill in both Latin and English.' : SAVE_FAILED,
      );
    }
  };
  const remove = (c: StudyCard) => {
    setError(removeCard(setId, c.id) ? '' : SAVE_FAILED);
    refresh();
  };
  const del = () => {
    if (!window.confirm(`Delete "${set.name}"? Its cards and review history will be gone for good.`)) return;
    if (!deleteSet(setId)) return setError(SAVE_FAILED);
    navigate('/practice/vocab');
  };

  return (
    <div>
      <Link className="btn-back" to={`/practice/vocab/${setId}`}><ChevronLeft size={18} />Back to set</Link>
      <h1>Edit set</h1>

      <div className="section">
        <label className="field">
          <span>Set name</span>
          <input className="input" value={name} maxLength={80} onChange={e => setName(e.target.value)} onBlur={saveName} />
        </label>
        <fieldset className="field">
          <span>Study directions</span>
          {(['l2e', 'e2l'] as VocabDirection[]).map(d => {
            const on = set.directions.includes(d);
            return (
              <label key={d}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={on && set.directions.length === 1}
                  onChange={e => saveDirections(d, e.target.checked)}
                />{' '}
                {DIRECTION_LABEL[d]}
              </label>
            );
          })}
        </fieldset>
        <div className="field">
          <label htmlFor="vocab-per-day">New cards per day</label>
          <input
            id="vocab-per-day"
            className="input"
            type="number"
            min={1}
            max={100}
            value={perDay}
            aria-describedby="vocab-per-day-help"
            onChange={e => setPerDay(e.target.value)}
            onBlur={savePerDay}
          />
          <span id="vocab-per-day-help" className="muted small">How many new words Review adds each day. Words you have already started don&apos;t count.</span>
        </div>
      </div>

      <div className="section">
        <h2>Cards ({set.cards.length})</h2>
        <div className="vocab-add">
          <span ref={latinWrap}>
            <LatinField block aria-label="Latin" value={latin} onValueChange={setLatin} />
          </span>
          <input
            className="input"
            aria-label="English"
            placeholder="English"
            value={english}
            onChange={e => setEnglish(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button className="btn-primary" onClick={add}>Add card</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <PasteImport set={set} onAdded={refresh} />
        {set.cards.length > 0 && (
          <div className="panel" style={{ marginTop: 16 }}>
            <ul className="rows">
              {set.cards.map(c => (
                <li key={c.id}>
                  <div className="row-item">
                    {editing?.id === c.id ? (
                      <>
                        <div className="row-main vocab-add">
                          <input
                            className="input"
                            aria-label="Edit Latin"
                            value={editing.latin}
                            onChange={e => setEditing({ ...editing, latin: e.target.value })}
                          />
                          <input
                            className="input"
                            aria-label="Edit English"
                            value={editing.english}
                            onChange={e => setEditing({ ...editing, english: e.target.value })}
                          />
                        </div>
                        <div className="row-side">
                          <button className="btn-primary btn-small" onClick={saveEdit}>Save</button>
                          <button className="btn-ghost btn-small" onClick={() => setEditing(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="row-main">
                          <div className="row-title">{c.latin}</div>
                          <div className="row-sub">{c.english}</div>
                        </div>
                        <div className="row-side">
                          <button className="btn-ghost btn-small" onClick={() => setEditing({ id: c.id, latin: c.latin, english: c.english })}>Edit</button>
                          <button className="btn-ghost btn-small" onClick={() => remove(c)}>Remove</button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="section">
        <button className="btn-secondary" style={{ color: 'var(--error)' }} onClick={del}>Delete set</button>
      </div>
    </div>
  );
}
