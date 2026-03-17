import { ServiceResponse } from '@/shared/types';
import { CreateTripType } from '../trips/trip.schema';
import { TripLocationRepository } from './trip-location.repository';
import { TripLocationType } from './trip-location.schema';
import { TripDTO } from '../trips/trip.dto';
import { TripRepository } from '../trips/trip.repository';
import { TripLocationPublisher } from './trip-location.publisher';

export class TripLocationService {
  private tripRepository = new TripRepository();
  //private tripLocationPublisher = new TripLocationPublisher();
  constructor(private tripLocationRepository: TripLocationRepository) {}

  async create(data: TripLocationType): Promise<ServiceResponse> {
    try {
      const tripExists = await this.tripRepository.findById(data.trip_id);
      if (!tripExists) {
        return ServiceResponse.notFound('Trip not found');
      }
      console.log('Creating trip location with data:', data);
      await TripLocationPublisher.publishTripLocation(data);
      return ServiceResponse.created({ message: 'Location published successfully' });
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error occurred', {});
    }
  }
}
