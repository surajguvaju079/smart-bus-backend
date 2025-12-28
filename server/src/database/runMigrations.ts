// src/database/runMigrations.ts
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { env } from '@/config/env';

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
    console.log('🔌 Connecting to database...');
    console.log(`  Host: ${env.DB_HOST}`);
    console.log(`  Database: ${env.DB_NAME}`);
    await client.connect();
    console.log('✅ Connected to database\n');

    // Debug: Show ALL possible paths
    console.log('🔍 Debug - Looking for migrations:');
    console.log('  __dirname:', __dirname);
    console.log('  process.cwd():', process.cwd());

    const possiblePaths = [
      path.join(__dirname, 'migrations'),
      path.join(__dirname, '../database/migrations'),
      path.join(process.cwd(), 'dist/database/migrations'),
      path.join(process.cwd(), 'src/database/migrations'),
      path.join(process.cwd(), 'database/migrations'),
    ];

    console.log('\n  Checking all possible paths:');
    possiblePaths.forEach((p) => {
      const exists = fs.existsSync(p);
      console.log(`    ${exists ? '✅' : '❌'} ${p}`);
      if (exists) {
        try {
          const files = fs.readdirSync(p);
          console.log(`       📁 Contents: [${files.join(', ')}]`);
        } catch (e) {
          console.log(`       ⚠️  Cannot read directory`);
        }
      }
    });

    // Also check dist directory structure
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      console.log('\n  📦 dist/ structure:');
      try {
        const distContents = fs.readdirSync(distPath);
        console.log(`    ${distContents.join(', ')}`);

        const distDbPath = path.join(distPath, 'database');
        if (fs.existsSync(distDbPath)) {
          const dbContents = fs.readdirSync(distDbPath);
          console.log(`    database/: ${dbContents.join(', ')}`);
        }
      } catch (e) {
        console.log('    Cannot read dist directory');
      }
    }

    const migrationsDir = possiblePaths.find((p) => fs.existsSync(p));

    if (!migrationsDir) {
      console.log('\n⚠️  No migrations directory found in any checked path');
      await client.end();
      return;
    }

    console.log(`\n📁 Using migrations from: ${migrationsDir}\n`);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No .sql files found in migrations directory');
      await client.end();
      return;
    }

    console.log(`📋 Found ${files.length} migration(s): ${files.join(', ')}\n`);

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
        throw err;
      }
    }

    await client.end();
    console.log('🎉 All migrations completed successfully\n');
  } catch (error) {
    console.error('❌ Migration error:', error);
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
