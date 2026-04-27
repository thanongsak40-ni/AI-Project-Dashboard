import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { getMonthlyStats, getTopProjects, MONTHS_TH } from '../lib/processData'

function fmt(n) { return (n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 }) }

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 flex items-center gap-3" style={{ borderColor: color }}>
      <div className="text-xl shrink-0">{icon}</div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
        <div className="text-xl font-extrabold text-slate-800 leading-tight">{value}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function MonthlyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[200px]">
      <div className="font-bold text-slate-700 mb-2">{label}</div>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-blue-500 font-semibold">⚡ ค่าไฟฟ้า</span>
          <span className="font-bold">{d?.elec?.projects || 0} โครงการ · {fmt(d?.elec?.rooms)} ห้อง</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-emerald-500 font-semibold">💧 ค่าน้ำ</span>
          <span className="font-bold">{d?.water?.projects || 0} โครงการ · {fmt(d?.water?.rooms)} ห้อง</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-amber-500 font-semibold">🏢 ค่าส่วนกลาง</span>
          <span className="font-bold">{d?.common?.projects || 0} โครงการ · {fmt(d?.common?.totalAmt)} บาท</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 text-slate-400 text-center">คลิกเพื่อกรองเดือนนี้</div>
    </div>
  )
}

export default function Overview({ selectedMonths, onSelectMonth, onGoProjects }) {
  const stats = getMonthlyStats(selectedMonths)

  const sumElecProj  = stats.reduce((s, m) => s + m.elec.projects, 0)
  const sumElecRooms = stats.reduce((s, m) => s + m.elec.rooms, 0)
  const sumWaterProj = stats.reduce((s, m) => s + m.water.projects, 0)
  const sumWaterRooms= stats.reduce((s, m) => s + m.water.rooms, 0)
  const sumCommonProj= stats.reduce((s, m) => s + m.common.projects, 0)
  const sumCommonAmt = stats.reduce((s, m) => s + m.common.totalAmt, 0)

  const topElec  = getTopProjects('elec',  selectedMonths).slice(0, 5)
  const topWater = getTopProjects('water', selectedMonths).slice(0, 5)

  function handleBarClick(data) {
    if (!data?.activeLabel) return
    const m = Object.keys(MONTHS_TH).find(k => MONTHS_TH[k] === data.activeLabel)
    if (m) onSelectMonth(m)
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: '12px', padding: '12px', height: '100%', overflow: 'hidden' }}>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
        <StatCard icon="⚡" label="ค่าไฟฟ้า"    color="#3b82f6"
          value={`${sumElecProj} โครงการ`}  sub={`${fmt(sumElecRooms)} ห้อง`} />
        <StatCard icon="💧" label="ค่าน้ำ"       color="#10b981"
          value={`${sumWaterProj} โครงการ`} sub={`${fmt(sumWaterRooms)} ห้อง`} />
        <StatCard icon="🏢" label="ค่าส่วนกลาง"  color="#f59e0b"
          value={`${sumCommonProj} โครงการ`} sub={`${fmt(sumCommonAmt)} บาท`} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-700 text-sm">📈 จำนวนโครงการต่อเดือน</h3>
          <div className="flex gap-3 text-xs">
            {[['#3b82f6','ค่าไฟฟ้า'],['#10b981','ค่าน้ำ'],['#f59e0b','ค่าส่วนกลาง']].map(([c,l])=>(
              <span key={l} className="flex items-center gap-1 font-semibold" style={{color:c}}>
                <span className="w-2 h-2 rounded-sm inline-block" style={{background:c}}/>
                {l}
              </span>
            ))}
            <span className="text-slate-400">คลิกแท่งเพื่อกรองเดือน</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={175}>
          <BarChart data={stats} barSize={14} barGap={2} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<MonthlyTooltip />} />
            <Bar dataKey="elec.projects"   name="ค่าไฟฟ้า"   radius={[3,3,0,0]}>
              {stats.map(m => <Cell key={m.month} fill="#3b82f6"
                opacity={selectedMonths.length===0||selectedMonths.includes(m.month)?1:0.3}/>)}
            </Bar>
            <Bar dataKey="water.projects"  name="ค่าน้ำ"      radius={[3,3,0,0]}>
              {stats.map(m => <Cell key={m.month} fill="#10b981"
                opacity={selectedMonths.length===0||selectedMonths.includes(m.month)?1:0.3}/>)}
            </Bar>
            <Bar dataKey="common.projects" name="ค่าส่วนกลาง" radius={[3,3,0,0]}>
              {stats.map(m => <Cell key={m.month} fill="#f59e0b"
                opacity={selectedMonths.length===0||selectedMonths.includes(m.month)?1:0.3}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top projects — เฉพาะค่าไฟ + ค่าน้ำ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', minHeight: 0, overflow: 'hidden' }}>
        {[
          { src:'elec',  top:topElec,  label:'ค่าไฟฟ้า', color:'#3b82f6', icon:'⚡', subFn: p=>`${p.count} ครั้ง · ${fmt(p.totalRooms)} ห้อง` },
          { src:'water', top:topWater, label:'ค่าน้ำ',    color:'#10b981', icon:'💧', subFn: p=>`${p.count} ครั้ง · ${fmt(p.totalRooms)} ห้อง` },
        ].map(({ src, top, label, color, icon, subFn }) => (
          <div key={src} className="bg-white rounded-xl shadow-sm flex flex-col" style={{ minHeight:0, overflow:'hidden' }}>
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 shrink-0">
              <span>{icon}</span>
              <h3 className="font-bold text-slate-700 text-sm">Top โครงการ — {label}</h3>
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {top.length === 0
                ? <div className="p-6 text-center text-slate-300 text-xs">ไม่มีข้อมูล</div>
                : top.map((p, i) => (
                  <button key={p.id} onClick={() => onGoProjects(p.id, src)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 hover:bg-slate-50 text-left transition-colors">
                    <span className="text-sm font-extrabold w-5 text-slate-300 shrink-0">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700 truncate">{p.project}</div>
                      <div className="text-xs mt-0.5 font-medium" style={{color}}>{subFn(p)}</div>
                    </div>
                    <span className="text-slate-300 text-xs shrink-0">›</span>
                  </button>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
