import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const SRC_COLOR = { electricity: '#3b82f6', water: '#10b981', common: '#f59e0b' }
const SRC_LABEL = { electricity: 'ค่าไฟฟ้า', water: 'ค่าน้ำ', common: 'ค่าส่วนกลาง' }
const CAT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']

export default function Analytics({ data }) {
  const { monthlyTrend, byCategory, byProject, kpi } = data

  const top10 = byProject.slice(0, 10)
  const maxTotal = top10[0]?.total || 1

  // Cumulative line
  let cumulative = 0
  const cumulativeTrend = monthlyTrend.map(m => {
    cumulative += m.total
    return { ...m, cumulative }
  })

  return (
    <div className="p-4 space-y-4 w-full flex-1 min-h-0 overflow-y-auto">

      <div className="grid grid-cols-2 gap-4">

        {/* Monthly stacked bar */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-slate-700 text-sm mb-3">📊 จำนวนงาน AI ต่อเดือน (แยกประเภท)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyTrend} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v, n) => [v, SRC_LABEL[n]||n]} />
              <Legend formatter={n => SRC_LABEL[n]||n} iconSize={10} />
              <Bar dataKey="electricity" stackId="a" fill={SRC_COLOR.electricity} />
              <Bar dataKey="water"       stackId="a" fill={SRC_COLOR.water} />
              <Bar dataKey="common"      stackId="a" fill={SRC_COLOR.common} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative line */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-slate-700 text-sm mb-3">📈 สะสมงาน AI ทั้งหมด</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cumulativeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => [v + ' งาน', 'สะสม']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="cumulative" stroke="#6366f1"
                strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie by category */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-slate-700 text-sm mb-3">🥧 สัดส่วนตามประเภทงาน</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={byCategory} dataKey="total" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {byCategory.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' งาน', n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {byCategory.map((c, i) => {
                const pct = kpi.total > 0 ? Math.round(c.total/kpi.total*100) : 0
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: CAT_COLORS[i], display:'inline-block' }}/>
                        {c.name}
                      </span>
                      <span className="text-slate-500 font-bold">{c.total} งาน ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-full rounded-full" style={{ width:`${pct}%`, background: CAT_COLORS[i] }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top projects */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-slate-700 text-sm mb-3">🏆 Top 10 โครงการ — จำนวนงาน AI</h3>
          <div className="space-y-2">
            {top10.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-semibold text-slate-600 truncate">{p.name}</span>
                    <span className="text-slate-400 ml-2 shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: SRC_COLOR[p.source] }}/>
                      {p.total} งาน
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${p.total/maxTotal*100}%`, background: SRC_COLOR[p.source] }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
