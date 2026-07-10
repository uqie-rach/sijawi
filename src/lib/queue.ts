import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

export type EmailJobData = {
  to: string;
  subject: string;
  html: string;
  type?: 'welcome' | 'general';
};

let _emailQueue: Queue<EmailJobData> | null = null;

function getEmailQueue(): Queue<EmailJobData> {
  if (_emailQueue) return _emailQueue;
  _emailQueue = new Queue<EmailJobData>('email-queue', {
    connection: redis as any,
  });
  console.log('[Email Queue] Queue initialized, connected to Redis');
  return _emailQueue;
}

export async function enqueueEmail(params: EmailJobData) {
  try {
    const queue = getEmailQueue();
    const job = await queue.add('send-email', params);
    console.log(`[Email Queue] Job ${job.id} enqueued: sending to ${params.to}`);
    return job;
  } catch (err) {
    console.error('[Email Queue] Failed to enqueue email:', err);
    throw err;
  }
}