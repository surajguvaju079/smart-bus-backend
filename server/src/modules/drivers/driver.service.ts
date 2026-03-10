import { ServiceResponse } from '@/shared/types';
import { DriverRepository } from './driver.repository';
import { CreateDriverType } from './driver.schema';
import { UserRepository } from '../users/user.repository';
import { ROLES } from '@/shared/constants/constant';
import { ServerResponse } from 'http';
import { db } from '@/shared/database/connection';
import { DriverDto } from './driver.dto';
import { PoolClient } from 'pg';
import bcrypt from 'bcrypt';
export class DriverService {
  private userRepository = new UserRepository();
  constructor(private driverRepository: DriverRepository) {}

  async create(data: CreateDriverType): Promise<ServiceResponse> {
    try {
      return await db.transaction(async (trx) => {
        const userExists = await this.userRepository.findByEmail(data.email, trx);

        if (userExists) {
          return ServiceResponse.alreadyExists('User with this email already exists');
        }

        const password = bcrypt.hashSync(data.password, 10);

        const user = await this.userRepository.create(
          {
            email: data.email,
            name: data.name,
            password,
          },
          trx
        );

        if (!user) {
          return ServiceResponse.databaseError('Failed to create user');
        }

        await this.userRepository.update(user.id, { role: ROLES.DRIVER }, trx);

        const driver = await this.driverRepository.create(
          {
            user_id: user.id,
            license_number: data.license_number,
            vehicle_number: data.vehicle_number,
            current_latitude: null,
            current_longitude: null,
          },
          trx
        );

        if (!driver) {
          return ServiceResponse.databaseError('Failed to create driver');
        }

        return ServiceResponse.created({
          name: user.name,
          email: user.email,
        });
      });
    } catch (error) {
      return ServiceResponse.internalError('Unexpected error occurred', {
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

      const driverDto = drivers.map((driver) => DriverDto.fromEntity(driver as any));
      console.log('driverDto', driverDto);

      return ServiceResponse.ok(driverDto);
    } catch (error) {
      return ServiceResponse.internalError('An unexpedcted error occured', {
        original: (error as Error).message,
      });
    }
  }
}
