import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage, useAsync } from '../../lib/useAsync';
import { createClass, listClasses } from './api';

export function Classes() {
  const { data, error, loading, reload } = useAsync(listClasses, []);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      <h1>Your classes</h1>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      <ul className="list-plain">
        {data?.map(c => (
          <li key={c.id} className="row" style={{ justifyContent: 'space-between' }}>
            <Link className="link" to={`/t/c/${c.id}`}>{c.name}</Link>
            <span className="muted small">Code <strong>{c.join_code}</strong></span>
          </li>
        ))}
        {data?.length === 0 && <li className="muted">No classes yet. Create one below.</li>}
      </ul>
      <h2>New class</h2>
      <form
        className="row"
        onSubmit={async e => {
          e.preventDefault();
          if (!name.trim()) return;
          try {
            await createClass(name.trim());
            setName('');
            setErr(null);
            reload();
          } catch (e) {
            setErr(errorMessage(e));
          }
        }}
      >
        <input className="input" placeholder="e.g. Latin III, period 2" value={name} onChange={e => setName(e.target.value)} maxLength={80} />
        <button className="btn-primary" type="submit">Create</button>
      </form>
      {err && <p className="form-error">{err}</p>}
    </>
  );
}
