import { useState, useMemo } from 'react'
import { X, Zap, Droplets, Building2, ChevronUp, ChevronDown as ChevronDn, ArrowUpRight, TrendingUp, BarChart3, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import {
  getMonthlyStats, getTopProjects, getElec, getWater, getCommon,
  getProjectHistory, MONTHS_TH, COMMON_FEE_KEYS, RAW, ALL_MONTHS
} from '../lib/processData'

const fmt = n => (n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 })
const PAGE_SIZE = 15

/* ━━━ KPI Card (clickable) — professional white card with subtle accent ━━ */
const KPI_STYLES = {
  elec:   { color: '#dc2626', tint: '#fef2f2', soft: 'rgba(220,38,38,0.08)' },
  water:  { color: '#2563eb', tint: '#eff6ff', soft: 'rgba(37,99,235,0.08)' },
  common: { color: '#0f8a6f', tint: '#ecfdf5', soft: 'rgba(15,138,111,0.08)' },
}

function KpiCard({ type, icon: Icon, label, value, unit, sub, active, onClick }) {
  const s = KPI_STYLES[type]
  return (
    <button onClick={onClick}
      className="relative text-left rounded-xl p-4 flex items-center gap-3.5 w-full overflow-hidden transition-all duration-200 bg-white border hover:shadow-md"
      style={{
        borderColor: active ? s.color : '#e2e8f0',
        boxShadow: active ? `0 4px 14px ${s.soft}, inset 0 0 0 1px ${s.color}` : '0 1px 2px rgba(15,23,42,0.04)',
      }}>
      {/* Left accent bar */}
      <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ background: s.color }} />

      {/* Icon tile */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-1"
        style={{ background: s.tint }}>
        <Icon size={20} style={{ color: s.color }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-0.5">{label}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black leading-none tabular-nums" style={{ color: '#0f172a' }}>{value}</span>
          <span className="text-xs font-bold text-slate-500">{unit}</span>
        </div>
        <div className="text-xs font-semibold mt-1" style={{ color: s.color }}>{sub}</div>
      </div>

      {active && (
        <div className="absolute top-2 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: s.tint, color: s.color }}>
          กำลังดู
        </div>
      )}
    </button>
  )
}

/* ━━━ Chart Tooltip ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ChartTooltip({ active, payload, label, mode }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  const val = payload[0]?.value

  const modeRows = {
    elec:    [{ color: '#f87171', label: 'จำนวนห้อง',    val: `${fmt(val)} ห้อง` },
              { color: '#fecaca', label: 'โครงการ',        val: `${d?.elec?.projects || 0} โครงการ` }],
    water:   [{ color: '#60a5fa', label: 'จำนวนห้อง',    val: `${fmt(val)} ห้อง` },
              { color: '#93c5fd', label: 'โครงการ',        val: `${d?.water?.projects || 0} โครงการ` }],
    common:  [{ color: '#34d399', label: 'ยอดรวม',         val: `${fmt(val * 1000)} บาท` },
              { color: '#6ee7b7', label: 'โครงการ',        val: `${d?.common?.projects || 0} โครงการ` }],
    project: [
      { color: '#f87171', label: 'ค่าไฟฟ้า',    val: d?.elec?.rooms ? `${fmt(d.elec.rooms)} ห้อง` : '—' },
      { color: '#60a5fa', label: 'ค่าน้ำ',     val: d?.water?.rooms ? `${fmt(d.water.rooms)} ห้อง` : '—' },
      { color: '#34d399', label: 'ค่าส่วนกลาง', val: d?.common?.totalAmt ? `${fmt(d.common.totalAmt)} บาท` : '—' },
    ],
    all:     [
      { color: '#f87171', label: 'ค่าไฟฟ้า',   val: `${d?.elec?.projects || 0} โครงการ · ${fmt(d?.elec?.rooms)} ห้อง` },
      { color: '#60a5fa', label: 'ค่าน้ำ',    val: `${d?.water?.projects || 0} โครงการ · ${fmt(d?.water?.rooms)} ห้อง` },
      { color: '#34d399', label: 'ค่าส่วนกลาง', val: `${d?.common?.projects || 0} โครงการ · ${fmt(d?.common?.totalAmt)} บาท` },
    ],
  }
  const rows = (modeRows[mode] || modeRows.all).filter(r => r.val !== '0 รายการ' || mode !== 'project')

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-3.5 text-xs min-w-[190px] border border-white/10">
      <div className="font-bold text-white mb-2.5 text-sm flex items-center gap-2">
        <CalendarDays size={13} className="text-red-400" />{label}
      </div>
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
            <span className="text-white/60">{r.label}</span>
          </div>
          <span className="font-bold text-white text-[11px]">{r.val}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-white/10 text-white/30 text-center text-[10px]">คลิกเพื่อกรองเดือน</div>
    </div>
  )
}

/* ━━━ Project Drawer ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ProjectDrawer({ projectId, onClose }) {
  const proj = RAW.elec.find(r => r.project_id === projectId)
             || RAW.water.find(r => r.project_id === projectId)
             || RAW.common.find(r => r.project_id === projectId)
  const hist = getProjectHistory(projectId)
  const hasElec   = hist.elec.length > 0
  const hasWater  = hist.water.length > 0
  const hasCommon = hist.common.length > 0
  const totalAmt  = hist.common.reduce((s,r) => s + COMMON_FEE_KEYS.reduce((a,k) => a + r[k.key].amount, 0), 0)

  const Section = ({ title, icon: Ic, color, badge, children }) => (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100">
      <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ borderColor: `${color}20`, background: `${color}08` }}>
        <Ic size={13} style={{ color }} />
        <span className="font-bold text-xs" style={{ color }}>{title}</span>
        {badge && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: color }}>{badge}</span>}
      </div>
      {children}
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]" onClick={onClose}
        style={{ animation: 'fadeIn 0.15s ease' }} />
      <div className="fixed right-0 top-0 h-full z-50 flex flex-col bg-white"
        style={{ width: 440, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', animation: 'slideIn 0.2s ease' }}>

        <div className="px-5 py-4 shrink-0" style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm leading-tight">{proj?.project || projectId}</div>
              <div className="text-slate-500 font-mono text-[10px] mt-0.5">{projectId}</div>
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {hasElec && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/30">⚡ {hist.elec.length} ครั้ง · {fmt(hist.elec.reduce((s,r) => s + r.rooms, 0))} ห้อง</span>}
                {hasWater && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">💧 {hist.water.length} ครั้ง · {fmt(hist.water.reduce((s,r) => s + r.rooms, 0))} ห้อง</span>}
                {hasCommon && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🏢 {fmt(totalAmt)} บาท</span>}
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0">
              <X size={14} className="text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/80">
          {hasElec && (
            <Section title="ประวัติค่าไฟฟ้า" icon={Zap} color="#f56565" badge={`${hist.elec.length} รายการ`}>
              <table className="w-full text-[11px]">
                <thead><tr className="text-slate-400 font-bold bg-slate-50/80">
                  <th className="px-4 py-1.5 text-left">วันที่</th><th className="px-4 py-1.5 text-right">ห้อง</th><th className="px-4 py-1.5 text-left">เอกสาร</th>
                </tr></thead>
                <tbody>{hist.elec.map((r, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-red-50/40 transition-colors">
                    <td className="px-4 py-2 text-slate-500">{r.date}</td>
                    <td className="px-4 py-2 text-right font-bold text-red-600">{fmt(r.rooms)}</td>
                    <td className="px-4 py-2 font-mono text-slate-400 text-[9px]">{r.doc}</td>
                  </tr>
                ))}</tbody>
              </table>
            </Section>
          )}
          {hasWater && (
            <Section title="ประวัติค่าน้ำ" icon={Droplets} color="#3b82f6" badge={`${hist.water.length} รายการ`}>
              <table className="w-full text-[11px]">
                <thead><tr className="text-slate-400 font-bold bg-slate-50/80">
                  <th className="px-4 py-1.5 text-left">วันที่</th><th className="px-4 py-1.5 text-right">ห้อง</th>
                </tr></thead>
                <tbody>{hist.water.map((r, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-2 text-slate-500">{r.date}</td>
                    <td className="px-4 py-2 text-right font-bold text-blue-600">{fmt(r.rooms)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </Section>
          )}
          {hasCommon && (
            <Section title="ค่าส่วนกลาง" icon={Building2} color="#10b981">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead><tr className="text-slate-400 font-bold bg-slate-50/80">
                    <th className="px-3 py-1.5 text-left whitespace-nowrap">เดือน</th>
                    {COMMON_FEE_KEYS.map(k => <th key={k.key} className="px-2 py-1.5 text-right whitespace-nowrap" style={{ color: k.color }}>{k.label}</th>)}
                    <th className="px-3 py-1.5 text-right text-emerald-500">รวม</th>
                  </tr></thead>
                  <tbody>{hist.common.map((r, i) => {
                    const t = COMMON_FEE_KEYS.reduce((s,k) => s + r[k.key].amount, 0)
                    return (
                      <tr key={i} className="border-t border-slate-50 hover:bg-emerald-50/40 transition-colors">
                        <td className="px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">{MONTHS_TH[r.month] || r.date}</td>
                        {COMMON_FEE_KEYS.map(k => (
                          <td key={k.key} className="px-2 py-2 text-right">
                            {r[k.key].amount > 0 ? <span className="font-semibold text-slate-700">{fmt(r[k.key].amount)}</span> : <span className="text-slate-300">—</span>}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-right font-extrabold text-emerald-600">{fmt(t)}</td>
                      </tr>
                    )
                  })}</tbody>
                </table>
              </div>
            </Section>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </>
  )
}

/* ━━━ Sort helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <span className="text-slate-300 ml-0.5 text-[9px]">⇅</span>
  return sortDir === 'asc'
    ? <ChevronUp size={10} className="inline ml-0.5 text-red-500" />
    : <ChevronDn size={10} className="inline ml-0.5 text-red-500" />
}

/* ━━━ Pagination ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Pagination({ page, totalPages, total, onPage }) {
  if (totalPages <= 1) return null

  const pages = []
  const show = 5
  let start = Math.max(1, page - Math.floor(show / 2))
  let end = Math.min(totalPages, start + show - 1)
  if (end - start < show - 1) start = Math.max(1, end - show + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 shrink-0">
      <div className="text-[11px] text-slate-400 font-medium">
        ทั้งหมด <span className="font-bold text-slate-600">{fmt(total)}</span> รายการ · หน้า {page}/{totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)} disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition">
          <ChevronsLeft size={13} />
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition">
          <ChevronLeft size={13} />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              p === page ? 'bg-red-500 text-white shadow-sm shadow-red-500/25' : 'text-slate-500 hover:bg-slate-100'
            }`}>{p}</button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition">
          <ChevronRight size={13} />
        </button>
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition">
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  )
}

/* ━━━ Records Table with tabs + pagination ━━━━━━━━━━━━━ */
const REC_TABS = [
  { id: 'elec',   label: 'ค่าไฟฟ้า',   icon: Zap,       color: '#f56565' },
  { id: 'water',  label: 'ค่าน้ำ',      icon: Droplets,  color: '#3b82f6' },
  { id: 'common', label: 'ค่าส่วนกลาง', icon: Building2, color: '#10b981' },
]

function RecordsTable({ selectedMonths, searchQuery, selectedProject, onProjectClick, forceTab }) {
  const [tab, setTab]         = useState('elec')
  const [sortCol, setSortCol] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage]       = useState(1)

  // Sync tab to forceTab (from type filter)
  const activeTab = forceTab || tab

  const elecRows   = useMemo(() => getElec(selectedMonths, searchQuery).filter(r => !selectedProject || r.project_id === selectedProject), [selectedMonths, searchQuery, selectedProject])
  const waterRows  = useMemo(() => getWater(selectedMonths, searchQuery).filter(r => !selectedProject || r.project_id === selectedProject), [selectedMonths, searchQuery, selectedProject])
  const commonRows = useMemo(() => getCommon(selectedMonths, searchQuery).filter(r => !selectedProject || r.project_id === selectedProject), [selectedMonths, searchQuery, selectedProject])
  const counts = { elec: elecRows.length, water: waterRows.length, common: commonRows.length }

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  function changeTab(t) {
    setTab(t); setSortCol('date'); setSortDir('desc'); setPage(1)
  }

  const sorted = rows => [...rows].sort((a, b) => {
    let va = a[sortCol] ?? '', vb = b[sortCol] ?? ''
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
  })

  const TH = ({ col, children, right }) => (
    <th onClick={() => handleSort(col)}
      className={`px-4 py-2.5 select-none cursor-pointer text-slate-600 hover:text-slate-800 transition-colors whitespace-nowrap uppercase tracking-wider text-[11px] font-bold ${right ? 'text-right' : 'text-left'}`}>
      {children}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
    </th>
  )

  const allRows = activeTab === 'elec' ? elecRows : activeTab === 'water' ? waterRows : commonRows
  const sortedAll = sorted(allRows)
  const totalPages = Math.max(1, Math.ceil(sortedAll.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = sortedAll.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Show all tabs or only the forced one
  const visibleTabs = forceTab ? REC_TABS.filter(t => t.id === forceTab) : REC_TABS

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-100 h-full">
      <div className="flex items-center gap-0.5 px-4 pt-3 pb-0 shrink-0 border-b border-slate-100">
        {visibleTabs.map(t => {
          const active = activeTab === t.id
          const Ic = t.icon
          return (
            <button key={t.id} onClick={() => changeTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                active ? 'border-current' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`} style={active ? { color: t.color } : {}}>
              <Ic size={12} />
              {t.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                active ? 'text-white' : 'bg-slate-100 text-slate-400'
              }`} style={active ? { background: t.color } : {}}>
                {counts[t.id]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="overflow-auto flex-1">
        {activeTab === 'elec' && (
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
              <tr className="text-slate-600">
                <TH col="date">วันที่</TH><TH col="project">โครงการ</TH><TH col="project_id">รหัส</TH><TH col="rooms" right>ห้อง</TH><TH col="doc">เอกสาร</TH>
              </tr>
            </thead>
            <tbody>{pageRows.map((r, i) => (
              <tr key={i} onClick={() => onProjectClick(r.project_id)}
                className="border-t border-slate-50 cursor-pointer hover:bg-red-50/50 transition-colors group">
                <td className="px-4 py-2.5 text-slate-600 font-semibold text-xs whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2.5 text-slate-700 font-semibold max-w-[220px] truncate group-hover:text-red-600 transition-colors">{r.project}</td>
                <td className="px-4 py-2.5"><span className="font-mono text-xs bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">{r.project_id}</span></td>
                <td className="px-4 py-2.5 text-right"><span className="font-extrabold text-red-600">{fmt(r.rooms)}</span></td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{r.doc || '—'}</td>
              </tr>
            ))}
            {pageRows.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-300">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'water' && (
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
              <tr className="text-slate-600">
                <TH col="date">วันที่</TH><TH col="project">โครงการ</TH><TH col="project_id">รหัส</TH><TH col="rooms" right>ห้อง</TH>
              </tr>
            </thead>
            <tbody>{pageRows.map((r, i) => (
              <tr key={i} onClick={() => onProjectClick(r.project_id)}
                className="border-t border-slate-50 cursor-pointer hover:bg-blue-50/50 transition-colors group">
                <td className="px-4 py-2.5 text-slate-600 font-semibold text-xs whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2.5 text-slate-700 font-semibold max-w-[220px] truncate group-hover:text-blue-600 transition-colors">{r.project}</td>
                <td className="px-4 py-2.5"><span className="font-mono text-xs bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">{r.project_id}</span></td>
                <td className="px-4 py-2.5 text-right"><span className="font-extrabold text-blue-600">{fmt(r.rooms)}</span></td>
              </tr>
            ))}
            {pageRows.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-300">ไม่มีข้อมูล</td></tr>}
            </tbody>
          </table>
        )}

        {activeTab === 'common' && (
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
              <tr className="text-slate-600 font-bold">
                <th className="px-4 py-2.5 text-left uppercase tracking-wider text-[11px]">เดือน</th>
                <TH col="project">โครงการ</TH>
                <th className="px-4 py-2.5 text-left uppercase tracking-wider text-[11px]">รหัส</th>
                {COMMON_FEE_KEYS.map(k => <th key={k.key} className="px-2.5 py-2.5 text-right whitespace-nowrap text-[11px] font-bold text-slate-600">{k.label}</th>)}
                <th className="px-4 py-2.5 text-right text-emerald-500 uppercase tracking-wider text-[11px] font-bold">รวม</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => {
                const t = COMMON_FEE_KEYS.reduce((s,k) => s + r[k.key].amount, 0)
                return (
                  <tr key={i} onClick={() => onProjectClick(r.project_id)}
                    className="border-t border-slate-50 cursor-pointer hover:bg-emerald-50/50 transition-colors group">
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap font-semibold">{MONTHS_TH[r.month] || r.date}</td>
                    <td className="px-4 py-2.5 text-slate-700 font-semibold max-w-[160px] truncate group-hover:text-emerald-600 transition-colors">{r.project}</td>
                    <td className="px-4 py-2.5"><span className="font-mono text-xs bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">{r.project_id}</span></td>
                    {COMMON_FEE_KEYS.map(k => (
                      <td key={k.key} className="px-2.5 py-2.5 text-right">
                        {r[k.key].amount > 0 ? <span className="font-semibold text-slate-700">{fmt(r[k.key].amount)}</span> : <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right font-extrabold text-emerald-600">{fmt(t)}</td>
                  </tr>
                )
              })}
              {pageRows.length === 0 && <tr><td colSpan={10} className="text-center py-10 text-slate-300">ไม่มีข้อมูล</td></tr>}
              {sortedAll.length > 0 && (
                <tr className="border-t-2 border-emerald-200 bg-emerald-50/50 sticky bottom-0">
                  <td colSpan={3} className="px-4 py-2.5 font-bold text-slate-600 text-xs">รวมทั้งหมด ({sortedAll.length} รายการ)</td>
                  {COMMON_FEE_KEYS.map(k => <td key={k.key} className="px-2.5 py-2.5 text-right font-bold text-xs text-slate-700">{fmt(sortedAll.reduce((s,r) => s + r[k.key].amount, 0))}</td>)}
                  <td className="px-4 py-2.5 text-right font-extrabold text-emerald-600 text-xs">{fmt(sortedAll.reduce((s,r) => s + COMMON_FEE_KEYS.reduce((a,k) => a + r[k.key].amount, 0), 0))}</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={safePage} totalPages={totalPages} total={sortedAll.length} onPage={setPage} />
    </div>
  )
}

/* ━━━ Project Detail Card (when a project is selected) ━━━ */
function ProjectDetailCard({ projectId, selectedMonths }) {
  const hist = useMemo(() => getProjectHistory(projectId), [projectId])
  const projName =
    hist.elec[0]?.project || hist.water[0]?.project || hist.common[0]?.project || projectId

  // KPIs scoped to the selectedMonths filter (or all if none selected)
  const inScope = (month) => selectedMonths.length === 0 || selectedMonths.includes(month)
  const elecRooms   = hist.elec.filter(r => inScope(r.month)).reduce((s,r)=>s+r.rooms,0)
  const waterRooms  = hist.water.filter(r => inScope(r.month)).reduce((s,r)=>s+r.rooms,0)
  const commonScope = hist.common.filter(r => inScope(r.month))
  const commonAmt   = commonScope.reduce((s,r)=>s+COMMON_FEE_KEYS.reduce((a,k)=>a+r[k.key].amount,0),0)

  // Trend across ALL months (not filtered) so user always sees pattern
  const trend = ALL_MONTHS.map(m => {
    const e = hist.elec.filter(r => r.month === m).reduce((s,r)=>s+r.rooms,0)
    const w = hist.water.filter(r => r.month === m).reduce((s,r)=>s+r.rooms,0)
    const c = hist.common
      .filter(r => r.month === m)
      .reduce((s,r)=>s+COMMON_FEE_KEYS.reduce((a,k)=>a+r[k.key].amount,0), 0)
    return { month: m, label: MONTHS_TH[m], elec: e, water: w, common: c }
  })

  // Common-fee breakdown for scoped months — sum per category
  const breakdown = COMMON_FEE_KEYS.map(k => ({
    key: k.key,
    label: k.label,
    color: k.color,
    amount: commonScope.reduce((s,r)=>s+r[k.key].amount,0),
  })).filter(b => b.amount > 0).sort((a,b)=>b.amount-a.amount)
  const breakdownTotal = breakdown.reduce((s,b)=>s+b.amount,0) || 1

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3" style={{ minHeight: 280 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Building2 size={14} className="text-indigo-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-xs truncate">
              {projName} <span className="text-indigo-400 font-semibold">· {projectId}</span>
            </h3>
            <p className="text-[10px] text-slate-400">รายละเอียดโครงการ</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <MiniStat color="#f56565" icon={Zap}       value={fmt(elecRooms)}  unit="ห้อง" />
          <MiniStat color="#3b82f6" icon={Droplets}  value={fmt(waterRooms)} unit="ห้อง" />
          <MiniStat color="#10b981" icon={Building2} value={fmt(commonAmt)}  unit="บาท" />
        </div>
      </div>

      {/* Body: trend (left) + breakdown (right) */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Trend */}
        <div className="flex flex-col min-h-0">
          <div className="text-[10px] font-bold text-slate-500 mb-1">แนวโน้มรายเดือน</div>
          <div className="flex-1" style={{ minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} barSize={8} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rooms" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={22} allowDecimals={false} />
                <YAxis yAxisId="amt" orientation="right"
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                  tick={{ fontSize: 9, fill: '#10b981' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(v, n) => [n === 'ค่าส่วนกลาง' ? `${fmt(v)} บาท` : `${fmt(v)} ห้อง`, n]}
                />
                <Bar  yAxisId="rooms" dataKey="elec"   name="ไฟฟ้า"     fill="#f56565" radius={[3,3,0,0]} />
                <Bar  yAxisId="rooms" dataKey="water"  name="น้ำ"         fill="#3b82f6" radius={[3,3,0,0]} />
                <Line yAxisId="amt"   dataKey="common" name="ค่าส่วนกลาง"
                  type="monotone" stroke="#10b981" strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col min-h-0">
          <div className="text-[10px] font-bold text-slate-500 mb-1">
            สัดส่วนค่าส่วนกลาง · {fmt(breakdownTotal)} บาท
          </div>
          {breakdown.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400">
              ไม่มีข้อมูลค่าส่วนกลางในช่วงที่เลือก
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1" style={{ minHeight: 180 }}>
              {breakdown.map(b => {
                const pct = (b.amount / breakdownTotal) * 100
                return (
                  <div key={b.key}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="font-semibold text-slate-700 truncate">{b.label}</span>
                      <span className="font-bold tabular-nums text-slate-600 shrink-0 ml-2">
                        {fmt(b.amount)} <span className="text-slate-400 font-normal">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: b.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniStat({ color, icon: Icon, value, unit }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: color + '14' }}>
      <Icon size={11} style={{ color }} />
      <div className="leading-tight">
        <div className="text-[11px] font-black tabular-nums" style={{ color }}>{value}</div>
        <div className="text-[8px] font-bold text-slate-400">{unit}</div>
      </div>
    </div>
  )
}

/* ━━━ Single-Month Top Projects (when exactly 1 month selected, no project) ━━━ */
function SingleMonthTopCard({ month, selectedType, onSelectProject }) {
  const monthLabel = MONTHS_TH[month] || month

  // Build per-source top lists
  const top = useMemo(() => {
    const build = (records, valKey) => {
      const map = {}
      records.forEach(r => {
        if (!map[r.project_id]) map[r.project_id] = { id: r.project_id, name: r.project, value: 0 }
        map[r.project_id].value += valKey === 'amount'
          ? COMMON_FEE_KEYS.reduce((s,k)=>s+r[k.key].amount, 0)
          : r.rooms
      })
      return Object.values(map).sort((a,b)=>b.value-a.value).slice(0, 10)
    }
    return {
      elec:   build(RAW.elec.filter(r => r.month === month), 'rooms'),
      water:  build(RAW.water.filter(r => r.month === month), 'rooms'),
      common: build(RAW.common.filter(r => r.month === month), 'amount'),
    }
  }, [month])

  // Pick which source to show: respect KPI filter, else default to one with most data
  const source = selectedType || (
    top.elec.length >= top.water.length && top.elec.length >= top.common.length ? 'elec' :
    top.water.length >= top.common.length ? 'water' : 'common'
  )
  const cfg = {
    elec:   { label: 'ค่าไฟฟ้า',     unit: 'ห้อง', color: '#f56565', icon: Zap },
    water:  { label: 'ค่าน้ำ',         unit: 'ห้อง', color: '#3b82f6', icon: Droplets },
    common: { label: 'ค่าส่วนกลาง',   unit: 'บาท',  color: '#10b981', icon: Building2 },
  }[source]
  const list = top[source]
  const max = Math.max(...list.map(p => p.value), 1)
  const Icon = cfg.icon

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col" style={{ minHeight: 280 }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.color + '14' }}>
            <Icon size={14} style={{ color: cfg.color }} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-xs">
              Top 10 โครงการ · {cfg.label}
              <span className="ml-1.5 text-slate-400">· {monthLabel}</span>
            </h3>
            <p className="text-[10px] text-slate-400">คลิกเพื่อดูรายละเอียดโครงการ</p>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400">หน่วย: {cfg.unit}</div>
      </div>

      {list.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400">
          ไม่มีข้อมูลในเดือนนี้
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
          {list.map((p, i) => {
            const pct = (p.value / max) * 100
            return (
              <button key={p.id} onClick={() => onSelectProject(p.id)}
                className="text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ background: cfg.color + '20', color: cfg.color }}>{i+1}</span>
                    <span className="font-bold text-slate-700 truncate group-hover:text-slate-900">{p.name}</span>
                  </div>
                  <span className="font-black tabular-nums shrink-0 ml-2" style={{ color: cfg.color }}>{fmt(p.value)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-7">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}cc)` }} />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ━━━ Main Dashboard ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Dashboard({ selectedMonths, searchQuery, selectedType, onSelectType, selectedProject, onSelectProject, onSelectMonth }) {
  const [drawerProject, setDrawerProject] = useState(null)

  const stats    = useMemo(() => getMonthlyStats(selectedMonths, selectedProject), [selectedMonths, selectedProject])
  const topElec  = useMemo(() => getTopProjects('elec', selectedMonths).slice(0, 6), [selectedMonths])
  const topWater = useMemo(() => getTopProjects('water', selectedMonths).slice(0, 6), [selectedMonths])
  const [topTab, setTopTab] = useState('elec')

  const allElec   = useMemo(() => getElec(selectedMonths, '').filter(r => !selectedProject || r.project_id === selectedProject), [selectedMonths, selectedProject])
  const allWater  = useMemo(() => getWater(selectedMonths, '').filter(r => !selectedProject || r.project_id === selectedProject), [selectedMonths, selectedProject])
  const allCommon = useMemo(() => getCommon(selectedMonths, '').filter(r => !selectedProject || r.project_id === selectedProject), [selectedMonths, selectedProject])

  const sumElecProj   = new Set(allElec.map(r => r.project_id)).size
  const sumElecRooms  = allElec.reduce((s,r) => s + r.rooms, 0)
  const sumWaterProj  = new Set(allWater.map(r => r.project_id)).size
  const sumWaterRooms = allWater.reduce((s,r) => s + r.rooms, 0)
  const sumCommonProj = new Set(allCommon.map(r => r.project_id)).size
  const sumCommonAmt  = allCommon.reduce((s,r) => s + COMMON_FEE_KEYS.reduce((a,k) => a + r[k.key].amount, 0), 0)
  const maxElecRooms  = Math.max(...topElec.map(p => p.totalRooms), 1)
  const maxWaterRooms = Math.max(...topWater.map(p => p.totalRooms), 1)

  function handleBarClick(data) {
    if (!data?.activeLabel) return
    const m = Object.keys(MONTHS_TH).find(k => MONTHS_TH[k] === data.activeLabel)
    if (m) onSelectMonth(m)
  }

  function handleKpiClick(type) {
    onSelectType(selectedType === type ? null : type)
  }

  function handleProjectClick(projectId) {
    setDrawerProject(projectId)
  }

  return (
    <div className="flex-1 overflow-auto min-h-0" style={{ background: 'linear-gradient(180deg,#f8fafc 0%,#eef4f3 100%)' }}>
      <div className="p-3 flex flex-col gap-2 max-w-[1600px] mx-auto">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-3 gap-3">
          <KpiCard type="elec"   icon={Zap}       label="ค่าไฟฟ้า"    value={sumElecProj}  unit="โครงการ" sub={`${fmt(sumElecRooms)} ห้อง`} active={selectedType === 'elec'} onClick={() => handleKpiClick('elec')} />
          <KpiCard type="water"  icon={Droplets}  label="ค่าน้ำ"       value={sumWaterProj} unit="โครงการ" sub={`${fmt(sumWaterRooms)} ห้อง`} active={selectedType === 'water'} onClick={() => handleKpiClick('water')} />
          <KpiCard type="common" icon={Building2} label="ค่าส่วนกลาง"  value={sumCommonProj} unit="โครงการ" sub={`${fmt(sumCommonAmt)} บาท`} active={selectedType === 'common'} onClick={() => handleKpiClick('common')} />
        </div>

        {/* ── Chart + Top Projects (balanced) ── */}
        <div className="grid gap-2" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          {/* Chart / Detail / Single-month */}
          {selectedProject ? (
            <ProjectDetailCard projectId={selectedProject} selectedMonths={selectedMonths} />
          ) : selectedMonths.length === 1 ? (
            <SingleMonthTopCard month={selectedMonths[0]} selectedType={selectedType} onSelectProject={handleProjectClick} />
          ) : (() => {
            // When a project is selected → show record counts per type per month
            const projMode = !!selectedProject
            const chartMode = selectedType || 'all'
            const projName = selectedProject
              ? (RAW.elec.find(r => r.project_id === selectedProject) ||
                 RAW.water.find(r => r.project_id === selectedProject) ||
                 RAW.common.find(r => r.project_id === selectedProject))?.project
              : null

            const CONFIG = {
              all:    { title: 'จำนวนโครงการต่อเดือน',          sub: 'คลิกแท่งเพื่อกรองเดือน',                        iconBg: 'bg-red-50',    icon: 'text-red-500' },
              elec:   { title: 'จำนวนห้องค่าไฟฟ้าต่อเดือน',     sub: 'หน่วย: ห้อง',                                   iconBg: 'bg-red-50',    icon: 'text-red-500' },
              water:  { title: 'จำนวนห้องค่าน้ำต่อเดือน',        sub: 'หน่วย: ห้อง',                                   iconBg: 'bg-blue-50', icon: 'text-blue-500' },
              common: { title: 'ยอดค่าส่วนกลางต่อเดือน',         sub: 'หน่วย: พัน (×1,000 บาท)',                       iconBg: 'bg-emerald-50',   icon: 'text-emerald-500' },
              project:{ title: 'สรุปรายเดือน',                   sub: 'แท่ง = ห้อง (ไฟ/น้ำ) · เส้น = ค่าส่วนกลาง',    iconBg: 'bg-indigo-50',  icon: 'text-indigo-500' },
            }
            const cfgKey = projMode ? 'project' : chartMode
            const cfg = CONFIG[cfgKey]

            // Legend config
            const legendAll = projMode
              ? [
                  { color: '#f56565', shape: 'bar',  label: 'ไฟฟ้า (ห้อง)',    active: !selectedType || selectedType === 'elec' },
                  { color: '#3b82f6', shape: 'bar',  label: 'น้ำ (ห้อง)',       active: !selectedType || selectedType === 'water' },
                  { color: '#10b981', shape: 'line', label: 'ส่วนกลาง (บาท)', active: !selectedType || selectedType === 'common' },
                ]
              : [
                  { color: '#f56565', shape: 'bar', label: 'ไฟฟ้า',     active: chartMode === 'all' || chartMode === 'elec' },
                  { color: '#3b82f6', shape: 'bar', label: 'น้ำ',        active: chartMode === 'all' || chartMode === 'water' },
                  { color: '#10b981', shape: 'bar', label: 'ส่วนกลาง',  active: chartMode === 'all' || chartMode === 'common' },
                ]

            const yFmt = (!projMode && chartMode === 'common')
              ? v => (v >= 1000 ? `${(v/1000).toFixed(0)}M` : v >= 1 ? `${v.toFixed(0)}K` : v)
              : v => v
            const y2Fmt = v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v

            const tooltipMode = projMode ? 'project' : chartMode

            return (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex flex-col" style={{ minHeight: 260 }}>
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
                      <BarChart3 size={14} className={cfg.icon} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {cfg.title}
                        {projName && <span className="ml-1.5 text-indigo-500">· {projName}</span>}
                      </h3>
                      <p className="text-xs text-slate-500">{cfg.sub}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {legendAll.map(l => (
                      <div key={l.label} className={`flex items-center gap-1 text-[11px] font-bold transition-all ${
                        l.active ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        {l.shape === 'line'
                          ? <span className="w-4 h-0.5 rounded-full transition-all inline-block" style={{ background: l.active ? l.color : '#e2e8f0' }} />
                          : <span className="w-2 h-2 rounded-sm transition-all" style={{ background: l.active ? l.color : '#e2e8f0' }} />
                        }{l.label}
                      </div>
                    ))}
                    {(selectedType || selectedProject) && (
                      <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-500 border border-red-100">Filtered</span>
                    )}
                  </div>
                </div>

                <div className="flex-1" style={{ minHeight: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {projMode ? (
                      /* PROJECT MODE: bars for rooms (elec/water) + line for common amount */
                      <ComposedChart
                        key={'project' + selectedProject}
                        data={stats}
                        barSize={10} barGap={2} barCategoryGap="22%"
                        onClick={handleBarClick} style={{ cursor: 'pointer' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        {/* Left Y: rooms */}
                        <YAxis yAxisId="rooms" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                        {/* Right Y: common amount */}
                        <YAxis yAxisId="amt" orientation="right" tickFormatter={y2Fmt} tick={{ fontSize: 10, fill: '#10b981' }} axisLine={false} tickLine={false} width={36} />
                        <Tooltip content={<ChartTooltip mode={tooltipMode} />} cursor={{ fill: '#f8fafc', radius: 4 }} />

                        {(!selectedType || selectedType === 'elec') && (
                          <Bar yAxisId="rooms" dataKey="elec.rooms" radius={[4,4,0,0]} name="ค่าไฟฟ้า">
                            {stats.map(m => <Cell key={m.month} fill="#f56565" opacity={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? 1 : 0.15} />)}
                          </Bar>
                        )}
                        {(!selectedType || selectedType === 'water') && (
                          <Bar yAxisId="rooms" dataKey="water.rooms" radius={[4,4,0,0]} name="ค่าน้ำ">
                            {stats.map(m => <Cell key={m.month} fill="#3b82f6" opacity={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? 1 : 0.15} />)}
                          </Bar>
                        )}
                        {(!selectedType || selectedType === 'common') && (
                          <Line yAxisId="amt" type="monotone" dataKey="common.totalAmt"
                            stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: '#10b981' }} name="ค่าส่วนกลาง"
                          />
                        )}
                      </ComposedChart>
                    ) : (
                      /* NORMAL MODE */
                      <BarChart
                        key={cfgKey + (selectedProject || '')}
                        data={stats}
                        barSize={chartMode === 'all' ? 10 : 18}
                        barGap={2} barCategoryGap="22%"
                        onClick={handleBarClick} style={{ cursor: 'pointer' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={yFmt} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                        <Tooltip content={<ChartTooltip mode={tooltipMode} />} cursor={{ fill: '#f8fafc', radius: 4 }} />

                        {chartMode === 'all' && (
                          <>
                            <Bar dataKey="elec.projects" radius={[4,4,0,0]} name="ค่าไฟฟ้า">
                              {stats.map(m => <Cell key={m.month} fill="#f56565" opacity={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? 1 : 0.15} />)}
                            </Bar>
                            <Bar dataKey="water.projects" radius={[4,4,0,0]} name="ค่าน้ำ">
                              {stats.map(m => <Cell key={m.month} fill="#3b82f6" opacity={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? 1 : 0.15} />)}
                            </Bar>
                            <Bar dataKey="common.projects" radius={[4,4,0,0]} name="ค่าส่วนกลาง">
                              {stats.map(m => <Cell key={m.month} fill="#10b981" opacity={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? 1 : 0.15} />)}
                            </Bar>
                          </>
                        )}
                        {chartMode === 'elec' && (
                          <Bar dataKey="elec.rooms" radius={[6,6,0,0]} name="จำนวนห้อง">
                            {stats.map(m => <Cell key={m.month} fill={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? '#f56565' : '#fecaca'} />)}
                          </Bar>
                        )}
                        {chartMode === 'water' && (
                          <Bar dataKey="water.rooms" radius={[6,6,0,0]} name="จำนวนห้อง">
                            {stats.map(m => <Cell key={m.month} fill={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? '#3b82f6' : '#bfdbfe'} />)}
                          </Bar>
                        )}
                        {chartMode === 'common' && (
                          <Bar dataKey={d => (d.common?.totalAmt || 0) / 1000} radius={[6,6,0,0]} name="ยอดรวม (พัน)">
                            {stats.map(m => <Cell key={m.month} fill={selectedMonths.length === 0 || selectedMonths.includes(m.month) ? '#10b981' : '#6ee7b7'} />)}
                          </Bar>
                        )}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )
          })()}

          {/* Top Projects — tabbed */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden" style={{ minHeight: 280 }}>
            {/* tab header */}
            <div className="px-4 pt-3 pb-0 shrink-0 border-b border-slate-100 flex items-center gap-0.5">
              {[{id:'elec',label:'Top ค่าไฟฟ้า',icon:Zap,color:'#f56565'},{id:'water',label:'Top ค่าน้ำ',icon:Droplets,color:'#3b82f6'}].map(t => {
                const Ic = t.icon; const active = topTab === t.id
                return (
                  <button key={t.id} onClick={() => setTopTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-t-lg transition-all border-b-2 ${
                      active ? 'border-current' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`} style={active ? { color: t.color } : {}}>
                    <Ic size={13} />{t.label}
                  </button>
                )
              })}
              <div className="ml-auto flex items-center gap-1 text-xs text-slate-500 mb-2 font-semibold">
                <TrendingUp size={12} /><span>เรียงตามจำนวนครั้ง</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(() => {
                const list = topTab === 'elec' ? topElec : topWater
                const maxCount = Math.max(...list.map(p => p.count), 1)
                return list.map((p, i) => {
                  const accent = '#1f8c80'
                  const grad = 'linear-gradient(90deg,#5fc7b8 0%,#1f8c80 100%)'
                  const hoverBg = 'hover:bg-teal-50/60'
                  return (
                    <button key={p.id} onClick={() => handleProjectClick(p.id)}
                      className={`w-full px-4 py-2.5 text-left transition-all ${hoverBg} group border-b border-slate-50/80`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-black ${
                          i < 3 ? 'text-white' : 'bg-slate-100 text-slate-400'
                        }`} style={i < 3 ? { background: accent } : {}}>{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-700 truncate leading-tight transition-colors"
                            style={{}} onMouseEnter={e => e.currentTarget.style.color=accent} onMouseLeave={e => e.currentTarget.style.color=''}>{p.project}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${(p.count / maxCount) * 100}%`, background: grad }} />
                            </div>
                            <span className="text-xs font-bold shrink-0 text-right text-slate-800">{p.count} ครั้ง</span>
                          </div>
                        </div>
                        <ArrowUpRight size={11} className="text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-all" style={{ color: accent }} />
                      </div>
                    </button>
                  )
                })
              })()}
            </div>
          </div>
        </div>

        {/* ── Records Table ── */}
        <div className="flex-1 min-h-0" style={{ minHeight: 360 }}>
          <RecordsTable
            selectedMonths={selectedMonths}
            searchQuery={searchQuery}
            selectedProject={selectedProject}
            onProjectClick={handleProjectClick}
            forceTab={selectedType}
          />
        </div>
      </div>

      {drawerProject && <ProjectDrawer projectId={drawerProject} onClose={() => setDrawerProject(null)} />}
    </div>
  )
}
