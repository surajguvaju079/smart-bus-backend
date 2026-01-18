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
      const driverExists = await this.driverRepository.findById(data.driver_id);
      if (!driverExists) {
        return ServiceResponse.notFound('Driver not found');
      }
      const vehicleNumberExists = await this.driverRepository.findByVehicleNumber(
        data.vehicle_number
      );
      if (vehicleNumberExists) {
        return ServiceResponse.alreadyExists('Trip with this vehicle number already exists');
      }
      const trip = await this.tripRepository.createTrip(data);
      if (!trip) {
        return ServiceResponse.databaseError('Failed to create trip');
      }

      return ServiceResponse.created(trip);
    } catch (error) {
      return ServiceResponse.internalError('Failed to create trip');
    }
  }
  async getTrips(page: number, limit: number) {
    try {
      const trips = await this.tripRepository.getAllTrips(page, limit);
      console.log('Fetched trips:', trips);

      const tripDto = TripDTO.fromEntity(trips as any);
      return ServiceResponse.ok(tripDto);
    } catch (error) {
      return ServiceResponse.internalError('Failed to fetch trips');
    }
  }
}
