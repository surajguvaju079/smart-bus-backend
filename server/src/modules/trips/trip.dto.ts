import { TripStatus } from '@/shared/types/auth';

export interface TripsEntity {
  id: number;
  driver_id: number;
  start_latitude: number;
  start_longitude: number;
  start_location_name: string;
  end_latitude: number;
  end_longitude: number;
  end_location_name: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
  updated_at: string;
  status: TripStatus;
  vehicle_number: string;
}

export class TripDTO {
  public readonly id: number;
  public readonly driverId: number;
  public readonly startLatitude: number;
  public readonly startLongitude: number;
  public readonly startLocationName: string;
  public readonly endLatitude: number;
  public readonly endLongitude: number;
  public readonly endLocationName: string;
  public readonly startTime: Date;
  public readonly endTime: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly status: TripStatus;
  public readonly vehicleNumber: string;
  private constructor(trip: TripsEntity) {
    this.id = trip.id;
    this.driverId = trip.driver_id;
    this.startLatitude = trip.start_latitude;
    this.startLongitude = trip.start_longitude;
    this.startLocationName = trip.start_location_name;
    this.endLatitude = trip.end_latitude;
    this.endLongitude = trip.end_longitude;
    this.endLocationName = trip.end_location_name;
    this.startTime = new Date(trip.start_time);
    this.endTime = trip.end_time ? new Date(trip.end_time) : null;
    this.createdAt = new Date(trip.created_at);
    this.updatedAt = new Date(trip.updated_at);
    this.status = trip.status;
    this.vehicleNumber = trip.vehicle_number;
  }
  static fromEntity(trip: TripsEntity): TripDTO {
    return new TripDTO(trip);
  }
}
