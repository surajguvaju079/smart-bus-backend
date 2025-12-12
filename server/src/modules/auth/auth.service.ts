import bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { UserLoginDTO } from './auth.schema';
import { ServiceResponse } from '@/shared/types';
import { User } from '../users/user.schema';

export class AuthService {
  constructor(private authRepository: AuthRepository) {}
  async loginUser(data: UserLoginDTO): Promise<ServiceResponse<Omit<User, 'password'>>> {
    const user = await this.authRepository.findByEmail(data.email);
    if (user.isFailure()) {
      return ServiceResponse.unauthorized('Invalid credentials');
    }
    const password = user.data.password;
    const isPasswordValid = bcrypt.compareSync(data.password, password);
    if (!isPasswordValid) {
      return ServiceResponse.unauthorized('Invalid credentials');
    }
    return ServiceResponse.ok({
      id: user.data.id,
      email: user.data.email,
      name: user.data.name,
      role: user.data.role,
      createdAt: user.data.createdAt,
      updatedAt: user.data.updatedAt,
    });
  }
}
