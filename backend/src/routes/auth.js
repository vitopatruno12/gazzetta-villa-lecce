import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PROFILE_FIELDS =
  'id, email, name, role, first_name, last_name, company_name, vat_number, city, address, created_at';

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    first_name: row.first_name,
    last_name: row.last_name,
    company_name: row.company_name,
    vat_number: row.vat_number,
    city: row.city,
    address: row.address,
    created_at: row.created_at,
  };
}

function signUser(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/register', async (req, res) => {
  const body = req.body || {};
  const email = String(body.email || '').toLowerCase().trim();
  const password = String(body.password || '');
  const firstName = String(body.first_name || '').trim();
  const lastName = String(body.last_name || '').trim();
  const companyName = String(body.company_name || '').trim();
  const vatNumber = String(body.vat_number || '').replace(/\s/g, '');
  const city = String(body.city || '').trim();
  const address = String(body.address || '').trim();

  if (!email || !password || !firstName || !lastName || !companyName || !vatNumber || !city || !address) {
    return res.status(400).json({ error: 'Compila tutti i campi' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email non valida' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri' });
  }
  if (!/^\d{11}$/.test(vatNumber)) {
    return res.status(400).json({ error: 'La partita IVA deve avere 11 cifre' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows[0]) {
    return res.status(409).json({ error: 'Questa email è già registrata' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const name = `${firstName} ${lastName}`;
  const { rows } = await query(
    `INSERT INTO users
       (email, password_hash, name, role, first_name, last_name, company_name, vat_number, city, address)
     VALUES ($1, $2, $3, 'cliente', $4, $5, $6, $7, $8, $9)
     RETURNING ${PROFILE_FIELDS}`,
    [email, passwordHash, name, firstName, lastName, companyName, vatNumber, city, address]
  );
  const user = publicUser(rows[0]);
  res.status(201).json({ token: signUser(user), user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password obbligatori' });
  }

  const { rows } = await query(
    `SELECT ${PROFILE_FIELDS}, password_hash FROM users WHERE email = $1`,
    [String(email).toLowerCase().trim()]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Credenziali non valide' });
  }

  res.json({
    token: signUser(user),
    user: publicUser(user),
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query(`SELECT ${PROFILE_FIELDS} FROM users WHERE id = $1`, [req.user.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Utente non trovato' });
  res.json(publicUser(rows[0]));
});

export default router;
