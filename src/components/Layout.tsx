import { Link, NavLink, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/library">
          Eng Book Reader
        </Link>
        <nav className="topbar-nav">
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
