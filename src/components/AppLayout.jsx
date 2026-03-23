import { Outlet } from 'react-router-dom'
import ToastStack from './ToastStack'
import TopNav from './TopNav'

function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-gradient" aria-hidden="true" />
      <TopNav />
      <main className="page-shell">
        <Outlet />
      </main>
      <ToastStack />
    </div>
  )
}

export default AppLayout
