import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDeckLibrary } from '../context/DeckContext'
import { useLanguage } from '../context/LanguageContext'
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
  const { t } = useLanguage()
  const { sessionId } = useParams()
  const hasPlayedCelebration = useRef(false)
  const { getDeckById, isLoading, loadError, studySessions } = useDeckLibrary()
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

  if (isLoading) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>Loading results</h1>
          <p>Reading saved study sessions from the local SQL database.</p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>Database unavailable</h1>
          <p>{loadError}</p>
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            Browse decks
          </button>
        </section>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>{t('results.unavailableTitle')}</h1>
          <p>{t('results.unavailableBody')}</p>
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            {t('nav.browse')}
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
            <span>{t('results.accuracy')}</span>
          </div>
        </div>

        <div className="results-hero__content">
          <p className="section-tag">{t('results.tag')}</p>
          <h2>{t('results.title')}</h2>
          <p>
            {session.deckTitle} {t('results.finishedOn')} {formatShortDate(session.completedAt)} {t('results.with')}{' '}
            {session.correctCount} {t('results.correctAnswersOutOf')} {session.totalCards}.
          </p>

          <div className="hero-stats hero-stats--compact">
            <div>
              <strong>{session.correctCount}</strong>
              <span>{t('results.correct')}</span>
            </div>
            <div>
              <strong>{session.incorrectCount}</strong>
              <span>{t('results.needReview')}</span>
            </div>
            <div>
              <strong>{accuracyDelta === null ? t('results.new') : `${accuracyDelta >= 0 ? '+' : ''}${accuracyDelta}%`}</strong>
              <span>{accuracyDelta === null ? t('results.firstAttempt') : t('results.changeFromLast')}</span>
            </div>
          </div>

          <div className="results-actions">
            {deck ? (
              <button type="button" className="button button--primary" onClick={() => navigate(`/study/${deck.id}`)}>
                {t('results.studyAgain')}
              </button>
            ) : null}
            {deck ? (
              <button type="button" className="button button--secondary" onClick={() => navigate(`/edit/${deck.id}`)}>
                {t('results.editDeck')}
              </button>
            ) : null}
            <button type="button" className="button button--secondary" onClick={() => navigate('/browse')}>
              {t('common.backToBrowse')}
            </button>
          </div>
        </div>
      </section>

      <section className="split-section">
        <article className="surface-panel">
          <p className="section-tag">{t('results.whatToReview')}</p>
          <h2>{t('results.cardsNeedWork')}</h2>
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
            <p className="empty-copy">{t('results.perfectRound')}</p>
          )}
        </article>

        <article className="surface-panel">
          <p className="section-tag">{t('results.responseBreakdown')}</p>
          <h2>{t('results.everyCard')}</h2>
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
                    {response.result === 'right' ? t('results.correctBadge') : t('results.reviewBadge')}
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
