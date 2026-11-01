import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { AppHeader } from './AppHeader';

export function ClassroomShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const teacher = profile?.role === 'teacher';
  return (
    <div className="screen active">
      <AppHeader subtitle={teacher ? 'Teacher' : 'My class'}>
        <nav className="row small">
          {teacher ? (
            <>
              <NavLink className="link" to="/t" end>Classes</NavLink>
              <NavLink className="link" to="/t/vocab">Vocab lists</NavLink>
            </>
          ) : (
            <>
              <NavLink className="link" to="/s" end>Assignments</NavLink>
              <NavLink className="link" to="/">Solo practice</NavLink>
            </>
          )}
          <span className="muted">{profile?.display_name}</span>
          <button
            className="btn-ghost"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
          >
            Sign out
          </button>
        </nav>
      </AppHeader>
      <main className="page">{children}</main>
    </div>
  );
}
