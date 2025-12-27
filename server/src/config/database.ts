// src/config/database.ts
import { PoolConfig } from 'pg';
import { env } from './env';

const isRenderPostgres = env.DB_HOST?.includes('render.com');
const requireSSL = env.NODE_ENV === 'production' || isRenderPostgres;

console.log('🔧 Building database config...');
console.log('  Environment:', env.NODE_ENV);
console.log('  DB_HOST:', env.DB_HOST);
console.log('  Render Postgres:', isRenderPostgres);
console.log('  SSL Required:', requireSSL);

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

console.log('  Final SSL config:', databaseConfig.ssl);
