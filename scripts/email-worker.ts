import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendEmail } from '@/lib/email';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'email-queue',
  async (job) => {
    const { to, subject, html } = job.data;
    console.log(`[Standalone Worker] Processing job ${job.id}: sending email to ${to}`);
    await sendEmail(to, subject, html);
    console.log(`[Standalone Worker] Email sent to: ${to}`);
  },
  {
    connection: connection as any,
    concurrency: 4,
  },
);

worker.on('failed', (job, err) => {
  console.error(`[Standalone Worker] Job ${job?.id} failed:`, err);
});

worker.on('completed', (job) => {
  console.log(`[Standalone Worker] Job ${job.id} completed`);
});

console.log('[Standalone Worker] Email Worker is running via pure Node.js...');