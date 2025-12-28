import { db } from '@shared/database/connection';
import { User, CreateUserDTO, UpdateUserDTO } from './user.schema';
import { PaginationParams, ServiceResponse } from '@shared/types/index';
import { StatusCodes } from 'http-status-codes';

export class UserRepository {
  async create(data: { email: string; name: string; password: string }): Promise<User | null> {
    const query = `
        INSERT INTO users (email, name, password)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

    const result = await db.query(query, [data.email, data.name, data.password]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async findById(id: number) {
    const query = `
        SELECT *
        FROM users
        WHERE id = $1
      `;

    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
        SELECT *
        FROM users
        WHERE email = $1
      `;

    const result = await db.query(query, [email]);
    console.log('findByEmail result:', result.rows);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  async findAll(pagination: PaginationParams) {
    const countQuery = 'SELECT COUNT(*) FROM users';
    const dataQuery = `
        SELECT *
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery),
      db.query(dataQuery, [pagination.limit, pagination.offset]),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return {
      users: dataResult.rows,
      total,
    };
  }

  async update(id: number, data: UpdateUserDTO) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(data.role);
    }
    if (data.phone_number !== undefined) {
      fields.push(`phone_number = $${paramCount++}`);
      values.push(data.phone_number);
    }
    if (data.profile_image !== undefined) {
      fields.push(`profile_image = $${paramCount++}`);
      values.push(data.profile_image);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

    const result = await db.query(query, values);

    if (!result.rows[0]) {
      return ServiceResponse.notFound('User not found');
    }
    return result.rows[0];
  }

  async delete(id: number): Promise<ServiceResponse<null>> {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await db.query(query, [id]);

      if (!result.rows[0]) {
        return ServiceResponse.notFound('User not found');
      }

      return ServiceResponse.noContent();
    } catch (error: any) {
      console.error('Database error in delete:', error);
      return ServiceResponse.databaseError('Failed to delete user', { original: error.message });
    }
  }
}
