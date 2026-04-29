import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from './db.js';
import { requireAdmin } from './auth.js';

export const usersRouter = Router();

// All routes here require admin (mounted after requireAuth in index.js)
usersRouter.use(requireAdmin);

usersRouter.get('/', async (_req, res, next) => {
  try {
    const r = await query(
      `SELECT id, username, full_name, role, to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(r.rows);
  } catch (e) { next(e); }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, password, full_name, role } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username/password required' });
    if (password.length < 8) return res.status(400).json({ error: 'password must be at least 8 characters' });
    const r0 = await query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (r0.rows.length) return res.status(409).json({ error: 'username already exists' });
    const hash = await bcrypt.hash(password, 10);
    const r = await query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, username, full_name, role, to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at`,
      [username, hash, full_name || null, role === 'admin' ? 'admin' : 'viewer']
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { next(e); }
});

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user.sub) {
      return res.status(400).json({ error: 'cannot delete yourself' });
    }
    const r = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});
