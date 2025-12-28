import { UserRole } from '@/shared/types/auth';

export interface UserEntity {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  profile_image: string | null;
  is_first_login: boolean;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}
export class UserDTO {
  public readonly id: number;
  public readonly email: string;
  public readonly name: string;
  public readonly role: UserRole;
  public readonly profileImage: string | null;
  public readonly isFirstLogin: boolean;
  public readonly phoneNumber: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  private constructor(user: UserEntity) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.profileImage = user.profile_image ?? null;
    this.isFirstLogin = user.is_first_login ?? false;
    this.phoneNumber = user.phone_number ?? null;
    this.createdAt = new Date(user.created_at);
    this.updatedAt = new Date(user.updated_at);
  }

  static fromEntity(user: UserEntity): UserDTO {
    return new UserDTO(user);
  }
}
