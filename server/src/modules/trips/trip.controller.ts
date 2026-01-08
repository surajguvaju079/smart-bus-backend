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
  }
  private create: AsyncHandler = async (req, res) => {};
}
