// Request handlers for the student account edge functions. Platform access goes through
// AdminPort so the logic is testable without Deno or a live Supabase project.
import { normalizeDisplayName, normalizeJoinCode, validateJoin, validatePin } from './validate.ts';

export interface AdminPort {
  /** Creates a confirmed auth user with a synthetic @students.invalid email and the PIN as password. */
  createStudentUser(pin: string, displayName: string): Promise<{ id: string; email: string }>;
  deleteUser(id: string): Promise<void>;
  joinClassAs(
    userId: string,
    joinCode: string,
    displayName: string,
  ): Promise<{ ok: true } | { ok: false; reason: 'name_taken' | 'unknown_class' }>;
  studentEmailFor(joinCode: string, displayName: string): Promise<string | null>;
  userIdFromJwt(jwt: string): Promise<string | null>;
  teacherOwnsStudent(teacherId: string, studentId: string): Promise<boolean>;
  setPassword(userId: string, password: string): Promise<void>;
}

export const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });

type Handler = (req: Request) => Promise<Response>;

function withJson(fn: (body: Record<string, unknown>, req: Request) => Promise<Response>): Handler {
  return async req => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return reply(400, { error: 'Invalid request' });
    }
    if (!body || typeof body !== 'object') return reply(400, { error: 'Invalid request' });
    try {
      return await fn(body as Record<string, unknown>, req);
    } catch (e) {
      console.error(e);
      return reply(500, { error: 'Something went wrong. Try again.' });
    }
  };
}

export const makeStudentJoin = (admin: AdminPort): Handler =>
  withJson(async body => {
    const v = validateJoin(body);
    if (!v.ok) return reply(400, { error: v.error });
    const { join_code, display_name, pin } = v.value;
    const user = await admin.createStudentUser(pin, display_name);
    let joined;
    try {
      joined = await admin.joinClassAs(user.id, join_code, display_name);
    } catch (e) {
      await admin.deleteUser(user.id);
      throw e;
    }
    if (!joined.ok) {
      await admin.deleteUser(user.id);
      return joined.reason === 'name_taken'
        ? reply(409, { error: 'That name is taken in this class' })
        : reply(404, { error: 'No class with that code' });
    }
    return reply(200, { email: user.email });
  });

const LOGIN_FAILED = { error: 'Class code, name or PIN is incorrect' };

export const makeStudentLogin = (admin: AdminPort): Handler =>
  withJson(async body => {
    const code = normalizeJoinCode(body.join_code);
    const name = normalizeDisplayName(body.display_name);
    if (!code || !name) return reply(401, LOGIN_FAILED);
    const email = await admin.studentEmailFor(code, name);
    return email ? reply(200, { email }) : reply(401, LOGIN_FAILED);
  });

export const makeResetPin = (admin: AdminPort): Handler =>
  withJson(async (body, req) => {
    const jwt = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    const teacherId = jwt ? await admin.userIdFromJwt(jwt) : null;
    if (!teacherId) return reply(401, { error: 'Sign in again' });
    if (typeof body.student_id !== 'string') return reply(400, { error: 'Invalid request' });
    if (!validatePin(body.pin)) return reply(400, { error: 'PIN must be 6 digits' });
    if (!(await admin.teacherOwnsStudent(teacherId, body.student_id))) {
      return reply(403, { error: 'That student is not in your classes' });
    }
    await admin.setPassword(body.student_id, body.pin as string);
    return reply(200, { ok: true });
  });
