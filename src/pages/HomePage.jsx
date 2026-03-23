import { BarChart3, BookOpen, Layers3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const featureCards = [
  {
    title: 'Build decks fast',
    body: 'Create custom flashcards with clear fields, quick add controls, and reusable categories.',
    icon: BookOpen,
  },
  {
    title: 'Stay organized',
    body: 'Keep decks tidy with categories, recent activity, and search that works across card content.',
    icon: Layers3,
  },
  {
    title: 'Study with focus',
    body: 'Reveal one answer at a time in a clean review mode that keeps attention on the current card.',
    icon: Sparkles,
  },
  {
    title: 'Track your progress',
    body: 'See what you got right, what still needs work, and where to jump back in next.',
    icon: BarChart3,
  },
]

const highlightCards = ['Recently viewed decks', 'Quick card builder', 'Focused review mode', 'Session results']

function HomePage() {
  return (
    <div className="page page--home">
      <section className="hero-panel surface-panel">
        <div className="hero-panel__eyebrow">Defy the Conventional • Repoussez les frontieres</div>
        <h1>
          Master any subject with
          <span> interactive flashcards</span>
        </h1>
        <p>
          uoDecks helps Gee-Gees create, organize, and study digital flashcards with fast deck
          building, clean review sessions, and simple progress tracking.
        </p>
        <div className="hero-panel__actions">
          <Link to="/browse" className="button button--primary button--large">
            Start Learning Now
          </Link>
          <Link to="/about" className="button button--secondary button--large">
            Learn More
          </Link>
        </div>
      </section>

      <section className="split-section">
        <article className="surface-panel">
          <p className="section-tag">What You Can Do</p>
          <h2>Everything you need in one study flow</h2>
          <div className="card-grid card-grid--compact">
            {featureCards.map((featureCard) => (
              <article key={featureCard.title} className="info-card">
                <div className="info-card__icon">
                  <featureCard.icon size={20} strokeWidth={2.2} />
                </div>
                <h3>{featureCard.title}</h3>
                <p>{featureCard.body}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <p className="section-tag">Why Students Use uoDecks</p>
          <h2>Built for fast setup and focused review</h2>
          <p>
            Jump from creating a deck to studying it in a few clicks, then come back later without
            losing your place.
          </p>
          <div className="highlight-list">
            {highlightCards.map((highlight) => (
              <div key={highlight} className="highlight-chip">
                {highlight}
              </div>
            ))}
          </div>
          <div className="hero-stats hero-stats--compact">
            <div>
              <strong>Search</strong>
              <span>find decks by course, topic, or card content</span>
            </div>
            <div>
              <strong>Review</strong>
              <span>flip through cards with keyboard shortcuts</span>
            </div>
            <div>
              <strong>Results</strong>
              <span>see missed cards immediately after each session</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default HomePage
