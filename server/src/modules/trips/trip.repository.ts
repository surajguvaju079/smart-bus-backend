import { TRIP_STATUS } from '@/shared/constants/constant';
import { BaseRepository } from '@/shared/database/base.repository';
import { db } from '@/shared/database/connection';
import { PoolClient } from 'pg';
export class TripRepository extends BaseRepository {
  public async createTrip(
    data: {
      driver_id: number;
      start_latitude: number;
      start_longitude: number;
      start_location_name: string;
      end_latitude: number;
      end_longitude: number;
      end_location_name: string;
      start_time: Date;
      vehicle_number: string;
    },
    client?: PoolClient
  ) {
    const query = `INSERT INTO trips
     (driver_id,start_latitude,start_longitude,start_location_name,end_latitude,end_longitude,end_location_name,start_time,vehicle_number) 
    values (
    $1,$2,$3,$4,$5,$6,$7,$8,$9
    )
    returning *
    `;

    const result = await this.executor(client).query(query, [
      data.driver_id,
      data.start_latitude,
      data.start_longitude,
      data.start_location_name,
      data.end_latitude,
      data.end_longitude,
      data.end_location_name,
      new Date(data.start_time),
      data.vehicle_number,
    ]);

    return result.rows[0] ?? null;
  }

  public async findById(id: number, client?: PoolClient) {
    const query = `SELECT * FROM trips WHERE id = $1`;
    const result = await this.executor(client).query(query, [id]);
    return result.rows[0] ?? null;
  }

  public async getAllTrips(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM trips LIMIT $1 OFFSET $2 `;
    const result = await db.query(query, [limit, offset]);
    console.log('getAllTrips result:', result.rows);
    return result.rows ?? [];
  }

  public async findOngoingTripByVehicle(vehicle_number: string) {
    const query = `SELECT * FROM trips WHERE vehicle_number = $1 AND status = $2`;
    const result = await db.query(query, [vehicle_number, TRIP_STATUS.ONGOING]);
    return result.rows[0] ?? null;
  }
}
