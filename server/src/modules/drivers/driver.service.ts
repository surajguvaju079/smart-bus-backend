import { ServiceResponse } from '@/shared/types';
import { DriverRepository } from './driver.repository';
import { CreateDriverType } from './driver.schema';
import { UserRepository } from '../users/user.repository';
import { ROLES } from '@/shared/constants/constant';
import { ServerResponse } from 'http';
import { db } from '@/shared/database/connection';
import { DriverDto } from './driver.dto';
import { PoolClient } from 'pg';

export class DriverService {
  private userRepository = new UserRepository();
  constructor(private driverRepository: DriverRepository) {}

  async create(data: CreateDriverType): Promise<ServiceResponse> {
    let client: PoolClient | null = null;
    try {
      client = await db.getClient();
      await client.query('BEGIN');
      const userExists = await this.userRepository.findByEmail(data.email, client);
      if (userExists) {
        await client.query('ROLLBACK');
        return ServiceResponse.alreadyExists('user with this email already exists');
      }

      const user = await this.userRepository.create(
        {
          email: data.email,
          name: data.name,
          password: data.password,
        },
        client
      );
      if (!user) {
        await client.query('ROLLBACK');
        return ServiceResponse.internalError('Failed to create user');
      }

      const userUpdate = await this.userRepository.update(user.id, { role: ROLES.DRIVER }, client);
      if (!userUpdate) {
        await client.query('ROLLBACK');
        return ServiceResponse.databaseError('Failed to update user into driver');
      }

      const payload = {
        user_id: user.id,
        license_number: data.license_number,
        vehicle_number: data.vehicle_number,
        vehicle_type: data.vehicle_type,
        current_latitude: null,
        current_longitude: null,
      };

      const driver = await this.driverRepository.create(payload, client);
      if (!driver) {
        await client.query('ROLLBACK');
        return ServiceResponse.databaseError('Failed to create driver');
      }
      await client.query('COMMIT');
      return ServiceResponse.created({ name: driver.name, email: driver.email });
    } catch (error) {
      await client.query('ROLLBACK');
      return ServiceResponse.internalError('An unexpected error occurred', {
        original: (error as Error).message,
      });
    }
  }

  async get(): Promise<ServiceResponse> {
    try {
      const drivers = await this.driverRepository.getAll();
      if (!drivers) {
        return ServiceResponse.databaseError('Error in fetching drivers from database');
      }
      console.log('drivers', drivers);

      const driverDto = DriverDto.fromEntity(drivers as any);
      console.log('driverDto', driverDto);

      return ServiceResponse.ok(driverDto);
    } catch (error) {
      return ServiceResponse.internalError('An unexpedcted error occured', {
        original: (error as Error).message,
      });
    }
  }
}
