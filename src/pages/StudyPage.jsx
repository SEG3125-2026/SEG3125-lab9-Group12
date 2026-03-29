import { ArrowLeft, Eye, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { useDeckLibrary } from '../context/DeckContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'

function findNextIndex(cards, answers, currentIndex) {
  for (let index = currentIndex + 1; index < cards.length; index += 1) {
    if (!answers[cards[index].id]) {
      return index
    }
  }

  for (let index = 0; index < cards.length; index += 1) {
    if (!answers[cards[index].id]) {
      return index
    }
  }

  return -1
}

function StudyPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { deckId } = useParams()
  const { getDeckById, isLoading, loadError, recordDeckAccess, recordStudySession } = useDeckLibrary()
  const { pushToast } = useToast()
  const deck = getDeckById(deckId)
  const initializedDeckIdRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState({})
  const currentCard = deck?.cards[currentIndex] ?? null
  const correctCount = Object.values(answers).filter((result) => result === 'right').length
  const answeredCount = Object.keys(answers).length
  const currentCardResult = currentCard ? answers[currentCard.id] : null
  const progressValue = deck
    ? Math.min(99, Math.round((answeredCount / deck.cards.length) * 100))
    : 0

  const resetSession = useEffectEvent((nextDeck) => {
    void recordDeckAccess(nextDeck.id)
    setCurrentIndex(0)
    setRevealed(false)
    setAnswers({})
  })

  useEffect(() => {
    if (!deck || initializedDeckIdRef.current === deck.id) {
      return
    }

    initializedDeckIdRef.current = deck.id
    resetSession(deck)
  }, [deck?.id])

  async function finishSession(nextAnswers) {
    if (!deck) {
      return
    }

    const nextCorrectCount = Object.values(nextAnswers).filter((result) => result === 'right').length

    try {
      const nextSession = await recordStudySession({
        deckId: deck.id,
        deckTitle: deck.title,
        category: deck.category,
        totalCards: deck.cards.length,
        correctCount: nextCorrectCount,
        incorrectCount: deck.cards.length - nextCorrectCount,
        responses: deck.cards.map((card) => ({
          cardId: card.id,
          front: card.front,
          back: card.back,
          result: nextAnswers[card.id],
        })),
      })

      navigate(`/results/${nextSession.id}`)
    } catch (error) {
      pushToast({
        title: 'Unable to save study session',
        message: error.message,
        tone: 'danger',
      })
    }
  }

  function handleAnswer(result) {
    if (!deck || !currentCard) {
      return
    }

    const nextAnswers = {
      ...answers,
      [currentCard.id]: result,
    }

    setAnswers(nextAnswers)

    const nextIndex = findNextIndex(deck.cards, nextAnswers, currentIndex)

    if (nextIndex === -1) {
      void finishSession(nextAnswers)
      return
    }

    setCurrentIndex(nextIndex)
    setRevealed(Boolean(nextAnswers[deck.cards[nextIndex].id]))
  }

  function handlePrevious() {
    if (!deck || currentIndex === 0) {
      return
    }

    const previousIndex = currentIndex - 1
    setCurrentIndex(previousIndex)
    setRevealed(Boolean(answers[deck.cards[previousIndex].id]))
  }

  function handleRepeat() {
    if (!currentCard) {
      return
    }

    if (answers[currentCard.id]) {
      const nextAnswers = { ...answers }
      delete nextAnswers[currentCard.id]
      setAnswers(nextAnswers)
    }

    setRevealed(false)
  }

  const onKeyDown = useEffectEvent((event) => {
    if (!deck) {
      return
    }

    if (event.code === 'Space') {
      event.preventDefault()
      if (!revealed) {
        setRevealed(true)
      }
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handlePrevious()
      return
    }

    if (event.key.toLowerCase() === 'r') {
      event.preventDefault()
      handleRepeat()
      return
    }

    if ((event.key === 'w' || event.key.toLowerCase() === 'w') && revealed) {
      event.preventDefault()
      handleAnswer('wrong')
    }

    if ((event.key === 'c' || event.key.toLowerCase() === 'c') && revealed) {
      event.preventDefault()
      handleAnswer('right')
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (isLoading) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>Loading study session</h1>
          <p>Fetching the deck from the local SQL database.</p>
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
            Back to browse
          </button>
        </section>
      </div>
    )
  }

  if (!deck || !currentCard) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>{t('study.unavailableTitle')}</h1>
          <p>{t('study.unavailableBody')}</p>
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            {t('common.backToBrowse')}
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="surface-panel study-header">
        <button type="button" className="button button--secondary" onClick={() => navigate('/browse')}>
          <ArrowLeft size={16} strokeWidth={2.2} />
          {t('study.backToDecks')}
        </button>
        <div className="study-header__content">
          <div>
            <p className="section-tag">{t('study.tag')}</p>
            <h1>{deck.title}</h1>
            <p>{deck.description}</p>
          </div>
          <div className="score-panel">
            <div>
              <span>{t('study.correct')}</span>
              <strong>{correctCount}</strong>
            </div>
            <div>
              <span>{t('study.cards')}</span>
              <strong>
                {currentIndex + 1}/{deck.cards.length}
              </strong>
            </div>
          </div>
        </div>

        <ProgressBar
          label={t('study.progress')}
          helper={`${progressValue}% ${t('study.complete')}`}
          value={progressValue}
        />

        <div className="shortcut-row">
          <span className="shortcut-chip">{t('study.shortcutReveal')}</span>
          <span className="shortcut-chip">{t('study.shortcutWrong')}</span>
          <span className="shortcut-chip">{t('study.shortcutCorrect')}</span>
          <span className="shortcut-chip">{t('study.shortcutRepeat')}</span>
        </div>
      </section>

      <section className="study-stage">
        <article
          className={revealed ? 'study-card study-card--revealed' : 'study-card'}
          onClick={() => !revealed && setRevealed(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !revealed) {
              setRevealed(true)
            }
          }}
        >
          <div className="study-card__label">{revealed ? t('study.answer') : t('study.question')}</div>
          <h2>{revealed ? currentCard.back : currentCard.front}</h2>
          {!revealed ? <p>{t('study.revealHint')}</p> : null}
          {currentCardResult ? (
            <span
              className={
                currentCardResult === 'right' ? 'badge badge--success' : 'badge badge--danger'
              }
            >
              {t('study.marked')} {currentCardResult === 'right' ? t('study.markedCorrect') : t('study.markedWrong')}
            </span>
          ) : null}
        </article>

        <div className="study-actions">
          <button
            type="button"
            className="button button--secondary"
            disabled={currentIndex === 0}
            onClick={handlePrevious}
          >
            {t('study.previous')}
          </button>

          {!revealed ? (
            <button type="button" className="button button--primary" onClick={() => setRevealed(true)}>
              <Eye size={16} strokeWidth={2.2} />
              {t('study.revealAnswer')}
            </button>
          ) : (
            <div className="study-actions__answer-group">
              <button type="button" className="button button--danger-ghost" onClick={() => handleAnswer('wrong')}>
                <XCircle size={16} strokeWidth={2.2} />
                {t('study.gotWrong')}
              </button>
              <button type="button" className="button button--success" onClick={() => handleAnswer('right')}>
                <CheckCircle2 size={16} strokeWidth={2.2} />
                {t('study.gotCorrect')}
              </button>
            </div>
          )}

          <button type="button" className="button button--secondary" onClick={handleRepeat}>
            <RefreshCw size={16} strokeWidth={2.2} />
            {t('study.repeat')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default StudyPage
