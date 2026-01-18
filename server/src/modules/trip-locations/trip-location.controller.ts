import { Controller } from '@/shared/types';
import { TripLocationRepository } from './trip-location.repository';
import { TripLocationService } from './trip-location.service';
import { Router } from 'express';
import { validate } from '@/shared/middleware/validation.middleware';
import { TripLocationSchema } from './trip-location.schema';

export class TripLocationController implements Controller {
  public path = '/trip-locations';
  public router = Router();
  public tripLocationService: TripLocationService;

  constructor() {
    this.tripLocationService = new TripLocationService(new TripLocationRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', validate(TripLocationSchema), this.createTripLocation);
    // Define routes here
  }

  private createTripLocation = async (req, res) => {
    const response = await this.tripLocationService.create(req.body);
    res.status(response.StatusCodes).json(response.toJSON());
  };
}
