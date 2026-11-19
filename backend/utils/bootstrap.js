import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Nexora Menswear: shirts only
export const MENSWEAR_CATEGORIES = [
  ['Formal Shirts', 'formal-shirts'],
  ['Casual Shirts', 'casual-shirts'],
  ['Printed Shirts', 'printed-shirts'],
  ['Checked Shirts', 'checked-shirts'],
  ['Linen Shirts', 'linen-shirts'],
  ['Half Sleeve Shirts', 'half-sleeve-shirts'],
];

export const CATEGORIES = [
  ['Saree', 'saree'],
  ['3 Piece Set Kurtis', '3-piece-set-kurtis'],
  ['2 Piece Set', '2-piece-set'],
  ['Single Top', 'single-top'],
  ['Legging', 'legging'],
  ['Straight Cut Pant', 'straight-cut-pant'],
];

/**
 * Makes sure the database is ready. Safe to run every time the server starts:
 *  1. creates / updates all tables (schema.sql uses IF NOT EXISTS)
 *  2. adds the boutique categories and the Nexora Menswear (shirt) categories
 *  3. creates the admin account if it does not exist yet (never changes an existing password)
 * This is why the live site (Render) works without running any command by hand.
 */
export async function bootstrap({ resetAdminPassword = false } = {}) {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  await pool.query(sql);

  for (const [i, [name, slug]] of CATEGORIES.entries()) {
    await pool.query(
      "INSERT INTO categories (name, slug, sort_order, store) VALUES ($1,$2,$3,'boutique') ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order",
      [name, slug, i],
    );
  }
  for (const [i, [name, slug]] of MENSWEAR_CATEGORIES.entries()) {
    await pool.query(
      "INSERT INTO categories (name, slug, sort_order, store) VALUES ($1,$2,$3,'menswear') ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, store = 'menswear'",
      [name, slug, 100 + i],
    );
  }

  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  let admin = 'not configured (set ADMIN_EMAIL and ADMIN_PASSWORD)';
  if (email && password) {
    const hash = await bcrypt.hash(password, 10);
    const name = process.env.ADMIN_NAME || 'Admin';
    if (resetAdminPassword) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1,$2,$3,'admin',TRUE)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', is_verified = TRUE`,
        [name, email, hash],
      );
      admin = `${email} (password reset from .env)`;
    } else {
      const r = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1,$2,$3,'admin',TRUE)
         ON CONFLICT (email) DO UPDATE SET role = 'admin', is_verified = TRUE RETURNING (xmax = 0) AS created`,
        [name, email, hash],
      );
      admin = `${email} (${r.rows[0].created ? 'created' : 'already exists'})`;
    }
  }

  // Separate owner login for Nexora Menswear. It sees ONLY Nexora products, orders, messages and reviews.
  const nxEmail = (process.env.NEXORA_ADMIN_EMAIL || '').trim().toLowerCase();
  const nxPass = process.env.NEXORA_ADMIN_PASSWORD || '';
  if (nxEmail && nxPass) {
    const nxHash = await bcrypt.hash(nxPass, 10);
    const nxName = process.env.NEXORA_ADMIN_NAME || 'Nexora Admin';
    const r = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified, admin_store) VALUES ($1,$2,$3,'admin',TRUE,'menswear')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', is_verified = TRUE, admin_store = 'menswear'
         ${resetAdminPassword ? ', password_hash = EXCLUDED.password_hash' : ''}
       RETURNING (xmax = 0) AS created`,
      [nxName, nxEmail, nxHash],
    );
    admin += ` | Nexora admin: ${nxEmail} (${r.rows[0].created ? 'created' : 'already exists'})`;
  }
  return { admin };
}
