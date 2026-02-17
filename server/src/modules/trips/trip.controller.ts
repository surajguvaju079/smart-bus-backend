import { AsyncHandler, Controller } from '@/shared/types';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repository';
import { Router } from 'express';
import { validate } from '@/shared/middleware/validation.middleware';
import { createTripSchema } from './trip.schema';

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
  }

  private create: AsyncHandler = async (req, res) => {
    const response = await this.tripService.create(req.body);
    res.status(response.statusCode).json(response.toJSON());
  };

  private get: AsyncHandler = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const response = await this.tripService.getTrips(page, limit);
    res.status(response.statusCode).json(response.toJSON());
  };
}
