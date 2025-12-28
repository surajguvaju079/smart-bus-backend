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

  async getUserById(id: number): Promise<ServiceResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return ServiceResponse.notFound('User not found');
    }

    const userDto = UserDTO.fromEntity(user as any);
    return ServiceResponse.ok(userDto);
  }

  async getUsers(page: number, limit: number): Promise<ServiceResponse> {
    try {
      const offset = (page - 1) * limit;
      const response = await this.userRepository.findAll({ page, limit, offset });
      if (!response) {
        return ServiceResponse.internalError('Failed to fetch users');
      }

      const data = response as any;

      const usersDto = data.users.map((user: User) => UserDTO.fromEntity(user as any));

      return ServiceResponse.ok({
        users: usersDto,
        meta: {
          page,
          limit,
          total: data.total,
          totalPages: Math.ceil(data.total / limit),
        },
      });
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error occurred', {
        original: (error as Error).message,
      });
    }
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<ServiceResponse<User>> {
    // If email is being updated, check if it's already in use
    if (data.email) {
      const existingResponse = await this.userRepository.findByEmail(data.email);

      if (existingResponse) {
        const existingUser = existingResponse;
        if (existingUser.id !== id) {
          return ServiceResponse.alreadyExists('Email already in use');
        }
      }
      return ServiceResponse.internalError('Failed to check existing email');
    }

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: number): Promise<ServiceResponse<null>> {
    return await this.userRepository.delete(id);
  }
}
