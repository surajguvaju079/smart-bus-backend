import { ServiceResponse } from '@/shared/types';
import { DriverRepository } from './driver.repository';
import { CreateDriverType } from './driver.schema';
import { UserRepository } from '../users/user.repository';
import { ROLES } from '@/shared/constants/constant';

export class DriverService {
  private userRepository = new UserRepository();
  constructor(private driverRepository: DriverRepository) {}

  async create(data: CreateDriverType): Promise<ServiceResponse> {
    try {
      const userExists = await this.userRepository.findByEmail(data.email);
      if (userExists) {
        return ServiceResponse.alreadyExists('user with this email already exists');
      }

      const user = await this.userRepository.create({
        email: data.email,
        name: data.name,
        password: data.password,
      });
      if (!user) {
        return ServiceResponse.internalError('Failed to create user');
      }

      const userUpdate = await this.userRepository.update(user.id, { role: ROLES.DRIVER });
      if (!userUpdate) {
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

      const driver = await this.driverRepository.create(payload);
      if (!driver) {
        return ServiceResponse.databaseError('Failed to create driver');
      }
      return ServiceResponse.created({ name: driver.name, email: driver.email });
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error occurred', {
        original: (error as Error).message,
      });
    }
  }
}
