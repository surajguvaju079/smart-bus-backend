import http from 'http';
import App from './app';
import { env } from '@config/env';
import { initSocket } from './socket/index';
import { db } from '@shared/database/connection';
import { startTripLocationWorker } from './workers/trip-location.worker';
import { startEmailWorker } from './workers/email-worker';
import logger from './shared/utils/logger';

(async () => {
  logger.info('app instance is listening');
  const appInstance = new App();
  await appInstance.init();
  const server = http.createServer(appInstance.app);
  await initSocket(server);

  startTripLocationWorker().catch(logger.error);
  startEmailWorker();
  server.listen(env.PORT || 8080, '0.0.0.0', () => {
    logger.info(`🚀 Server running on port ${env.PORT || 8080}`);
    logger.info(`📚 API docs available at ${env.BASE_URL}/api-docs`);
    logger.info(`🏥 Health check at ${env.BASE_URL}/health`);
  });

  process.on('SIGINT', async () => {
    logger.info('🔒 Shutting down server...');
    server.close();
    await db.close();
    process.exit(0);
  });
})();
