import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { pool } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXCEL_PATH = path.resolve(__dirname, '../../../Data AI Project (1).xlsx');

// Excel serial date -> JS Date (UTC)
function excelSerialToDate(serial) {
  if (typeof serial !== 'number') return null;
  const utcDays = Math.floor(serial - 25569);
  const utcMs = utcDays * 86400 * 1000;
  return new Date(utcMs);
}

function toIsoDate(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    const d = excelSerialToDate(value);
    return d ? d.toISOString().slice(0, 10) : null;
  }
  // String like "04/2026" -> first day of month
  if (typeof value === 'string' && /^\d{2}\/\d{4}$/.test(value)) {
    const [mm, yyyy] = value.split('/');
    return `${yyyy}-${mm}-01`;
  }
  const d = new Date(value);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

function toPeriod(value) {
  if (typeof value === 'string' && /^\d{2}\/\d{4}$/.test(value)) {
    const [mm, yyyy] = value.split('/');
    return `${yyyy}-${mm}`;
  }
  const iso = toIsoDate(value);
  return iso ? iso.slice(0, 7) : null;
}

async function upsertProject(client, projectId, projectName) {
  await client.query(
    `INSERT INTO projects(project_id, project_name)
     VALUES ($1, $2)
     ON CONFLICT (project_id) DO UPDATE SET project_name = EXCLUDED.project_name`,
    [projectId, projectName]
  );
}

async function main() {
  console.log('Reading:', EXCEL_PATH);
  const wb = XLSX.readFile(EXCEL_PATH);

  const elec   = XLSX.utils.sheet_to_json(wb.Sheets['Electric'], { defval: null });
  const water  = XLSX.utils.sheet_to_json(wb.Sheets['Water'],    { defval: null });
  const common = XLSX.utils.sheet_to_json(wb.Sheets['Common'],   { defval: null });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Wipe and reload (idempotent for dev)
    await client.query('TRUNCATE electric_billings, water_billings, common_fees RESTART IDENTITY');

    // Collect all projects from all sheets
    const projects = new Map();
    for (const r of [...elec, ...water, ...common]) {
      const id = String(r.ProjectID ?? '').trim();
      const name = String(r.ProjectName ?? '').trim();
      if (id) projects.set(id, name);
    }
    console.log(`Upserting ${projects.size} projects...`);
    for (const [id, name] of projects) await upsertProject(client, id, name);

    console.log(`Inserting ${elec.length} electric rows...`);
    for (const r of elec) {
      const date = toIsoDate(r.Date);
      const pid = String(r.ProjectID ?? '').trim();
      if (!date || !pid) continue;
      await client.query(
        `INSERT INTO electric_billings(date, project_id, total_billing, cms_doc_number)
         VALUES ($1,$2,$3,$4)`,
        [date, pid, r.TotalBilling ?? 0, r.CMSDocNumber ?? null]
      );
    }

    console.log(`Inserting ${water.length} water rows...`);
    for (const r of water) {
      const date = toIsoDate(r.Date);
      const pid = String(r.ProjectID ?? '').trim();
      if (!date || !pid) continue;
      await client.query(
        `INSERT INTO water_billings(date, project_id, total_billing, cms_doc_number)
         VALUES ($1,$2,$3,$4)`,
        [date, pid, r.TotalBilling ?? 0, r.CMSDocNumber ?? null]
      );
    }

    console.log(`Inserting ${common.length} common-fee rows...`);
    for (const r of common) {
      const period = toPeriod(r.Date);
      const pid = String(r.ProjectID ?? '').trim();
      if (!period || !pid) continue;
      await client.query(
        `INSERT INTO common_fees(
           period, project_id,
           common_fee_totalroom, common_fee_amount,
           water_meter_fee_totalroom, water_meter_fee_amount,
           insurance_fee_totalroom, insurance_fee_amount,
           funding_fee_totalroom, funding_fee_amount,
           water_fee_totalroom, water_fee_amount,
           water_promotion_fee_totalroom, water_promotion_fee_amount
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (period, project_id) DO UPDATE SET
           common_fee_totalroom = EXCLUDED.common_fee_totalroom,
           common_fee_amount = EXCLUDED.common_fee_amount,
           water_meter_fee_totalroom = EXCLUDED.water_meter_fee_totalroom,
           water_meter_fee_amount = EXCLUDED.water_meter_fee_amount,
           insurance_fee_totalroom = EXCLUDED.insurance_fee_totalroom,
           insurance_fee_amount = EXCLUDED.insurance_fee_amount,
           funding_fee_totalroom = EXCLUDED.funding_fee_totalroom,
           funding_fee_amount = EXCLUDED.funding_fee_amount,
           water_fee_totalroom = EXCLUDED.water_fee_totalroom,
           water_fee_amount = EXCLUDED.water_fee_amount,
           water_promotion_fee_totalroom = EXCLUDED.water_promotion_fee_totalroom,
           water_promotion_fee_amount = EXCLUDED.water_promotion_fee_amount`,
        [
          period, pid,
          r.CommonFee_totalroom ?? 0, r.CommonFee_Amount ?? 0,
          r.WaterMeterFee_totalroom ?? 0, r.WaterMeterFee_Amount ?? 0,
          r.InsuranceFee_totalroom ?? 0, r.InsuranceFee_Amount ?? 0,
          r.FundingFee_totalroom ?? 0, r.FundingFee__Amount ?? 0,
          r.WaterFee_totalroom ?? 0, r.WaterFee__Amount ?? 0,
          r.WaterPromotionFee_totalroom ?? 0, r.WaterPromotionFee__Amount ?? 0,
        ]
      );
    }

    await client.query('COMMIT');
    console.log('Import complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
