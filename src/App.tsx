import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { StudentShell } from './components/StudentShell';
import { AuthProvider, useAuth } from './features/auth/AuthProvider';
import { RequireRole } from './features/auth/RequireRole';
import { PracticeHome } from './features/practice/PracticeHome';
import { SessionSyncProvider } from './features/practice/useSessionSync';
import { hasBackend } from './lib/supabase';

// Lazy: keeps the generated nouns and adjectives out of the main bundle.
// VocabHome pulls in the starter-set data (nouns, adjectives), so keep it out of the main bundle.
const VocabHome = lazy(() => import('./features/vocab/VocabHome').then(m => ({ default: m.VocabHome })));
const StudentJoin = lazy(() => import('./features/auth/StudentJoin').then(m => ({ default: m.StudentJoin })));
const StudentLogin = lazy(() => import('./features/auth/StudentLogin').then(m => ({ default: m.StudentLogin })));
const TeacherLogin = lazy(() => import('./features/auth/TeacherLogin').then(m => ({ default: m.TeacherLogin })));
const EndlessRoute = lazy(() => import('./features/practice/EndlessRoute').then(m => ({ default: m.EndlessRoute })));
const LessonRoute = lazy(() => import('./features/practice/LessonRoute').then(m => ({ default: m.LessonRoute })));
const GrammarPath = lazy(() => import('./features/practice/GrammarPath').then(m => ({ default: m.GrammarPath })));
const ModuleRoute = lazy(() => import('./features/practice/ModuleRoute').then(m => ({ default: m.ModuleRoute })));
const SetPage = lazy(() => import('./features/vocab/SetPage').then(m => ({ default: m.SetPage })));
const SetEditor = lazy(() => import('./features/vocab/SetEditor').then(m => ({ default: m.SetEditor })));
const StudyRoute = lazy(() => import('./features/vocab/StudyRoute').then(m => ({ default: m.StudyRoute })));
const StudentRoutes = lazy(() => import('./features/student/StudentRoutes').then(m => ({ default: m.StudentRoutes })));
const TeacherRoutes = lazy(() => import('./features/teacher/TeacherRoutes').then(m => ({ default: m.TeacherRoutes })));
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
      <Route path="/practice/grammar" element={<StudentShell><Suspense fallback={null}><GrammarPath /></Suspense></StudentShell>} />
      <Route path="/practice/grammar/:moduleId" element={<Suspense fallback={null}><ModuleRoute /></Suspense>} />
      <Route path="/practice/grammar/:moduleId/lesson" element={<Suspense fallback={null}><LessonRoute /></Suspense>} />
      <Route path="/practice/endless" element={<Suspense fallback={null}><EndlessRoute /></Suspense>} />
      <Route path="/practice/forms" element={<Suspense fallback={null}><FormsRoute /></Suspense>} />
      <Route path="/practice/vocab" element={<StudentShell><Suspense fallback={null}><VocabHome /></Suspense></StudentShell>} />
      <Route path="/practice/vocab/:setId" element={<StudentShell><Suspense fallback={null}><SetPage /></Suspense></StudentShell>} />
      <Route path="/practice/vocab/:setId/edit" element={<StudentShell><Suspense fallback={null}><SetEditor /></Suspense></StudentShell>} />
      <Route path="/practice/vocab/:setId/:mode" element={<Suspense fallback={null}><StudyRoute /></Suspense>} />
      {hasBackend && (
        <>
          <Route path="/join" element={<Suspense fallback={null}><StudentJoin /></Suspense>} />
          <Route path="/student/login" element={<Suspense fallback={null}><StudentLogin /></Suspense>} />
          <Route path="/teacher/login" element={<Suspense fallback={null}><TeacherLogin /></Suspense>} />
          <Route path="/s/*" element={<Suspense fallback={null}><StudentRoutes /></Suspense>} />
          <Route path="/t/*" element={<RequireRole role="teacher"><Suspense fallback={null}><TeacherRoutes /></Suspense></RequireRole>} />
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
