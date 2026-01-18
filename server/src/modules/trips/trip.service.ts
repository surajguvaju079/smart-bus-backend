import { ServiceResponse } from '@/shared/types';
import { TripRepository } from './trip.repository';
import { DriverRepository } from '../drivers/driver.repository';
import { TripDTO } from './trip.dto';

export class TripService {
  private driverRepository: DriverRepository;
  constructor(private tripRepository: TripRepository) {
    this.driverRepository = new DriverRepository();
  }

  async create(data: any) {
    try {
      console.log('Creating trip with data:', data);
      const driverExists = await this.driverRepository.findById(data.driver_id);
      if (!driverExists) {
        return ServiceResponse.notFound('Driver not found');
      }
      const vehicleIsOngoing = await this.tripRepository.findOngoingTripByVehicle(
        data.vehicle_number
      );
      if (vehicleIsOngoing) {
        return ServiceResponse.alreadyExists('Trip with this vehicle is already moving');
      }
      const trip = await this.tripRepository.createTrip(data);

      return ServiceResponse.created(trip);
    } catch (error) {
      return ServiceResponse.internalError('Failed to create trip');
    }
  }
  async getTrips(page: number, limit: number) {
    try {
      const trips = await this.tripRepository.getAllTrips(page, limit);
      console.log('Fetched trips:', trips);

      if (!trips || trips.length === 0) {
        return ServiceResponse.ok([]);
      }

      const tripDto = trips.map((trip: any) => TripDTO.fromEntity(trip as any));
      return ServiceResponse.ok({ trips: tripDto });
    } catch (error) {
      return ServiceResponse.internalError('Failed to fetch trips');
    }
  }
}
