import { RouteStopService } from './route-stop.service';
import { RouteStopRepository } from './route-stop.repository';
import { AsyncHandler } from '@/shared/types';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class RouteStopController {
  public routeStopService: RouteStopService;

  constructor() {
    this.routeStopService = new RouteStopService(new RouteStopRepository());
  }

  public createRouteStop: AsyncHandler = async (req, res) => {
    const { latitude, longitude, stopOrder, name } = req.body;
    console.log(latitude, longitude, stopOrder, name);
    const routeId = req.params.routeId;
    const serviceResponse = await this.routeStopService.createRouteStop(
      Number(routeId),
      Number(latitude),
      Number(longitude),
      Number(stopOrder),
      String(name)
    );
    handleServiceResponse(serviceResponse, res);
  };

  public addRouteStops: AsyncHandler = async (req, res) => {
    const { id } = req.params as any;
    const { stops } = req.body;

    const serviceResponse = await this.routeStopService.addRouteStops(id, stops);

    handleServiceResponse(serviceResponse, res);
  };
}
