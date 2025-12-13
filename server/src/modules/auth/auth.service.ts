import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { UserLoginDTO } from './auth.schema';
import { ServiceResponse } from '@/shared/types';
import { User } from '../users/user.schema';
import { generateAuthToken, generateRefreshToken } from '@/shared/middleware/auth.middleware';

export class AuthService {
  constructor(private authRepository: AuthRepository) {}
  async loginUser(data: UserLoginDTO): Promise<ServiceResponse> {
    const user = await this.authRepository.findByEmail(data.email);
    if (user.isFailure()) {
      return ServiceResponse.unauthorized('Invalid credentials');
    }
    const password = user.data.password;
    const isPasswordValid = bcrypt.compareSync(data.password, password);
    if (!isPasswordValid) {
      return ServiceResponse.unauthorized('Invalid credentials');
    }
    console.log('User authenticated:', user.data.email);
    const access_token = generateAuthToken(user.data.id, user.data.email, user.data.role);
    if (!access_token) {
      return ServiceResponse.internalError('Failed to generate access token');
    }
    const refresh_token = generateRefreshToken(user.data.id);
    if (!refresh_token) {
      return ServiceResponse.internalError('Failed to generate refresh token');
    }

    return ServiceResponse.ok({
      user: {
        id: user.data.id,
        email: user.data.email,
        name: user.data.name,
        role: user.data.role,
        createdAt: user.data.createdAt,
        updatedAt: user.data.updatedAt,
      },
      access_token,
      refresh_token,
    });
  }
}
