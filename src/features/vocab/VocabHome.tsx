import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from '../../components/icons';
import { useSyncVersion } from '../practice/useSessionSync';
import { setCounts } from './scheduler';
import { starterSets, type StarterSet } from './starterSets';
import { createSet, loadSets, loadSrs } from './storage';

export function VocabHome() {
  useSyncVersion();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const srs = loadSrs();
  const now = new Date();
  const existing = loadSets();
  const sets = existing
    .map(s => ({ set: s, counts: setCounts(s, srs, now) }))
    .sort((a, b) => b.set.updatedAt.localeCompare(a.set.updatedAt));

  const create = () => {
    const set = createSet(name);
    if (!set) return setError("Couldn't save. Your browser's storage may be full.");
    navigate(`/practice/vocab/${set.id}/edit`);
  };

  const add = (st: StarterSet) => {
    const set = createSet(st.name, st.cards, st.id);
    if (!set) return setError("Couldn't save. Your browser's storage may be full.");
    navigate(`/practice/vocab/${set.id}`);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Vocab</h1>
          <p>Your own study sets. Reviews are spaced out so words stick.</p>
        </div>
        {!adding && <button className="btn-primary" onClick={() => setAdding(true)}>New set</button>}
      </div>

      {!adding && error && <p className="error" role="alert">{error}</p>}

      {adding && (
        <form className="panel" onSubmit={e => { e.preventDefault(); create(); }}>
          <label className="field">
            <span>Set name</span>
            <input className="input" autoFocus value={name} maxLength={80} onChange={e => setName(e.target.value)} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="btn-primary">Create</button>{' '}
          <button type="button" className="btn-secondary" onClick={() => { setAdding(false); setName(''); setError(''); }}>Cancel</button>
        </form>
      )}

      <section className="section">
        <h2>Your sets</h2>
        <div className="panel">
          {sets.length === 0 ? (
            <p className="empty">No study sets yet. Make your first one with New set.</p>
          ) : (
            <ul className="rows">
              {sets.map(({ set, counts }) => (
                <li key={set.id}>
                  <Link className="row-item" to={`/practice/vocab/${set.id}`}>
                    <span className="row-main">
                      <span className="row-title" style={{ display: 'block' }}>{set.name}</span>
                      <span className="row-sub">{set.cards.length} {set.cards.length === 1 ? 'card' : 'cards'} · {counts.due} due today</span>
                    </span>
                    <span className="row-side">
                      {counts.due > 0 && <span className="tag info">{counts.due} due</span>}
                      <ChevronRight size={18} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Starter sets</h2>
        <p className="muted">Core words from the LatinIQ dictionary, grouped for study. Adding one gives you your own copy to edit.</p>
        <div className="panel">
          <ul className="rows">
            {starterSets().map(st => {
              const copy = existing.find(s => s.source === st.id);
              return (
                <li key={st.id}>
                  <div className="row-item">
                    <span className="row-main">
                      <span className="row-title" style={{ display: 'block' }}>{st.name}</span>
                      <span className="row-sub">{st.cards.length} cards</span>
                    </span>
                    <span className="row-side">
                      {copy ? (
                        <>
                          <span className="tag info">Added</span>
                          <Link to={`/practice/vocab/${copy.id}`} aria-label={`Open ${st.name}`}><ChevronRight size={18} /></Link>
                        </>
                      ) : (
                        <button className="btn-secondary btn-small" onClick={() => add(st)}>Add</button>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <p className="muted small">Sets are saved in this browser only. They don't sync to your account or other devices.</p>
    </>
  );
}
