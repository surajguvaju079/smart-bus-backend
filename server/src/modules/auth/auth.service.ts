import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { UserLoginDTO } from './auth.schema';
import { ServiceResponse } from '@/shared/types';
import { User } from '../users/user.schema';
import { generateAuthToken, generateRefreshToken } from '@/shared/middleware/auth.middleware';
import { UserDTO } from '../users/user.dto';

export class AuthService {
  constructor(private authRepository: AuthRepository) {}
  async loginUser(data: { email: string; password: string }): Promise<ServiceResponse> {
    const user = await this.authRepository.findByEmail(data.email);
    console.log('Fetched user:', user);
    if (!user || user === undefined) {
      return ServiceResponse.unauthorized('Invalid credentials');
    }

    console.log('user data:', user);

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

    return ServiceResponse.ok({
      user: userDto,
      access_token,
      refresh_token,
    });
  }
}
