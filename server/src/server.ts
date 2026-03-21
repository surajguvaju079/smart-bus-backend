import http from 'http';
import App from './app';
import { env } from '@config/env';
import { initSocket } from './socket/index';
import { db } from '@shared/database/connection';
import { startTripLocationWorker } from './workers/trip-location.worker';

(async () => {
  console.log('app instance is listening');
  const appInstance = new App();
  await appInstance.init();
  const server = http.createServer(appInstance.app);
  initSocket(server);

  console.log('hi there server is listening');
  startTripLocationWorker();
  server.listen(env.PORT || 8080, '0.0.0.0', () => {
    console.log(`Server running on port ${env.PORT || 8080}`);
    console.log(`API docs available at ${env.BASE_URL}/api-docs`);
    console.log(`Health check at ${env.BASE_URL}/health`);
  });

  //Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    server.close();
    await db.close();
    process.exit(0);
  });
})();
