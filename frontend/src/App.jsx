import { useState } from 'react'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedMonths, setSelectedMonths]     = useState([])
  const [searchQuery, setSearchQuery]           = useState('')
  const [selectedType, setSelectedType]         = useState(null)
  const [selectedProject, setSelectedProject]   = useState(null)

  function toggleMonth(m) {
    if (m === null) { setSelectedMonths([]); return }
    setSelectedMonths(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    )
  }

  function setMonths(months) { setSelectedMonths(months) }

  return (
    <div style={{ display:'flex', flexDirection:'row', height:'100vh', overflow:'hidden' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />
      <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
        <FilterBar
          selectedMonths={selectedMonths}
          onToggleMonth={toggleMonth}
          onSetMonths={setMonths}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          <Dashboard
            selectedMonths={selectedMonths}
            searchQuery={searchQuery}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onSelectMonth={m => toggleMonth(m)}
          />
        </div>
      </div>
    </div>
  )
}
