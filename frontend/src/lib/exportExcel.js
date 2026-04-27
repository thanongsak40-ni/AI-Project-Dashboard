import ExcelJS from 'exceljs'
import { MONTHS_TH, COMMON_FEE_KEYS } from './processData'

// ── Color palette (no '#') ───────────────────────────────
const COLOR = {
  titleBg:    '1E3A8A',  // deep indigo
  subTitleBg: '3B82F6',  // blue
  headerBg:   '1F2937',  // slate-800
  headerFg:   'FFFFFF',
  zebra:      'F8FAFC',  // slate-50
  totalBg:    'FEF3C7',  // amber-100
  totalBorder:'F59E0B',
  border:     'CBD5E1',  // slate-300
  meta:       'E0E7FF',  // indigo-100
}
const FONT = 'TH Sarabun New'

const thinBorder = { style: 'thin', color: { argb: COLOR.border } }
const allBorders = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder }

function fmt(n) { return Number((n || 0).toFixed(2)) }

function fillCell(cell, argb) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

function applyTitleBlock(ws, title, subtitle, period, totalCols) {
  // Row 1: company / system
  ws.mergeCells(1, 1, 1, totalCols)
  const r1 = ws.getCell(1, 1)
  r1.value = 'บริษัท เสนาดีเวลลอปเม้นท์ จำกัด (มหาชน)  |  ระบบ AI ออกใบแจ้งหนี้อัตโนมัติ'
  r1.font = { name: FONT, size: 11, bold: true, color: { argb: 'FFFFFF' } }
  r1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  fillCell(r1, COLOR.titleBg)
  ws.getRow(1).height = 22

  // Row 2: report title
  ws.mergeCells(2, 1, 2, totalCols)
  const r2 = ws.getCell(2, 1)
  r2.value = title
  r2.font = { name: FONT, size: 18, bold: true, color: { argb: 'FFFFFF' } }
  r2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  fillCell(r2, COLOR.subTitleBg)
  ws.getRow(2).height = 30

  // Row 3: meta (subtitle | period | issued date)
  ws.mergeCells(3, 1, 3, totalCols)
  const r3 = ws.getCell(3, 1)
  const issued = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  r3.value = `${subtitle}     ·     ช่วงเวลา: ${period}     ·     วันที่ออกรายงาน: ${issued}`
  r3.font = { name: FONT, size: 10, color: { argb: '1E293B' } }
  r3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  fillCell(r3, COLOR.meta)
  ws.getRow(3).height = 20

  // Spacer row 4
  ws.getRow(4).height = 6
}

function applyHeaderRow(ws, rowIdx, headers) {
  const row = ws.getRow(rowIdx)
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1)
    cell.value = h
    cell.font = { name: FONT, size: 11, bold: true, color: { argb: COLOR.headerFg } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = allBorders
    fillCell(cell, COLOR.headerBg)
  })
  row.height = 28
}

function applyDataRow(ws, rowIdx, values, opts = {}) {
  const { numericCols = [], zebra = false } = opts
  const row = ws.getRow(rowIdx)
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1)
    cell.value = v
    cell.font = { name: FONT, size: 10 }
    cell.border = allBorders
    if (numericCols.includes(i)) {
      cell.numFmt = '#,##0.00'
      cell.alignment = { vertical: 'middle', horizontal: 'right' }
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    }
    if (zebra) fillCell(cell, COLOR.zebra)
  })
  row.height = 18
}

function applyTotalRow(ws, rowIdx, values, numericCols = []) {
  const row = ws.getRow(rowIdx)
  values.forEach((v, i) => {
    const cell = row.getCell(i + 1)
    cell.value = v
    cell.font = { name: FONT, size: 11, bold: true, color: { argb: '92400E' } }
    cell.border = {
      top: { style: 'medium', color: { argb: COLOR.totalBorder } },
      bottom: { style: 'medium', color: { argb: COLOR.totalBorder } },
      left: thinBorder, right: thinBorder,
    }
    if (numericCols.includes(i)) {
      cell.numFmt = '#,##0.00'
      cell.alignment = { vertical: 'middle', horizontal: 'right' }
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    }
    fillCell(cell, COLOR.totalBg)
  })
  row.height = 22
}

function buildSheet(wb, name, title, subtitle, period, headers, rows, numericCols, totalRow) {
  const ws = wb.addWorksheet(name, {
    properties: { defaultRowHeight: 16 },
    views: [{ state: 'frozen', ySplit: 5 }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 } },
  })

  applyTitleBlock(ws, title, subtitle, period, headers.length)
  applyHeaderRow(ws, 5, headers)
  rows.forEach((r, i) => applyDataRow(ws, 6 + i, r, { numericCols, zebra: i % 2 === 1 }))
  if (totalRow) applyTotalRow(ws, 6 + rows.length, totalRow, numericCols)

  return ws
}

function setCols(ws, widths) {
  ws.columns = widths.map(w => ({ width: w }))
}

export async function exportExcel(elec, water, common, selectedMonths) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SENA AI Automation'
  wb.created = new Date()

  const period = selectedMonths.length === 0 ? 'ทุกเดือน'
    : [...selectedMonths].sort().map(m => MONTHS_TH[m]).join(', ')

  // ── Sheet 1: ค่าไฟฟ้า ──────────────────────────────
  const elecHeaders = ['วันที่', 'รหัสโครงการ', 'ชื่อโครงการ', 'จำนวนห้อง', 'เลขที่เอกสาร']
  const elecRows = elec.map(r => [r.date, r.project_id, r.project, fmt(r.rooms), r.doc])
  const elecTotal = ['รวมทั้งหมด', '', '', fmt(elec.reduce((s,r)=>s+r.rooms,0)), `${elec.length} รายการ`]
  const wsElec = buildSheet(wb, 'ค่าไฟฟ้า', 'รายงานค่าไฟฟ้า', 'แยกตามโครงการและวันที่', period, elecHeaders, elecRows, [3], elecTotal)
  setCols(wsElec, [14, 14, 42, 14, 22])

  // ── Sheet 2: ค่าน้ำ ────────────────────────────────
  const waterHeaders = ['วันที่', 'รหัสโครงการ', 'ชื่อโครงการ', 'จำนวนห้อง', 'เลขที่เอกสาร']
  const waterRows = water.map(r => [r.date, r.project_id, r.project, fmt(r.rooms), r.doc])
  const waterTotal = ['รวมทั้งหมด', '', '', fmt(water.reduce((s,r)=>s+r.rooms,0)), `${water.length} รายการ`]
  const wsWater = buildSheet(wb, 'ค่าน้ำ', 'รายงานค่าน้ำ', 'แยกตามโครงการและวันที่', period, waterHeaders, waterRows, [3], waterTotal)
  setCols(wsWater, [14, 14, 42, 14, 22])

  // ── Sheet 3: ค่าส่วนกลาง ───────────────────────────
  const subKeys = COMMON_FEE_KEYS.map(k => k.key)
  const subLabels = COMMON_FEE_KEYS.map(k => k.label)
  const commonHeaders = [
    'เดือน', 'รหัสโครงการ', 'ชื่อโครงการ',
    ...subLabels.flatMap(l => [`${l}\n(ห้อง)`, `${l}\n(บาท)`]),
    'รวมทั้งหมด\n(บาท)',
  ]
  const commonNumCols = []
  for (let i = 3; i < commonHeaders.length; i++) commonNumCols.push(i)
  const commonRows = common.map(r => {
    const total = subKeys.reduce((s,k)=>s+r[k].amount, 0)
    return [
      MONTHS_TH[r.month] || r.date, r.project_id, r.project,
      ...subKeys.flatMap(k => [fmt(r[k].rooms), fmt(r[k].amount)]),
      fmt(total),
    ]
  })
  const commonTotal = [
    'รวมทั้งหมด', '', '',
    ...subKeys.flatMap(k => [
      fmt(common.reduce((s,r)=>s+r[k].rooms,0)),
      fmt(common.reduce((s,r)=>s+r[k].amount,0)),
    ]),
    fmt(common.reduce((s,r)=>s+subKeys.reduce((a,k)=>a+r[k].amount,0),0)),
  ]
  const wsCommon = buildSheet(wb, 'ค่าส่วนกลาง', 'รายงานค่าส่วนกลาง', 'แยกตามหมวดค่าใช้จ่ายและโครงการ', period, commonHeaders, commonRows, commonNumCols, commonTotal)
  setCols(wsCommon, [12, 14, 36, ...subKeys.flatMap(() => [12, 16]), 18])

  // ── Sheet 4: สรุปรายเดือน ────────────────────────────
  const allMonths = Object.keys(MONTHS_TH)
  const mths = selectedMonths.length === 0 ? allMonths : [...selectedMonths].sort()
  const summaryHeaders = ['เดือน', 'ค่าไฟ\nโครงการ', 'ค่าไฟ\nห้อง', 'ค่าน้ำ\nโครงการ', 'ค่าน้ำ\nห้อง', 'ค่าส่วนกลาง\nโครงการ', 'ค่าส่วนกลาง\nห้อง']
  const summaryRows = mths.map(m => {
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
      fmt(mc.reduce((s,r)=>subKeys.reduce((a,k)=>a+r[k].rooms,0)+s,0)),
    ]
  })
  const summaryTotal = [
    'รวมทุกเดือน',
    new Set(elec.map(r=>r.project_id)).size,
    fmt(elec.reduce((s,r)=>s+r.rooms,0)),
    new Set(water.map(r=>r.project_id)).size,
    fmt(water.reduce((s,r)=>s+r.rooms,0)),
    new Set(common.map(r=>r.project_id)).size,
    fmt(common.reduce((s,r)=>subKeys.reduce((a,k)=>a+r[k].rooms,0)+s,0)),
  ]
  const wsSummary = buildSheet(wb, 'สรุปรายเดือน', 'สรุปผลการดำเนินงานรายเดือน', 'ภาพรวม 3 ประเภทค่าใช้จ่าย (จำนวนห้อง)', period, summaryHeaders, summaryRows, [1,2,3,4,5,6], summaryTotal)
  setCols(wsSummary, [16, 14, 14, 14, 14, 18, 16])

  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `SENA_AI_Report_${new Date().toISOString().slice(0,10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
