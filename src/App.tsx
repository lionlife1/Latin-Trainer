import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthProvider';
import { RequireRole } from './features/auth/RequireRole';
import { StudentJoin } from './features/auth/StudentJoin';
import { StudentLogin } from './features/auth/StudentLogin';
import { TeacherLogin } from './features/auth/TeacherLogin';
import { SoloHome } from './features/solo/SoloHome';
import { StudentRoutes } from './features/student/StudentRoutes';
import { TeacherRoutes } from './features/teacher/TeacherRoutes';
import { hasBackend } from './lib/supabase';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SoloHome />} />
          {hasBackend && (
            <>
              <Route path="/join" element={<StudentJoin />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/teacher/login" element={<TeacherLogin />} />
              <Route path="/s/*" element={<RequireRole role="student"><StudentRoutes /></RequireRole>} />
              <Route path="/t/*" element={<RequireRole role="teacher"><TeacherRoutes /></RequireRole>} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
