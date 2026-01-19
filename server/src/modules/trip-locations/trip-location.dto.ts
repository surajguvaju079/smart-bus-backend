export interface TripLocationEntity {
  id: number;
  trip_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  recorded_at?: string;
}

export class TripLocationDto {
  public readonly id: number;
  public readonly tripId: number;
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly timestamp: Date;
  public readonly speed?: number;
  public readonly recordedAt?: Date;

  constructor(tripLocation: TripLocationEntity) {
    this.id = tripLocation.id;
    this.tripId = tripLocation.trip_id;
    this.latitude = tripLocation.latitude;
    this.longitude = tripLocation.longitude;
    this.timestamp = new Date(tripLocation.timestamp);
    this.speed = tripLocation.speed;
    this.recordedAt = tripLocation.recorded_at ? new Date(tripLocation.recorded_at) : undefined;
  }
  public static fromEntity(tripLocation: TripLocationEntity): TripLocationDto {
    return new TripLocationDto(tripLocation);
  }
}
