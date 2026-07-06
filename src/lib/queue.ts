import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

export type EmailJobData = {
  to: string;
  subject: string;
  html: string;
  type?: 'welcome' | 'general';
};

// BullMQ bundles its own ioredis, causing a TS version mismatch.
// The instance is runtime-compatible; cast to avoid type errors.
const emailQueue = new Queue<EmailJobData>('email-queue', {
  connection: redis as any,
});

export function enqueueEmail(params: EmailJobData) {
  // Fire-and-forget: caller does not need to await the queue.add result.
  // .catch handles any synchronous/async errors from the add call itself.
  (emailQueue as Queue).add('send-email', params).catch((err) => {
    console.error('[Email Queue] Failed to enqueue email:', err);
  });
}
