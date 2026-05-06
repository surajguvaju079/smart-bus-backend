import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import type { RedisReply } from 'rate-limit-redis';
import { redis } from '../redis/redis';

export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<RedisReply>,
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again after 15 minutes',
    },
  },
  keyGenerator: (req) => {
    return req.ip || 'anonymous';
  },
});
