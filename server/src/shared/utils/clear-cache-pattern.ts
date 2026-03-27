import { redis } from '../redis/redis';

export async function clearCacheByPattern(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}
