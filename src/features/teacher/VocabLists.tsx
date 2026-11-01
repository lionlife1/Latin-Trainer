import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync } from '../../lib/useAsync';
import { createVocabList, listVocabLists } from './api';

/** Set VITE_LEXICON_ATTRIBUTION when the DCC core list is imported (see README). */
export const DCC_ATTRIBUTION =
  (import.meta.env.VITE_LEXICON_ATTRIBUTION as string | undefined) || 'Built-in dictionary: LatinIQ starter vocabulary';

export function VocabLists() {
  const { data, error } = useAsync(listVocabLists, []);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  return (
    <>
      <h1>Vocab lists</h1>
      {error && <p className="form-error">{error}</p>}
      <ul className="list-plain">
        {data?.map(l => <li key={l.id}><Link className="link" to={`/t/vocab/${l.id}`}>{l.name}</Link></li>)}
        {data?.length === 0 && <li className="muted">No lists yet.</li>}
      </ul>
      <h2>New list</h2>
      <form
        className="row"
        onSubmit={async e => {
          e.preventDefault();
          if (!name.trim()) return;
          const l = await createVocabList(name.trim());
          navigate(`/t/vocab/${l.id}`);
        }}
      >
        <input className="input" placeholder="e.g. Chapter 12 vocab" value={name} onChange={e => setName(e.target.value)} maxLength={80} />
        <button className="btn-primary" type="submit">Create</button>
      </form>
    </>
  );
}
