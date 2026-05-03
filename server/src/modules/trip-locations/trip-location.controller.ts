import { AsyncHandler, Controller } from '@/shared/types';
import { TripLocationRepository } from './trip-location.repository';
import { TripLocationService } from './trip-location.service';
import { Router } from 'express';
import { validate } from '@/shared/middleware/validation.middleware';
import { TripLocationSchema } from './trip-location.schema';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

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
  }

  private createTripLocation: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.tripLocationService.create(req.body);
    handleServiceResponse(serviceResponse, res);
  };
}
