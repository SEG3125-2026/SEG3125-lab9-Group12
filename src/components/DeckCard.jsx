import { Pencil, Play, Trash2 } from 'lucide-react'
import { formatRelativeActivity, pluralize } from '../utils/formatters'

function DeckCard({ deck, isRecent = false, onStudy, onEdit, onDelete }) {
  return (
    <article className="deck-card">
      <div className="deck-card__header">
        <div>
          <p className="deck-card__eyebrow">{deck.category}</p>
          <h3>{deck.title}</h3>
        </div>
        {isRecent ? <span className="badge badge--soft">Recent</span> : null}
      </div>

      <p className="deck-card__description">{deck.description}</p>

      <div className="deck-card__meta">
        <span>{pluralize(deck.cards.length, 'card')}</span>
        <span>{pluralize(deck.studyCount || 0, 'study session')}</span>
        <span>{formatRelativeActivity(deck.lastStudiedAt || deck.updatedAt)}</span>
      </div>

      <div className="deck-card__actions">
        <button type="button" className="button button--primary" onClick={onStudy}>
          <Play size={16} strokeWidth={2.2} />
          Study
        </button>
        <button type="button" className="button button--secondary" onClick={onEdit}>
          <Pencil size={16} strokeWidth={2.2} />
          Edit
        </button>
        <button type="button" className="button button--ghost-danger" onClick={onDelete}>
          <Trash2 size={16} strokeWidth={2.2} />
          Delete
        </button>
      </div>
    </article>
  )
}

export default DeckCard
