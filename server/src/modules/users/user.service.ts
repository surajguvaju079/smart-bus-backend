import { UserRepository } from './user.repository';
import { User, CreateUserDTO, UpdateUserDTO } from './user.schema';
import { ServiceResponse } from '@shared/types';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: CreateUserDTO): Promise<ServiceResponse<User>> {
    // Check if user already exists
    const existingResponse = await this.userRepository.findByEmail(data.email);

    // If we got a success response, user exists
    if (existingResponse.isSuccess()) {
      return ServiceResponse.alreadyExists('User with this email already exists');
    }

    // If error is NOT "not found", it's a real error
    if (existingResponse.isFailure() && existingResponse.getError()?.code !== 'NOT_FOUND') {
      return existingResponse;
    }

    // User doesn't exist, create new one
    return await this.userRepository.create(data);
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
