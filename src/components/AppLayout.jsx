import { Outlet, useLocation } from 'react-router-dom'
import ToastStack from './ToastStack'
import TopNav from './TopNav'

function AppLayout() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <div className="app-gradient" aria-hidden="true" />
      <TopNav />
      <main className="page-shell">
        <div key={location.pathname} className="route-transition">
          <Outlet />
        </div>
      </main>
      <ToastStack />
    </div>
  )
}

export default AppLayout
