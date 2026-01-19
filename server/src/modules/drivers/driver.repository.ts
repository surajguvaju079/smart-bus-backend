import { BaseRepository } from '@/shared/database/base.repository';
import { db } from '@/shared/database/connection';
import { PoolClient } from 'pg';

export class DriverRepository extends BaseRepository {
  public async create(
    data: {
      current_latitude: number | null;
      current_longitude: number | null;
      license_number: string;
      user_id: number;
      vehicle_number: string;
    },
    client?: PoolClient
  ) {
    const query = `INSERT INTO drivers (current_latitude,current_longitude,license_number,user_id,vehicle_number)
    values ($1,$2,$3,$4,$5) returning *`;
    const result = await this.executor(client).query(query, [
      data.current_latitude,
      data.current_longitude,
      data.license_number,
      data.user_id,
      data.vehicle_number,
    ]);

    return result.rows[0];
  }

  public async getAll() {
    const query = `SELECT d.id, d.current_latitude, d.current_longitude, d.vehicle_number, d.created_at, d.updated_at, d.is_verified, d.is_available,
    u.id AS user_id,u.name,u.email FROM drivers d INNER JOIN users u
    ON d.user_id = u.id
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  public async findById(id: number) {
    const query = `SELECT d.id, d.current_latitude, d.current_longitude, d.vehicle_number, d.created_at, d.updated_at, d.is_verified, d.is_available,
    u.id AS user_id,u.name,u.email FROM drivers d INNER JOIN users u
    ON d.user_id = u.id WHERE d.id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
  public async findByVehicleNumber(vehicle_number: string) {
    const query = `SELECT * FROM drivers WHERE vehicle_number = $1`;
    const result = await db.query(query, [vehicle_number]);
    return result.rows[0];
  }
}
