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
    ${1},${2},${3},${4},${5},${6},${7},${8},${9}  
    )
    `;

    const result = await this.executor(client).query(query, [
      data.driver_id,
      data.start_latitude,
      data.start_longitude,
      data.start_location_name,
      data.end_latitude,
      data.end_longitude,
      data.end_location_name,
      data.start_time,
      data.vehicle_number,
    ]);

    return result.rows[0];
  }

  public async getAllTrips(page: number, limit: number) {
    const query = `SELECT * FROM trips LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
    const result = await db.query(query);
    return result.rows;
  }
}
