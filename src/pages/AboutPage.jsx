import { BarChart3, BookOpen, Brain, FolderOpen, HardDrive, Search } from 'lucide-react'

const featureCards = [
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
    title: 'Progress Tracking',
    body: 'Monitor completion state, card counts, and study performance after each session.',
    icon: BarChart3,
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
  return (
    <div className="page">
      <section className="surface-panel page-header page-header--centered">
        <p className="section-tag">About uoDecks</p>
        <h1>uOttawa flashcards, structured for usability</h1>
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
    </div>
  )
}

export default AboutPage
