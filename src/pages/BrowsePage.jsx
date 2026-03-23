import { Search } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import DeckCard from '../components/DeckCard'
import { useDeckLibrary } from '../context/DeckContext'
import { useToast } from '../context/ToastContext'

function BrowsePage() {
  const navigate = useNavigate()
  const { decks, recentDecks, deleteDeck, recordDeckAccess, restoreDeck } = useDeckLibrary()
  const { pushToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [deckToDelete, setDeckToDelete] = useState(null)
  const deferredSearch = useDeferredValue(search)

  const categories = ['All', ...new Set(decks.map((deck) => deck.category))]
  const trimmedSearch = deferredSearch.trim().toLowerCase()

  const filteredDecks = decks.filter((deck) => {
    const matchesCategory = selectedCategory === 'All' || deck.category === selectedCategory

    if (!trimmedSearch) {
      return matchesCategory
    }

    const haystack = [
      deck.title,
      deck.category,
      deck.description,
      ...deck.cards.flatMap((card) => [card.front, card.back]),
    ]
      .join(' ')
      .toLowerCase()

    return matchesCategory && haystack.includes(trimmedSearch)
  })

  function handleStudy(deckId) {
    recordDeckAccess(deckId)
    navigate(`/study/${deckId}`)
  }

  function handleEdit(deckId) {
    recordDeckAccess(deckId)
    navigate(`/edit/${deckId}`)
  }

  function handleDelete(deckId) {
    const deletedDeck = deleteDeck(deckId)

    if (!deletedDeck) {
      return
    }

    pushToast({
      title: 'Deck deleted',
      message: 'Undo is available for a few seconds if this was accidental.',
      tone: 'danger',
      actionLabel: 'Undo',
      onAction: () => restoreDeck(deletedDeck),
    })
  }

  return (
    <div className="page">
      <section className="surface-panel page-header">
        <p className="section-tag">Discover</p>
        <h1>Browse decks</h1>
        <p>
          Search by name, description, category, or card content. Recently viewed decks stay visible
          so students do not need to remember exact titles.
        </p>
      </section>

      <section className="surface-panel">
        <label className="search-bar" htmlFor="deck-search">
          <Search size={18} strokeWidth={2.2} aria-hidden="true" />
          <input
            id="deck-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search decks by name, description, category, or concept..."
          />
        </label>

        <div className="chip-row" aria-label="Category filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                category === selectedCategory ? 'filter-chip filter-chip--active' : 'filter-chip'
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="section-tag">Deck Library</p>
            <h2>Decks</h2>
          </div>
          <span className="badge">{filteredDecks.length} shown</span>
        </div>

        {filteredDecks.length > 0 ? (
          <div className="card-grid card-grid--browse">
            {filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStudy={() => handleStudy(deck.id)}
                onEdit={() => handleEdit(deck.id)}
                onDelete={() => setDeckToDelete(deck)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No decks match that search</h3>
            <p>Clear the current filters or create a new deck to keep building your study library.</p>
          </div>
        )}
      </section>

      <section className="split-section">
        <article className="surface-panel">
          <div className="section-heading">
            <div>
              <p className="section-tag">Recent Activity</p>
              <h2>Recently viewed decks</h2>
            </div>
          </div>

          {recentDecks.length > 0 ? (
            <div className="card-grid card-grid--compact">
              {recentDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  isRecent
                  onStudy={() => handleStudy(deck.id)}
                  onEdit={() => handleEdit(deck.id)}
                  onDelete={() => setDeckToDelete(deck)}
                />
              ))}
            </div>
          ) : (
            <p className="empty-copy">Open or study a deck and it will appear here automatically.</p>
          )}
        </article>

        <article className="surface-panel">
          <p className="section-tag">Overview</p>
          <h2>Library overview</h2>
          <div className="hero-stats hero-stats--compact">
            <div>
              <strong>{decks.length}</strong>
              <span>available decks</span>
            </div>
            <div>
              <strong>{categories.length - 1}</strong>
              <span>course categories</span>
            </div>
            <div>
              <strong>{filteredDecks.length}</strong>
              <span>matching current filters</span>
            </div>
          </div>
        </article>
      </section>

      <ConfirmDialog
        open={Boolean(deckToDelete)}
        title="Delete this deck?"
        body="This permanently removes the deck from your library unless you immediately undo the action."
        confirmLabel="Delete deck"
        onConfirm={() => {
          handleDelete(deckToDelete.id)
          setDeckToDelete(null)
        }}
        onCancel={() => setDeckToDelete(null)}
      />
    </div>
  )
}

export default BrowsePage
