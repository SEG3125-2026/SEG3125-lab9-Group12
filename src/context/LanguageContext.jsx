/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const LanguageContext = createContext(null)

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.browse': 'Browse',
    'nav.create': 'Create',
    'nav.switchToEnglish': 'Switch to English',
    'nav.switchToFrench': 'Switch to French',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'A propos',
    'nav.browse': 'Parcourir',
    'nav.create': 'Creer',
    'nav.switchToEnglish': 'Passer en anglais',
    'nav.switchToFrench': 'Passer en francais',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useLocalStorage('app-language', 'en')

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const t = (key) => {
    return translations[language]?.[key] ?? translations.en[key] ?? key
  }

  const toggleLanguage = () => {
    setLanguage((current) => (current === 'en' ? 'fr' : 'en'))
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}
