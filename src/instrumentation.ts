export async function register() {
  // Only register the worker in non-edge runtimes (edge doesn't support BullMQ workers)
  if (process.env.NEXT_RUNTIME === 'edge') return;

  const { Worker } = await import('bullmq');
  const { redis } = await import('@/lib/redis');
  const { sendEmail } = await import('@/lib/email');

  const worker = new Worker(
    'email-queue',
    async (job) => {
      const { to, subject, html } = job.data;
      console.log(`[Email Worker] Processing job ${job.id}: sending email to ${to}`);
      await sendEmail(to, subject, html);
      console.log(`[Email Worker] Email sent to: ${to}`);
    },
    {
      connection: redis as any,
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
