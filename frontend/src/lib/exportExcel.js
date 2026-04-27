import * as XLSX from 'xlsx'
import { MONTHS_TH, COMMON_FEE_KEYS } from './processData'

function fmt(n) { return Number((n || 0).toFixed(2)) }

export function exportExcel(elec, water, common, selectedMonths) {
  const wb = XLSX.utils.book_new()
  const period = selectedMonths.length === 0 ? 'ทุกเดือน'
    : [...selectedMonths].sort().map(m => MONTHS_TH[m]).join(', ')

  // ── Sheet 1: ค่าไฟฟ้า ──────────────────────────────
  const elecRows = [
    ['วันที่', 'รหัสโครงการ', 'ชื่อโครงการ', 'จำนวนห้อง', 'เลขที่เอกสาร'],
    ...elec.map(r => [r.date, r.project_id, r.project, fmt(r.rooms), r.doc]),
    [],
    ['รวม', '', '', fmt(elec.reduce((s,r)=>s+r.rooms,0)), ''],
  ]
  const wsElec = XLSX.utils.aoa_to_sheet(elecRows)
  wsElec['!cols'] = [{ wch:14 },{ wch:10 },{ wch:40 },{ wch:12 },{ wch:22 }]
  XLSX.utils.book_append_sheet(wb, wsElec, 'ค่าไฟฟ้า')

  // ── Sheet 2: ค่าน้ำ ────────────────────────────────
  const waterRows = [
    ['วันที่', 'รหัสโครงการ', 'ชื่อโครงการ', 'จำนวนห้อง'],
    ...water.map(r => [r.date, r.project_id, r.project, fmt(r.rooms)]),
    [],
    ['รวม', '', '', fmt(water.reduce((s,r)=>s+r.rooms,0))],
  ]
  const wsWater = XLSX.utils.aoa_to_sheet(waterRows)
  wsWater['!cols'] = [{ wch:14 },{ wch:10 },{ wch:40 },{ wch:12 }]
  XLSX.utils.book_append_sheet(wb, wsWater, 'ค่าน้ำ')

  // ── Sheet 3: ค่าส่วนกลาง ───────────────────────────
  const subKeys = COMMON_FEE_KEYS.map(k => k.key)
  const subLabels = COMMON_FEE_KEYS.map(k => k.label)

  const commonHeader1 = ['เดือน', 'รหัสโครงการ', 'ชื่อโครงการ',
    ...subLabels.flatMap(l => [l + ' (ห้อง)', l + ' (บาท)']),
    'รวมทั้งหมด (บาท)']

  const commonRows = [
    commonHeader1,
    ...common.map(r => {
      const total = subKeys.reduce((s,k)=>s+r[k].amount, 0)
      return [
        MONTHS_TH[r.month] || r.date,
        r.project_id,
        r.project,
        ...subKeys.flatMap(k => [fmt(r[k].rooms), fmt(r[k].amount)]),
        fmt(total),
      ]
    }),
    [],
    ['รวม', '', '',
      ...subKeys.flatMap(k => [
        fmt(common.reduce((s,r)=>s+r[k].rooms,0)),
        fmt(common.reduce((s,r)=>s+r[k].amount,0)),
      ]),
      fmt(common.reduce((s,r)=>s+subKeys.reduce((a,k)=>a+r[k].amount,0),0)),
    ],
  ]
  const wsCommon = XLSX.utils.aoa_to_sheet(commonRows)
  wsCommon['!cols'] = [{ wch:12 },{ wch:10 },{ wch:35 },
    ...subKeys.flatMap(() => [{ wch:12 },{ wch:14 }]),
    { wch:16 }]
  XLSX.utils.book_append_sheet(wb, wsCommon, 'ค่าส่วนกลาง')

  // ── Sheet 4: Monthly Summary ────────────────────────
  const allMonths = Object.keys(MONTHS_TH)
  const mths = selectedMonths.length === 0 ? allMonths : [...selectedMonths].sort()
  const summaryRows = [
    ['สรุปรายเดือน', `ช่วงเวลา: ${period}`],
    [],
    ['เดือน', 'ค่าไฟ — โครงการ', 'ค่าไฟ — ห้อง', 'ค่าน้ำ — โครงการ', 'ค่าน้ำ — ห้อง', 'ค่าส่วนกลาง — โครงการ', 'ค่าส่วนกลาง — ยอดรวม (บาท)'],
    ...mths.map(m => {
      const me = elec.filter(r=>r.month===m)
      const mw = water.filter(r=>r.month===m)
      const mc = common.filter(r=>r.month===m)
      return [
        MONTHS_TH[m],
        new Set(me.map(r=>r.project_id)).size,
        fmt(me.reduce((s,r)=>s+r.rooms,0)),
        new Set(mw.map(r=>r.project_id)).size,
        fmt(mw.reduce((s,r)=>s+r.rooms,0)),
        new Set(mc.map(r=>r.project_id)).size,
        fmt(mc.reduce((s,r)=>subKeys.reduce((a,k)=>a+r[k].amount,0)+s,0)),
      ]
    }),
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows)
  wsSummary['!cols'] = [{ wch:14 },{ wch:16 },{ wch:14 },{ wch:16 },{ wch:14 },{ wch:20 },{ wch:22 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุปรายเดือน')

  const filename = `SENA_AI_Report_${new Date().toISOString().slice(0,10)}.xlsx`
  XLSX.writeFile(wb, filename)
}
