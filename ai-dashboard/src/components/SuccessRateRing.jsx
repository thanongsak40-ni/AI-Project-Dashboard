export default function SuccessRateRing({ rate }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (rate / 100) * circ
  const color = rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="mt-[-100px] mb-[20px] text-center pointer-events-none">
        <p className="text-4xl font-extrabold text-slate-800">{rate}%</p>
        <p className="text-xs text-slate-400 mt-0.5">อัตราสำเร็จ</p>
      </div>
    </div>
  )
}
