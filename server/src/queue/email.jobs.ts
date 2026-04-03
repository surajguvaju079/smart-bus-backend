import { emailQueue } from './email.queue';

export const sendWelcomeEmail = async (data: { email: string; name: string }) => {
  console.log('Enqueuing welcome email for:', data.email);
  await emailQueue.add('send-welcome-email', data);
};
