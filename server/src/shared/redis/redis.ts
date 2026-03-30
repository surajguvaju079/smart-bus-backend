import Redis from 'ioredis';

const BASE_OPTIONS = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  keepAlive: 10000,
  connectTimeout: 10000,
  retryStrategy: (times: number) => Math.min(times * 200, 2000),
};

const getRedisConfig = (): Redis => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      ...BASE_OPTIONS,
      tls: process.env.REDIS_URL.startsWith('rediss://')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  return new Redis({
    ...BASE_OPTIONS,
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  });
};

const attachListeners = (client: Redis, name: string) => {
  client.on('connect', () => console.log(`✅ Redis connected [${name}]`));
  client.on('error', (err) => console.error(`❌ Redis error [${name}]`, err));
  client.on('close', () => console.warn(`⚠️ Redis connection closed [${name}]`));
  client.on('reconnecting', () => console.log(`🔄 Redis reconnecting [${name}]`));
};

export const redis = getRedisConfig();
export const redisSub = redis.duplicate();

attachListeners(redis, 'main');
attachListeners(redisSub, 'sub');
