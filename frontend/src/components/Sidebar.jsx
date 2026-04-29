import { LayoutDashboard, Zap, Droplets, Building2, ChevronRight, Sparkles } from 'lucide-react'

const MENU_ITEMS = [
  { id: null,      label: 'ภาพรวม',       icon: LayoutDashboard, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { id: 'elec',    label: 'ค่าไฟฟ้า',     icon: Zap,             color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { id: 'water',   label: 'ค่าน้ำประปา', icon: Droplets,        color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { id: 'common',  label: 'ค่าส่วนกลาง', icon: Building2,       color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
]

export default function Sidebar({ collapsed, onToggle, selectedType, onSelectType }) {
  return (
    <div
      className="flex flex-col shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? 56 : 220,
        background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <div className={`flex items-center gap-2.5 px-3 ${collapsed ? 'justify-center' : ''} pt-4 pb-3 border-b border-white/5`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
          <Sparkles size={17} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[13px] font-black text-white leading-tight">AI Automation</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">SENA Dashboard</div>
          </div>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">เมนูหลัก</span>
        </div>
      )}
      {collapsed && <div className="pt-3" />}

      {/* Menu items */}
      <nav className="flex-1 px-2 space-y-1">
        {MENU_ITEMS.map(item => {
          const Ic = item.icon
          const active = selectedType === item.id
          return (
            <button
              key={item.id ?? 'all'}
              onClick={() => onSelectType(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all text-left relative group ${
                active ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
              style={active ? { background: item.bg } : {}}
            >
              <Ic size={17} className="shrink-0" style={active ? { color: item.color } : {}} />
              {!collapsed && (
                <span className="text-xs font-bold truncate leading-tight">{item.label}</span>
              )}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r" style={{ background: item.color }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer / Collapse toggle */}
      <div className="p-2 border-t border-white/5 mt-auto">
        <button
          onClick={onToggle}
          title={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
        >
          <ChevronRight
            size={14}
            className="transition-transform duration-200"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
          {!collapsed && <span className="text-[10px] font-semibold">ย่อเมนู</span>}
        </button>
      </div>
    </div>
  )
}
