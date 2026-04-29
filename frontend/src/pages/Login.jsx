import { useState } from 'react'
import { User, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { login } from '../lib/auth'

// SENA corporate teal (sampled from logo)
const BRAND = '#2bb3a3'        // teal mid
const BRAND_DARK = '#1f8c80'   // teal deep
const BRAND_ALT = '#3fc7b4'    // teal light

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
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
    <div className="w-full h-full flex bg-white">
      {/* LEFT — brand panel */}
      <div
        className="hidden lg:flex relative flex-1 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${BRAND_ALT} 0%, ${BRAND} 50%, ${BRAND_DARK} 100%)`,
        }}
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/login-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Color overlay for tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${BRAND_ALT}cc 0%, ${BRAND_DARK}dd 100%)`,
          }}
        />

        {/* Decorative blobs */}
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full opacity-40 pointer-events-none"
          style={{ background: `radial-gradient(circle, #ffffff44 0%, transparent 70%)` }} />
        <div className="absolute -bottom-48 -left-32 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle, #ffffff33 0%, transparent 70%)` }} />

        {/* Brand header (top-left) */}
        <div className="relative z-10 flex items-center gap-3 p-10">
          <div className="rounded-2xl bg-white p-2 shadow-lg" style={{ width: 64, height: 64 }}>
            <img src="/sena-logo.png" alt="SENA" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-white text-xl font-black tracking-tight">SENA Development</div>
            <div className="text-white/80 text-xs font-bold uppercase tracking-[0.15em] mt-0.5">AI Automation Dashboard</div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10 text-white/70 text-xs font-medium">
          © {year} SENA Development Public Co., Ltd.
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16 bg-white">
        <div className="w-full max-w-[420px]">

          {/* Mobile-only logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src="/sena-logo.png" alt="SENA" className="h-20 w-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 leading-tight">ยินดีต้อนรับ</h2>
            <p className="text-sm text-slate-500 mt-2">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field
              label="USERNAME"
              icon={User}
              value={username}
              onChange={setUsername}
              placeholder="กรอก username"
              autoFocus
            />

            <div>
              <label className="block">
                <span className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">PASSWORD</span>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none"
                    onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px rgba(43,179,163,0.20)` }}
                    onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>

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
                boxShadow: `0 8px 20px rgba(43,179,163,0.40)`,
              }}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, autoFocus }) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-700 mb-1.5 block tracking-wider">{label}</span>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type={type}
          autoFocus={autoFocus}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none"
          onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px rgba(43,179,163,0.20)` }}
          onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = '' }}
        />
      </div>
    </label>
  )
}
