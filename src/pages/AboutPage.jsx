import { BarChart3, BookOpen, Brain, FolderOpen, HardDrive, Search, Layers3, Sparkles, ChevronDown } from 'lucide-react'
import { useState } from 'react'


const highlightCards = ['Recently viewed decks', 'Quick card builder', 'Focused review mode', 'Session results']


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
  {
    title: 'Create Custom Decks',
    body: 'Build your own flashcards from scratch with guided fields and a reusable structure.',
    icon: BookOpen,
  },
  {
    title: 'Browse Existing Decks',
    body: 'Explore sample and user-created decks using quick search, categories, and recents.',
    icon: Search,
  },
  {
    title: 'Interactive Study Mode',
    body: 'Reveal one answer at a time, then mark whether you got it right or wrong.',
    icon: Brain,
  },
  {
    title: 'Category Organization',
    body: 'Group materials into recognizable course categories to support fast scanning.',
    icon: FolderOpen,
  },
  {
    title: 'Local Storage',
    body: 'Data is persisted on-device so decks and recent activity are available between visits.',
    icon: HardDrive,
  },
]

const semanticConcepts = [
  'Deck',
  'Category',
  'Flashcard',
  'Study Session',
  'Result',
  'Tag',
  'Course Topic',
  'Recent Activity',
  'Performance Trend',
  'Builder Form',
  'Search Query',
]

function AboutPage() {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="page">
      <section className="page-header page-header--centered">
        <p className="section-tag">About uoDecks</p>
        <h1>About uOttawa FlashCards</h1>
        <p>
          The platform supports students who need to create, browse, study, and evaluate their
          learning materials while keeping the interface consistent and easy to understand.
        </p>
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
          {showDetails ? 'Show Less' : 'Learn More'}
        </button>
      </div>

      {showDetails && (
        <>
        {/* Seems like a repeated section */}
        {/* <article className="surface-panel">
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
        </article> */}

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

        <section className="split-section">
        <article className="surface-panel">
          <p className="section-tag">How It Stays Organized</p>
          <h2>Everything revolves around a simple study structure</h2>
          <p>
            Your decks, cards, categories, study sessions, and recent activity all stay connected so
            it is easy to pick up where you left off.
          </p>
          <div className="concept-grid">
            {semanticConcepts.map((concept) => (
              <span key={concept} className="concept-pill">
                {concept}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-panel">
          <p className="section-tag">Why It Feels Fast</p>
          <h2>Designed for quick study sessions</h2>
          <div className="heuristic-grid">
            {[
              'Search across titles, descriptions, and cards',
              'Jump back into recently viewed decks',
              'Undo removed flashcards before losing work',
              'See progress and results at a glance',
            ].map((highlight) => (
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
