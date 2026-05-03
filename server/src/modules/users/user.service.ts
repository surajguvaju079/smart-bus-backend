import brcypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { User, CreateUserDTO, UpdateUserDTO } from './user.schema';
import { ServiceResponse } from '@shared/types';
import { UserDTO } from './user.dto';
import { sendWelcomeEmail } from '@/queue/email.jobs';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Creates a new user after checking that the email is not already registered.
   * The password is hashed before persistence, the persisted entity is mapped to
   * a UserDTO, and a welcome email job is queued after successful creation.
   *
   * @param data The user payload containing email, name, and password
   * @returns A service response containing the created user DTO or an error message
   */
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

      sendWelcomeEmail({ email: user.email, name: user.name });

      return ServiceResponse.created(userDto);
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error occurred', {
        original: (error as Error).message,
      });
    }
  }

  /**
   * Fetches a user by ID. If the user does not exist, it returns a not found
   * response; otherwise it maps the user entity to a UserDTO.
   *
   * @param id The ID of the user to fetch
   * @returns A service response containing the user DTO or an error message
   */
  async getUserById(id: number): Promise<ServiceResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return ServiceResponse.notFound('User not found');
    }

    const userDto = UserDTO.fromEntity(user as any);
    return ServiceResponse.ok(userDto);
  }

  /**
   * Fetches users with pagination metadata. The method calculates the offset,
   * retrieves users from the repository, maps each entity to a UserDTO, and
   * returns the list with page, limit, total, and totalPages metadata.
   *
   * @param page The current page number
   * @param limit The maximum number of users to return per page
   * @returns A service response containing users and pagination metadata or an error message
   */
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

  /**
   * Updates a user by ID after verifying that the user exists. If the email is
   * being changed, it also checks that the new email is not used by another user.
   *
   * @param id The ID of the user to update
   * @param data The partial user payload to update
   * @returns A service response containing the updated user DTO or an error message
   */
  async updateUser(id: number, data: Partial<UpdateUserDTO>): Promise<ServiceResponse> {
    try {
      const userExists = await this.userRepository.findById(id);
      if (!userExists) {
        return ServiceResponse.notFound('User not found');
      }

      // If email is being updated, check if it's already in use
      if (data.email) {
        const existingUser = await this.userRepository.findByEmail(data.email);

        if (existingUser) {
          if (existingUser.id !== id) {
            return ServiceResponse.alreadyExists('Email already in use');
          }
        }
      }

      const user = await this.userRepository.update(id, data);
      if (!user) {
        return ServiceResponse.internalError('Failed to update user');
      }
      console.log('Updated user:', user);
      const userDto = UserDTO.fromEntity(user as any);
      console.log('user from response', userDto);
      return ServiceResponse.ok(userDto);
    } catch (error) {
      return ServiceResponse.internalError('An unexpected error ocurred', {
        original: (error as Error).message,
      });
    }
  }

  /**
   * Deletes a user by ID through the repository delete operation.
   *
   * @param id The ID of the user to delete
   * @returns A service response indicating deletion success or an error message
   */
  async deleteUser(id: number): Promise<ServiceResponse<null>> {
    return await this.userRepository.delete(id);
  }
}
