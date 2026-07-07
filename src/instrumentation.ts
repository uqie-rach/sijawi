export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return;

  // webpackIgnore: true — Node akan resolve bullmq & ioredis langsung dari node_modules
  const { Worker } = await import(/* webpackIgnore: true */ 'bullmq');
  const { default: Redis } = await import(/* webpackIgnore: true */ 'ioredis');

  // Dynamic import tanpa webpackIgnore — webpack resolve path lokal & externalize nodemailer
  const { sendEmail } = await import('./lib/email');

  const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    'email-queue',
    async (job) => {
      const { to, subject, html } = job.data;
      console.log(`[Email Worker] Processing job ${job.id}: sending email to ${to}`);
      await sendEmail(to, subject, html);
      console.log(`[Email Worker] Email sent to: ${to}`);
    },
    {
      connection: connection as any,
      concurrency: 4,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[Email Worker] Job ${job?.id} failed:`, err);
  });

  worker.on('completed', (job) => {
    console.log(`[Email Worker] Job ${job.id} completed`);
  });

  console.log('[Email Worker] BullMQ worker registered for "email-queue"');
}