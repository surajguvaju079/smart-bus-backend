import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided
const parseDatabaseUrl = (url: string | undefined) => {
  if (!url) return {};

  try {
    const parsed = new URL(url);
    return {
      DB_HOST: parsed.hostname,
      DB_PORT: parsed.port || '5432',
      DB_NAME: parsed.pathname.slice(1), // Remove leading '/'
      DB_USER: parsed.username,
      DB_PASSWORD: parsed.password,
    };
  } catch (error) {
    console.error('Failed to parse DATABASE_URL:', error);
    return {};
  }
};

// Merge DATABASE_URL parsed values with existing env vars
const dbFromUrl = parseDatabaseUrl(process.env.DATABASE_URL);
const mergedEnv = { ...process.env, ...dbFromUrl };

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),

  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_POOL_MIN: z.string().transform(Number).default(2),
  DB_POOL_MAX: z.string().transform(Number).default(10),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  API_PREFIX: z.string().default('/api/v1'),
  API_RATE_LIMIT: z.string().transform(Number).default(100),

  Sid:z.string(),
  Semail:z.email(),
  Sname:z.string(),
  Spassword:z.string()
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  try {
    return envSchema.parse(mergedEnv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:');
      error.issues.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

export const env = parseEnv();
