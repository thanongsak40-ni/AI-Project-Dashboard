import { useEffect, useState } from 'react'
import { Users as UsersIcon, UserPlus, Trash2, Shield, Eye, AlertCircle, X, CheckCircle2, Loader2 } from 'lucide-react'
import { getToken } from '../lib/auth'

const API_BASE = import.meta.env.VITE_API_BASE || ''

async function api(path, opts = {}) {
  const token = getToken()
  const r = await fetch(`${API_BASE}/api${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
  return data
}

export default function Users({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [toast, setToast] = useState(null)

  async function load() {
    setLoading(true); setErr('')
    try { setUsers(await api('/users')) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function flash(msg, kind = 'success') {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2800)
  }

  async function handleDelete(u) {
    try {
      await api(`/users/${u.id}`, { method: 'DELETE' })
      setConfirmDel(null)
      flash(`ลบผู้ใช้ "${u.username}" เรียบร้อย`)
      load()
    } catch (e) {
      flash(e.message, 'error')
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 16px rgba(99,102,241,0.35)' }}>
              <UsersIcon size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">จัดการผู้ใช้งาน</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">เพิ่ม / ลบ / กำหนดสิทธิ์ผู้ใช้งานระบบ</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', boxShadow: '0 6px 16px rgba(99,102,241,0.35)' }}>
            <UserPlus size={16} /> เพิ่มผู้ใช้งาน
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
              <Loader2 size={18} className="animate-spin mr-2" /> กำลังโหลด...
            </div>
          ) : err ? (
            <div className="p-6 text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-500">
              <AlertCircle size={16} className="inline mr-2" /> {err}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">ชื่อผู้ใช้</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">ชื่อ-สกุล</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">สิทธิ์</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">สร้างเมื่อ</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isMe = u.id === currentUser.id
                  return (
                    <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-bold text-slate-900">
                        {u.username}
                        {isMe && <span className="ml-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">คุณ</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{u.full_name || <span className="text-slate-300">—</span>}</td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{u.created_at}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          disabled={isMe}
                          onClick={() => setConfirmDel(u)}
                          title={isMe ? 'ลบบัญชีตัวเองไม่ได้' : 'ลบผู้ใช้'}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 size={14} /> ลบ
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">ยังไม่มีผู้ใช้งาน</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); flash('เพิ่มผู้ใช้งานเรียบร้อย'); load() }} api={api} />}
      {confirmDel && (
        <ConfirmDialog
          title="ยืนยันการลบผู้ใช้"
          message={<>คุณต้องการลบผู้ใช้ <b>{confirmDel.username}</b> ใช่หรือไม่?<br />การกระทำนี้ไม่สามารถย้อนกลับได้</>}
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => handleDelete(confirmDel)}
        />
      )}
      {toast && <Toast {...toast} />}
    </div>
  )
}

function RoleBadge({ role }) {
  const isAdmin = role === 'admin'
  const Ic = isAdmin ? Shield : Eye
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={isAdmin
        ? { background: 'rgba(99,102,241,0.12)', color: '#4338ca' }
        : { background: 'rgba(100,116,139,0.12)', color: '#475569' }}>
      <Ic size={12} /> {isAdmin ? 'Admin' : 'Viewer'}
    </span>
  )
}

function AddUserModal({ onClose, onCreated, api }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('viewer')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setSaving(true)
    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password, full_name: fullName.trim() || null, role }),
      })
      onCreated()
    } catch (e) {
      setErr(e.message === 'username already exists' ? 'มีชื่อผู้ใช้นี้อยู่แล้ว'
           : e.message.includes('8 characters') ? 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร'
           : e.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">เพิ่มผู้ใช้งานใหม่</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ModalField label="ชื่อผู้ใช้งาน *" value={username} onChange={setUsername} placeholder="username" autoFocus />
          <ModalField label="ชื่อ-สกุล" value={fullName} onChange={setFullName} placeholder="ชื่อเต็ม (ไม่บังคับ)" />
          <ModalField label="รหัสผ่าน *" value={password} onChange={setPassword} placeholder="อย่างน้อย 8 ตัวอักษร" type="password" />

          <div>
            <span className="text-xs font-bold text-slate-700 mb-1.5 block">สิทธิ์การใช้งาน *</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'viewer', label: 'Viewer', desc: 'ดูข้อมูลเท่านั้น', icon: Eye },
                { v: 'admin',  label: 'Admin',  desc: 'จัดการทุกอย่าง',   icon: Shield },
              ].map(opt => {
                const Ic = opt.icon
                const active = role === opt.v
                return (
                  <button key={opt.v} type="button" onClick={() => setRole(opt.v)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${active ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>
                      <Ic size={14} /> {opt.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">{opt.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {err && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <AlertCircle size={14} /> {err}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100">
            ยกเลิก
          </button>
          <button type="submit" disabled={saving || !username || !password}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ModalField({ label, value, onChange, placeholder, type = 'text', autoFocus }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-700 mb-1.5 block">{label}</span>
      <input
        type={type}
        autoFocus={autoFocus}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  )
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertCircle size={20} className="text-rose-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
        </div>
        <div className="text-sm text-slate-600 leading-relaxed mb-5">{message}</div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100">ยกเลิก</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700">ลบ</button>
        </div>
      </div>
    </div>
  )
}

function Toast({ msg, kind }) {
  const isErr = kind === 'error'
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white shadow-2xl animate-in"
      style={{ background: isErr ? '#e11d48' : '#059669' }}>
      {isErr ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />} {msg}
    </div>
  )
}
