import { useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <section className="surface-panel empty-state">
        <p className="section-tag">Error Recovery</p>
        <h1>That page does not exist</h1>
        <p>
          The route you tried to open is not part of the app. Use the navigation or jump directly
          back to the flashcard library.
        </p>
        <div className="results-actions">
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            Browse decks
          </button>
          <button type="button" className="button button--secondary" onClick={() => navigate('/')}>
            Go home
          </button>
        </div>
      </section>
    </div>
  )
}

export default NotFoundPage
