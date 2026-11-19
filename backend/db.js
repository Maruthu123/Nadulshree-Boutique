import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

// Always read backend/.env (next to this file), no matter which folder the command was started from
const envFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
dotenv.config({ path: envFile });

// NUMERIC columns (prices) come back as numbers instead of strings
pg.types.setTypeParser(1700, (v) => parseFloat(v));

const url = (process.env.DATABASE_URL || '').trim();

if (!url) {
  console.error('\n❌ DATABASE_URL is empty or missing.');
  console.error(`   Looking for: ${envFile}`);
  console.error(`   File exists: ${fs.existsSync(envFile) ? 'yes (but DATABASE_URL line is empty)' : 'NO. Create backend/.env (copy .env.example) and paste your Neon connection string.'}\n`);
  process.exit(1);
}

// pg does not support Neon's "channel_binding" option, so remove it if it is in the link
const cleanUrl = url.replace(/([?&])channel_binding=[^&]*&?/i, '$1').replace(/[?&]$/, '');
const isLocal = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1');

try { console.log(`Database: ${new URL(cleanUrl).host}`); } catch { console.error('❌ DATABASE_URL is not a valid link. Copy it again from Neon.'); process.exit(1); }

export const pool = new pg.Pool({
  connectionString: cleanUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('Unexpected DB error', err.message));

export const query = (text, params) => pool.query(text, params);
