// src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config();
  if (result.error) {
    console.log('📄 No .env file found (using system environment variables)');
  } else {
    console.log('📄 Loaded .env file');
  }
} else {
  console.log('🚀 Production mode: Using system environment variables');
}

const parseDatabaseUrl = (url: string | undefined) => {
  if (!url) {
    console.warn('⚠️  DATABASE_URL not found');
    return {};
  }

  try {
    const parsed = new URL(url);
    console.log('✅ Parsed DATABASE_URL successfully');
    console.log('  Host:', parsed.hostname);
    console.log('  Database:', parsed.pathname.slice(1));

    return {
      DB_HOST: parsed.hostname,
      DB_PORT: parsed.port || '5432',
      DB_NAME: parsed.pathname.slice(1),
      DB_USER: parsed.username,
      DB_PASSWORD: decodeURIComponent(parsed.password),
    };
  } catch (error) {
    console.error('❌ Failed to parse DATABASE_URL:', error);
    return {};
  }
};

console.log('🔍 Environment Check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL exists:', !!process.env.DATABASE_URL);

const dbFromUrl = parseDatabaseUrl(process.env.DATABASE_URL);
const mergedEnv = { ...process.env, ...dbFromUrl };

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number).pipe(z.number().min(1).max(65535)),
  BASE_URL: z.string().default('http://localhost:3000'),

  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.string().default('5432').transform(Number),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_POOL_MIN: z.string().default('2').transform(Number),
  DB_POOL_MAX: z.string().default('10').transform(Number),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_PREFIX: z.string().default('/api/v1'),
<<<<<<< HEAD
  API_RATE_LIMIT: z.string().transform(Number).default(100),

  Sid:z.string(),
  Semail:z.email(),
  Sname:z.string(),
  Spassword:z.string()
=======
  API_RATE_LIMIT: z.string().default('100').transform(Number),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
>>>>>>> 05806509826b1a2a2e4258b909c37d5f4d78886e
});

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  try {
    const parsed = envSchema.parse(mergedEnv);
    console.log('✅ Environment validation successful');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:');
      error.issues.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Required: DATABASE_URL, JWT_SECRET');
    }
    process.exit(1);
  }
};

export const env = parseEnv();
