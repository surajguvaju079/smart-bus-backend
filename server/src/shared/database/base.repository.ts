import { PoolClient } from 'pg';
import { db } from './connection';

type QueryExecutor = {
  query: (text: string, params?: any[]) => Promise<any>;
};

export abstract class BaseRepository {
  protected executor(client?: PoolClient): QueryExecutor {
    return client ?? db;
  }
}
