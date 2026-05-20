import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { UserLoginDTO } from './auth.schema';
import { ServiceResponse } from '@/shared/types';
import { User } from '../users/user.schema';
import { generateAuthToken, generateRefreshToken } from '@/shared/middleware/auth.middleware';
import { UserDTO } from '../users/user.dto';
import { DriverRepository } from '../drivers/driver.repository';
import logger from '@/shared/utils/logger';

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private driverRepository: DriverRepository
  ) {}

  /**
   * Authenticates a user with email and password. It verifies the credentials,
   * generates access and refresh tokens, maps the user to an Auth/User DTO, and
   * includes driver metadata when the authenticated user has the DRIVER role.
   *
   * @param data The login payload containing email and password
   * @returns A service response containing the authenticated user and tokens or an error message
   */
  async loginUser(data: { email: string; password: string }): Promise<ServiceResponse> {
    const user = await this.authRepository.findByEmail(data.email);

    if (!user || user === undefined) {
      return ServiceResponse.unauthorized('Invalid credentials');
    }

    logger.info('user data:', user);

    const isPasswordValid = bcrypt.compareSync(data.password, user.password);
    if (!isPasswordValid) {
      return ServiceResponse.unauthorized('Invalid credentials');
    }

    const access_token = generateAuthToken(user.id, user.email, user.role);
    if (!access_token) {
      return ServiceResponse.internalError('Failed to generate access token');
    }
    const refresh_token = generateRefreshToken(user.id);
    if (!refresh_token) {
      return ServiceResponse.internalError('Failed to generate refresh token');
    }

    const userDto = UserDTO.fromEntity(user as any);
    console.log('userDto:', userDto);
    let driver = null;
    if (userDto.role === 'DRIVER') {
      const driverData = await this.driverRepository.findByUserId(user.id);

      driver = { driver_id: driverData.id, vehicle_number: driverData.vehicle_number };
    }

    return ServiceResponse.ok({
      user: { ...userDto, ...driver },
      access_token,
      refresh_token,
    });
  }
}
