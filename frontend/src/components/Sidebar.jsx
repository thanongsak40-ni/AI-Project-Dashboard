import { LayoutDashboard, Zap, Droplets, Building2, ChevronRight, LogOut, Users as UsersIcon } from 'lucide-react'

const MENU_ITEMS = [
  { id: null,      label: 'ภาพรวม',       icon: LayoutDashboard, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { id: 'elec',    label: 'ค่าไฟฟ้า',     icon: Zap,             color: '#f56565', bg: 'rgba(245,101,101,0.15)' },
  { id: 'water',   label: 'ค่าน้ำประปา', icon: Droplets,        color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { id: 'common',  label: 'ค่าส่วนกลาง', icon: Building2,       color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
]

export default function Sidebar({ collapsed, onToggle, selectedType, onSelectType, view, onSelectView, user, onLogout }) {
  const isAdmin = user?.role === 'admin'
  const onDashboard = view === 'dashboard'
  return (
    <div
      className="flex flex-col shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? 56 : 220,
        background: 'linear-gradient(180deg,#0a3d39 0%,#0d4a45 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Brand */}
      <div className={`flex items-center gap-2.5 px-3 ${collapsed ? 'justify-center' : ''} pt-4 pb-3 border-b border-white/5`}>
        <div className="rounded-lg bg-white flex items-center justify-center shrink-0 p-1"
          style={{ width: collapsed ? 36 : 40, height: collapsed ? 36 : 40, boxShadow: '0 4px 14px rgba(43,179,163,0.35)' }}>
          <img src="/sena-logo.png" alt="SENA" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[13px] font-black text-white leading-tight">AI Automation</div>
            <div className="text-[9px] font-bold text-teal-200/70 uppercase tracking-[0.12em]">SENA Dashboard</div>
          </div>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-200/60">เมนูหลัก</span>
        </div>
      )}
      {collapsed && <div className="pt-3" />}

      {/* Menu items */}
      <nav className="px-2 space-y-1">
        {MENU_ITEMS.map(item => {
          const Ic = item.icon
          const active = onDashboard && selectedType === item.id
          return (
            <button
              key={item.id ?? 'all'}
              onClick={() => onSelectType(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left relative group ${
                active ? 'text-white' : 'text-teal-100/70 hover:bg-white/5 hover:text-white'
              }`}
              style={active ? { background: item.bg } : {}}
            >
              <Ic size={20} className="shrink-0" style={active ? { color: item.color } : {}} />
              {!collapsed && (
                <span className="text-sm font-bold truncate leading-tight">{item.label}</span>
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

      {/* Admin section — inline within nav area */}
      {isAdmin && (
        <div className="px-2 mt-3">
          {!collapsed && (
            <div className="px-2 pb-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-200/60">ผู้ดูแลระบบ</span>
              <span className="flex-1 h-px bg-white/5" />
            </div>
          )}
          {(() => {
            const active = view === 'users'
            const color = '#a855f7'
            const bg = 'rgba(168,85,247,0.15)'
            return (
              <button
                onClick={() => onSelectView('users')}
                title={collapsed ? 'จัดการผู้ใช้งาน' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left relative ${
                  active ? 'text-white' : 'text-teal-100/70 hover:bg-white/5 hover:text-white'
                }`}
                style={active ? { background: bg } : {}}
              >
                <UsersIcon size={20} className="shrink-0" style={active ? { color } : {}} />
                {!collapsed && <span className="text-sm font-bold truncate leading-tight">จัดการผู้ใช้งาน</span>}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                )}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r" style={{ background: color }} />
                )}
              </button>
            )
          })()}
        </div>
      )}

      {/* Bottom panel — User card + Collapse toggle */}
      <div className="mt-auto p-2.5 space-y-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
        {user && !collapsed && (
          <div className="rounded-xl p-2.5 flex items-center gap-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-black"
              style={{ background: 'linear-gradient(135deg,#2bb3a3,#1f8c80)', boxShadow: '0 4px 12px rgba(139,92,246,0.35)' }}>
              {(user.full_name || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-black text-white truncate leading-tight">{user.full_name || user.username}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                <span className="text-[10px] font-bold text-teal-200/70 uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="ออกจากระบบ"
              className="p-2 rounded-lg text-teal-100/70 hover:text-white hover:bg-rose-500/20 transition-all shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        {user && collapsed && (
          <>
            <div className="flex justify-center" title={`${user.full_name || user.username} (${user.role})`}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#2bb3a3,#1f8c80)' }}>
                {(user.full_name || user.username).charAt(0).toUpperCase()}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="ออกจากระบบ"
              className="w-full flex items-center justify-center py-2 rounded-lg text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all"
            >
              <LogOut size={15} />
            </button>
          </>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-teal-200/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronRight
            size={13}
            className="transition-transform duration-200"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          />
          {!collapsed && <span className="text-[11px] font-bold">ย่อเมนู</span>}
        </button>
      </div>
    </div>
  )
}
