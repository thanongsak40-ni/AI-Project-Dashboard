import { useState } from 'react'
import Sidebar from './components/Sidebar'
import FilterBar from './components/FilterBar'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'

export default function AuthedApp({ user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [view, setView]                         = useState('dashboard') // 'dashboard' | 'users'
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

  function handleSelectType(t) {
    setView('dashboard')
    setSelectedType(t)
  }

  return (
    <div style={{ display:'flex', flexDirection:'row', height:'100vh', overflow:'hidden' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        selectedType={selectedType}
        onSelectType={handleSelectType}
        view={view}
        onSelectView={setView}
        user={user}
        onLogout={onLogout}
      />
      <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
        {view === 'dashboard' ? (
          <>
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
          </>
        ) : view === 'users' ? (
          <Users currentUser={user} />
        ) : null}
      </div>
    </div>
  )
}
