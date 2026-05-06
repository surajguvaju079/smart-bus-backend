import logger from '@/shared/utils/logger';
import { emailQueue } from './email.queue';

export const sendWelcomeEmail = async (data: { email: string; name: string }) => {
  logger.info('Enqueuing welcome email for:', data.email);
  await emailQueue.add('send-welcome-email', data);
};
