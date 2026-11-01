import { enqueue, flush, pending, PermanentError, type QueueJob } from './offlineQueue';

const job = (n: number, userId = 'u1', attemptId = 'a'): QueueJob => ({ userId, attemptId, poolId: `p${n}`, given: `g${n}`, ms: n });

beforeEach(() => localStorage.clear());

describe('offlineQueue', () => {
  it('persists jobs in localStorage across reloads', () => {
    enqueue(job(1));
    enqueue(job(2));
    expect(JSON.parse(localStorage.getItem('latiniq_queue')!)).toHaveLength(2);
    expect(pending()).toEqual([job(1), job(2)]);
  });

  it('flush sends in order and empties the queue', async () => {
    enqueue(job(1));
    enqueue(job(2));
    const sent: string[] = [];
    const res = await flush(async j => { sent.push(j.poolId); });
    expect(sent).toEqual(['p1', 'p2']);
    expect(res).toEqual({ sent: 2, remaining: 0 });
    expect(pending()).toEqual([]);
  });

  it('keeps the failed job and everything after it', async () => {
    enqueue(job(1));
    enqueue(job(2));
    enqueue(job(3));
    const res = await flush(async j => {
      if (j.poolId === 'p2') throw new Error('offline');
    });
    expect(res).toEqual({ sent: 1, remaining: 2 });
    expect(pending().map(j => j.poolId)).toEqual(['p2', 'p3']);
  });

  it('drops jobs that can never succeed and keeps going', async () => {
    enqueue(job(1));
    enqueue(job(2));
    const sent: string[] = [];
    const res = await flush(async j => {
      if (j.poolId === 'p1') throw new PermanentError('attempt already submitted');
      sent.push(j.poolId);
    });
    expect(sent).toEqual(['p2']);
    expect(res).toEqual({ sent: 1, remaining: 0 });
    expect(pending()).toEqual([]);
  });

  it('only sends jobs matching the filter and leaves the rest (other users on a shared device)', async () => {
    enqueue(job(1, 'u1', 'a'));
    enqueue(job(2, 'u2', 'b'));
    enqueue(job(3, 'u1', 'c'));
    const sent: string[] = [];
    const res = await flush(async j => { sent.push(j.poolId); }, j => j.userId === 'u1' && j.attemptId === 'a');
    expect(sent).toEqual(['p1']);
    expect(res).toEqual({ sent: 1, remaining: 0 });
    expect(pending().map(j => j.poolId)).toEqual(['p2', 'p3']);
  });
});
