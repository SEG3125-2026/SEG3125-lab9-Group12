import { Link } from 'react-router-dom'

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
    </div>
  )
}

export default HomePage
