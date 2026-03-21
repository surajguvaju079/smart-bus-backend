import { AsyncHandler, Controller } from '@/shared/types';
import { RouteRepository } from './route.repository';
import { RouteService } from './route.service';
import express from 'express';
import { validate } from '@/shared/middleware/validation.middleware';
import { createRouteSchema } from './route.schema';
export class RouteController implements Controller {
  public path = '/routes';
  private routeService: RouteService;
  public router = express.Router();

  constructor() {
    this.routeService = new RouteService(new RouteRepository());
    this.initializeRoutes();
  }
  public initializeRoutes() {
    this.router.post('/', validate(createRouteSchema), this.createRoute);
  }

  private createRoute: AsyncHandler = async (req, res) => {
    const name = req.body.name;
    const serviceResponse = await this.routeService.createRoute(name);
    res.status(serviceResponse.statusCode).json(serviceResponse.toJSON());
  };
}
