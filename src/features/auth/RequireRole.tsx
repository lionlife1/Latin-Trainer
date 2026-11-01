import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RequireRole({ role, children }: { role: 'teacher' | 'student'; children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="page muted">Loading…</div>;
  if (!session || !profile) return <Navigate to={role === 'teacher' ? '/teacher/login' : '/student/login'} replace />;
  if (profile.role !== role) return <Navigate to={profile.role === 'teacher' ? '/t' : '/s'} replace />;
  return <>{children}</>;
}
