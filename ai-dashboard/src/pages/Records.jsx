import { useState } from 'react'
import { getElec, getWater, getCommon, COMMON_FEE_KEYS, MONTHS_TH } from '../lib/processData'

function fmt(n) { return (n||0).toLocaleString('th-TH', { maximumFractionDigits: 0 }) }

const TABS = [
  { id: 'elec',   label: '⚡ ค่าไฟฟ้า',    color: '#3b82f6' },
  { id: 'water',  label: '💧 ค่าน้ำ',       color: '#10b981' },
  { id: 'common', label: '🏢 ค่าส่วนกลาง',  color: '#f59e0b' },
]

function ElecTable({ rows }) {
  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 bg-slate-50 z-10">
        <tr className="text-slate-500 font-bold uppercase">
          <th className="px-3 py-2 text-left">วันที่</th>
          <th className="px-3 py-2 text-left">โครงการ</th>
          <th className="px-3 py-2 text-left">รหัส</th>
          <th className="px-3 py-2 text-right">จำนวนห้อง</th>
          <th className="px-3 py-2 text-left">เลขที่เอกสาร</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-50 hover:bg-blue-50/30 transition-colors">
            <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{r.date}</td>
            <td className="px-3 py-2 text-slate-700 font-medium max-w-[220px] truncate">{r.project}</td>
            <td className="px-3 py-2 font-mono text-slate-400">{r.project_id}</td>
            <td className="px-3 py-2 text-right font-bold text-blue-600">{fmt(r.rooms)}</td>
            <td className="px-3 py-2 font-mono text-slate-400">{r.doc || '—'}</td>
          </tr>
        ))}
        {rows.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-300">ไม่มีข้อมูล</td></tr>}
      </tbody>
    </table>
  )
}

function WaterTable({ rows }) {
  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 bg-slate-50 z-10">
        <tr className="text-slate-500 font-bold uppercase">
          <th className="px-3 py-2 text-left">วันที่</th>
          <th className="px-3 py-2 text-left">โครงการ</th>
          <th className="px-3 py-2 text-left">รหัส</th>
          <th className="px-3 py-2 text-right">จำนวนห้อง</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-50 hover:bg-emerald-50/30 transition-colors">
            <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{r.date}</td>
            <td className="px-3 py-2 text-slate-700 font-medium max-w-[220px] truncate">{r.project}</td>
            <td className="px-3 py-2 font-mono text-slate-400">{r.project_id}</td>
            <td className="px-3 py-2 text-right font-bold text-emerald-600">{fmt(r.rooms)}</td>
          </tr>
        ))}
        {rows.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-300">ไม่มีข้อมูล</td></tr>}
      </tbody>
    </table>
  )
}

function CommonTable({ rows }) {
  const totalAmt = rows.reduce((s, r) => s + COMMON_FEE_KEYS.reduce((a, k) => a + r[k.key].amount, 0), 0)
  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 bg-slate-50 z-10">
        <tr className="text-slate-500 font-bold uppercase">
          <th className="px-3 py-2 text-left">เดือน</th>
          <th className="px-3 py-2 text-left">โครงการ</th>
          <th className="px-3 py-2 text-left">รหัส</th>
          {COMMON_FEE_KEYS.map(k => (
            <th key={k.key} className="px-3 py-2 text-right whitespace-nowrap" style={{ color: k.color }}>
              {k.label}<br/>
              <span className="font-normal text-slate-400">ห้อง / บาท</span>
            </th>
          ))}
          <th className="px-3 py-2 text-right text-slate-600">ยอดรวม (บาท)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const rowTotal = COMMON_FEE_KEYS.reduce((s, k) => s + r[k.key].amount, 0)
          return (
            <tr key={i} className="border-t border-slate-50 hover:bg-amber-50/30 transition-colors">
              <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{MONTHS_TH[r.month] || r.date}</td>
              <td className="px-3 py-2 text-slate-700 font-medium max-w-[160px] truncate">{r.project}</td>
              <td className="px-3 py-2 font-mono text-slate-400">{r.project_id}</td>
              {COMMON_FEE_KEYS.map(k => (
                <td key={k.key} className="px-3 py-2 text-right">
                  {r[k.key].rooms > 0 ? (
                    <div>
                      <div className="font-semibold" style={{ color: k.color }}>{fmt(r[k.key].rooms)} ห้อง</div>
                      <div className="text-slate-400">{fmt(r[k.key].amount)} ฿</div>
                    </div>
                  ) : <span className="text-slate-200">—</span>}
                </td>
              ))}
              <td className="px-3 py-2 text-right font-extrabold text-amber-600">{fmt(rowTotal)}</td>
            </tr>
          )
        })}
        {rows.length === 0 && <tr><td colSpan={10} className="text-center py-10 text-slate-300">ไม่มีข้อมูล</td></tr>}
        {rows.length > 0 && (
          <tr className="border-t-2 border-amber-200 bg-amber-50/50">
            <td colSpan={3} className="px-3 py-2 font-bold text-slate-600">รวมทั้งหมด</td>
            {COMMON_FEE_KEYS.map(k => (
              <td key={k.key} className="px-3 py-2 text-right font-bold" style={{ color: k.color }}>
                {fmt(rows.reduce((s,r)=>s+r[k.key].amount,0))} ฿
              </td>
            ))}
            <td className="px-3 py-2 text-right font-extrabold text-amber-600">{fmt(totalAmt)} ฿</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default function Records({ selectedMonths, searchQuery, defaultTab = 'elec' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const elecRows  = getElec(selectedMonths, searchQuery).sort((a,b)=>b.date.localeCompare(a.date))
  const waterRows = getWater(selectedMonths, searchQuery).sort((a,b)=>b.date.localeCompare(a.date))
  const commonRows = getCommon(selectedMonths, searchQuery).sort((a,b)=>b.month.localeCompare(a.month))

  const counts = { elec: elecRows.length, water: waterRows.length, common: commonRows.length }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Sub-tabs */}
      <div className="flex gap-0 px-4 pt-3 shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border border-b-0 transition-all mr-1 ${
              activeTab === t.id ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-100 text-slate-400 border-transparent hover:bg-white/60'
            }`}>
            {t.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-slate-100 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Table area */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm mx-4 mb-4" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {activeTab === 'elec'   && <ElecTable   rows={elecRows} />}
        {activeTab === 'water'  && <WaterTable  rows={waterRows} />}
        {activeTab === 'common' && <CommonTable rows={commonRows} />}
      </div>
    </div>
  )
}
