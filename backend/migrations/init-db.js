import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { getDatabaseConfig, testParameterStoreConnection } from '../lib/secrets.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getClientConfig() {
  if (process.env.NODE_ENV === 'production' || process.env.USE_PARAMETER_STORE === 'true') {
    const isConnected = await testParameterStoreConnection();
    if (isConnected) return getDatabaseConfig();
  }

  return {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

async function run() {
  const dbConfig = await getClientConfig();
  const client = new pg.Client({
    host: dbConfig.host,
    port: parseInt(dbConfig.port, 10) || 5432,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await client.connect();

  const initPath = path.join(__dirname, '../db/init.sql');
  const sql = fs.readFileSync(initPath, 'utf8');
  await client.query(sql);

  console.log('✅ Database schema initialized');
  await client.end();
}

run().catch((err) => {
  console.error('Init failed:', err.message);
  process.exit(1);
});
