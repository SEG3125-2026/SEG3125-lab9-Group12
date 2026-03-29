import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeckLibrary } from '../context/DeckContext'
import { formatShortDate } from '../utils/formatters'

function hashString(value) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

function seededUnit(seed) {
  const raw = Math.sin(seed) * 10000
  return raw - Math.floor(raw)
}

function playCelebrationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) {
      return
    }

    const audioContext = new AudioContextClass()
    const noteSequence = [523.25, 659.25, 783.99]

    noteSequence.forEach((frequency, index) => {
      const startTime = audioContext.currentTime + index * 0.1
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(frequency, startTime)

      gainNode.gain.setValueAtTime(0.0001, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.16, startTime + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.24)
    })

    window.setTimeout(() => {
      audioContext.close().catch(() => {})
    }, 800)
  } catch {
    // Ignore audio errors (e.g., autoplay restrictions).
  }
}

function ResultsPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { getDeckById, studySessions } = useDeckLibrary()
  const hasPlayedCelebration = useRef(false)
  const session = studySessions.find((studySession) => studySession.id === sessionId)
  const isPerfectScore = session?.accuracy === 100

  const confettiPieces = useMemo(
    () => {
      const confettiColors = ['#a40e23', '#6b7280']
      const baseSeed = hashString(sessionId || 'results')

      return Array.from({ length: 34 }, (_, index) => ({
        id: index,
        color: confettiColors[Math.round(seededUnit(baseSeed + index * 17.11))],
        x: `${seededUnit(baseSeed + index * 23.71) * 100}%`,
        drift: `${seededUnit(baseSeed + index * 31.37) * 90 - 45}px`,
        delay: `${seededUnit(baseSeed + index * 43.03) * 0.4}s`,
        duration: `${1.6 + seededUnit(baseSeed + index * 59.21) * 1.4}s`,
      }))
    },
    [sessionId],
  )

  useEffect(() => {
    if (!isPerfectScore || hasPlayedCelebration.current) {
      return
    }

    hasPlayedCelebration.current = true
    playCelebrationSound()
  }, [isPerfectScore])

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
      {isPerfectScore ? (
        <div className="confetti-overlay" aria-hidden="true">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={{
                '--confetti-color': piece.color,
                '--confetti-x': piece.x,
                '--confetti-drift': piece.drift,
                '--confetti-delay': piece.delay,
                '--confetti-duration': piece.duration,
              }}
            />
          ))}
        </div>
      ) : null}

      <section className="surface-panel results-hero">
        <div className="results-ring" style={{ '--score': `${session.accuracy}%` }}>
          <div>
            <strong>{session.accuracy}%</strong>
            <span>accuracy</span>
          </div>
        </div>

        <div className="results-hero__content">
          <p className="section-tag">Analyzing Results</p>
          <h2>Study session complete!</h2>
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
