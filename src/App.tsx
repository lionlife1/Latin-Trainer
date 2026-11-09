import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StudentShell } from './components/StudentShell';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { RequireRole } from './features/auth/RequireRole';
import { StudentJoin } from './features/auth/StudentJoin';
import { StudentLogin } from './features/auth/StudentLogin';
import { TeacherLogin } from './features/auth/TeacherLogin';
import { EndlessRoute } from './features/practice/EndlessRoute';
import { GrammarPath } from './features/practice/GrammarPath';
import { ModuleRoute } from './features/practice/ModuleRoute';
import { PracticeHome } from './features/practice/PracticeHome';
import { SessionSyncProvider } from './features/practice/useSessionSync';
import { SetPage } from './features/vocab/SetPage';
import { SetEditor } from './features/vocab/SetEditor';
import { StudyRoute } from './features/vocab/StudyRoute';
import { StudentRoutes } from './features/student/StudentRoutes';
import { TeacherRoutes } from './features/teacher/TeacherRoutes';
import { hasBackend } from './lib/supabase';

// Lazy: keeps the generated nouns and adjectives out of the main bundle.
// VocabHome pulls in the starter-set data (nouns, adjectives), so keep it out of the main bundle.
const VocabHome = lazy(() => import('./features/vocab/VocabHome').then(m => ({ default: m.VocabHome })));
const FormsRoute = lazy(() => import('./features/practice/forms/FormsRoute'));

/** Students land on Class, teachers on their classes, everyone else on Practice. */
export function Home() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role === 'teacher') return <Navigate to="/t" replace />;
  if (profile?.role === 'student') return <Navigate to="/s" replace />;
  return <Navigate to="/practice" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/practice" element={<StudentShell><PracticeHome /></StudentShell>} />
      <Route path="/practice/grammar" element={<StudentShell><GrammarPath /></StudentShell>} />
      <Route path="/practice/grammar/:moduleId" element={<ModuleRoute />} />
      <Route path="/practice/endless" element={<EndlessRoute />} />
      <Route path="/practice/forms" element={<Suspense fallback={null}><FormsRoute /></Suspense>} />
      <Route path="/practice/vocab" element={<StudentShell><Suspense fallback={null}><VocabHome /></Suspense></StudentShell>} />
      <Route path="/practice/vocab/:setId" element={<StudentShell><SetPage /></StudentShell>} />
      <Route path="/practice/vocab/:setId/edit" element={<StudentShell><SetEditor /></StudentShell>} />
      <Route path="/practice/vocab/:setId/:mode" element={<StudyRoute />} />
      {hasBackend && (
        <>
          <Route path="/join" element={<StudentJoin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/s/*" element={<StudentRoutes />} />
          <Route path="/t/*" element={<RequireRole role="teacher"><TeacherRoutes /></RequireRole>} />
        </>
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <SessionSyncProvider>
          <AppRoutes />
        </SessionSyncProvider>
      </AuthProvider>
    </HashRouter>
  );
}
