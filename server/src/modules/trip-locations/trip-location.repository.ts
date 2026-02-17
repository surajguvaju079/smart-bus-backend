import { BaseRepository } from '@/shared/database/base.repository';
import { TripLocationType } from './trip-location.schema';
import { PoolClient } from 'pg';

export class TripLocationRepository extends BaseRepository {
  public async create(data: TripLocationType, client?: PoolClient) {
    const query = `INSERT INTO trip_locations (trip_id,latitude,longitude)
    values ($1,$2,$3) returning *`;
    const result = await this.executor(client).query(query, [
      data.trip_id,
      data.latitude,
      data.longitude,
    ]);
    return result.rows[0];
  }
}
