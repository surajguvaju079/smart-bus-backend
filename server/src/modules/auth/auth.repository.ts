import { db } from '@/shared/database/connection';
import { User } from '../users/user.schema';
import { ServiceResponse } from '@/shared/types';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }
}
