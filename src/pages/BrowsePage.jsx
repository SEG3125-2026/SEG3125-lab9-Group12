import { Search, ChevronDown } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import DeckCard from '../components/DeckCard'
import { useDeckLibrary } from '../context/DeckContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'

const ALL_CATEGORIES = '__all__'

function BrowsePage() {
  const navigate = useNavigate()
  const { decks, recentDecks, deleteDeck, recordDeckAccess, restoreDeck } = useDeckLibrary()
  const { t } = useLanguage()
  const { pushToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)
  const [deckToDelete, setDeckToDelete] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const deferredSearch = useDeferredValue(search)

  const categories = [ALL_CATEGORIES, ...new Set(decks.map((deck) => deck.category))]
  const trimmedSearch = deferredSearch.trim().toLowerCase()

  const filteredDecks = decks.filter((deck) => {
    const matchesCategory = selectedCategory === ALL_CATEGORIES || deck.category === selectedCategory

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
      title: t('browse.toastDeckDeletedTitle'),
      message: t('browse.toastDeckDeletedMessage'),
      tone: 'danger',
      actionLabel: t('common.undo'),
      onAction: () => restoreDeck(deletedDeck),
    })
  }

  return (
    <div className="page">
      <section className="page-header">
        <p className="section-tag">{t('browse.discover')}</p>
        <h1>{t('browse.title')}</h1>
        <p>{t('browse.description')}</p>
      </section>

      <section className="surface-panel">
        <label className="search-bar" htmlFor="deck-search">
          <Search size={18} strokeWidth={2.2} aria-hidden="true" />
          <input
            id="deck-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('browse.searchPlaceholder')}
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
              {category === ALL_CATEGORIES ? t('common.all') : category}
            </button>
          ))}
        </div>
      </section>

      <article>
            <h2>{t('browse.libraryOverview')}</h2>
          <div className="hero-stats hero-stats--compact">
            <div>
              <strong>{decks.length}</strong>
              <span>{t('browse.availableDecks')}</span>
            </div>
            <div>
              <strong>{categories.length - 1}</strong>
              <span>{t('browse.courseCategories')}</span>
            </div>
            <div>
              <strong>{filteredDecks.length}</strong>
              <span>{t('browse.matchingCurrentFilters')}</span>
            </div>
          </div>
        </article>
        
      <section className="surface-panel">
        <div className="section-heading">
          <div>
            <p className="section-tag">{t('browse.deckLibrary')}</p>
            <h2>{t('browse.decks')}</h2>
          </div>
          <span className="badge">{filteredDecks.length} {t('browse.shown')}</span>
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
            <h3>{t('browse.noDecksMatch')}</h3>
            <p>{t('browse.noDecksMatchBody')}</p>
          </div>
        )}
      </section>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setShowStats(!showStats)}
        >
          <ChevronDown
            size={18}
            strokeWidth={2.2}
            style={{ transform: showStats ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
            aria-hidden="true"
          />
          {showStats ? t('browse.hideRecentActivities') : t('browse.viewRecentActivities')}
        </button>
      </div>

      {showStats && (
        <>
        <article className="surface-panel">
          <div className="section-heading">
            <div>
              <p className="section-tag">{t('browse.recentActivity')}</p>
              <h2>{t('browse.recentlyViewedDecks')}</h2>
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
            <p className="empty-copy">{t('browse.recentEmpty')}</p>
          )}
        </article>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deckToDelete)}
        title={t('browse.deleteDeckTitle')}
        body={t('browse.deleteDeckBody')}
        confirmLabel={t('browse.deleteDeckConfirm')}
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
