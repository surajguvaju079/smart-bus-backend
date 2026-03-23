import { AsyncHandler, Controller } from '@/shared/types';
import { RouteRepository } from './route.repository';
import { RouteService } from '@/modules/routes/route.service';
import express from 'express';
import { validate } from '@/shared/middleware/validation.middleware';
import { createRouteSchema, getAllRoutesSchema, getRouteSchema } from './route.schema';
export class RouteController implements Controller {
  public path = '/routes';
  public routeService: RouteService;
  public router = express.Router();

  constructor() {
    this.routeService = new RouteService(new RouteRepository());
    this.initializeRoutes();
  }
  public initializeRoutes() {
    this.router.post('/', validate(createRouteSchema), this.createRoute);
    this.router.get('/', validate(getAllRoutesSchema), this.getRoutes);
    this.router.get('/:id', validate(getRouteSchema), this.getRoute);
  }

  private createRoute: AsyncHandler = async (req, res) => {
    const name = req.body.name;
    const serviceResponse = await this.routeService.createRoute(String(name));
    res.status(serviceResponse.statusCode).json(serviceResponse.toJSON());
  };
  private getRoutes: AsyncHandler = async (req, res) => {
    let page = Number(req.query.page);
    if (typeof page !== 'string') {
      page = 1;
    }

    let limit = Number(req.query.limit) ?? 10;
    if (typeof limit !== 'string') {
      limit = 10;
    }

    const serviceResponse = await this.routeService.getAllRoutes(page, limit);
    res.status(serviceResponse.statusCode).json(serviceResponse.toJSON());
  };

  private getRoute: AsyncHandler = async (req, res) => {
    const id = req.params.id;
    const serviceResponse = await this.routeService.getRoute(Number(id));
    res.status(serviceResponse.statusCode).json(serviceResponse.toJSON());
  };
}
