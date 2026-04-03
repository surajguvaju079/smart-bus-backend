import { Queue } from 'bullmq';
import { redis } from '@/shared/redis/redis';
export const emailQueue = new Queue('email', {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
