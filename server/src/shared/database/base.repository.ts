import { PoolClient } from 'pg';
import { db } from './connection';

export abstract class BaseRepository {
  public executor(client?: PoolClient) {
    return client ?? db;
  }
}
