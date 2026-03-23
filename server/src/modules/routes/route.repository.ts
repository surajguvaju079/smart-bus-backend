import { db } from '@/shared/database/connection';
import { Client, PoolClient } from 'pg';

export class RouteRepository {
  async createRoute(name: string, client?: PoolClient) {
    const query = 'INSERT INTO routes (name) VALUES ($1) RETURNING *';
    const result = await client.query(query, [name]);
    return result.rows[0] ?? null;
  }

  async getAllRoutes(currentPage: number, limit: number) {
    const offset = (currentPage - 1) * limit;
    const dataQuery = `SELECT * FROM routes ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const countQuery = `SELECT COUNT(*) from routes`;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, [limit, offset]),
      db.query(countQuery),
    ]);

    return {
      routes: dataResult.rows ?? [],
      total: Number(countResult.rows[0]?.count ?? 0),
    };
  }

  async getRouteById(id: number) {
    const query = `SELECT id FROM routes where id = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0] ?? null;
  }

  async getRouteWithStops(id: number) {
    const query = `SELECT
     r.id as route_id, r.created_at, r.updated_at, r.name as route_name, 
     rs.id as stop_id, rs.name as stop_name, rs.longitude, rs.latitude, rs.stop_order
      from routes r left join route_stops rs
       on r.id = rs.route_id
       where r.id = $1
       order by rs.stop_order asc
    `;

    const result = await db.query(query, [id]);
    return result.rows;
  }
}
