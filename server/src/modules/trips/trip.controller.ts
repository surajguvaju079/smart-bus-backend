import { AsyncHandler } from '@/shared/types';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repository';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class TripController {
  public tripService: TripService;

  constructor() {
    this.tripService = new TripService(new TripRepository());
  }

  public create: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.tripService.create(req.body);
    handleServiceResponse(serviceResponse, res);
  };

  public get: AsyncHandler = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const serviceResponse = await this.tripService.getTrips(page, limit);
    handleServiceResponse(serviceResponse, res);
  };

  public getByDriverId: AsyncHandler = async (req, res) => {
    const driverId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const serviceResponse = await this.tripService.getTripsByDriverId(driverId, page, limit);
    handleServiceResponse(serviceResponse, res);
  };
}
