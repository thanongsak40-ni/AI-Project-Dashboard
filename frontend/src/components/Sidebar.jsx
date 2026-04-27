import { Zap, ChevronRight } from 'lucide-react'

const MENU_ITEMS = [
  { id: 'utilities', label: 'ค่าสาธารณูปโภค', icon: Zap, active: true },
  // เพิ่ม AI Project อื่นๆ ในอนาคตได้ที่นี่
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <div
      className="flex flex-col shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? 52 : 200,
        background: '#0f172a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">เมนูหลัก</span>
        </div>
      )}
      {collapsed && <div className="pt-4" />}

      {/* Menu items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {MENU_ITEMS.map(item => {
          const Ic = item.icon
          return (
            <button
              key={item.id}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all text-left relative ${
                item.active
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`}
            >
              <Ic size={16} className="shrink-0" />
              {!collapsed && (
                <span className="text-xs font-semibold truncate leading-tight">{item.label}</span>
              )}
              {item.active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              )}
              {item.active && collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-blue-400" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-white/5 mt-auto">
        <button
          onClick={onToggle}
          title={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
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
