import brcypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { User, CreateUserDTO, UpdateUserDTO } from './user.schema';
import { ServiceResponse } from '@shared/types';
import { UserDTO } from './user.dto';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: CreateUserDTO): Promise<ServiceResponse> {
    try {
      const existingUser = await this.userRepository.findByEmail(data.email);
      console.log('Existing user check:', existingUser);

      if (existingUser) {
        return ServiceResponse.alreadyExists('Email already in use');
      }

      const password = brcypt.hashSync(data.password, 10);
      data.password = password;

      // User doesn't exist, create new one
      const user = await this.userRepository.create(data);
      if (!user) {
        return ServiceResponse.internalError('Failed to create user');
      }

      const userDto = UserDTO.fromEntity(user as any);
      console.log('Created userDto:', userDto);

      return ServiceResponse.created(userDto);
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error occurred', {
        original: (error as Error).message,
      });
    }
    // Check if user already exists
  }

  async getUserById(id: number): Promise<ServiceResponse<User>> {
    return await this.userRepository.findById(id);
  }

  async getUsers(
    page: number,
    limit: number
  ): Promise<ServiceResponse<{ users: User[]; meta: any }>> {
    const offset = (page - 1) * limit;
    const response = await this.userRepository.findAll({ page, limit, offset });

    if (response.isFailure()) {
      return response as any;
    }

    const data = response.getData()!;

    return ServiceResponse.ok({
      users: data.users,
      meta: {
        page,
        limit,
        total: data.total,
        totalPages: Math.ceil(data.total / limit),
      },
    });
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<ServiceResponse<User>> {
    // If email is being updated, check if it's already in use
    if (data.email) {
      const existingResponse = await this.userRepository.findByEmail(data.email);

      if (existingResponse.isSuccess()) {
        const existingUser = existingResponse.getData()!;
        if (existingUser.id !== id) {
          return ServiceResponse.alreadyExists('Email already in use');
        }
      } else if (existingResponse.getError()?.code !== 'NOT_FOUND') {
        // Real error occurred
        return existingResponse;
      }
    }

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: number): Promise<ServiceResponse<null>> {
    return await this.userRepository.delete(id);
  }
}
