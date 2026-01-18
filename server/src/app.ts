import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from '@config/env';
import { db } from '@shared/database/connection';
import { errorHandler, notFoundHandler } from '@shared/middleware/error.middleware';
import { UserController } from '@modules/users/user.controller';
import { openApiSpec } from './docs/swagger';
import { AuthController } from './modules/auth/auth.controller';
import { runMigrations } from './database/runMigrations';
import { DriverController } from './modules/drivers/driver.controller';
import { TripController } from './modules/trips/trip.controller';

class App {
  public app: Application;
  private controllers = [
    new UserController(),
    new AuthController(),
    new DriverController(),
    new TripController(),
  ];

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: 'true',
        credentials: true,
        exposedHeaders: ['Authorization'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private initializeControllers() {
    this.controllers.forEach((controller) => {
      this.app.use(`${env.API_PREFIX}${controller.path}`, controller.router);
    });
  }

  private initializeSwagger() {
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(openApiSpec, {
        explorer: true,
        customSiteTitle: 'API Documentation',
      })
    );
  }

  private initializeErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async listen() {
    try {
      if (env.NODE_ENV === 'production') {
        await runMigrations();
      }
      this.app.listen(env.PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${env.PORT}`);
        console.log(`📚 API docs available at ${env.BASE_URL}/api-docs`);
        console.log(`🏥 Health check at ${env.BASE_URL}/health`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

const app = new App();
app.listen();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await db.close();
  process.exit(0);
});
