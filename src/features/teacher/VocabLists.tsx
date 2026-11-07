import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage, useAsync } from '../../lib/useAsync';
import { createVocabList, listVocabLists } from './api';

export const LEXICON_CREDIT =
  "Dictionary: William Whitaker's Words. Core list from G. Lodge, The Vocabulary of High School Latin (1909) and B. L. D'Ooge, Latin for Beginners (1911).";

export function VocabLists() {
  const { data, error } = useAsync(listVocabLists, []);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
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
          try {
            const l = await createVocabList(name.trim());
            navigate(`/t/vocab/${l.id}`);
          } catch (e) {
            setErr(errorMessage(e));
          }
        }}
      >
        <input className="input" placeholder="e.g. Chapter 12 vocab" value={name} onChange={e => setName(e.target.value)} maxLength={80} />
        <button className="btn-primary" type="submit">Create</button>
      </form>
      {err && <p className="form-error">{err}</p>}
    </>
  );
}
