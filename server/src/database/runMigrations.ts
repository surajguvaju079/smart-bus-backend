import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { env } from '@/config/env';
import logger from '@/shared/utils/logger';

export async function runMigrations() {
  const isRenderPostgres = env.DB_HOST?.includes('render.com');
  const requireSSL = env.NODE_ENV === 'production' || isRenderPostgres;

  const client = new Client({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: requireSSL ? { rejectUnauthorized: false } : undefined,
  });

  try {
    logger.info('🔌 Connecting to database...');
    logger.info(`  Host: ${env.DB_HOST}`);
    logger.info(`  Database: ${env.DB_NAME}`);
    await client.connect();
    logger.info('✅ Connected to database\n');

    // Debug: Show ALL possible paths
    logger.info('🔍 Debug - Looking for migrations:');
    logger.info('  __dirname:', __dirname);
    logger.info('  process.cwd():', process.cwd());

    const possiblePaths = [
      path.join(__dirname, 'migrations'),
      path.join(__dirname, '../database/migrations'),
      path.join(process.cwd(), 'dist/database/migrations'),
      path.join(process.cwd(), 'src/database/migrations'),
      path.join(process.cwd(), 'database/migrations'),
    ];

    logger.info('\n  Checking all possible paths:');
    possiblePaths.forEach((p) => {
      const exists = fs.existsSync(p);
      logger.info(`    ${exists ? '✅' : '❌'} ${p}`);
      if (exists) {
        try {
          const files = fs.readdirSync(p);
          logger.info(`       📁 Contents: [${files.join(', ')}]`);
        } catch (e) {
          logger.error(`       ⚠️  Cannot read directory`);
        }
      }
    });

    // Also check dist directory structure
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      logger.info('\n  📦 dist/ structure:');
      try {
        const distContents = fs.readdirSync(distPath);
        logger.info(`    ${distContents.join(', ')}`);

        const distDbPath = path.join(distPath, 'database');
        if (fs.existsSync(distDbPath)) {
          const dbContents = fs.readdirSync(distDbPath);
          logger.info(`    database/: ${dbContents.join(', ')}`);
        }
      } catch (e) {
        logger.info('    Cannot read dist directory');
      }
    }

    const migrationsDir = possiblePaths.find((p) => fs.existsSync(p));

    if (!migrationsDir) {
      logger.info('\n⚠️  No migrations directory found in any checked path');
      await client.end();
      return;
    }

    logger.info(`\n📁 Using migrations from: ${migrationsDir}\n`);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      logger.info('⚠️  No .sql files found in migrations directory');
      await client.end();
      return;
    }

    logger.info(`📋 Found ${files.length} migration(s): ${files.join(', ')}\n`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      logger.info(`▶ Running: ${file}`);

      try {
        await client.query(sql);
        logger.info(`✔ Completed: ${file}\n`);
      } catch (err: any) {
        logger.error(`❌ Failed on ${file}`);
        logger.error(err.message);
        await client.end();
        throw err;
      }
    }

    await client.end();
    logger.info('🎉 All migrations completed successfully\n');
  } catch (error) {
    logger.error('❌ Migration error:', error);
    try {
      await client.end();
    } catch (e) {
      logger.error('⚠️  Error closing database connection:', e);
    }
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
