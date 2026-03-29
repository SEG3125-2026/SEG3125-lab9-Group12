import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="page page--home">
      <section className="hero-panel surface-panel">
        <div className="hero-panel__eyebrow">{t('home.eyebrow')}</div>
        <h1>
          {t('home.titleLead')}
          <span>{t('home.titleAccent')}</span>
        </h1>
        <p>{t('home.description')}</p>
        <div className="hero-panel__actions">
          <Link to="/browse" className="button button--primary button--large">
            {t('home.startLearning')}
          </Link>
          <Link to="/about" className="button button--secondary button--large">
            {t('home.learnMore')}
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
