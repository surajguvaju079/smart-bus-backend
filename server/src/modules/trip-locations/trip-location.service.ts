import { ServiceResponse } from '@/shared/types';
import { CreateTripType } from '../trips/trip.schema';
import { TripLocationRepository } from './trip-location.repository';
import { TripLocationType } from './trip-location.schema';
import { TripDTO } from '../trips/trip.dto';
import { TripRepository } from '../trips/trip.repository';

export class TripLocationService {
  private tripRepository = new TripRepository();
  constructor(private tripLocationRepository: TripLocationRepository) {}

  async create(data: TripLocationType): Promise<ServiceResponse> {
    try {
      const tripExists = await this.tripRepository.findById(data.trip_id);
      if (!tripExists) {
        return ServiceResponse.notFound('Trip not found');
      }
      const tripLocation = await this.tripLocationRepository.create(data);
      const trip = TripDTO.fromEntity(tripLocation);
      return ServiceResponse.created(trip);
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error occurred', {});
    }
  }
}
