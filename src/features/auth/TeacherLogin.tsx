import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import { teacherSignIn, teacherSignUp } from './api';

export function TeacherLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <AppHeader subtitle="Teacher" />
      <div className="card auth-card">
        <h1 className="intro-title">{mode === 'signin' ? 'Teacher sign in' : 'Create teacher account'}</h1>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setBusy(true);
            setMsg(null);
            if (mode === 'signin') {
              const res = await teacherSignIn(email, password);
              if (res.ok) navigate('/t');
              else setMsg({ kind: 'error', text: res.error });
            } else {
              const res = await teacherSignUp(email, password, name);
              if (!res.ok) setMsg({ kind: 'error', text: res.error });
              else if (res.needsConfirm) setMsg({ kind: 'ok', text: 'Check your email to confirm your account, then sign in.' });
              else navigate('/t');
            }
            setBusy(false);
          }}
        >
          {mode === 'signup' && (
            <label className="field">
              <span>Name students will see</span>
              <input className="input" value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>
          {msg && <p className={msg.kind === 'error' ? 'form-error' : 'form-ok'} role="alert">{msg.text}</p>}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
          </button>
        </form>
        <p className="small muted" style={{ marginTop: 16 }}>
          {mode === 'signin' ? 'New here? ' : 'Have an account? '}
          <button className="btn-ghost link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Create a teacher account' : 'Sign in'}
          </button>
        </p>
      </div>
    </>
  );
}
