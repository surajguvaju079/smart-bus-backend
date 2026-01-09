import { UserRole } from '@/shared/types/auth';

export interface DriverEntity {
  id: number;
  vehicle_number: string;
  name: string;
  email: string;
  current_latitude: Number | null;
  current_longitude: Number | null;
  is_available: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export class DriverDto {
  public readonly id: number;
  public readonly vehicleNumber: string;
  public readonly name: string;
  public readonly email: string;
  public readonly currentLatitude: Number | null;
  public readonly currentLongitude: Number | null;
  public readonly isAvailable: boolean;
  public readonly isVerifed: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  constructor(driver: DriverEntity) {
    this.id = driver.id;
    this.createdAt = new Date(driver.created_at);
    this.updatedAt = new Date(driver.updated_at);
    this.currentLongitude = driver.current_longitude ?? null;
    this.currentLatitude = driver.current_latitude ?? null;
    this.isAvailable = driver.is_available;
    this.isVerifed = driver.is_verified;
    this.email = driver.email;
    this.name = driver.name;
    this.vehicleNumber = driver.vehicle_number;
  }

  public static fromEntity(driver: DriverEntity): DriverDto {
    return new DriverDto(driver);
  }
}
