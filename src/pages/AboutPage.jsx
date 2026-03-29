import { BarChart3, BookOpen, Brain, FolderOpen, HardDrive, Search, Layers3, Sparkles, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

function AboutPage() {
  const [showDetails, setShowDetails] = useState(false)
  const { t } = useLanguage()

  const featureCards = [
    {
      title: t('about.feature.buildFast.title'),
      body: t('about.feature.buildFast.body'),
      icon: BookOpen,
    },
    {
      title: t('about.feature.organized.title'),
      body: t('about.feature.organized.body'),
      icon: Layers3,
    },
    {
      title: t('about.feature.focus.title'),
      body: t('about.feature.focus.body'),
      icon: Sparkles,
    },
    {
      title: t('about.feature.progress.title'),
      body: t('about.feature.progress.body'),
      icon: BarChart3,
    },
    {
      title: t('about.feature.customDecks.title'),
      body: t('about.feature.customDecks.body'),
      icon: BookOpen,
    },
    {
      title: t('about.feature.browseDecks.title'),
      body: t('about.feature.browseDecks.body'),
      icon: Search,
    },
    {
      title: t('about.feature.studyMode.title'),
      body: t('about.feature.studyMode.body'),
      icon: Brain,
    },
    {
      title: t('about.feature.categoryOrganization.title'),
      body: t('about.feature.categoryOrganization.body'),
      icon: FolderOpen,
    },
    {
      title: t('about.feature.localStorage.title'),
      body: t('about.feature.localStorage.body'),
      icon: HardDrive,
    },
  ]

  const highlightCards = [
    t('about.highlight.recent'),
    t('about.highlight.builder'),
    t('about.highlight.focused'),
    t('about.highlight.results'),
  ]

  const semanticConcepts = [
    t('about.concept.deck'),
    t('about.concept.category'),
    t('about.concept.flashcard'),
    t('about.concept.session'),
    t('about.concept.result'),
    t('about.concept.tag'),
    t('about.concept.topic'),
    t('about.concept.recent'),
    t('about.concept.trend'),
    t('about.concept.builderForm'),
    t('about.concept.searchQuery'),
  ]

  const speedHighlights = [
    t('about.speed.item1'),
    t('about.speed.item2'),
    t('about.speed.item3'),
    t('about.speed.item4'),
  ]

  return (
    <div className="page">
      <section className="page-header page-header--centered">
        <p className="section-tag">{t('about.tag')}</p>
        <h1>{t('about.title')}</h1>
        <p>{t('about.description')}</p>
      </section>

      <section className="card-grid">
        {featureCards.map((featureCard) => (
          <article key={featureCard.title} className="feature-card">
            <div className="feature-card__icon" aria-hidden="true">
              <featureCard.icon size={20} strokeWidth={2.2} />
            </div>
            <h2>{featureCard.title}</h2>
            <p>{featureCard.body}</p>
          </article>
        ))}
      </section>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setShowDetails(!showDetails)}
        >
          <ChevronDown
            size={18}
            strokeWidth={2.2}
            style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
            aria-hidden="true"
          />
          {showDetails ? t('about.showLess') : t('about.learnMore')}
        </button>
      </div>

      {showDetails && (
        <>
        <article className="surface-panel">
          <p className="section-tag">{t('about.whyStudents.tag')}</p>
          <h2>{t('about.whyStudents.title')}</h2>
          <p>{t('about.whyStudents.body')}</p>
          <div className="highlight-list">
            {highlightCards.map((highlight) => (
              <div key={highlight} className="highlight-chip">
                {highlight}
              </div>
            ))}
          </div>

          <div className="hero-stats hero-stats--compact">
            <div>
              <strong>{t('about.stat.searchTitle')}</strong>
              <span>{t('about.stat.searchBody')}</span>
            </div>
            <div>
              <strong>{t('about.stat.reviewTitle')}</strong>
              <span>{t('about.stat.reviewBody')}</span>
            </div>
            <div>
              <strong>{t('about.stat.resultsTitle')}</strong>
              <span>{t('about.stat.resultsBody')}</span>
            </div>
          </div>
        </article>

        <section className="split-section">
        <article className="surface-panel">
          <p className="section-tag">{t('about.organized.tag')}</p>
          <h2>{t('about.organized.title')}</h2>
          <p>{t('about.organized.body')}</p>
          <div className="concept-grid">
            {semanticConcepts.map((concept) => (
              <span key={concept} className="concept-pill">
                {concept}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <p className="section-tag">{t('about.speed.tag')}</p>
          <h2>{t('about.speed.title')}</h2>
          <div className="heuristic-grid">
            {speedHighlights.map((highlight) => (
              <div key={highlight} className="heuristic-card">
                {highlight}
              </div>
            ))}
          </div>
        </article>
      </section>
        </>
      )}
    </div>
  )
}

export default AboutPage
