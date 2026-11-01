import { Route, Routes } from 'react-router-dom';
import { ClassroomShell } from '../../components/ClassroomShell';
import { AttemptResult } from './AttemptResult';
import { MyAssignments } from './MyAssignments';
import { RunAssignment } from './RunAssignment';

export function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<ClassroomShell><MyAssignments /></ClassroomShell>} />
      <Route path="a/:assignmentId" element={<ClassroomShell><RunAssignment /></ClassroomShell>} />
      <Route path="attempt/:attemptId" element={<ClassroomShell><AttemptResult /></ClassroomShell>} />
    </Routes>
  );
}
