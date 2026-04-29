import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!SECRET) {
  console.error('FATAL: JWT_SECRET is not set');
  process.exit(1);
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'admin only' });
  }
  next();
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username/password required' });
    const r = await query('SELECT id, username, password_hash, full_name, role FROM users WHERE username = $1', [username]);
    const u = r.rows[0];
    if (!u) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign(
      { sub: u.id, username: u.username, role: u.role, full_name: u.full_name },
      SECRET,
      { expiresIn: EXPIRES_IN }
    );
    res.json({
      token,
      user: { id: u.id, username: u.username, full_name: u.full_name, role: u.role },
    });
  } catch (e) { next(e); }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.sub,
      username: req.user.username,
      full_name: req.user.full_name,
      role: req.user.role,
    },
  });
});
