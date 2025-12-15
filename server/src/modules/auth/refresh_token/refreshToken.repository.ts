import { db } from '@/shared/database/connection';

export class RefreshTokenRepository {
  async createRefreshToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    const query = `
        INSERT INTO refresh_tokens(user_id,token,expires_at)
        VALUES ($1, $2, $3)
        `;
    await db.query(query, [userId, token, expiresAt]);
  }

  async findRefreshToken(token: string): Promise<{ user_id: number; expires_at: Date } | null> {
    const query = `SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1`;
    const result = await db.query(query, [token]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async deleteByToken(token: string): Promise<void> {
    const query = `DELETE FROM refresh_tokens WHERE token = $1`;
    await db.query(query, [token]);
  }

  async deleteByUserId(userId: number): Promise<void> {
    const query = `DELETE FROM refresh_tokens WHERE user_id = $1`;
    await db.query(query, [userId]);
  }
}
