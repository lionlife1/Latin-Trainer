import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { Profile } from './features/auth/AuthProvider';

vi.mock('./lib/supabase', () => ({ hasBackend: true, supabase: null, requireSupabase: () => { throw new Error('no'); } }));
vi.mock('./features/student/api', () => ({ listMyAssignments: () => Promise.resolve([]) }));
const auth = { session: null as unknown, profile: null as Profile | null, loading: false, signOut: vi.fn() };
vi.mock('./features/auth/AuthProvider', () => ({ useAuth: () => auth }));

import { AppRoutes } from './App';

const signedIn = (role: Profile['role']) => {
  auth.session = { user: { id: 'u1' } };
  auth.profile = { id: 'u1', role, display_name: 'Marcus' };
};
const visit = (path: string) => render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>);

beforeEach(() => {
  localStorage.clear();
  auth.session = null;
  auth.profile = null;
});

describe('routes and shell', () => {
  it('sends logged-out visitors to Practice, with a Sign in link and both tabs', async () => {
    visit('/');
    expect(await screen.findByRole('heading', { name: 'Practice' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/student/login');
    expect(screen.getAllByRole('link', { name: 'Class' }).length).toBeGreaterThan(0);
  });

  it('shows the join gate on Class when logged out', () => {
    visit('/s');
    expect(screen.getByRole('heading', { name: 'Join your class' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Join with a class code' })).toHaveAttribute('href', '/join');
  });

  it('sends signed-in students to Class and lets them sign out', async () => {
    signedIn('student');
    visit('/');
    expect(await screen.findByRole('heading', { name: 'Class' })).toBeInTheDocument();
    expect(await screen.findByText('Nothing assigned yet.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /marcus/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('keeps teachers out of the student Class area', () => {
    signedIn('teacher');
    visit('/s');
    expect(screen.queryByRole('heading', { name: 'Class' })).not.toBeInTheDocument();
  });
});
