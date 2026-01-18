import { ServiceResponse } from '@/shared/types';
import { CreateTripType } from '../trips/trip.schema';
import { TripLocationRepository } from './trip-location.repository';

export class TripLocationService {
  constructor(private tripLocationRepository: TripLocationRepository) {}

  async create(data: CreateTripType): Promise<ServiceResponse> {
    try {
      return ServiceResponse.created(null);
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error occurred', {});
    }
    // Service methods would go here
  }
  // Service methods would go here
}
