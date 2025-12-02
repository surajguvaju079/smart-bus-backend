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

class App {
  public app: Application;
  private controllers = [new UserController()];

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(helmet());
    this.app.use(cors());
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
      // Test database connection
      await db.query('SELECT NOW()');
      console.log('✅ Database connected');

      this.app.listen(env.PORT, () => {
        console.log(`🚀 Server running on port ${env.PORT}`);
        console.log(`📚 API docs available at http://localhost:${env.PORT}/api-docs`);
        console.log(`🏥 Health check at http://localhost:${env.PORT}/health`);
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
