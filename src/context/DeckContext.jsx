/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext } from 'react'
import { sampleDecks } from '../data/sampleDecks'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createId } from '../utils/createId'

const DeckContext = createContext(null)

function sanitizeCards(cards) {
  return cards
    .filter((card) => card.front.trim() || card.back.trim())
    .map((card, index) => ({
      id: card.id || createId('card-'),
      front: card.front.trim(),
      back: card.back.trim(),
      order: index + 1,
    }))
}

function sortDecks(decks) {
  return [...decks].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )
}

export function DeckProvider({ children }) {
  const [decks, setDecks] = useLocalStorage('uodecks-library-v2', sampleDecks)
  const [recentDeckIds, setRecentDeckIds] = useLocalStorage('uodecks-recents-v2', [
    'deck-csi2101',
    'deck-csi2110',
  ])
  const [studySessions, setStudySessions] = useLocalStorage('uodecks-study-sessions-v2', [])

  function getDeckById(deckId) {
    return decks.find((deck) => deck.id === deckId)
  }

  function recordDeckAccess(deckId) {
    setRecentDeckIds((currentIds) => [deckId, ...currentIds.filter((id) => id !== deckId)].slice(0, 4))
  }

  function createDeck(deckInput) {
    const timestamp = new Date().toISOString()
    const nextDeck = {
      id: createId('deck-'),
      title: deckInput.title.trim(),
      category: deckInput.category.trim(),
      description: deckInput.description.trim(),
      cards: sanitizeCards(deckInput.cards),
      createdAt: timestamp,
      updatedAt: timestamp,
      lastStudiedAt: null,
      studyCount: 0,
    }

    setDecks((currentDecks) => sortDecks([...currentDecks, nextDeck]))
    recordDeckAccess(nextDeck.id)
    return nextDeck
  }

  function updateDeck(deckId, deckInput) {
    const existingDeck = getDeckById(deckId)

    if (!existingDeck) {
      return null
    }

    const nextDeck = {
      ...existingDeck,
      title: deckInput.title.trim(),
      category: deckInput.category.trim(),
      description: deckInput.description.trim(),
      cards: sanitizeCards(deckInput.cards),
      updatedAt: new Date().toISOString(),
    }

    setDecks((currentDecks) =>
      sortDecks(currentDecks.map((deck) => (deck.id === deckId ? nextDeck : deck))),
    )
    recordDeckAccess(deckId)
    return nextDeck
  }

  function deleteDeck(deckId) {
    const deletedDeck = getDeckById(deckId)

    if (!deletedDeck) {
      return null
    }

    setDecks((currentDecks) => currentDecks.filter((deck) => deck.id !== deckId))
    setRecentDeckIds((currentIds) => currentIds.filter((id) => id !== deckId))

    return deletedDeck
  }

  function restoreDeck(deck) {
    setDecks((currentDecks) => {
      const withoutRestoredDeck = currentDecks.filter((currentDeck) => currentDeck.id !== deck.id)
      return sortDecks([...withoutRestoredDeck, deck])
    })
  }

  function recordStudySession(summary) {
    const completedAt = new Date().toISOString()
    const accuracy = Math.round((summary.correctCount / summary.totalCards) * 100)
    const session = {
      id: createId('session-'),
      ...summary,
      accuracy,
      completedAt,
    }

    setStudySessions((currentSessions) => [session, ...currentSessions].slice(0, 24))
    setDecks((currentDecks) =>
      sortDecks(
        currentDecks.map((deck) =>
          deck.id === summary.deckId
            ? {
                ...deck,
                updatedAt: completedAt,
                lastStudiedAt: completedAt,
                studyCount: (deck.studyCount || 0) + 1,
              }
            : deck,
        ),
      ),
    )
    recordDeckAccess(summary.deckId)

    return session
  }

  const orderedDecks = sortDecks(decks)
  const recentDecks = recentDeckIds
    .map((deckId) => orderedDecks.find((deck) => deck.id === deckId))
    .filter(Boolean)

  const value = {
    decks: orderedDecks,
    recentDecks,
    studySessions,
    createDeck,
    updateDeck,
    deleteDeck,
    restoreDeck,
    recordDeckAccess,
    recordStudySession,
    getDeckById,
  }

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>
}

export function useDeckLibrary() {
  const context = useContext(DeckContext)

  if (!context) {
    throw new Error('useDeckLibrary must be used within a DeckProvider')
  }

  return context
}
