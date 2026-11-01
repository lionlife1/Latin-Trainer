import { flush, PermanentError, type QueueJob } from '../../lib/offlineQueue';
import { requireSupabase } from '../../lib/supabase';
import type { AssignmentMode, DrillQuestion, PublicQuestion } from '../../lib/types';

export interface StudentAssignment {
  id: string; title: string; mode: AssignmentMode; question_count: number; due_at: string | null;
  time_limit_sec: number | null; max_attempts: number | null; reveal_answers: boolean; created_at: string;
}
export interface AttemptRow {
  id: string; assignment_id: string; started_at: string; submitted_at: string | null; score: number | null;
  total: number; is_late: boolean; over_time: boolean;
}
export interface AttemptItem { pool_id: string; position: number; question: DrillQuestion | PublicQuestion }
export interface ResponseRow { pool_id: string; given: string; correct: boolean }

const sb = () => requireSupabase();
function must<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const A_COLS = 'id, title, mode, question_count, due_at, time_limit_sec, max_attempts, reveal_answers, created_at';
const T_COLS = 'id, assignment_id, started_at, submitted_at, score, total, is_late, over_time';

export async function listMyAssignments() {
  const [assignments, attempts] = await Promise.all([
    sb().from('assignments').select(A_COLS).order('due_at', { ascending: true, nullsFirst: false }),
    sb().from('attempts').select(T_COLS).order('started_at', { ascending: false }),
  ]);
  const as = must<StudentAssignment[]>(assignments);
  const ts = must<AttemptRow[]>(attempts);
  return as.map(a => {
    const mine = ts.filter(t => t.assignment_id === a.id);
    const done = mine.filter(t => t.submitted_at);
    const best = done.reduce<AttemptRow | null>((b, t) => (!b || (t.score ?? 0) > (b.score ?? 0) ? t : b), null);
    return { assignment: a, attempts: mine, best, open: mine.find(t => !t.submitted_at) ?? null, latest: done[0] ?? null };
  });
}

export const getAssignment = async (id: string) =>
  must<StudentAssignment>(await sb().from('assignments').select(A_COLS).eq('id', id).single());
export const getAttempt = async (id: string) =>
  must<AttemptRow>(await sb().from('attempts').select(T_COLS).eq('id', id).single());
export const startAttempt = async (assignmentId: string) =>
  must<string>(await sb().rpc('start_attempt', { p_assignment_id: assignmentId }));
export const getAttemptItems = async (attemptId: string) =>
  must<AttemptItem[]>(await sb().rpc('get_attempt_items', { p_attempt_id: attemptId }));
export const getResponses = async (attemptId: string) =>
  must<ResponseRow[]>(await sb().from('responses').select('pool_id, given, correct').eq('attempt_id', attemptId));

/** Throws PermanentError when the server rejects the answer for good (not your attempt, already submitted). */
export async function recordPractice(job: QueueJob): Promise<void> {
  const { error } = await sb().rpc('record_practice_response', {
    p_attempt_id: job.attemptId, p_pool_id: job.poolId, p_given: job.given, p_ms: job.ms,
  });
  if (!error) return;
  if (error.code === '42501' || error.code === 'P0001') throw new PermanentError(error.message);
  throw new Error(error.message);
}

/** Retries queued practice answers for this user (optionally one attempt only). */
export const flushPracticeQueue = (userId: string, attemptId?: string) =>
  flush(recordPractice, j => j.userId === userId && (!attemptId || j.attemptId === attemptId));

export const finishPractice = async (attemptId: string) =>
  must<{ score: number; total: number }>(await sb().rpc('finish_practice', { p_attempt_id: attemptId }));
export const submitTest = async (attemptId: string, responses: { pool_id: string; given: string }[]) =>
  must<{ score: number; total: number }>(await sb().rpc('submit_test', { p_attempt_id: attemptId, p_responses: responses }));
