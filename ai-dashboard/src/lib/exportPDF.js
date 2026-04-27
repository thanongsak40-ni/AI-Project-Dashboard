import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { COMMON_FEE_KEYS } from './processData'
import { SarabunRegular, SarabunBold } from './sarabunFont'

function fmt(n) { return (n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 }) }
function fmtD(n) { return (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const MONTH_LABEL = {
  '2025-08':'ส.ค. 68','2025-09':'ก.ย. 68','2025-10':'ต.ค. 68',
  '2025-11':'พ.ย. 68','2025-12':'ธ.ค. 68','2026-01':'ม.ค. 69',
  '2026-02':'ก.พ. 69','2026-03':'มี.ค. 69','2026-04':'เม.ย. 69',
}
const ALL_MONTHS_ORDER = Object.keys(MONTH_LABEL)

function setupFont(doc) {
  doc.addFileToVFS('THSarabunNew.ttf', SarabunRegular)
  doc.addFont('THSarabunNew.ttf', 'TH', 'normal')
  doc.addFileToVFS('THSarabunNew-Bold.ttf', SarabunBold)
  doc.addFont('THSarabunNew-Bold.ttf', 'TH', 'bold')
}

// ─── colour palette ───────────────────────────────────────
const C = {
  navy:    [15,  23,  42],
  blue:    [37,  99, 235],
  elec:    [59, 130, 246],
  water:   [16, 185, 129],
  common:  [245,158,  11],
  indigo:  [99, 102, 241],
  light:   [248,250,252],
  border:  [203,213,225],
  text:    [15,  23,  42],
  muted:   [100,116,139],
  white:   [255,255,255],
}

// ─── helpers ─────────────────────────────────────────────
function thDate() {
  return new Date().toLocaleDateString('th-TH', { day:'2-digit', month:'long', year:'numeric' })
}

function drawHeaderBand(doc, W, title, subtitle) {
  // navy top bar
  doc.setFillColor(...C.navy)
  doc.rect(0, 0, W, 22, 'F')
  // blue accent line
  doc.setFillColor(...C.blue)
  doc.rect(0, 22, W, 1.5, 'F')
  // company
  doc.setFont('TH','normal'); doc.setFontSize(8.5)
  doc.setTextColor(148,163,184)
  doc.text('บริษัท เสนาดีเวลลอปเม้นท์ จำกัด (มหาชน)  |  ระบบ AI ออกใบแจ้งหนี้อัตโนมัติ', 12, 8)
  // title
  doc.setFont('TH','bold'); doc.setFontSize(16)
  doc.setTextColor(...C.white)
  doc.text(title, 12, 18)
  // subtitle right-aligned
  doc.setFont('TH','normal'); doc.setFontSize(8.5)
  doc.setTextColor(148,163,184)
  doc.text(subtitle, W - 12, 18, { align:'right' })
}

function drawSectionTitle(doc, x, y, label, accent) {
  doc.setFillColor(...accent)
  doc.rect(x, y, 3, 5.5, 'F')
  doc.setFont('TH','bold'); doc.setFontSize(11)
  doc.setTextColor(...C.text)
  doc.text(label, x + 6, y + 4.5)
  return y + 8
}

function addFooter(doc, W, H, TH_FONT, pageNum, totalPages) {
  doc.setDrawColor(...C.border)
  doc.setLineWidth(0.3)
  doc.line(12, H - 8, W - 12, H - 8)
  doc.setFont(TH_FONT,'normal'); doc.setFontSize(7.5)
  doc.setTextColor(...C.muted)
  doc.text('เอกสารนี้ออกโดยระบบ AI Automation ของ บมจ. เสนาดีเวลลอปเม้นท์  —  เอกสารลับ ห้ามเผยแพร่', 12, H - 4)
  doc.text(`หน้า ${pageNum} / ${totalPages}`, W - 12, H - 4, { align:'right' })
}

// ═════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════

export function exportPDF(elec, water, common, selectedMonths, selectedProject = null, selectedType = null) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  setupFont(doc)
  const TH_FONT = 'TH'
  const W  = doc.internal.pageSize.getWidth()   // 297
  const H  = doc.internal.pageSize.getHeight()  // 210
  const ML = 12
  const CW = W - ML * 2

  const subKeys         = COMMON_FEE_KEYS.map(k => k.key)
  const mths            = selectedMonths.length === 0 ? ALL_MONTHS_ORDER : [...selectedMonths].sort()
  const period          = mths.map(m => MONTH_LABEL[m] || m).join(', ')
  const projName        = elec[0]?.project || water[0]?.project || common[0]?.project || null
  const isSingleProject = !!selectedProject

  const totalElecRooms  = elec.reduce((s,r) => s + r.rooms, 0)
  const totalWaterRooms = water.reduce((s,r) => s + r.rooms, 0)
  const totalCommonAmt  = common.reduce((s,r) => s + subKeys.reduce((a,k) => a + r[k].amount, 0), 0)
  const typeLabel = selectedType === 'elec' ? 'ค่าไฟฟ้า' : selectedType === 'water' ? 'ค่าน้ำ' : selectedType === 'common' ? 'ค่าส่วนกลาง' : 'ทุกประเภท'

  // ── Header ─────────────────────────────────────────
  drawHeaderBand(doc, W, 'รายงานสรุปผลการดำเนินงาน AI Automation', `วันที่พิมพ์: ${thDate()}`)
  let y = 30

  // ── Info band ──────────────────────────────────────
  // period display: if all 9 months show range, else list months
  const periodDisplay = mths.length === ALL_MONTHS_ORDER.length
    ? 'ส.ค. 68 – เม.ย. 69 (ทุกเดือน)'
    : mths.length > 4
      ? `${MONTH_LABEL[mths[0]]} – ${MONTH_LABEL[mths[mths.length-1]]} (${mths.length} เดือน)`
      : period

  const infoBandH = 16
  doc.setFillColor(...C.light)
  doc.rect(ML, y, CW, infoBandH, 'F')
  doc.setDrawColor(...C.border); doc.setLineWidth(0.3)
  doc.rect(ML, y, CW, infoBandH, 'S')

  // draw dividers between cells
  const infoColWidths = [80, 40, 100, 53]  // ช่วงเวลา / ประเภท / โครงการ / วันที่ออก
  const infoLabels  = ['ช่วงเวลา', 'ประเภท', 'โครงการ', 'วันที่ออก']
  const infoVals    = [periodDisplay, typeLabel, isSingleProject ? (projName || selectedProject) : 'ทุกโครงการ', thDate()]
  let ix = ML
  infoColWidths.forEach((w, i) => {
    // divider
    if (i > 0) {
      doc.setDrawColor(...C.border)
      doc.line(ix, y + 1, ix, y + infoBandH - 1)
    }
    doc.setFont(TH_FONT,'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.muted)
    doc.text(infoLabels[i], ix + 4, y + 5.5)
    doc.setFont(TH_FONT,'bold'); doc.setFontSize(9.5); doc.setTextColor(...C.text)
    // truncate if too wide
    const maxW = w - 8
    doc.text(infoVals[i], ix + 4, y + 12, { maxWidth: maxW })
    ix += w
  })
  y += infoBandH + 4

  // ── KPI row ────────────────────────────────────────
  const kpis = [
    { label:'ค่าไฟฟ้า',    val1:`${fmt(totalElecRooms)} ห้อง`,  val2:`${elec.length} รายการ${isSingleProject ? '' : ' · ' + new Set(elec.map(r=>r.project_id)).size + ' โครงการ'}`,  color:C.elec   },
    { label:'ค่าน้ำ',       val1:`${fmt(totalWaterRooms)} ห้อง`, val2:`${water.length} รายการ${isSingleProject ? '' : ' · ' + new Set(water.map(r=>r.project_id)).size + ' โครงการ'}`, color:C.water  },
    { label:'ค่าส่วนกลาง', val1:`${fmt(totalCommonAmt)} บาท`,   val2:`${common.length} รายการ${isSingleProject ? '' : ' · ' + new Set(common.map(r=>r.project_id)).size + ' โครงการ'}`, color:C.common },
    { label:'AI ทั้งหมด',  val1:`${fmt(elec.length+water.length+common.length)} รายการ`, val2:`ใน ${mths.length} เดือน`, color:C.indigo },
  ]
  const bw = (CW - 9) / 4
  kpis.forEach((k, i) => {
    const kx = ML + i*(bw+3)
    doc.setFillColor(...C.light); doc.rect(kx, y, bw, 15, 'F')
    doc.setFillColor(...k.color); doc.rect(kx, y, 3, 15, 'F')
    doc.setFont(TH_FONT,'bold'); doc.setFontSize(7.5); doc.setTextColor(...C.muted)
    doc.text(k.label, kx+6, y+5)
    doc.setFont(TH_FONT,'bold'); doc.setFontSize(12); doc.setTextColor(...C.text)
    doc.text(k.val1, kx+6, y+11)
    doc.setFont(TH_FONT,'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.muted)
    doc.text(k.val2, kx+6, y+14.5)
  })
  y += 20

  // ── Monthly table ──────────────────────────────────
  y = drawSectionTitle(doc, ML, y, 'สรุปรายเดือน', C.blue)

  if (isSingleProject) {
    // Single project: remove project columns, show common fee breakdown per month
    const feeLabels = COMMON_FEE_KEYS.map(k => k.label)
    const monthHead = [['เดือน', 'ค่าไฟฟ้า\n(ห้อง)', 'ค่าน้ำ\n(ห้อง)', ...feeLabels, 'รวม\nส่วนกลาง (บาท)']]
    const monthBody = mths.map(m => {
      const me = elec.filter(r => r.month === m)
      const mw = water.filter(r => r.month === m)
      const mc = common.filter(r => r.month === m)
      const feeAmts = COMMON_FEE_KEYS.map(k => mc.reduce((s,r)=>s+r[k.key].amount,0))
      const totalFee = feeAmts.reduce((a,v)=>a+v,0)
      return [
        MONTH_LABEL[m]||m,
        me.length ? fmt(me.reduce((s,r)=>s+r.rooms,0)) : '—',
        mw.length ? fmt(mw.reduce((s,r)=>s+r.rooms,0)) : '—',
        ...feeAmts.map(v => v > 0 ? fmt(v) : '—'),
        mc.length ? fmt(totalFee) : '—',
      ]
    })
    // total row
    const grandFees = COMMON_FEE_KEYS.map(k => common.reduce((s,r)=>s+r[k.key].amount,0))
    monthBody.push([
      'รวมทั้งหมด',
      fmt(totalElecRooms),
      fmt(totalWaterRooms),
      ...grandFees.map(v => v>0 ? fmt(v) : '—'),
      fmt(totalCommonAmt),
    ])

    const feeColW = Math.floor((CW - 22 - 25 - 25 - 32) / COMMON_FEE_KEYS.length)
    const feeColStyles = {}
    COMMON_FEE_KEYS.forEach((_, i) => { feeColStyles[3+i] = { cellWidth: feeColW, halign:'right' } })

    autoTable(doc, {
      startY: y,
      head: monthHead,
      body: monthBody,
      theme: 'grid',
      styles:     { font: TH_FONT, fontSize: 8.5, cellPadding: 2, textColor: C.text },
      headStyles: { font: TH_FONT, fillColor: C.navy, textColor: C.white, fontStyle:'bold', fontSize: 8.5, halign:'center', valign:'middle' },
      columnStyles: {
        0: { cellWidth:22, fontStyle:'bold' },
        1: { cellWidth:25, halign:'right' },
        2: { cellWidth:25, halign:'right' },
        ...feeColStyles,
        [3+COMMON_FEE_KEYS.length]: { cellWidth:32, halign:'right', fontStyle:'bold' },
      },
      alternateRowStyles: { fillColor: C.light },
      didParseCell: data => {
        if (data.row.index === monthBody.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [226,232,240]
        }
      },
      margin: { left: ML, right: ML },
    })
  } else {
    // All projects: show project counts per type
    const monthHead = [['เดือน', 'ค่าไฟฟ้า\n(ห้อง)', 'โครงการ', 'ค่าน้ำ\n(ห้อง)', 'โครงการ', 'ค่าส่วนกลาง\n(บาท)', 'โครงการ', 'รวมห้อง\n(ไฟ+น้ำ)']]
    const monthBody = mths.map(m => {
      const me = elec.filter(r => r.month === m)
      const mw = water.filter(r => r.month === m)
      const mc = common.filter(r => r.month === m)
      const commonAmt = mc.reduce((s,r) => s + subKeys.reduce((a,k) => a + r[k].amount, 0), 0)
      const er = me.reduce((s,r)=>s+r.rooms,0), wr = mw.reduce((s,r)=>s+r.rooms,0)
      return [
        MONTH_LABEL[m]||m,
        me.length ? fmt(er) : '—', me.length ? new Set(me.map(r=>r.project_id)).size : '—',
        mw.length ? fmt(wr) : '—', mw.length ? new Set(mw.map(r=>r.project_id)).size : '—',
        mc.length ? fmt(commonAmt) : '—', mc.length ? new Set(mc.map(r=>r.project_id)).size : '—',
        (er+wr)>0 ? fmt(er+wr) : '—',
      ]
    })
    monthBody.push([
      'รวมทั้งหมด',
      fmt(totalElecRooms), new Set(elec.map(r=>r.project_id)).size,
      fmt(totalWaterRooms), new Set(water.map(r=>r.project_id)).size,
      fmt(totalCommonAmt), new Set(common.map(r=>r.project_id)).size,
      fmt(totalElecRooms+totalWaterRooms),
    ])

    autoTable(doc, {
      startY: y,
      head: monthHead,
      body: monthBody,
      theme: 'grid',
      styles:     { font: TH_FONT, fontSize: 8.5, cellPadding: 2, textColor: C.text },
      headStyles: { font: TH_FONT, fillColor: C.navy, textColor: C.white, fontStyle:'bold', fontSize: 8.5, halign:'center', valign:'middle' },
      columnStyles: {
        0: { cellWidth:22, fontStyle:'bold' },
        1: { cellWidth:26, halign:'right' }, 2: { cellWidth:18, halign:'center' },
        3: { cellWidth:26, halign:'right' }, 4: { cellWidth:18, halign:'center' },
        5: { cellWidth:32, halign:'right' }, 6: { cellWidth:18, halign:'center' },
        7: { cellWidth:26, halign:'right', fontStyle:'bold' },
      },
      alternateRowStyles: { fillColor: C.light },
      didParseCell: data => {
        if (data.row.index === monthBody.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [226,232,240]
        }
      },
      margin: { left: ML, right: ML },
    })
  }

  // ── Footer ─────────────────────────────────────────
  addFooter(doc, W, H, TH_FONT, 1, 1)

  const proj = selectedProject ? `_${projName||selectedProject}` : ''
  const type = selectedType ? `_${selectedType}` : ''
  doc.save(`SENA_Report${proj}${type}_${new Date().toISOString().slice(0,10)}.pdf`)
}
