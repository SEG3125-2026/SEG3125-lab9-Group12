import { BookOpenText, House, Info, Library, Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function TopNav() {
  const { t, language, toggleLanguage } = useLanguage()

  const navigationLinks = [
    { to: '/', label: t('nav.home'), icon: House },
    { to: '/about', label: t('nav.about'), icon: Info },
    { to: '/browse', label: t('nav.browse'), icon: Library },
    { to: '/create', label: t('nav.create'), icon: Plus },
  ]

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

      <button
        type="button"
        onClick={toggleLanguage}
        className="top-nav__language-toggle"
        aria-label={language === 'fr' ? t('nav.switchToEnglish') : t('nav.switchToFrench')}
      >
        {language === 'fr' ? 'EN' : 'FR'}
      </button>
    </header>
  )
}

export default TopNav
