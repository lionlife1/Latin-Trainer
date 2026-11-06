import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../auth/AuthProvider';
import {
  addCustomWord, addListItem, deleteVocabList, getVocabList, removeListItem, renameVocabList, searchLexicon,
  updateListItem, type LexiconRow, type VocabListItemRow,
} from './api';
import { LatinField } from './LatinField';
import { LEXICON_CREDIT } from './VocabLists';

const POS = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'other'];

function OverrideCell({ item, onSaved }: { item: VocabListItemRow; onSaved: () => void }) {
  const [value, setValue] = useState(item.definition_override ?? '');
  return (
    <input
      className="input"
      style={{ width: '100%' }}
      placeholder={item.lexicon.definition}
      value={value}
      aria-label={`Definition for ${item.lexicon.lemma}`}
      onChange={e => setValue(e.target.value)}
      onBlur={async () => {
        const next = value.trim() || null;
        if (next !== item.definition_override) {
          await updateListItem(item.id, next);
          onSaved();
        }
      }}
    />
  );
}

export function VocabListEditor() {
  const { listId = '' } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const list = useAsync(() => getVocabList(listId), [listId]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<LexiconRow[]>([]);
  const [custom, setCustom] = useState({ headword: '', definition: '', pos: 'noun' });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      searchLexicon(q).then(setResults, e => setErr(String(e)));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  if (list.error) return <p className="form-error">{list.error}</p>;
  if (!list.data) return <p className="muted">Loading…</p>;
  const { list: meta, items } = list.data;
  const inList = new Set(items.map(i => i.lexicon_id));
  const nextPos = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0;

  const add = async (lexiconId: number) => {
    try {
      await addListItem(listId, lexiconId, nextPos);
      list.reload();
    } catch (e) {
      setErr(String(e));
    }
  };

  return (
    <>
      <div className="crumbs"><Link className="link" to="/t/vocab">← Vocab lists</Link></div>
      <input
        className="input"
        style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', width: '100%' }}
        defaultValue={meta.name}
        aria-label="List name"
        onBlur={e => e.target.value.trim() && e.target.value !== meta.name && renameVocabList(listId, e.target.value.trim())}
      />
      <p className="muted small">{items.length} words. Leave a definition blank to use the dictionary meaning.</p>

      <table className="table">
        <thead><tr><th>Word</th><th>Definition used in quizzes</th><th /></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.lexicon.headword}<div className="muted small">{i.lexicon.pos}</div></td>
              <td><OverrideCell item={i} onSaved={list.reload} /></td>
              <td>
                <button className="btn-ghost small" onClick={async () => { await removeListItem(i.id); list.reload(); }}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add from dictionary</h2>
      <LatinField block style={{ width: '100%' }} aria-label="Search the dictionary" placeholder="Search Latin or English (macrons optional)…" value={q} onValueChange={setQ} />
      <ul className="list-plain">
        {results.map(r => (
          <li key={r.id} className="row" style={{ justifyContent: 'space-between' }}>
            <span><strong>{r.headword}</strong> <span className="muted">({r.pos})</span>: {r.definition}</span>
            <button className="btn-secondary small" disabled={inList.has(r.id)} onClick={() => add(r.id)}>
              {inList.has(r.id) ? 'Added' : 'Add'}
            </button>
          </li>
        ))}
      </ul>

      <h2>Add your own word</h2>
      <form
        className="row"
        onSubmit={async e => {
          e.preventDefault();
          if (!profile || !custom.headword.trim() || !custom.definition.trim()) return;
          try {
            const w = await addCustomWord(custom, profile.id);
            await add(w.id);
            setCustom({ headword: '', definition: '', pos: custom.pos });
          } catch (e) {
            setErr(String(e));
          }
        }}
      >
        <LatinField aria-label="Dictionary form" placeholder="Dictionary form, e.g. gladius, gladiī, m." value={custom.headword} onValueChange={headword => setCustom({ ...custom, headword })} maxLength={120} />
        <input className="input" placeholder="Meaning" value={custom.definition} onChange={e => setCustom({ ...custom, definition: e.target.value })} maxLength={200} />
        <select className="select" value={custom.pos} onChange={e => setCustom({ ...custom, pos: e.target.value })}>
          {POS.map(p => <option key={p}>{p}</option>)}
        </select>
        <button className="btn-primary" type="submit">Add word</button>
      </form>
      {err && <p className="form-error">{err}</p>}

      <div className="row-end">
        <button
          className="btn-ghost"
          onClick={async () => {
            if (window.confirm('Delete this list? Assignments already published keep their questions.')) {
              await deleteVocabList(listId);
              navigate('/t/vocab');
            }
          }}
        >
          Delete list
        </button>
      </div>
      <p className="attribution">{LEXICON_CREDIT}</p>
    </>
  );
}
