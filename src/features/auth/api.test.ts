const signInWithPassword = vi.fn();
const invoke = vi.fn();
vi.mock('../../lib/supabase', () => ({
  requireSupabase: () => ({ auth: { signInWithPassword }, functions: { invoke } }),
}));

import { joinClass, studentLogin } from './api';

beforeEach(() => {
  signInWithPassword.mockReset().mockResolvedValue({ error: null });
  invoke.mockReset();
});

describe('joinClass', () => {
  it('signs in with the returned synthetic email and the pin', async () => {
    invoke.mockResolvedValue({ data: { email: 'u1@students.invalid' }, error: null });
    expect(await joinClass({ join_code: 'AAAAAA', display_name: 'Marcus', pin: '123456' })).toEqual({ ok: true });
    expect(invoke).toHaveBeenCalledWith('student-join', { body: { join_code: 'AAAAAA', display_name: 'Marcus', pin: '123456' } });
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'u1@students.invalid', password: '123456' });
  });
  it('surfaces the server error message', async () => {
    invoke.mockResolvedValue({
      data: null,
      error: { context: new Response(JSON.stringify({ error: 'That name is taken in this class' }), { status: 409 }) },
    });
    expect(await joinClass({ join_code: 'AAAAAA', display_name: 'Marcus', pin: '123456' })).toEqual({
      ok: false,
      error: 'That name is taken in this class',
    });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});

describe('studentLogin', () => {
  it('uses one generic message for a wrong PIN', async () => {
    invoke.mockResolvedValue({ data: { email: 'u1@students.invalid' }, error: null });
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    expect(await studentLogin({ join_code: 'AAAAAA', display_name: 'Marcus', pin: '000000' })).toEqual({
      ok: false,
      error: 'Class code, name or PIN is incorrect',
    });
  });
});
