import { db } from '@/shared/database/connection';

export class RouteRepository {
  async createRoute(name: string) {
    const query = 'INSERT INTO routes (name) VALUES ($1) RETURNING *';
    const result = await db.query(query, [name]);
    return result.rows[0] ?? null;
  }
}
