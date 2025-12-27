// src/database/runMigrations.ts
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { env } from '@/config/env'; // Import env instead of dotenv

// Remove this line:
// dotenv.config();

export async function runMigrations() {
  const client = new Client({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    // Add SSL for production
    ssl:
      env.NODE_ENV === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  });

  try {
    console.log('🔌 Connecting to database...');
    console.log(`  Host: ${env.DB_HOST}`);
    console.log(`  Database: ${env.DB_NAME}`);

    await client.connect();
    console.log('✅ Connected to database\n');

    const migrationsDir = path.join(__dirname, 'migrations');

    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found');
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    console.log(`📋 Found ${files.length} migration(s)\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`▶ Running: ${file}`);

      try {
        await client.query(sql);
        console.log(`✔ Completed: ${file}\n`);
      } catch (err: any) {
        console.error(`❌ Failed on ${file}`);
        console.error(err.message);
        await client.end();
        process.exit(1);
      }
    }

    await client.end();
    console.log('🎉 All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    await client.end();
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runMigrations();
}
