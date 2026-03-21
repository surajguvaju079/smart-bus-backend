import { Router } from 'express';
import { RouteStopService } from './route-stop.service';
import { RouteStopRepository } from './route-stop.repository';
import { AsyncHandler } from '@/shared/types';
export class RouteStopController {
  public path = '/route-stops';
  public router = Router();
  public routeStopService: RouteStopService;
  constructor() {
    this.routeStopService = new RouteStopService(new RouteStopRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', this.createRouteStop);
  }
  public createRouteStop: AsyncHandler = async (req, res) => {
    const { routeId, latitude, longitude, stopOrder } = req.body;
    const response = await this.routeStopService.createRouteStop(
      routeId,
      latitude,
      longitude,
      stopOrder
    );
    res.status(response.statusCode).json(response.toJSON());
  };
}
