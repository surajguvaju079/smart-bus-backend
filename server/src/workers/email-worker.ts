import { Worker } from 'bullmq';
import { redis } from '@/shared/redis/redis';
import { sendEmail } from '@/shared/email/email.service';
import { welcomeTemplate } from '@/shared/services/welcome-template';

export const startEmailWorker = () => {
  console.log('📧 Email worker started');
  const worker = new Worker(
    'email',
    async (job) => {
      switch (job.name) {
        case 'send-welcome-email':
          const { email, name } = job.data;
          const html = welcomeTemplate(name);
          await sendEmail({
            to: email,
            subject: 'Welcome to Smart Bus App',
            html,
          });
          console.log(`Welcome email sent to ${email}`);
          break;
      }
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error:`, err);
  });
};
