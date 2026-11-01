import { useState } from 'react';
import { validateJoin, type JoinInput } from '../../../supabase/functions/_shared/validate.ts';
import type { Result } from './api';

interface Props {
  submitLabel: string;
  onSubmit: (input: JoinInput) => Promise<Result>;
  pinHelp?: string;
}

export function CodeNamePinForm({ submitLabel, onSubmit, pinHelp }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        const v = validateJoin({ join_code: code, display_name: name, pin });
        if (!v.ok) return setError(v.error);
        setBusy(true);
        setError(null);
        const res = await onSubmit(v.value);
        setBusy(false);
        if (!res.ok) setError(res.error);
      }}
    >
      <label className="field">
        <span>Class code</span>
        <input className="input" value={code} onChange={e => setCode(e.target.value)} autoCapitalize="characters" autoComplete="off" />
      </label>
      <label className="field">
        <span>Your name (first name or nickname)</span>
        <input className="input" value={name} onChange={e => setName(e.target.value)} autoComplete="off" maxLength={24} />
      </label>
      <label className="field">
        <span>6-digit PIN</span>
        <input className="input" value={pin} onChange={e => setPin(e.target.value)} inputMode="numeric" type="password" autoComplete="off" maxLength={6} />
        {pinHelp && <small className="muted">{pinHelp}</small>}
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : submitLabel}</button>
    </form>
  );
}
