import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { downloadCsv, downloadText } from '../../lib/csv';
import { errorMessage, useAsync } from '../../lib/useAsync';
import type { VocabItem } from '../../lib/vocab';
import { blooketCsv, gimkitCsv, quizletText } from '../../lib/vocabExport';
import { PARTS_OF_SPEECH } from '../../lib/vocabImport';
import { useAuth } from '../auth/AuthProvider';
import {
  addCustomWord, addListItem, deleteVocabList, getVocabList, loadFallbackLexicon, removeListItem, renameVocabList,
  searchLexicon, toVocabItem, updateListItem, type LexiconRow, type VocabListItemRow,
} from './api';
import { LatinField } from './LatinField';
import { VocabImport } from './VocabImport';
import { LEXICON_CREDIT } from './VocabLists';

function OverrideCell({ item, onSaved, onError }: { item: VocabListItemRow; onSaved: () => void; onError: (e: unknown) => void }) {
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
          try {
            await updateListItem(item.id, next);
            onSaved();
          } catch (e) {
            onError(e);
          }
        }
      }}
    />
  );
}

const fileName = (name: string, ext: string) => `${name.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'vocab'}.${ext}`;

/** Downloads for review games. Gimkit/Blooket layouts must be checked against their templates (vocabExport.ts). */
function ExportButtons({ name, items }: { name: string; items: VocabItem[] }) {
  const [note, setNote] = useState<string | null>(null);
  const withFallback = async (make: (fallback: VocabItem[]) => string, file: string) => {
    try {
      downloadCsv(file, make(await loadFallbackLexicon()));
    } catch (e) {
      setNote(errorMessage(e));
    }
  };
  return (
    <div className="row">
      <span className="muted small">Export:</span>
      <button className="btn-secondary small" onClick={() => downloadText(fileName(name, 'txt'), quizletText(items))}>Quizlet (.txt)</button>
      <button
        className="btn-ghost small"
        onClick={() => navigator.clipboard.writeText(quizletText(items)).then(() => setNote('Copied. In Quizlet: Create → Import, then paste.'), e => setNote(errorMessage(e)))}
      >
        Copy for Quizlet
      </button>
      <button className="btn-secondary small" onClick={() => withFallback(f => gimkitCsv(items, f), fileName(name, 'gimkit.csv'))}>Gimkit (.csv)</button>
      <button className="btn-secondary small" onClick={() => withFallback(f => blooketCsv(items, f), fileName(name, 'blooket.csv'))}>Blooket (.csv)</button>
      {note && <span className="small">{note}</span>}
    </div>
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

  /** Runs a list change, reloads, and shows any failure below the custom-word form. */
  const change = async (fn: () => Promise<unknown>) => {
    setErr(null);
    try {
      await fn();
      list.reload();
    } catch (e) {
      setErr(errorMessage(e));
    }
  };
  const add = (lexiconId: number) => change(() => addListItem(listId, lexiconId, nextPos));

  return (
    <>
      <div className="crumbs"><Link className="link" to="/t/vocab">← Vocab lists</Link></div>
      <input
        className="input"
        style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', width: '100%' }}
        defaultValue={meta.name}
        aria-label="List name"
        onBlur={e => {
          const name = e.target.value.trim();
          if (name && name !== meta.name) void change(() => renameVocabList(listId, name));
        }}
      />
      <p className="muted small">{items.length} words. Leave a definition blank to use the dictionary meaning.</p>
      {items.length > 0 && <ExportButtons name={meta.name} items={items.map(toVocabItem)} />}

      <table className="table">
        <thead><tr><th>Word</th><th>Definition used in quizzes</th><th /></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.lexicon.headword}<div className="muted small">{i.lexicon.pos}</div></td>
              <td><OverrideCell item={i} onSaved={list.reload} onError={e => setErr(errorMessage(e))} /></td>
              <td>
                <button className="btn-ghost small" onClick={() => change(() => removeListItem(i.id))}>Remove</button>
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
          await change(async () => {
            const w = await addCustomWord(custom, profile.id);
            await addListItem(listId, w.id, nextPos);
            setCustom({ headword: '', definition: '', pos: custom.pos });
          });
        }}
      >
        <LatinField aria-label="Dictionary form" placeholder="Dictionary form, e.g. gladius, gladiī, m." value={custom.headword} onValueChange={headword => setCustom({ ...custom, headword })} maxLength={120} />
        <input className="input" placeholder="Meaning" value={custom.definition} onChange={e => setCustom({ ...custom, definition: e.target.value })} maxLength={200} />
        <select className="select" value={custom.pos} onChange={e => setCustom({ ...custom, pos: e.target.value })}>
          {PARTS_OF_SPEECH.map(p => <option key={p}>{p}</option>)}
        </select>
        <button className="btn-primary" type="submit">Add word</button>
      </form>
      {err && <p className="form-error">{err}</p>}

      <h2>Import a list</h2>
      {profile && <VocabImport listId={listId} ownerId={profile.id} inList={inList} nextPos={nextPos} onDone={list.reload} />}

      <div className="row-end">
        <button
          className="btn-ghost"
          onClick={async () => {
            if (window.confirm('Delete this list? Assignments already published keep their questions.')) {
              try {
                await deleteVocabList(listId);
                navigate('/t/vocab');
              } catch (e) {
                setErr(errorMessage(e));
              }
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
