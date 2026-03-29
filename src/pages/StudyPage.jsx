import { ArrowLeft, Eye, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProgressBar from '../components/ProgressBar'
import { useDeckLibrary } from '../context/DeckContext'

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
  const { deckId } = useParams()
  const { getDeckById, recordDeckAccess, recordStudySession } = useDeckLibrary()
  const deck = getDeckById(deckId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState({})
  const currentCard = deck?.cards[currentIndex] ?? null
  const correctCount = Object.values(answers).filter((result) => result === 'correct').length
  const answeredCount = Object.keys(answers).length
  const currentCardResult = currentCard ? answers[currentCard.id] : null
  const progressValue = deck
    ? Math.min(99, Math.round((answeredCount / deck.cards.length) * 100))
    : 0

  const resetSession = useEffectEvent((nextDeck) => {
    recordDeckAccess(nextDeck.id)
    setCurrentIndex(0)
    setRevealed(false)
    setAnswers({})
  })

  useEffect(() => {
    if (!deck) {
      return
    }

    resetSession(deck)
  }, [deck])

  function finishSession(nextAnswers) {
    if (!deck) {
      return
    }

    const nextCorrectCount = Object.values(nextAnswers).filter((result) => result === 'correct').length
    const nextSession = recordStudySession({
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
      finishSession(nextAnswers)
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
      handleAnswer('correct')
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!deck || !currentCard) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>Study session unavailable</h1>
          <p>This deck could not be found. Return to the library and start another session.</p>
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            Back to browse
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
          Back to Decks
        </button>
        <div className="study-header__content">
          <div>
            <p className="section-tag">Absorb Information</p>
            <h1>{deck.title}</h1>
            <p>{deck.description}</p>
          </div>
          <div className="score-panel">
            <div>
              <span>Correct</span>
              <strong>{correctCount}</strong>
            </div>
            <div>
              <span>Cards</span>
              <strong>
                {currentIndex + 1}/{deck.cards.length}
              </strong>
            </div>
          </div>
        </div>

        <ProgressBar
          label="Progress"
          helper={`${progressValue}% complete`}
          value={progressValue}
        />

        <div className="shortcut-row">
          <span className="shortcut-chip">SPACE: reveal</span>
          <span className="shortcut-chip">W: Wrong</span>
          <span className="shortcut-chip">C: Correct</span>
          <span className="shortcut-chip">R: Repeat</span>
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
          <div className="study-card__label">{revealed ? 'Answer' : 'Question'}</div>
          <h2>{revealed ? currentCard.back : currentCard.front}</h2>
          {!revealed ? <p>Click or press space to reveal answer</p> : null}
          {currentCardResult ? (
            <span
              className={
                currentCardResult === 'correct' ? 'badge badge--success' : 'badge badge--danger'
              }
            >
              Marked {currentCardResult === 'correct' ? 'correct' : 'wrong'}
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
            Previous
          </button>

          {!revealed ? (
            <button type="button" className="button button--primary" onClick={() => setRevealed(true)}>
              <Eye size={16} strokeWidth={2.2} />
              Reveal Answer
            </button>
          ) : (
            <div className="study-actions__answer-group">
              <button type="button" className="button button--danger-ghost" onClick={() => handleAnswer('wrong')}>
                <XCircle size={16} strokeWidth={2.2} />
                Got it Wrong
              </button>
              <button type="button" className="button button--success" onClick={() => handleAnswer('correct')}>
                <CheckCircle2 size={16} strokeWidth={2.2} />
                Got it Correct
              </button>
            </div>
          )}

          <button type="button" className="button button--secondary" onClick={handleRepeat}>
            <RefreshCw size={16} strokeWidth={2.2} />
            Repeat
          </button>
        </div>
      </section>
    </div>
  )
}

export default StudyPage
