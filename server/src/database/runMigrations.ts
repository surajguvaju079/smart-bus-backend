import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  console.log('Running migrations...\n');

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
      process.exit(1);
    }
  }

  await client.end();
  console.log('🎉 All migrations completed');
}

runMigrations();
