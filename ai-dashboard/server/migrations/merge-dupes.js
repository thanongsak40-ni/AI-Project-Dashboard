import 'dotenv/config';
import { pool } from '../db.js';

const client = await pool.connect();
try {
  await client.query('BEGIN');

  const { rows } = await client.query('SELECT project_id, project_name FROM projects');
  const byNorm = new Map();
  for (const row of rows) {
    const norm = row.project_id.replace(/[/_]/g, '').toUpperCase();
    if (!byNorm.has(norm)) byNorm.set(norm, []);
    byNorm.get(norm).push(row);
  }

  const merges = [];
  for (const [, group] of byNorm) {
    if (group.length < 2) continue;
    const keep = group.find(x => /[/_]/.test(x.project_id)) || group[0];
    for (const drop of group) {
      if (drop.project_id !== keep.project_id) merges.push({ keep: keep.project_id, drop: drop.project_id });
    }
  }

  if (merges.length === 0) {
    console.log('No merges needed.');
  } else {
    for (const { keep, drop } of merges) {
      console.log(`Merging ${drop} -> ${keep}`);
      await client.query('UPDATE electric_billings SET project_id=$1 WHERE project_id=$2', [keep, drop]);
      await client.query('UPDATE water_billings    SET project_id=$1 WHERE project_id=$2', [keep, drop]);

      // common_fees has UNIQUE(period, project_id) — handle conflicts by summing then deleting
      const { rows: dupRows } = await client.query(
        `SELECT d.* FROM common_fees d
         JOIN common_fees k ON k.project_id=$1 AND k.period=d.period
         WHERE d.project_id=$2`,
        [keep, drop]
      );
      for (const d of dupRows) {
        await client.query(
          `UPDATE common_fees SET
             common_fee_totalroom         = common_fee_totalroom + $1,
             common_fee_amount            = common_fee_amount + $2,
             water_meter_fee_totalroom    = water_meter_fee_totalroom + $3,
             water_meter_fee_amount       = water_meter_fee_amount + $4,
             insurance_fee_totalroom      = insurance_fee_totalroom + $5,
             insurance_fee_amount         = insurance_fee_amount + $6,
             funding_fee_totalroom        = funding_fee_totalroom + $7,
             funding_fee_amount           = funding_fee_amount + $8,
             water_fee_totalroom          = water_fee_totalroom + $9,
             water_fee_amount             = water_fee_amount + $10,
             water_promotion_fee_totalroom= water_promotion_fee_totalroom + $11,
             water_promotion_fee_amount   = water_promotion_fee_amount + $12
           WHERE project_id=$13 AND period=$14`,
          [
            d.common_fee_totalroom, d.common_fee_amount,
            d.water_meter_fee_totalroom, d.water_meter_fee_amount,
            d.insurance_fee_totalroom, d.insurance_fee_amount,
            d.funding_fee_totalroom, d.funding_fee_amount,
            d.water_fee_totalroom, d.water_fee_amount,
            d.water_promotion_fee_totalroom, d.water_promotion_fee_amount,
            keep, d.period,
          ]
        );
        await client.query('DELETE FROM common_fees WHERE id=$1', [d.id]);
      }
      await client.query('UPDATE common_fees SET project_id=$1 WHERE project_id=$2', [keep, drop]);

      await client.query('DELETE FROM projects WHERE project_id=$1', [drop]);
    }
  }

  await client.query('COMMIT');
  console.log('Done.');
} catch (e) {
  await client.query('ROLLBACK');
  console.error('Failed:', e);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
