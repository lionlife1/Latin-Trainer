// Practice responses that failed to reach the server, retried later. Survives reloads.
// Shared devices are common in classrooms, so jobs carry their user and flushes are filtered.
const KEY = 'latiniq_queue';

export interface QueueJob {
  userId: string;
  attemptId: string;
  poolId: string;
  given: string;
  ms: number;
}

/** Thrown by a sender when retrying can never succeed (e.g. attempt already submitted); the job is dropped. */
export class PermanentError extends Error {}

export function pending(): QueueJob[] {
  try {
    return (JSON.parse(localStorage.getItem(KEY) ?? '[]') as QueueJob[]) ?? [];
  } catch {
    return [];
  }
}

function save(jobs: QueueJob[]) {
  if (jobs.length) localStorage.setItem(KEY, JSON.stringify(jobs));
  else localStorage.removeItem(KEY);
}

export function enqueue(job: QueueJob) {
  save([...pending(), job]);
}

/**
 * Sends matching jobs in order. A transient failure stops the flush and keeps that job and the
 * matching jobs after it; a PermanentError drops the job. Non-matching jobs are left untouched.
 */
export async function flush(
  send: (job: QueueJob) => Promise<void>,
  match: (job: QueueJob) => boolean = () => true,
): Promise<{ sent: number; remaining: number }> {
  const done = new Set<QueueJob>();
  let sent = 0;
  for (const job of pending().filter(match)) {
    try {
      await send(job);
      sent++;
    } catch (e) {
      if (!(e instanceof PermanentError)) break;
    }
    done.add(job);
  }
  // Re-read so jobs enqueued while flushing aren't lost.
  const current = pending();
  const isDone = (j: QueueJob) =>
    [...done].some(d => d.userId === j.userId && d.attemptId === j.attemptId && d.poolId === j.poolId && d.given === j.given);
  const rest = current.filter(j => !isDone(j));
  save(rest);
  return { sent, remaining: rest.filter(match).length };
}
