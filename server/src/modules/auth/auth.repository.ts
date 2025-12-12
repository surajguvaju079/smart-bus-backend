import { db } from '@/shared/database/connection';
import { User } from '../users/user.schema';
import { ServiceResponse } from '@/shared/types';

export class AuthRepository {
  async findByEmail(email: string): Promise<ServiceResponse<User>> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query<User>(query, [email]);
    if (!result.rows[0]) {
      return ServiceResponse.notFound('User not found');
    }
    return ServiceResponse.ok(result.rows[0]);
  }
}
