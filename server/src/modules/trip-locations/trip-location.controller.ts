import { AsyncHandler } from '@/shared/types';
import { TripLocationRepository } from './trip-location.repository';
import { TripLocationService } from './trip-location.service';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class TripLocationController {
  public tripLocationService: TripLocationService;

  constructor() {
    this.tripLocationService = new TripLocationService(new TripLocationRepository());
  }

  public createTripLocation: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.tripLocationService.create(req.body);
    handleServiceResponse(serviceResponse, res);
  };
}
