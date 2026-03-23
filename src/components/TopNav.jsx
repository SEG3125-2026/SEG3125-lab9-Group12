import { BookOpenText, House, Info, Library, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationLinks = [
  { to: '/', label: 'Home', icon: House },
  { to: '/about', label: 'About', icon: Info },
  { to: '/browse', label: 'Browse', icon: Library },
  { to: '/create', label: 'Create', icon: Plus },
]

function TopNav() {
  return (
    <header className="top-nav">
      <NavLink to="/" className="brand" aria-label="uoDecks home">
        <BookOpenText className="brand-mark" size={44} strokeWidth={2.1} aria-hidden="true" />
        <span className="brand-wordmark">
          uo<span>Decks</span>
        </span>
      </NavLink>

      <nav className="top-nav__links" aria-label="Primary">
        {navigationLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              isActive ? 'top-nav__link top-nav__link--active' : 'top-nav__link'
            }
          >
            <link.icon size={18} strokeWidth={2.1} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default TopNav
