import { useState } from 'react'

const SRC_COLOR = { electricity: '#3b82f6', water: '#10b981', common: '#f59e0b' }
const SRC_LABEL = { electricity: 'ค่าไฟฟ้า', water: 'ค่าน้ำ', common: 'ค่าส่วนกลาง' }

export default function Tasks({ data }) {
  const { allTasks } = data
  const [srcFilter, setSrcFilter] = useState('all')

  const filtered = (srcFilter === 'all' ? allTasks : allTasks.filter(t => t.source === srcFilter))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="p-4 w-full flex-1 min-h-0 overflow-y-auto">

      <div className="flex flex-wrap gap-2 mb-3">
        {['all', 'electricity', 'water', 'common'].map(s => (
          <button key={s} onClick={() => setSrcFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              srcFilter === s ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
            style={srcFilter === s ? { background: s === 'all' ? '#1e293b' : SRC_COLOR[s] } : {}}>
            {s === 'all' ? '📋 ทั้งหมด' : s === 'electricity' ? '⚡ ค่าไฟฟ้า' : s === 'water' ? '💧 ค่าน้ำ' : '🏢 ค่าส่วนกลาง'}
            <span className="ml-1.5 opacity-70">
              ({s === 'all' ? allTasks.length : allTasks.filter(t => t.source === s).length})
            </span>
          </button>
        ))}
        <div className="ml-auto text-sm text-slate-400 font-semibold self-center">
          แสดง {filtered.length} รายการ
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="text-xs text-slate-500 font-bold uppercase">
                <th className="px-4 py-3 text-left">วันที่</th>
                <th className="px-4 py-3 text-left">โครงการ</th>
                <th className="px-4 py-3 text-left">รหัส</th>
                <th className="px-4 py-3 text-left">ประเภท</th>
                <th className="px-4 py-3 text-right">จำนวนห้อง / ยอด</th>
                <th className="px-4 py-3 text-left">เลขที่เอกสาร</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700 max-w-[220px] truncate">{t.project}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{t.project_id}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: SRC_COLOR[t.source]+'20', color: SRC_COLOR[t.source] }}>
                      {SRC_LABEL[t.source]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-slate-500">
                    {t.amountLabel || '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{t.doc || '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">ไม่มีข้อมูลในช่วงที่เลือก</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
