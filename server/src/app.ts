import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { env } from '@config/env';
import { errorHandler, notFoundHandler } from '@shared/middleware/error.middleware';
import { openApiSpec } from './docs/swagger';
import { runMigrations } from './database/runMigrations';
import { requestLogger } from './shared/middleware/logger.middleware';
import { requestContext } from './shared/middleware/request-context.middleware';
import { requestTimer } from './shared/middleware/request-timer.middleware';
import logger from '@/shared/utils/logger';
import { apiLimiter } from './shared/middleware/rate-limit.middleware';
import { AuthRoute } from './modules/auth/auth.route';
import { UserRoute } from '@modules/users/user.route';
import { DriverRoute } from './modules/drivers/driver.route';
import { TripRoute } from './modules/trips/trip.route';
import { TripLocationRoute } from './modules/trip-locations/trip-location.route';
import { RouteRoute } from '@/modules/routes/route.route';
import { RouteStopRoute } from './modules/route-stops/route-stop.route';

class App {
  public app: Application;
  private routes = [
    new UserRoute(),
    new AuthRoute(),
    new DriverRoute(),
    new TripRoute(),
    new TripLocationRoute(),
    new RouteRoute(),
    new RouteStopRoute(),
  ];

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use('/api', apiLimiter);
    this.app.use(helmet());
    this.app.set('trust proxy', 1);
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

    this.app.use(requestContext);
    this.app.use(requestTimer);
    this.app.use(requestLogger);

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private initializeRoutes() {
    this.routes.forEach((route) => {
      this.app.use(`${env.API_PREFIX}${route.path}`, route.router);
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

  public async init() {
    if (env.NODE_ENV === 'production') {
      await runMigrations();
    }
    logger.info('app is running');
  }
}
export default App;
