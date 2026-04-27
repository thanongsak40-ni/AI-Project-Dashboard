import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getTopProjects, getProjectHistory, COMMON_FEE_KEYS, MONTHS_TH, RAW } from '../lib/processData'

function fmt(n) { return (n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 }) }

const SRC_COLOR = { elec: '#3b82f6', water: '#10b981', common: '#f59e0b' }
const SRC_LABEL = { elec: '⚡ ค่าไฟฟ้า', water: '💧 ค่าน้ำ', common: '🏢 ค่าส่วนกลาง' }

function ProjectHistory({ projectId, onBack }) {
  const proj = RAW.elec.find(r => r.project_id === projectId)
             || RAW.water.find(r => r.project_id === projectId)
             || RAW.common.find(r => r.project_id === projectId)
  const hist = getProjectHistory(projectId)
  const hasElec   = hist.elec.length > 0
  const hasWater  = hist.water.length > 0
  const hasCommon = hist.common.length > 0

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 shrink-0 bg-white border-b border-slate-100">
        <button onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors">
          <ArrowLeft size={14}/> กลับ
        </button>
        <div className="w-px h-4 bg-slate-200"/>
        <div>
          <div className="font-bold text-slate-800 text-sm">{proj?.project || projectId}</div>
          <div className="text-xs font-mono text-slate-400">{projectId}</div>
        </div>
        {/* Summary badges */}
        <div className="ml-auto flex gap-2 flex-wrap">
          {hasElec && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-600 border border-blue-100">
              ⚡ {hist.elec.length} ครั้ง · {fmt(hist.elec.reduce((s,r)=>s+r.rooms,0))} ห้อง
            </span>
          )}
          {hasWater && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              💧 {hist.water.length} ครั้ง · {fmt(hist.water.reduce((s,r)=>s+r.rooms,0))} ห้อง
            </span>
          )}
          {hasCommon && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-600 border border-amber-100">
              🏢 {hist.common.length} ครั้ง · {fmt(hist.common.reduce((s,r)=>COMMON_FEE_KEYS.reduce((a,k)=>a+r[k.key].amount,0)+s,0))} บาท
            </span>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:'12px' }}>

        {/* Electricity */}
        {hasElec && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="font-bold text-sm text-slate-700">⚡ ประวัติค่าไฟฟ้า</span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">{hist.elec.length} รายการ</span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr className="text-slate-500 font-bold uppercase">
                  <th className="px-4 py-2 text-left">วันที่</th>
                  <th className="px-4 py-2 text-right">จำนวนห้อง</th>
                  <th className="px-4 py-2 text-left">เลขที่เอกสาร</th>
                </tr>
              </thead>
              <tbody>
                {hist.elec.map((r, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-blue-50/20">
                    <td className="px-4 py-2 text-slate-500">{r.date}</td>
                    <td className="px-4 py-2 text-right font-bold text-blue-600">{fmt(r.rooms)}</td>
                    <td className="px-4 py-2 font-mono text-slate-400">{r.doc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Water */}
        {hasWater && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="font-bold text-sm text-slate-700">💧 ประวัติค่าน้ำ</span>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">{hist.water.length} รายการ</span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr className="text-slate-500 font-bold uppercase">
                  <th className="px-4 py-2 text-left">วันที่</th>
                  <th className="px-4 py-2 text-right">จำนวนห้อง</th>
                </tr>
              </thead>
              <tbody>
                {hist.water.map((r, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-emerald-50/20">
                    <td className="px-4 py-2 text-slate-500">{r.date}</td>
                    <td className="px-4 py-2 text-right font-bold text-emerald-600">{fmt(r.rooms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Common fee — แสดงทุกค่าย่อย */}
        {hasCommon && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="font-bold text-sm text-slate-700">🏢 ค่าส่วนกลาง</span>
              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold">{hist.common.length} รายการ</span>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="text-slate-500 font-bold uppercase">
                    <th className="px-4 py-2.5 text-left whitespace-nowrap">เดือน</th>
                    {COMMON_FEE_KEYS.map(k => (
                      <th key={k.key} className="px-3 py-2.5 text-center whitespace-nowrap" style={{ color: k.color }}>
                        {k.label}
                      </th>
                    ))}
                    <th className="px-4 py-2.5 text-right whitespace-nowrap text-amber-600">รวม (บาท)</th>
                  </tr>
                  {/* sub-header: ห้อง / บาท */}
                  <tr className="text-slate-400 text-xs border-b border-slate-100">
                    <th className="px-4 pb-2"/>
                    {COMMON_FEE_KEYS.map(k => (
                      <th key={k.key} className="px-3 pb-2 text-center font-normal">ห้อง / บาท</th>
                    ))}
                    <th className="px-4 pb-2"/>
                  </tr>
                </thead>
                <tbody>
                  {hist.common.map((r, i) => {
                    const rowTotal = COMMON_FEE_KEYS.reduce((s,k) => s + r[k.key].amount, 0)
                    return (
                      <tr key={i} className="border-t border-slate-50 hover:bg-amber-50/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                          {MONTHS_TH[r.month] || r.date}
                        </td>
                        {COMMON_FEE_KEYS.map(k => (
                          <td key={k.key} className="px-3 py-3 text-center">
                            {r[k.key].rooms > 0 || r[k.key].amount > 0 ? (
                              <div>
                                <div className="font-bold" style={{ color: k.color }}>
                                  {fmt(r[k.key].rooms)} ห้อง
                                </div>
                                <div className="text-slate-400 mt-0.5">
                                  {fmt(r[k.key].amount)} ฿
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right font-extrabold text-amber-600 whitespace-nowrap">
                          {fmt(rowTotal)}
                        </td>
                      </tr>
                    )
                  })}
                  {/* summary row */}
                  <tr className="border-t-2 border-amber-200 bg-amber-50/40 font-bold">
                    <td className="px-4 py-2.5 text-slate-600">รวมทั้งหมด</td>
                    {COMMON_FEE_KEYS.map(k => (
                      <td key={k.key} className="px-3 py-2.5 text-center">
                        <div className="font-bold" style={{ color: k.color }}>
                          {fmt(hist.common.reduce((s,r)=>s+r[k.key].rooms,0))} ห้อง
                        </div>
                        <div className="text-slate-500 text-xs">
                          {fmt(hist.common.reduce((s,r)=>s+r[k.key].amount,0))} ฿
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right font-extrabold text-amber-600">
                      {fmt(hist.common.reduce((s,r)=>s+COMMON_FEE_KEYS.reduce((a,k)=>a+r[k.key].amount,0),0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Main Projects list ----
export default function Projects({ selectedMonths, initialProjectId, initialSrc }) {
  const [selected, setSelected] = useState(initialProjectId || null)
  const [srcTab, setSrcTab]     = useState(initialSrc || 'elec')

  const topElec   = getTopProjects('elec',   selectedMonths)
  const topWater  = getTopProjects('water',  selectedMonths)
  const topCommon = getTopProjects('common', selectedMonths)

  const tabs = [
    { id:'elec',   label:'⚡ ค่าไฟฟ้า',   color:'#3b82f6', top:topElec,
      cols: ['จำนวนครั้ง','ห้องรวม'], valFn: p => [p.count, fmt(p.totalRooms)+' ห้อง'] },
    { id:'water',  label:'💧 ค่าน้ำ',      color:'#10b981', top:topWater,
      cols: ['จำนวนครั้ง','ห้องรวม'], valFn: p => [p.count, fmt(p.totalRooms)+' ห้อง'] },
    { id:'common', label:'🏢 ค่าส่วนกลาง', color:'#f59e0b', top:topCommon,
      cols: ['จำนวนครั้ง','ยอดรวม (บาท)'], valFn: p => [p.count, fmt(p.totalAmt)+' ฿'] },
  ]

  if (selected) return <ProjectHistory projectId={selected} onBack={() => setSelected(null)} />

  const active = tabs.find(t => t.id === srcTab)
  const maxCount = active?.top[0]?.count || 1

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', padding:'12px', gap:'10px' }}>

      {/* Source tabs */}
      <div className="flex gap-2 shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSrcTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              srcTab===t.id ? 'text-white border-transparent shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
            style={srcTab===t.id ? { background: t.color } : {}}>
            {t.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${srcTab===t.id?'bg-white/20 text-white':'bg-slate-100 text-slate-400'}`}>
              {t.top.length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm" style={{ flex:1, minHeight:0, overflow:'auto' }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="text-xs text-slate-500 font-bold uppercase">
              <th className="px-4 py-3 text-center w-10">#</th>
              <th className="px-4 py-3 text-left">โครงการ</th>
              <th className="px-4 py-3 text-left">รหัส</th>
              {active?.cols.map(c => <th key={c} className="px-4 py-3 text-right">{c}</th>)}
              <th className="px-4 py-3 w-6"/>
            </tr>
          </thead>
          <tbody>
            {active?.top.map((p, i) => {
              const [v1, v2] = active.valFn(p)
              return (
                <tr key={p.id} onClick={() => setSelected(p.id)}
                  className="border-t border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-center font-bold text-slate-300">{i+1}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{p.project}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">{v1}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: active.color }}>{v2}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">›</td>
                </tr>
              )
            })}
            {active?.top.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-slate-300">ไม่มีข้อมูลในช่วงที่เลือก</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
