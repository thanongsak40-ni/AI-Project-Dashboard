import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { query } from './db.js';
import { authRouter, requireAuth } from './auth.js';
import { usersRouter } from './users.js';

const isProd = process.env.NODE_ENV === 'production';

// CORS: in dev allow all; in prod restrict to CORS_ORIGIN (comma-separated)
const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const app = express();
app.use(cors({
  origin: isProd
    ? (corsOrigins.length ? corsOrigins : false)
    : true,
}));
app.use(express.json());

app.use('/api/auth', authRouter);

// All /api routes below require auth (except /api/health and /api/auth/*)
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path.startsWith('/auth')) return next();
  return requireAuth(req, res, next);
});

app.use('/api/users', usersRouter);

app.get('/api/health', async (_req, res) => {
  try {
    const r = await query('SELECT NOW() as now');
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/projects', async (_req, res, next) => {
  try {
    const r = await query('SELECT project_id, project_name FROM projects ORDER BY project_name');
    res.json(r.rows);
  } catch (e) { next(e); }
});

// Returns shape compatible with existing data.json: { date, month, project_id, project, rooms, doc }
app.get('/api/electric', async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT to_char(e.date, 'YYYY-MM-DD') AS date,
             to_char(e.date, 'YYYY-MM')    AS month,
             e.project_id,
             p.project_name                AS project,
             e.total_billing::float        AS rooms,
             e.cms_doc_number              AS doc
      FROM electric_billings e
      JOIN projects p ON p.project_id = e.project_id
      ORDER BY e.date, e.project_id
    `);
    res.json(r.rows);
  } catch (e) { next(e); }
});

app.get('/api/water', async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT to_char(w.date, 'YYYY-MM-DD') AS date,
             to_char(w.date, 'YYYY-MM')    AS month,
             w.project_id,
             p.project_name                AS project,
             w.total_billing::float        AS rooms,
             w.cms_doc_number              AS doc
      FROM water_billings w
      JOIN projects p ON p.project_id = w.project_id
      ORDER BY w.date, w.project_id
    `);
    res.json(r.rows);
  } catch (e) { next(e); }
});

app.get('/api/common', async (_req, res, next) => {
  try {
    const r = await query(`
      SELECT c.period,
             c.project_id,
             p.project_name AS project,
             c.common_fee_totalroom,           c.common_fee_amount::float          AS common_fee_amount,
             c.water_meter_fee_totalroom,      c.water_meter_fee_amount::float     AS water_meter_fee_amount,
             c.insurance_fee_totalroom,        c.insurance_fee_amount::float       AS insurance_fee_amount,
             c.funding_fee_totalroom,          c.funding_fee_amount::float         AS funding_fee_amount,
             c.water_fee_totalroom,            c.water_fee_amount::float           AS water_fee_amount,
             c.water_promotion_fee_totalroom,  c.water_promotion_fee_amount::float AS water_promotion_fee_amount
      FROM common_fees c
      JOIN projects p ON p.project_id = c.project_id
      ORDER BY c.period, c.project_id
    `);
    res.json(r.rows);
  } catch (e) { next(e); }
});

function reshapeCommon(row) {
  return {
    date: row.period.slice(5, 7) + '/' + row.period.slice(0, 4),
    month: row.period,
    project_id: row.project_id,
    project: row.project,
    common_fee:      { rooms: row.common_fee_totalroom,          amount: row.common_fee_amount },
    water_meter_fee: { rooms: row.water_meter_fee_totalroom,     amount: row.water_meter_fee_amount },
    insurance_fee:   { rooms: row.insurance_fee_totalroom,       amount: row.insurance_fee_amount },
    funding_fee:     { rooms: row.funding_fee_totalroom,         amount: row.funding_fee_amount },
    water_fee:       { rooms: row.water_fee_totalroom,           amount: row.water_fee_amount },
    water_promo_fee: { rooms: row.water_promotion_fee_totalroom, amount: row.water_promotion_fee_amount },
  };
}

// Aggregated bundle for the dashboard
app.get('/api/data', async (_req, res, next) => {
  try {
    const [elec, water, common] = await Promise.all([
      query(`SELECT to_char(e.date,'YYYY-MM-DD') AS date, to_char(e.date,'YYYY-MM') AS month,
                    e.project_id, p.project_name AS project, e.total_billing::float AS rooms, e.cms_doc_number AS doc
             FROM electric_billings e JOIN projects p ON p.project_id=e.project_id
             ORDER BY e.date, e.project_id`),
      query(`SELECT to_char(w.date,'YYYY-MM-DD') AS date, to_char(w.date,'YYYY-MM') AS month,
                    w.project_id, p.project_name AS project, w.total_billing::float AS rooms, w.cms_doc_number AS doc
             FROM water_billings w JOIN projects p ON p.project_id=w.project_id
             ORDER BY w.date, w.project_id`),
      query(`SELECT c.period, c.project_id, p.project_name AS project,
                    c.common_fee_totalroom, c.common_fee_amount::float AS common_fee_amount,
                    c.water_meter_fee_totalroom, c.water_meter_fee_amount::float AS water_meter_fee_amount,
                    c.insurance_fee_totalroom, c.insurance_fee_amount::float AS insurance_fee_amount,
                    c.funding_fee_totalroom, c.funding_fee_amount::float AS funding_fee_amount,
                    c.water_fee_totalroom, c.water_fee_amount::float AS water_fee_amount,
                    c.water_promotion_fee_totalroom, c.water_promotion_fee_amount::float AS water_promotion_fee_amount
             FROM common_fees c JOIN projects p ON p.project_id=c.project_id
             ORDER BY c.period, c.project_id`),
    ]);
    res.json({ elec: elec.rows, water: water.rows, common: common.rows.map(reshapeCommon) });
  } catch (e) { next(e); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`API listening on http://${HOST}:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`));
