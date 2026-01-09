import { db } from '@/shared/database/connection';

export class DriverRepository {
  public async create(data: {
    current_latitude: number | null;
    current_longitude: number | null;
    license_number: string;
    user_id: number;
    vehicle_number: string;
    vehicle_type: string;
  }) {
    const query = `INSERT INTO drivers (current_latitude,current_longitude,license_number,user_id,vehicle_number,vehicle_type)
    values ($1,$2,$3,$4,$5,$6) returning *`;
    const result = await db.query(query, [
      data.current_latitude,
      data.current_longitude,
      data.license_number,
      data.user_id,
      data.vehicle_number,
      data.vehicle_type,
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
}
