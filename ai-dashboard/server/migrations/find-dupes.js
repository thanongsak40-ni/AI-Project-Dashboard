import 'dotenv/config';
import { pool } from '../db.js';

const r = await pool.query(`
  SELECT p.project_id, p.project_name,
         (SELECT COUNT(*) FROM electric_billings WHERE project_id=p.project_id) AS elec,
         (SELECT COUNT(*) FROM water_billings    WHERE project_id=p.project_id) AS water,
         (SELECT COUNT(*) FROM common_fees       WHERE project_id=p.project_id) AS common
  FROM projects p ORDER BY project_id
`);
const byNorm = new Map();
for (const row of r.rows) {
  const norm = row.project_id.replace(/[/_]/g, '').toUpperCase();
  if (!byNorm.has(norm)) byNorm.set(norm, []);
  byNorm.get(norm).push(row);
}
console.log('=== Merge plan (keep id with / or _, drop the plain one) ===');
for (const [, rows] of byNorm) {
  if (rows.length > 1) {
    const keep = rows.find(x => /[/_]/.test(x.project_id)) || rows[0];
    const drop = rows.filter(x => x !== keep);
    console.log(`KEEP ${keep.project_id} (${keep.project_name}) [e:${keep.elec} w:${keep.water} c:${keep.common}]`);
    for (const d of drop) console.log(`  <- merge ${d.project_id} (${d.project_name}) [e:${d.elec} w:${d.water} c:${d.common}]`);
  }
}
await pool.end();
