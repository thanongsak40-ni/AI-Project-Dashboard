import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, ChevronDown, Bot, Calendar, Building, Zap, Droplets, Building2, Filter, RotateCcw } from 'lucide-react'
import { ALL_MONTHS, MONTHS_TH, getAllProjects } from '../lib/processData'
import ExportButton from './ExportButton'

/* ── Time period presets ── */
function getPresetMonths(preset) {
  const now = '2026-04' // current month in data
  const allSorted = [...ALL_MONTHS].sort()
  const idx = allSorted.indexOf(now)
  if (preset === 'this-month') return [now]
  if (preset === '3m') return allSorted.slice(Math.max(0, idx - 2), idx + 1)
  if (preset === '6m') return allSorted.slice(Math.max(0, idx - 5), idx + 1)
  if (preset === 'this-year') return allSorted.filter(m => m.startsWith('2026'))
  return []
}

const TIME_PRESETS = [
  { id: 'all',        label: 'ทั้งหมด' },
  { id: 'this-month', label: 'เดือนนี้' },
  { id: '3m',         label: '3 เดือน' },
  { id: '6m',         label: '6 เดือน' },
  { id: 'this-year',  label: 'ปีนี้' },
  { id: 'custom',     label: 'เลือกเดือน' },
]

const TYPE_OPTIONS = [
  { id: null,     label: 'ทั้งหมด',      icon: Filter,    color: '#64748b' },
  { id: 'elec',   label: 'ค่าไฟฟ้า',     icon: Zap,       color: '#3b82f6' },
  { id: 'water',  label: 'ค่าน้ำ',        icon: Droplets,  color: '#10b981' },
  { id: 'common', label: 'ค่าส่วนกลาง',  icon: Building2, color: '#f59e0b' },
]

/* ── Dropdown wrapper ── */
function Dropdown({ trigger, children, open, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [open, onClose])
  return (
    <div className="relative" ref={ref}>
      {trigger}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Month Year Grouping ── */
const MONTH_YEARS = {}
ALL_MONTHS.forEach(m => {
  const y = m.slice(0, 4)
  if (!MONTH_YEARS[y]) MONTH_YEARS[y] = []
  MONTH_YEARS[y].push(m)
})

/* ── Time Period Filter ── */
function TimePeriodFilter({ selectedMonths, onSetMonths, onToggleMonth }) {
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState('all')
  const [showCustom, setShowCustom] = useState(false)

  const label = activePreset === 'all' ? 'ทั้งหมด'
    : activePreset === 'custom'
      ? (selectedMonths.length === 0 ? 'เลือกเดือน' : `${selectedMonths.length} เดือน`)
      : TIME_PRESETS.find(p => p.id === activePreset)?.label || 'ทั้งหมด'

  function handlePreset(p) {
    setActivePreset(p.id)
    if (p.id === 'all') { onSetMonths([]); setShowCustom(false); setOpen(false) }
    else if (p.id === 'custom') { setShowCustom(true) }
    else { onSetMonths(getPresetMonths(p.id)); setShowCustom(false); setOpen(false) }
  }

  return (
    <Dropdown open={open} onClose={() => setOpen(false)}
      trigger={
        <button onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedMonths.length > 0
              ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          }`}>
          <Calendar size={12} />
          {label}
          <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      }>
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden"
        style={{ width: showCustom ? 340 : 180 }}>
        <div className="p-2 space-y-0.5 border-b border-slate-100">
          {TIME_PRESETS.map(p => (
            <button key={p.id} onClick={() => handlePreset(p)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activePreset === p.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        {showCustom && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">เลือกเดือน</span>
              <button onClick={() => { onSetMonths([]); }} className="text-[10px] text-red-400 hover:text-red-500 font-semibold">ล้าง</button>
            </div>
            {Object.entries(MONTH_YEARS).map(([y, months]) => (
              <div key={y} className="mb-2">
                <div className="text-[10px] font-bold text-slate-400 mb-1 px-0.5">ปี {y}</div>
                <div className="grid grid-cols-4 gap-1">
                  {months.map(m => (
                    <button key={m} onClick={() => { onToggleMonth(m); setActivePreset('custom') }}
                      className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                        selectedMonths.includes(m) ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}>{MONTHS_TH[m]}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dropdown>
  )
}

/* ── Project Filter ── */
function ProjectFilter({ selectedProject, onSelectProject }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const allProjects = useMemo(() => getAllProjects(), [])
  const filtered = useMemo(() => {
    if (!search) return allProjects
    const q = search.toLowerCase()
    return allProjects.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  }, [allProjects, search])

  const selectedName = selectedProject ? allProjects.find(p => p.id === selectedProject)?.name : null

  return (
    <Dropdown open={open} onClose={() => { setOpen(false); setSearch('') }}
      trigger={
        <button onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all max-w-[200px] ${
            selectedProject
              ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          }`}>
          <Building size={12} className="shrink-0" />
          <span className="truncate">{selectedName || 'ทุกโครงการ'}</span>
          <ChevronDown size={10} className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
      }>
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-[300px] overflow-hidden">
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาโครงการ..."
              autoFocus
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-slate-700" />
          </div>
        </div>
        <div className="max-h-[240px] overflow-y-auto">
          <button onClick={() => { onSelectProject(null); setOpen(false); setSearch('') }}
            className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
              !selectedProject ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
            }`}>ทุกโครงการ</button>
          {filtered.map(p => (
            <button key={p.id} onClick={() => { onSelectProject(p.id); setOpen(false); setSearch('') }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors border-t border-slate-50 ${
                selectedProject === p.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
            </button>
          ))}
          {filtered.length === 0 && <div className="px-3 py-6 text-center text-xs text-slate-300">ไม่พบโครงการ</div>}
        </div>
      </div>
    </Dropdown>
  )
}

/* ── Type Filter ── */
function TypeFilter({ selectedType, onSelectType }) {
  const [open, setOpen] = useState(false)
  const current = TYPE_OPTIONS.find(t => t.id === selectedType) || TYPE_OPTIONS[0]
  const Ic = current.icon

  return (
    <Dropdown open={open} onClose={() => setOpen(false)}
      trigger={
        <button onClick={() => setOpen(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedType
              ? 'text-white shadow-sm'
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          }`}
          style={selectedType ? { background: current.color, boxShadow: `0 2px 8px ${current.color}40` } : {}}>
          <Ic size={12} />
          {current.label}
          <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      }>
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-[180px] overflow-hidden p-1.5">
        {TYPE_OPTIONS.map(t => {
          const TIc = t.icon
          const active = selectedType === t.id
          return (
            <button key={t.id ?? 'all'} onClick={() => { onSelectType(t.id); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                active ? 'text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
              style={active ? { background: t.color } : {}}>
              <TIc size={13} style={active ? {} : { color: t.color }} />
              {t.label}
            </button>
          )
        })}
      </div>
    </Dropdown>
  )
}

/* ━━━ Main FilterBar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function FilterBar({
  selectedMonths, onToggleMonth, onSetMonths,
  searchQuery, onSearch,
  selectedType, onSelectType,
  selectedProject, onSelectProject,
}) {
  const hasAnyFilter = selectedMonths.length > 0 || selectedType || selectedProject || searchQuery

  return (
    <div className="flex items-center gap-2 px-4 py-0 shrink-0"
      style={{ background: '#0f172a', height: 52 }}>

      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0 mr-1">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
          <Bot size={16} className="text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold text-white leading-none tracking-tight">AI Automation</div>
          <div className="text-[10px] text-slate-500 leading-none mt-0.5 font-medium">SENA Dashboard</div>
        </div>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* 3 Filters */}
      <TimePeriodFilter selectedMonths={selectedMonths} onSetMonths={onSetMonths} onToggleMonth={onToggleMonth} />
      <ProjectFilter selectedProject={selectedProject} onSelectProject={onSelectProject} />
      <TypeFilter selectedType={selectedType} onSelectType={onSelectType} />

      {/* Quick search */}
      <div className="relative ml-1">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={searchQuery} onChange={e => onSearch(e.target.value)}
          placeholder="ค้นหา..."
          className="pl-8 pr-8 py-1.5 text-xs rounded-lg outline-none w-40 font-medium text-white placeholder:text-slate-500"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
        {searchQuery && (
          <button onClick={() => onSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X size={11} />
          </button>
        )}
      </div>

      {/* Reset all */}
      {hasAnyFilter && (
        <button onClick={() => { onSetMonths([]); onSelectType(null); onSelectProject(null); onSearch('') }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-300 bg-red-500/15 hover:bg-red-500/25 transition-all border border-red-500/20">
          <RotateCcw size={10} />ล้างทั้งหมด
        </button>
      )}

      {/* Export */}
      <div className="ml-auto shrink-0">
        <ExportButton
          selectedMonths={selectedMonths}
          searchQuery={searchQuery}
          selectedType={selectedType}
          selectedProject={selectedProject}
        />
      </div>
    </div>
  )
}
