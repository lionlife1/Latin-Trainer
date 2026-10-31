// Practice responses that failed to reach the server, retried later. Survives reloads.
const KEY = 'latiniq_queue';

export interface QueueJob {
  attemptId: string;
  poolId: string;
  given: string;
  ms: number;
}

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

/** Sends jobs in order; stops at the first failure and keeps it and the rest. */
export async function flush(send: (job: QueueJob) => Promise<void>): Promise<{ sent: number; remaining: number }> {
  const jobs = pending();
  let sent = 0;
  for (const job of jobs) {
    try {
      await send(job);
    } catch {
      break;
    }
    sent++;
  }
  const rest = jobs.slice(sent);
  save(rest);
  return { sent, remaining: rest.length };
}
