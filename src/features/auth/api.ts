import { requireSupabase } from '../../lib/supabase';
import type { JoinInput } from '../../../supabase/functions/_shared/validate.ts';

export type Result = { ok: true } | { ok: false; error: string };

async function functionError(error: unknown, fallback: string): Promise<string> {
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = (await ctx.json()) as { error?: string };
      if (body.error) return body.error;
    } catch {
      /* fall through */
    }
  }
  return fallback;
}

export async function joinClass(input: JoinInput): Promise<Result> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke('student-join', { body: input });
  if (error) return { ok: false, error: await functionError(error, 'Could not join the class. Try again.') };
  const { error: signInError } = await sb.auth.signInWithPassword({ email: data.email, password: input.pin });
  return signInError ? { ok: false, error: 'Joined, but sign-in failed. Try signing in.' } : { ok: true };
}

const LOGIN_FAILED = 'Class code, name or PIN is incorrect';

export async function studentLogin(input: JoinInput): Promise<Result> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke('student-login', {
    body: { join_code: input.join_code, display_name: input.display_name },
  });
  if (error) return { ok: false, error: await functionError(error, LOGIN_FAILED) };
  const { error: signInError } = await sb.auth.signInWithPassword({ email: data.email, password: input.pin });
  return signInError ? { ok: false, error: LOGIN_FAILED } : { ok: true };
}

export async function teacherSignIn(email: string, password: string): Promise<Result> {
  const { error } = await requireSupabase().auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function teacherSignUp(email: string, password: string, displayName: string): Promise<Result & { needsConfirm?: boolean }> {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: { data: { role: 'teacher', display_name: displayName } },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, needsConfirm: !data.session };
}

export async function resetPin(studentId: string, pin: string): Promise<Result> {
  const { error } = await requireSupabase().functions.invoke('reset-pin', { body: { student_id: studentId, pin } });
  return error ? { ok: false, error: await functionError(error, 'Could not reset PIN') } : { ok: true };
}
