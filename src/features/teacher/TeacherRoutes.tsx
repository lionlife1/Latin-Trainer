import { Route, Routes } from 'react-router-dom';
import { ClassroomShell } from '../../components/ClassroomShell';
import { ClassDetail } from './ClassDetail';
import { Classes } from './Classes';
import { NewAssignment } from './NewAssignment';
import { VocabListEditor } from './VocabListEditor';
import { VocabLists } from './VocabLists';

export function TeacherRoutes() {
  return (
    <ClassroomShell>
      <Routes>
        <Route index element={<Classes />} />
        <Route path="c/:classId" element={<ClassDetail />} />
        <Route path="c/:classId/new" element={<NewAssignment />} />
        <Route path="vocab" element={<VocabLists />} />
        <Route path="vocab/:listId" element={<VocabListEditor />} />
      </Routes>
    </ClassroomShell>
  );
}
