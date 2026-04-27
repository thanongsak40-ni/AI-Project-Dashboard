export default function KpiCard({ icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue:   'border-blue-500 bg-blue-50 text-blue-700',
    green:  'border-emerald-500 bg-emerald-50 text-emerald-700',
    amber:  'border-amber-500 bg-amber-50 text-amber-700',
    red:    'border-red-500 bg-red-50 text-red-700',
    violet: 'border-violet-500 bg-violet-50 text-violet-700',
  }
  const iconBg = {
    blue:   'bg-blue-100 text-blue-600',
    green:  'bg-emerald-100 text-emerald-600',
    amber:  'bg-amber-100 text-amber-600',
    red:    'bg-red-100 text-red-600',
    violet: 'bg-violet-100 text-violet-600',
  }
  return (
    <div className={`bg-white rounded-xl border-l-4 ${colors[color]} shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${iconBg[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
