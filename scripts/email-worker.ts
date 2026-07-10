import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { sendEmail } from '@/lib/email';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

console.log(`[Standalone Worker] Connecting to Redis at ${REDIS_URL}...`);

const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 1000, 10000);
    console.log(`[Standalone Worker] Redis retry ${times}, waiting ${delay}ms...`);
    return delay;
  },
  lazyConnect: false,
});

connection.on('connect', () => {
  console.log('[Standalone Worker] Redis connected successfully');
});

connection.on('error', (err) => {
  console.error('[Standalone Worker] Redis connection error:', err.message);
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

worker.on('ready', () => {
  console.log('[Standalone Worker] Worker is ready and listening on "email-queue"');
});

console.log('[Standalone Worker] Email Worker is starting...');