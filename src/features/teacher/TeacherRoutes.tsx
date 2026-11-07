import { Route, Routes } from 'react-router-dom';
import { ClassroomShell } from '../../components/ClassroomShell';
import { AttemptDetail } from './AttemptDetail';
import { ClassDetail } from './ClassDetail';
import { Gradebook } from './Gradebook';
import { ItemAnalysis } from './ItemAnalysis';
import { Classes } from './Classes';
import { NewAssignment } from './NewAssignment';
import { PrintAssignment } from './PrintAssignment';
import { VocabListEditor } from './VocabListEditor';
import { VocabLists } from './VocabLists';

export function TeacherRoutes() {
  return (
    <ClassroomShell>
      <Routes>
        <Route index element={<Classes />} />
        <Route path="c/:classId" element={<ClassDetail />} />
        <Route path="c/:classId/new" element={<NewAssignment />} />
        <Route path="c/:classId/grades" element={<Gradebook />} />
        <Route path="attempt/:attemptId" element={<AttemptDetail />} />
        <Route path="a/:assignmentId/analysis" element={<ItemAnalysis />} />
        <Route path="a/:assignmentId/print" element={<PrintAssignment />} />
        <Route path="vocab" element={<VocabLists />} />
        <Route path="vocab/:listId" element={<VocabListEditor />} />
      </Routes>
    </ClassroomShell>
  );
}
