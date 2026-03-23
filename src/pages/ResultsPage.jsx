import { useNavigate, useParams } from 'react-router-dom'
import { useDeckLibrary } from '../context/DeckContext'
import { formatShortDate } from '../utils/formatters'

function ResultsPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { getDeckById, studySessions } = useDeckLibrary()
  const session = studySessions.find((studySession) => studySession.id === sessionId)

  if (!session) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>Results unavailable</h1>
          <p>This study summary is missing. Start a new session to generate fresh results.</p>
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            Browse decks
          </button>
        </section>
      </div>
    )
  }

  const deck = getDeckById(session.deckId)
  const previousSession = studySessions.find(
    (studySession) => studySession.deckId === session.deckId && studySession.id !== session.id,
  )
  const accuracyDelta = previousSession ? session.accuracy - previousSession.accuracy : null
  const missedCards = session.responses.filter((response) => response.result === 'wrong')

  return (
    <div className="page">
      <section className="surface-panel results-hero">
        <div className="results-ring" style={{ '--score': `${session.accuracy}%` }}>
          <div>
            <strong>{session.accuracy}%</strong>
            <span>accuracy</span>
          </div>
        </div>

        <div className="results-hero__content">
          <p className="section-tag">Analyzing Results</p>
          <h1>Study session complete</h1>
          <p>
            {session.deckTitle} finished on {formatShortDate(session.completedAt)} with{' '}
            {session.correctCount} correct answers out of {session.totalCards}.
          </p>

          <div className="hero-stats hero-stats--compact">
            <div>
              <strong>{session.correctCount}</strong>
              <span>correct</span>
            </div>
            <div>
              <strong>{session.incorrectCount}</strong>
              <span>need review</span>
            </div>
            <div>
              <strong>{accuracyDelta === null ? 'New' : `${accuracyDelta >= 0 ? '+' : ''}${accuracyDelta}%`}</strong>
              <span>{accuracyDelta === null ? 'first recorded attempt' : 'change from last attempt'}</span>
            </div>
          </div>

          <div className="results-actions">
            {deck ? (
              <button type="button" className="button button--primary" onClick={() => navigate(`/study/${deck.id}`)}>
                Study Again
              </button>
            ) : null}
            {deck ? (
              <button type="button" className="button button--secondary" onClick={() => navigate(`/edit/${deck.id}`)}>
                Edit Deck
              </button>
            ) : null}
            <button type="button" className="button button--secondary" onClick={() => navigate('/browse')}>
              Back to Browse
            </button>
          </div>
        </div>
      </section>

      <section className="split-section">
        <article className="surface-panel">
          <p className="section-tag">What to Review</p>
          <h2>Cards that still need work</h2>
          {missedCards.length > 0 ? (
            <div className="results-list">
              {missedCards.map((response) => (
                <article key={response.cardId} className="result-row">
                  <h3>{response.front}</h3>
                  <p>{response.back}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Perfect round. No missed cards in this session.</p>
          )}
        </article>

        <article className="surface-panel">
          <p className="section-tag">Response Breakdown</p>
          <h2>Every studied card</h2>
          <div className="results-list">
            {session.responses.map((response) => (
              <article key={response.cardId} className="result-row">
                <div className="result-row__top">
                  <h3>{response.front}</h3>
                  <span
                    className={
                      response.result === 'right' ? 'badge badge--success' : 'badge badge--danger'
                    }
                  >
                    {response.result === 'right' ? 'Correct' : 'Review'}
                  </span>
                </div>
                <p>{response.back}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

export default ResultsPage
