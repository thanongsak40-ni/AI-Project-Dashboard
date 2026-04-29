import { useState } from 'react'
import { User, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react'
import { login } from '../lib/auth'

// Match Dashboard palette: indigo/blue gradient used in Sidebar brand + KPI accents
const BRAND = '#6366f1'        // indigo-500
const BRAND_DARK = '#4f46e5'   // indigo-600
const BRAND_ALT = '#3b82f6'    // blue-500 (gradient start, like Sidebar logo tile)

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const user = await login(username.trim(), password)
      onLoggedIn(user)
    } catch {
      setErr('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)' }}>

      {/* Subtle decorative shapes */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${BRAND_ALT}55 0%, transparent 70%)` }} />
      <div className="absolute -bottom-48 -left-32 w-[600px] h-[600px] rounded-full opacity-35 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${BRAND}55 0%, transparent 70%)` }} />

      {/* Card */}
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl px-10 py-10"
        style={{ boxShadow: '0 25px 70px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)' }}>

        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-8">
          <img src="/sena-logo.png" alt="SENA Development" className="h-32 w-auto" />
          <div className="w-12 h-0.5 rounded-full mt-5 mb-5" style={{ background: `linear-gradient(90deg, ${BRAND_ALT}, ${BRAND_DARK})` }} />
          <h2 className="text-2xl font-black text-slate-900 leading-tight">เข้าสู่ระบบ</h2>
          <p className="text-sm text-slate-500 mt-1.5">AI Automation Dashboard</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field
            label="ชื่อผู้ใช้งาน"
            icon={User}
            value={username}
            onChange={setUsername}
            placeholder="username"
            autoFocus
          />
          <Field
            label="รหัสผ่าน"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          {err && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0" /> {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{
              background: `linear-gradient(135deg, ${BRAND_ALT} 0%, ${BRAND_DARK} 100%)`,
              boxShadow: `0 8px 20px rgba(99,102,241,0.40)`,
            }}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
          <ShieldCheck size={13} />
          <span>การเชื่อมต่อนี้ได้รับการเข้ารหัสและปลอดภัย</span>
        </div>
      </div>

      <div className="relative mt-6 text-[11px] text-white/50 font-medium">
        © {year} SENA Development PCL. All rights reserved.
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, autoFocus }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-700 mb-1.5 block">{label}</span>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type={type}
          autoFocus={autoFocus}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none"
          onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px rgba(99,102,241,0.18)` }}
          onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
        />
      </div>
    </label>
  )
}
