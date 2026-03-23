import { Router } from 'express';
import { RouteStopService } from './route-stop.service';
import { RouteStopRepository } from './route-stop.repository';
import { AsyncHandler } from '@/shared/types';
import { validate } from '@/shared/middleware/validation.middleware';
import { addRouteStopsSchema, createRouteStopSchema } from './route-stop.schema';
import { sourceMapsEnabled } from 'process';
export class RouteStopController {
  public path = '/route-stops';
  public router = Router();
  public routeStopService: RouteStopService;
  constructor() {
    this.routeStopService = new RouteStopService(new RouteStopRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/:routeId', validate(createRouteStopSchema), this.createRouteStop);
    this.router.post('/bulk/:id', validate(addRouteStopsSchema), this.addRouteStops);
  }
  public createRouteStop: AsyncHandler = async (req, res) => {
    const { latitude, longitude, stopOrder, name } = req.body;
    console.log(latitude, longitude, stopOrder, name);
    const routeId = req.params.routeId;
    const response = await this.routeStopService.createRouteStop(
      Number(routeId),
      Number(latitude),
      Number(longitude),
      Number(stopOrder),
      String(name)
    );
    res.status(response.statusCode).json(response.toJSON());
  };

  private addRouteStops: AsyncHandler = async (req, res) => {
    const { id } = req.params as any;
    const { stops } = req.body;

    const serviceResponse = await this.routeStopService.addRouteStops(id, stops);

    res.status(serviceResponse.statusCode).json(serviceResponse.toJSON());
  };
}
