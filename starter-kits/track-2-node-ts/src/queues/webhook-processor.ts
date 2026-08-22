import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const webhookQueue = new Queue('webhooks', { connection });

export function createWebhookWorker(
  processor: (job: Job) => Promise<void>
): Worker {
  return new Worker(
    'webhooks',
    async (job: Job) => {
      console.log(`[WORKER] Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);
      await processor(job);
    },
    {
      connection,
      concurrency: 10,
      limiter: { max: 100, duration: 1000 },
    }
  );
}
