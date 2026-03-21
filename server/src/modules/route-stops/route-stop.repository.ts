import { db } from '@/shared/database/connection';

export class RouteStopRepository {
  async createRouteStop(routeId: number, latitude: number, longitude: number, stopOrder: number) {
    const query = `INSERT INTO route_stops (route_id, latitude, longitude, stop_order) VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await db.query(query, [routeId, latitude, longitude, stopOrder]);
    return result.rows[0] ?? null;
  }
}
