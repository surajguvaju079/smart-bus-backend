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
    values ($1,$2,$3) returning *`;
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
}
