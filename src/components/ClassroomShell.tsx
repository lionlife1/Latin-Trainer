import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { AppHeader } from './AppHeader';

/** Teacher screens. Students use StudentShell. */
export function ClassroomShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="screen active">
      <AppHeader subtitle="Teacher">
        <NavLink className="link" to="/t" end>Classes</NavLink>
        <NavLink className="link" to="/t/vocab">Vocab lists</NavLink>
        <span className="muted small">{profile?.display_name}</span>
        <button
          className="btn-ghost btn-small"
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
        >
          Sign out
        </button>
      </AppHeader>
      <main className="page">{children}</main>
    </div>
  );
}
