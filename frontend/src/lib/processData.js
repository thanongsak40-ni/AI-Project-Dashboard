// Loads dashboard data from backend API at module init (top-level await).
const API_BASE = import.meta.env.VITE_API_BASE || '';
const rawData = await fetch(`${API_BASE}/api/data`).then(r => {
  if (!r.ok) throw new Error(`Failed to load /api/data: ${r.status}`);
  return r.json();
});

export const MONTHS_TH = {
  '2025-08': 'ส.ค. 68', '2025-09': 'ก.ย. 68', '2025-10': 'ต.ค. 68',
  '2025-11': 'พ.ย. 68', '2025-12': 'ธ.ค. 68', '2026-01': 'ม.ค. 69',
  '2026-02': 'ก.พ. 69', '2026-03': 'มี.ค. 69', '2026-04': 'เม.ย. 69',
}

export const ALL_MONTHS = Object.keys(MONTHS_TH)

export const COMMON_FEE_KEYS = [
  { key: 'common_fee',      label: 'ค่าส่วนกลาง',          color: '#6366f1' },
  { key: 'water_meter_fee', label: 'ค่ามิเตอร์น้ำ',         color: '#0ea5e9' },
  { key: 'insurance_fee',   label: 'ค่าประกันภัย',           color: '#10b981' },
  { key: 'funding_fee',     label: 'กองทุน',                 color: '#f59e0b' },
  { key: 'water_fee',       label: 'ค่าน้ำ (ส่วนกลาง)',      color: '#3b82f6' },
  { key: 'water_promo_fee', label: 'ค่าน้ำโปรโมชั่น',        color: '#8b5cf6' },
]

export function getElec(months = [], search = '') {
  return rawData.elec.filter(r =>
    (months.length === 0 || months.includes(r.month)) &&
    (!search || r.project.toLowerCase().includes(search) || r.project_id.toLowerCase().includes(search))
  )
}

export function getWater(months = [], search = '') {
  return rawData.water.filter(r =>
    (months.length === 0 || months.includes(r.month)) &&
    (!search || r.project.toLowerCase().includes(search) || r.project_id.toLowerCase().includes(search))
  )
}

export function getCommon(months = [], search = '') {
  return rawData.common.filter(r =>
    (months.length === 0 || months.includes(r.month)) &&
    (!search || r.project.toLowerCase().includes(search) || r.project_id.toLowerCase().includes(search))
  )
}

export function getMonthlyStats(months = [], projectId = null) {
  const mths = months.length === 0 ? ALL_MONTHS : months
  return mths.map(m => {
    const elec  = rawData.elec.filter(r => r.month === m && (!projectId || r.project_id === projectId))
    const water = rawData.water.filter(r => r.month === m && (!projectId || r.project_id === projectId))
    const comm  = rawData.common.filter(r => r.month === m && (!projectId || r.project_id === projectId))
    return {
      month: m, label: MONTHS_TH[m],
      elec:   { projects: new Set(elec.map(r => r.project_id)).size,  rooms: elec.reduce((s,r)=>s+r.rooms,0),  count: elec.length  },
      water:  { projects: new Set(water.map(r => r.project_id)).size, rooms: water.reduce((s,r)=>s+r.rooms,0), count: water.length },
      common: {
        projects: new Set(comm.map(r => r.project_id)).size,
        totalAmt: comm.reduce((s,r) => s + COMMON_FEE_KEYS.reduce((a,k)=>a+r[k.key].amount,0), 0),
        count: comm.length,
      },
    }
  })
}

export function getTopProjects(source, months = []) {
  const records = source === 'elec' ? getElec(months)
                : source === 'water' ? getWater(months)
                : getCommon(months)

  if (source === 'common') {
    const map = {}
    records.forEach(r => {
      if (!map[r.project_id]) map[r.project_id] = { project: r.project, id: r.project_id, count: 0, totalAmt: 0 }
      map[r.project_id].count++
      map[r.project_id].totalAmt += COMMON_FEE_KEYS.reduce((s,k)=>s+r[k.key].amount,0)
    })
    return Object.values(map).sort((a,b)=>b.count-a.count)
  }

  const map = {}
  records.forEach(r => {
    if (!map[r.project_id]) map[r.project_id] = { project: r.project, id: r.project_id, count: 0, totalRooms: 0 }
    map[r.project_id].count++
    map[r.project_id].totalRooms += r.rooms
  })
  return Object.values(map).sort((a,b)=>b.count-a.count)
}

export function getProjectHistory(projectId) {
  return {
    elec:   rawData.elec.filter(r => r.project_id === projectId).sort((a,b)=>b.date.localeCompare(a.date)),
    water:  rawData.water.filter(r => r.project_id === projectId).sort((a,b)=>b.date.localeCompare(a.date)),
    common: rawData.common.filter(r => r.project_id === projectId).sort((a,b)=>b.month.localeCompare(a.month)),
  }
}

export function getAllProjects() {
  const map = {}
  ;[...rawData.elec, ...rawData.water, ...rawData.common].forEach(r => {
    if (!map[r.project_id]) map[r.project_id] = { id: r.project_id, name: r.project }
  })
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name, 'th'))
}

export const RAW = rawData
