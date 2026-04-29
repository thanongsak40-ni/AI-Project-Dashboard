import { useState, lazy, Suspense } from 'react'
import Login from './pages/Login'
import { getStoredUser, getToken, logout } from './lib/auth'

const AuthedApp = lazy(() => import('./AuthedApp'))

export default function App() {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null))

  if (!user) {
    return <Login onLoggedIn={setUser} />
  }
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">กำลังโหลด...</div>}>
      <AuthedApp user={user} onLogout={() => { logout(); setUser(null) }} />
    </Suspense>
  )
}
