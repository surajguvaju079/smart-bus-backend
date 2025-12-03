import { db } from '@shared/database/connection';
import { User, CreateUserDTO, UpdateUserDTO } from './user.schema';
import { PaginationParams, ServiceResponse } from '@shared/types/index';
import { StatusCodes } from 'http-status-codes';

export class UserRepository {
  async create(data: CreateUserDTO): Promise<ServiceResponse<User>> {
    try {
      const query = `
        INSERT INTO users (email, name)
        VALUES ($1, $2)
        RETURNING id, email, name, created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await db.query<User>(query, [data.email, data.name]);

      if (!result.rows[0]) {
        return ServiceResponse.internalError('Failed to create user');
      }

      return ServiceResponse.created(result.rows[0]);
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return ServiceResponse.alreadyExists('User with this email already exists');
      }

      console.error('Database error in create:', error);
      return ServiceResponse.databaseError('Failed to create user', { original: error.message });
    }
  }

  async findById(id: number): Promise<ServiceResponse<User>> {
    try {
      const query = `
        SELECT id, email, name, created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE id = $1
      `;

      const result = await db.query<User>(query, [id]);

      if (!result.rows[0]) {
        return ServiceResponse.notFound('User not found');
      }

      return ServiceResponse.ok(result.rows[0]);
    } catch (error: any) {
      console.error('Database error in findById:', error);
      return ServiceResponse.databaseError('Failed to fetch user', { original: error.message });
    }
  }

  async findByEmail(email: string): Promise<ServiceResponse<User>> {
    try {
      const query = `
        SELECT id, email, name, created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        WHERE email = $1
      `;

      const result = await db.query<User>(query, [email]);

      if (!result.rows[0]) {
        return ServiceResponse.notFound('User not found');
      }

      return ServiceResponse.ok(result.rows[0]);
    } catch (error: any) {
      console.error('Database error in findByEmail:', error);
      return ServiceResponse.databaseError('Failed to fetch user', { original: error.message });
    }
  }

  async findAll(
    pagination: PaginationParams
  ): Promise<ServiceResponse<{ users: User[]; total: number }>> {
    try {
      const countQuery = 'SELECT COUNT(*) FROM users';
      const dataQuery = `
        SELECT id, email, name, created_at as "createdAt", updated_at as "updatedAt"
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const [countResult, dataResult] = await Promise.all([
        db.query(countQuery),
        db.query<User>(dataQuery, [pagination.limit, pagination.offset]),
      ]);

      const total = parseInt(countResult.rows[0].count);

      return ServiceResponse.ok({
        users: dataResult.rows,
        total,
      });
    } catch (error: any) {
      console.error('Database error in findAll:', error);
      return ServiceResponse.databaseError('Failed to fetch users', { original: error.message });
    }
  }

  async update(id: number, data: UpdateUserDTO): Promise<ServiceResponse<User>> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.email !== undefined) {
        fields.push(`email = ${paramCount++}`);
        values.push(data.email);
      }
      if (data.name !== undefined) {
        fields.push(`name = ${paramCount++}`);
        values.push(data.name);
      }

      if (fields.length === 0) {
        return ServiceResponse.badRequest('No fields to update');
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = ${paramCount}
        RETURNING id, email, name, created_at as "createdAt", updated_at as "updatedAt"
      `;

      const result = await db.query<User>(query, values);

      if (!result.rows[0]) {
        return ServiceResponse.notFound('User not found');
      }

      return ServiceResponse.ok(result.rows[0]);
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return ServiceResponse.alreadyExists('Email already in use');
      }

      console.error('Database error in update:', error);
      return ServiceResponse.databaseError('Failed to update user', { original: error.message });
    }
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
