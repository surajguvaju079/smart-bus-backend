import { db } from '@/shared/database/connection';

export class RouteStopRepository {
  async createRouteStop(
    routeId: number,
    name: string,
    latitude: number,
    longitude: number,
    stopOrder: number
  ) {
    const query = `INSERT INTO route_stops (route_id, name, latitude, longitude, stop_order) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const result = await db.query(query, [routeId, name, latitude, longitude, stopOrder]);
    return result.rows[0] ?? null;
  }
}
