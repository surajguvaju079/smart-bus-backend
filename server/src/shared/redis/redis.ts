import Redis from 'ioredis';

const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      tls: process.env.REDIS_URL.startsWith('rediss://')
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });
  }

  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
};

export const redis = getRedisConfig();

export const redisSub = redis.duplicate();

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error', err);
});
