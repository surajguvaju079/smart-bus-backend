import { AsyncHandler, Controller } from '@/shared/types';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repository';
import { Router } from 'express';
import { validate } from '@/shared/middleware/validation.middleware';
import { createTripSchema } from './trip.schema';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class TripController implements Controller {
  public path = '/trips';
  public tripService: TripService;
  public router = Router();
  constructor() {
    this.tripService = new TripService(new TripRepository());
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post('/create', validate(createTripSchema), this.create);
    this.router.get('/', this.get);
    this.router.get('/driver/:id', this.getByDriverId);
  }

  private create: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.tripService.create(req.body);
    handleServiceResponse(serviceResponse, res);
  };

  private get: AsyncHandler = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const serviceResponse = await this.tripService.getTrips(page, limit);
    handleServiceResponse(serviceResponse, res);
  };

  private getByDriverId: AsyncHandler = async (req, res) => {
    const driverId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const serviceResponse = await this.tripService.getTripsByDriverId(driverId, page, limit);
    handleServiceResponse(serviceResponse, res);
  };
}
