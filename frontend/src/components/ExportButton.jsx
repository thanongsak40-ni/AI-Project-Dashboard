import { useState } from 'react'
import { Download, FileText, Sheet, Loader } from 'lucide-react'
import { getElec, getWater, getCommon } from '../lib/processData'

export default function ExportButton({ selectedMonths, searchQuery = '', selectedType = null, selectedProject = null }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(null)

  async function handleExport(type) {
    setOpen(false)
    setLoading(type)
    await new Promise(r => setTimeout(r, 50))
    try {
      let elec   = getElec(selectedMonths, searchQuery)
      let water  = getWater(selectedMonths, searchQuery)
      let common = getCommon(selectedMonths, searchQuery)
      // Apply project filter
      if (selectedProject) {
        elec   = elec.filter(r => r.project_id === selectedProject)
        water  = water.filter(r => r.project_id === selectedProject)
        common = common.filter(r => r.project_id === selectedProject)
      }
      // Apply type filter (only export the selected type's data, zero out others)
      if (selectedType === 'elec')   { water = []; common = [] }
      if (selectedType === 'water')  { elec  = []; common = [] }
      if (selectedType === 'common') { elec  = []; water  = [] }
      if (type === 'pdf') {
        const { exportPDF } = await import('../lib/exportPDF')
        exportPDF(elec, water, common, selectedMonths, selectedProject, selectedType)
      }
      if (type === 'excel') {
        const { exportExcel } = await import('../lib/exportExcel')
        exportExcel(elec, water, common, selectedMonths)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} disabled={!!loading}
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-60 text-white"
        style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: open ? 'none' : '0 2px 8px rgba(99,102,241,0.4)' }}>
        {loading ? <Loader size={13} className="animate-spin" /> : <Download size={13} />}
        {loading === 'pdf' ? 'PDF...' : loading === 'excel' ? 'Excel...' : 'Download'}
      </button>

      {open && !loading && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl z-50 w-56 overflow-hidden border border-slate-100">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Export Report</div>
              {(selectedType || selectedProject || selectedMonths.length > 0) && (
                <div className="text-[10px] text-blue-500 font-semibold mt-1">
                  {[selectedType && `ประเภท: ${selectedType==='elec'?'ค่าไฟฟ้า':selectedType==='water'?'ค่าน้ำ':'ค่าส่วนกลาง'}`, selectedMonths.length > 0 && `${selectedMonths.length} เดือน`, selectedProject && `1 โครงการ`].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            <div className="p-2">
              <button onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-700 transition-colors text-left group">
                <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-200 transition-colors">
                  <FileText size={15} className="text-red-500" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-700">Executive Summary</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">PDF Report</div>
                </div>
              </button>
              <button onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 transition-colors text-left group mt-0.5">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                  <Sheet size={15} className="text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-700">All Data</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Excel - 4 sheets</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
