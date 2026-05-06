import { AsyncHandler } from '@/shared/types';
import { RouteRepository } from './route.repository';
import { RouteService } from '@/modules/routes/route.service';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class RouteController {
  public routeService: RouteService;

  constructor() {
    this.routeService = new RouteService(new RouteRepository());
  }

  public createRoute: AsyncHandler = async (req, res) => {
    const name = req.body.name;
    const serviceResponse = await this.routeService.createRoute(String(name));
    handleServiceResponse(serviceResponse, res);
  };
  public getRoutes: AsyncHandler = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const serviceResponse = await this.routeService.getAllRoutes(page, limit);
    handleServiceResponse(serviceResponse, res);
  };

  public getRoute: AsyncHandler = async (req, res) => {
    const id = req.params.id;
    const serviceResponse = await this.routeService.getRoute(Number(id));
    handleServiceResponse(serviceResponse, res);
  };
  public getRouteByRouteId: AsyncHandler = async (req, res) => {
    const id = req.params.id;
    const serviceResponse = await this.routeService.getRouteByRouteId(Number(id));
    handleServiceResponse(serviceResponse, res);
  };

  public createFullRoute: AsyncHandler = async (req, res) => {
    const { name, stops } = req.body;
    const { trip_id } = req.query as any;
    const id = Number(trip_id) ?? null;
    console.log('id of trip is', id);

    const serviceResponse = await this.routeService.createFullRoute(String(name), stops, id);

    handleServiceResponse(serviceResponse, res);
  };
}
