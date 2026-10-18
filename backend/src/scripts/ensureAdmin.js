/**
 * Aggiorna/crea admin se il DB è già avviato senza seed corretto.
 * Uso: node src/scripts/ensureAdmin.js
 */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { query, pool } from '../db.js';

dotenv.config();

const email = 'admin@testata.local';
const password = 'admin123';

const hash = await bcrypt.hash(password, 10);
const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

if (existing.rows[0]) {
  await query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [
    hash,
    'admin',
    email,
  ]);
  console.log('Password admin aggiornata');
} else {
  await query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, 'Amministratore', 'admin')`,
    [email, hash]
  );
  console.log('Utente admin creato');
}

await pool.end();
