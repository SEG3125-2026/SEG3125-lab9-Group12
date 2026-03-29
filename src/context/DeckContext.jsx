/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiSend } from '../lib/api'

const DeckContext = createContext(null)

function sortDecks(decks) {
  return [...decks].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )
}

export function DeckProvider({ children }) {
  const [decks, setDecks] = useState([])
  const [recentDecks, setRecentDecks] = useState([])
  const [studySessions, setStudySessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  function applyLibrary(library) {
    setDecks(sortDecks(library.decks || []))
    setRecentDecks(library.recentDecks || [])
    setStudySessions(library.studySessions || [])
    setLoadError(null)
  }

  async function refreshLibrary() {
    const library = await apiGet('/api/library')
    applyLibrary(library)
    return library
  }

  useEffect(() => {
    let active = true

    async function loadLibrary() {
      try {
        const library = await apiGet('/api/library')
        if (!active) {
          return
        }
        applyLibrary(library)
      } catch (error) {
        if (!active) {
          return
        }
        setLoadError(error.message)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadLibrary()

    return () => {
      active = false
    }
  }, [])

  function getDeckById(deckId) {
    return decks.find((deck) => deck.id === deckId) || null
  }

  async function recordDeckAccess(deckId) {
    const library = await apiSend(`/api/decks/${deckId}/access`, 'POST', {})
    applyLibrary(library)
    return library
  }

  async function createDeck(deckInput) {
    const response = await apiSend('/api/decks', 'POST', deckInput)
    applyLibrary(response.library)
    return response.deck
  }

  async function updateDeck(deckId, deckInput) {
    const response = await apiSend(`/api/decks/${deckId}`, 'PUT', deckInput)
    applyLibrary(response.library)
    return response.deck
  }

  async function deleteDeck(deckId) {
    const response = await apiSend(`/api/decks/${deckId}`, 'DELETE', {})
    applyLibrary(response.library)
    return response.deletedDeck
  }

  async function restoreDeck(deck) {
    const response = await apiSend('/api/decks', 'POST', deck)
    applyLibrary(response.library)
    return response.deck
  }

  async function recordStudySession(summary) {
    const response = await apiSend('/api/study-sessions', 'POST', summary)
    applyLibrary(response.library)
    return response.session
  }

  const value = {
    decks,
    recentDecks,
    studySessions,
    isLoading,
    loadError,
    refreshLibrary,
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
