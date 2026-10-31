import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

let authCallback: (event: string, session: unknown) => void = () => {};
let resolveProfile: (v: unknown) => void = () => {};
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (cb: typeof authCallback) => {
        authCallback = cb;
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => new Promise(r => (resolveProfile = r)) }) }),
    }),
  },
}));

import { AuthProvider } from './AuthProvider';
import { RequireRole } from './RequireRole';

function SignIn() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        // supabase-js notifies subscribers before signInWithPassword resolves; the page then navigates.
        authCallback('SIGNED_IN', { user: { id: 'u1' } });
        navigate('/s');
      }}
    >
      sign in
    </button>
  );
}

it('waits for the profile after sign-in instead of bouncing to the login page', async () => {
  render(
    <MemoryRouter initialEntries={['/join']}>
      <AuthProvider>
        <Routes>
          <Route path="/join" element={<SignIn />} />
          <Route path="/s" element={<RequireRole role="student">STUDENT HOME</RequireRole>} />
          <Route path="/student/login" element={<>LOGIN PAGE</>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
  await act(async () => {}); // initial getSession resolves (signed out)
  await act(async () => screen.getByRole('button', { name: 'sign in' }).click());
  await act(async () => { await new Promise(r => setTimeout(r, 5)); });
  expect(screen.queryByText('LOGIN PAGE')).not.toBeInTheDocument();
  await act(async () => resolveProfile({ data: { id: 'u1', role: 'student', display_name: 'M' } }));
  expect(await screen.findByText('STUDENT HOME')).toBeInTheDocument();

  // A token refresh for the same user must not unmount the page (e.g. a running test).
  await act(async () => authCallback('TOKEN_REFRESHED', { user: { id: 'u1' } }));
  expect(screen.getByText('STUDENT HOME')).toBeInTheDocument();
  await act(async () => { await new Promise(r => setTimeout(r, 5)); });
  expect(screen.getByText('STUDENT HOME')).toBeInTheDocument();
});
