import { Navigate, Route, Routes } from 'react-router-dom';
import { StudentShell } from '../../components/StudentShell';
import { useAuth } from '../auth/AuthProvider';
import { AttemptResult } from './AttemptResult';
import { ClassGate } from './ClassGate';
import { MyAssignments } from './MyAssignments';
import { RunAssignment } from './RunAssignment';

/** Signed-out visitors see the join/sign-in gate; teachers go to their own area. */
export function StudentRoutes() {
  const { session, profile, loading } = useAuth();
  if (loading) return <StudentShell><p className="muted">Loading…</p></StudentShell>;
  if (!session || !profile) return <StudentShell><ClassGate /></StudentShell>;
  if (profile.role !== 'student') return <Navigate to="/t" replace />;
  return (
    <StudentShell>
      <Routes>
        <Route index element={<MyAssignments />} />
        <Route path="a/:assignmentId" element={<RunAssignment />} />
        <Route path="attempt/:attemptId" element={<AttemptResult />} />
      </Routes>
    </StudentShell>
  );
}
