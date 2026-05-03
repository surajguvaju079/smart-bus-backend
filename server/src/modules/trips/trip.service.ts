import { ServiceResponse } from '@/shared/types';
import { TripRepository } from './trip.repository';
import { DriverRepository } from '../drivers/driver.repository';
import { TripDTO } from './trip.dto';

export class TripService {
  private driverRepository: DriverRepository;
  constructor(private tripRepository: TripRepository) {
    this.driverRepository = new DriverRepository();
  }

  /**
   * Creates a trip after validating that the driver exists and that the vehicle
   * does not already have an ongoing trip.
   *
   * @param data The trip creation payload
   * @returns A service response containing the created trip or an error message
   */
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

  /**
   * Fetches trips with pagination and maps each trip entity to a TripDTO.
   *
   * @param page The current page number
   * @param limit The maximum number of trips to return per page
   * @returns A service response containing trip DTOs or an error message
   */
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

  /**
   * Fetches trips assigned to a specific driver with pagination and maps each
   * trip entity to a TripDTO.
   *
   * @param driverId The ID of the driver whose trips should be fetched
   * @param page The current page number
   * @param limit The maximum number of trips to return per page
   * @returns A service response containing trip DTOs or an error message
   */
  async getTripsByDriverId(driverId: number, page: number, limit: number) {
    try {
      console.log(`Fetching trips for driver ID: ${driverId}, page: ${page}, limit: ${limit}`);
      const trips = await this.tripRepository.getTripsByDriverId(driverId, page, limit);
      console.log('Fetched trips for driver:', trips);
      const tripDto = trips.map((trip: any) => TripDTO.fromEntity(trip as any));
      return ServiceResponse.ok({ trips: tripDto });
    } catch (error) {
      return ServiceResponse.internalError('Failed to fetch trips for driver');
    }
  }
}
