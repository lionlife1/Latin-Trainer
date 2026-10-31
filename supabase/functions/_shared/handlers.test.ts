import { makeStudentJoin, makeStudentLogin, makeResetPin, type AdminPort } from './handlers';

function fakeAdmin(over: Partial<AdminPort> = {}): AdminPort & { calls: Record<string, unknown[][]> } {
  const calls: Record<string, unknown[][]> = {};
  const rec = <T,>(name: string, v: T) => (...args: unknown[]) => {
    (calls[name] ??= []).push(args);
    return Promise.resolve(v);
  };
  return {
    calls,
    createStudentUser: rec('createStudentUser', { id: 'u1', email: 'u1@students.invalid' }),
    deleteUser: rec('deleteUser', undefined),
    joinClassAs: rec('joinClassAs', { ok: true } as const),
    studentEmailFor: rec('studentEmailFor', 'u1@students.invalid'),
    userIdFromJwt: rec('userIdFromJwt', 'teacher-1'),
    teacherOwnsStudent: rec('teacherOwnsStudent', true),
    setPassword: rec('setPassword', undefined),
    ...over,
  };
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://x/fn', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', ...headers } });
const good = { join_code: 'aaaaaa', display_name: 'Marcus', pin: '123456' };

describe('student-join', () => {
  it('answers CORS preflight', async () => {
    const res = await makeStudentJoin(fakeAdmin())(new Request('http://x', { method: 'OPTIONS' }));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
  it('400 on invalid input without creating a user', async () => {
    const admin = fakeAdmin();
    const res = await makeStudentJoin(admin)(post({ ...good, pin: '1' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'PIN must be 6 digits' });
    expect(admin.calls.createStudentUser).toBeUndefined();
  });
  it('creates user with synthetic email and enrolls', async () => {
    const admin = fakeAdmin();
    const res = await makeStudentJoin(admin)(post(good));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'u1@students.invalid' });
    expect(admin.calls.createStudentUser[0]).toEqual(['123456', 'Marcus']);
    expect(admin.calls.joinClassAs[0]).toEqual(['u1', 'AAAAAA', 'Marcus']);
  });
  it('409 on taken name and removes the orphan user', async () => {
    const admin = fakeAdmin({ joinClassAs: () => Promise.resolve({ ok: false, reason: 'name_taken' } as const) });
    const res = await makeStudentJoin(admin)(post(good));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'That name is taken in this class' });
    expect(admin.calls.deleteUser[0]).toEqual(['u1']);
  });
  it('404 on unknown class code and removes the orphan user', async () => {
    const admin = fakeAdmin({ joinClassAs: () => Promise.resolve({ ok: false, reason: 'unknown_class' } as const) });
    const res = await makeStudentJoin(admin)(post(good));
    expect(res.status).toBe(404);
    expect(admin.calls.deleteUser[0]).toEqual(['u1']);
  });
  it('400 on malformed JSON', async () => {
    const res = await makeStudentJoin(fakeAdmin())(new Request('http://x', { method: 'POST', body: '{' }));
    expect(res.status).toBe(400);
  });
});

describe('student-login', () => {
  it('returns email for a known student', async () => {
    const res = await makeStudentLogin(fakeAdmin())(post({ join_code: 'aaaaaa', display_name: 'marcus' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ email: 'u1@students.invalid' });
  });
  it('generic 401 for unknown student or bad code', async () => {
    const res = await makeStudentLogin(fakeAdmin({ studentEmailFor: () => Promise.resolve(null) }))(post({ join_code: 'aaaaaa', display_name: 'x' }));
    const bad = await makeStudentLogin(fakeAdmin())(post({ join_code: '1', display_name: 'x' }));
    expect(res.status).toBe(401);
    expect(bad.status).toBe(401);
    expect(await res.json()).toEqual(await bad.json());
  });
});

describe('reset-pin', () => {
  const auth = { authorization: 'Bearer jwt' };
  it('401 without a valid user token', async () => {
    const res = await makeResetPin(fakeAdmin({ userIdFromJwt: () => Promise.resolve(null) }))(post({ student_id: 's', pin: '123456' }, auth));
    expect(res.status).toBe(401);
  });
  it('403 when the student is not in one of the caller\'s classes', async () => {
    const admin = fakeAdmin({ teacherOwnsStudent: () => Promise.resolve(false) });
    const res = await makeResetPin(admin)(post({ student_id: 's', pin: '123456' }, auth));
    expect(res.status).toBe(403);
    expect(admin.calls.setPassword).toBeUndefined();
  });
  it('400 on bad pin', async () => {
    const res = await makeResetPin(fakeAdmin())(post({ student_id: 's', pin: '12' }, auth));
    expect(res.status).toBe(400);
  });
  it('sets the new pin', async () => {
    const admin = fakeAdmin();
    const res = await makeResetPin(admin)(post({ student_id: 's', pin: '654321' }, auth));
    expect(res.status).toBe(200);
    expect(admin.calls.userIdFromJwt[0]).toEqual(['jwt']);
    expect(admin.calls.teacherOwnsStudent[0]).toEqual(['teacher-1', 's']);
    expect(admin.calls.setPassword[0]).toEqual(['s', '654321']);
  });
});
