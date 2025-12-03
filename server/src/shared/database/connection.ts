import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { databaseConfig } from '@config/database';

class Database {
  private pool: Pool;
  private static instance: Database;

  private constructor() {
    this.pool = new Pool(databaseConfig);

    this.pool.on('connect', () => {
      console.log('📦 New database connection established');
    });

    this.pool.on('error', (err) => {
      console.error('💥 Unexpected database error:', err);
    });
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Query error:', { text, error });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log('📦 Database pool closed');
  }
}

export const db = Database.getInstance();
