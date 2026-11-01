import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { hasBackend } from '../lib/supabase';
import { Layers, Users } from './icons';

const tabs = [
  ...(hasBackend ? [{ to: '/s', label: 'Class', Icon: Users }] : []),
  { to: '/practice', label: 'Practice', Icon: Layers },
];

function Tabs({ className }: { className: string }) {
  return (
    <nav className={className} aria-label="Main">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function AccountMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current?.contains(e.target as Node) || setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!hasBackend) return null;
  if (!profile) return <Link className="btn-secondary btn-small" to="/student/login">Sign in</Link>;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="account-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="avatar">{profile.display_name.slice(0, 1).toUpperCase()}</span>
        <span>{profile.display_name}</span>
      </button>
      {open && (
        <div className="account-menu" role="menu">
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate('/practice');
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function StudentShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="wordmark">Latin<span>IQ</span></Link>
          <Tabs className="tabs" />
          <div className="account"><AccountMenu /></div>
        </div>
      </header>
      <main className="shell-main">{children}</main>
      <Tabs className="bottom-tabs" />
    </div>
  );
}
