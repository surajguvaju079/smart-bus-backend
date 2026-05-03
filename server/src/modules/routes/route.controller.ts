import { AsyncHandler, Controller } from '@/shared/types';
import { RouteRepository } from './route.repository';
import { RouteService } from '@/modules/routes/route.service';
import express from 'express';
import { validate } from '@/shared/middleware/validation.middleware';
import {
  createFullRouteSchema,
  createRouteSchema,
  getAllRoutesSchema,
  getRouteSchema,
} from './route.schema';
import { handleServiceResponse } from '@/shared/utils/http-handlers';
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
    this.router.get('/one/:id', validate(getRouteSchema), this.getRouteByRouteId);
    this.router.post('/full', validate(createFullRouteSchema), this.createFullRoute);
  }

  private createRoute: AsyncHandler = async (req, res) => {
    const name = req.body.name;
    const serviceResponse = await this.routeService.createRoute(String(name));
    handleServiceResponse(serviceResponse, res);
  };
  private getRoutes: AsyncHandler = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const serviceResponse = await this.routeService.getAllRoutes(page, limit);
    handleServiceResponse(serviceResponse, res);
  };

  private getRoute: AsyncHandler = async (req, res) => {
    const id = req.params.id;
    const serviceResponse = await this.routeService.getRoute(Number(id));
    handleServiceResponse(serviceResponse, res);
  };
  private getRouteByRouteId: AsyncHandler = async (req, res) => {
    const id = req.params.id;
    const serviceResponse = await this.routeService.getRouteByRouteId(Number(id));
    handleServiceResponse(serviceResponse, res);
  };

  private createFullRoute: AsyncHandler = async (req, res) => {
    const { name, stops } = req.body;
    const { trip_id } = req.query as any;
    const id = Number(trip_id) ?? null;
    console.log('id of trip is', id);

    const serviceResponse = await this.routeService.createFullRoute(String(name), stops, id);

    handleServiceResponse(serviceResponse, res);
  };
}
