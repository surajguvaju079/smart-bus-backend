// src/config/database.ts
import { PoolConfig } from 'pg';
import { env } from './env';
import logger from '@/shared/utils/logger';

const isRenderPostgres = env.DB_HOST?.includes('render.com');
const requireSSL = env.NODE_ENV === 'production' || isRenderPostgres;

logger.info('  Building database config...');
logger.info('  Environment:', env.NODE_ENV);
logger.info('  DB_HOST:', env.DB_HOST);
logger.info('  Render Postgres:', isRenderPostgres);
logger.info('  SSL Required:', requireSSL);

export const databaseConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  min: env.DB_POOL_MIN || 2,
  max: env.DB_POOL_MAX || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,

  // SSL is REQUIRED for Render and all production databases
  ssl: requireSSL
    ? {
        rejectUnauthorized: false, // Render uses self-signed certificates
      }
    : false,
};

logger.info('  Final SSL config:', databaseConfig.ssl);
