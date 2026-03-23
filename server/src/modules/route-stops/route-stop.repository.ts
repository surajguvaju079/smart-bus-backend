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

  async addRouteStops(routeId: number, stops: any[]) {
    const values: any[] = [];
    const placeholders: string[] = [];

    stops.forEach((stop, index) => {
      const baseIndex = index * 5;

      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`
      );

      values.push(routeId, stop.name, stop.latitude, stop.longitude, stop.order);
    });

    const query = `
    INSERT INTO route_stops (route_id, name, latitude, longitude, stop_order)
    VALUES ${placeholders.join(', ')}
    RETURNING *
  `;

    const result = await db.query(query, values);
    return result.rows;
  }
}
