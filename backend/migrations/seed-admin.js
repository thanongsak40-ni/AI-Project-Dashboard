import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import { query } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'users-schema.sql'), 'utf8');
  await query(sql);
  console.log('✓ users table ready');

  const username = process.env.SEED_ADMIN_USERNAME || 'superadmin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Superadmin@1234';
  const fullName = process.env.SEED_ADMIN_FULL_NAME || 'Super Admin';

  const existing = await query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.rows.length) {
    console.log(`• user "${username}" already exists — skip`);
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await query(
    'INSERT INTO users (username, password_hash, full_name, role) VALUES ($1,$2,$3,$4)',
    [username, hash, fullName, 'admin']
  );
  console.log(`✓ seeded admin "${username}"`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
