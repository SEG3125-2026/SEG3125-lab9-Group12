import { Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import FieldHint from '../components/FieldHint'
import { useDeckLibrary } from '../context/DeckContext'
import { useToast } from '../context/ToastContext'
import { createId } from '../utils/createId'

function createBlankCard() {
  return {
    id: createId('draft-card-'),
    front: '',
    back: '',
  }
}

function createEmptyForm() {
  return {
    title: '',
    category: '',
    description: '',
    cards: [createBlankCard(), createBlankCard()],
  }
}

function mapDeckToForm(deck) {
  return {
    title: deck.title,
    category: deck.category,
    description: deck.description,
    cards: deck.cards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
    })),
  }
}

function validateForm(form) {
  const nextErrors = {
    cardErrors: {},
  }

  if (!form.title.trim()) {
    nextErrors.title = 'Enter a deck name so the deck is recognizable in the library.'
  }

  if (!form.category.trim()) {
    nextErrors.category = 'Pick a course or category to keep the knowledge organized.'
  }

  const meaningfulCards = form.cards.filter((card) => card.front.trim() || card.back.trim())

  if (meaningfulCards.length < 2) {
    nextErrors.cards = 'Add at least two flashcards so the study session has meaningful progression.'
  }

  meaningfulCards.forEach((card) => {
    if (!card.front.trim() || !card.back.trim()) {
      nextErrors.cardErrors[card.id] = 'Each flashcard needs both a front and a back.'
    }
  })

  return nextErrors
}

function DeckEditor({ deckId, existingDeck, isEditing }) {
  const navigate = useNavigate()
  const { createDeck, updateDeck } = useDeckLibrary()
  const { pushToast } = useToast()
  const initialForm = existingDeck ? mapDeckToForm(existingDeck) : createEmptyForm()
  const initialSerialized = JSON.stringify(initialForm)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({ cardErrors: {} })
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [initialSerializedForm, setInitialSerializedForm] = useState(initialSerialized)
  const isDirty = JSON.stringify(form) !== initialSerializedForm

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateCard(cardId, field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      cards: currentForm.cards.map((card) => (card.id === cardId ? { ...card, [field]: value } : card)),
    }))
  }

  function addCard() {
    setForm((currentForm) => ({
      ...currentForm,
      cards: [...currentForm.cards, createBlankCard()],
    }))
  }

  function deleteCard(cardId) {
    setForm((currentForm) => {
      const deletedIndex = currentForm.cards.findIndex((card) => card.id === cardId)
      const deletedCard = currentForm.cards[deletedIndex]

      if (!deletedCard || currentForm.cards.length === 1) {
        return currentForm
      }

      pushToast({
        title: 'Flashcard removed',
        message: 'Undo to recover the deleted card without retyping it.',
        tone: 'info',
        actionLabel: 'Undo',
        onAction: () => {
          setForm((latestForm) => {
            const nextCards = [...latestForm.cards]
            nextCards.splice(deletedIndex, 0, deletedCard)
            return {
              ...latestForm,
              cards: nextCards,
            }
          })
        },
      })

      return {
        ...currentForm,
        cards: currentForm.cards.filter((card) => card.id !== cardId),
      }
    })
  }

  function handleSave(event) {
    event.preventDefault()

    const validationErrors = validateForm(form)
    setErrors(validationErrors)

    if (
      validationErrors.title ||
      validationErrors.category ||
      validationErrors.cards ||
      Object.keys(validationErrors.cardErrors).length > 0
    ) {
      pushToast({
        title: 'Fix the highlighted fields',
        message: 'The builder keeps incomplete cards from being saved to prevent study errors.',
        tone: 'danger',
      })
      return
    }

    const meaningfulCards = form.cards.filter((card) => card.front.trim() || card.back.trim())
    const nextDeck = {
      ...form,
      cards: meaningfulCards,
    }

    const savedDeck = isEditing ? updateDeck(deckId, nextDeck) : createDeck(nextDeck)

    pushToast({
      title: isEditing ? 'Deck updated' : 'Deck saved',
      message: 'Your deck is ready for browsing and study sessions.',
      tone: 'success',
    })

    setInitialSerializedForm(JSON.stringify(mapDeckToForm(savedDeck)))
    navigate('/browse')
  }

  function handleCancel() {
    if (isDirty) {
      setShowLeaveDialog(true)
      return
    }

    navigate('/browse')
  }

  return (
    <>
      <form className="builder-layout" onSubmit={handleSave}>
        <section className="surface-panel builder-main">
          <div className="section-heading">
            <div>
              <p className="section-tag">Deck information</p>
              <h2>Set the basics first</h2>
            </div>
            <span className="badge">{form.cards.length} draft cards</span>
          </div>

          <label className="form-field">
            <span className="form-field__label">
              Deck name <FieldHint text="Use a familiar course or topic label so it is easy to recognize later." />
            </span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="e.g., Spanish Vocabulary"
            />
            {errors.title ? <span className="form-field__error">{errors.title}</span> : null}
          </label>

          <label className="form-field">
            <span className="form-field__label">
              Category <FieldHint text="Categories support browsing, recognition, and future database filtering." />
            </span>
            <input
              type="text"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              placeholder="e.g., Language, Science, History"
            />
            {errors.category ? <span className="form-field__error">{errors.category}</span> : null}
          </label>

          <label className="form-field">
            <span className="form-field__label">
              Description <FieldHint text="Give enough context so students know what the deck covers before opening it." />
            </span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Briefly explain what this deck helps students study."
            />
          </label>
        </section>

        <aside className="surface-panel builder-sidebar">
          <p className="section-tag">Builder Tips</p>
          <h2>Make each card easy to review</h2>
          <ul className="checklist">
            <li>Keep one idea or definition per card so answers stay short and memorable.</li>
            <li>Use familiar course names or topics to make decks easier to find later.</li>
            <li>Write prompts that are specific enough to avoid vague guesses.</li>
            <li>If you remove a card by mistake, use undo from the toast message right away.</li>
          </ul>
        </aside>

        <section className="surface-panel builder-main">
          <div className="section-heading">
            <div>
              <p className="section-tag">Flashcards</p>
              <h2>Write clear prompts and concise answers</h2>
            </div>
            <button type="button" className="button button--secondary" onClick={addCard}>
              <Plus size={16} strokeWidth={2.2} />
              Add Card
            </button>
          </div>

          {errors.cards ? <p className="form-field__error">{errors.cards}</p> : null}

          <div className="builder-cards">
            {form.cards.map((card, index) => (
              <article key={card.id} className="flashcard-editor">
                <div className="flashcard-editor__count">{index + 1}</div>
                <div className="flashcard-editor__inputs">
                  <label className="form-field">
                    <span className="form-field__label">Front (question)</span>
                    <input
                      type="text"
                      value={card.front}
                      onChange={(event) => updateCard(card.id, 'front', event.target.value)}
                      placeholder="Enter the question or term"
                    />
                  </label>
                  <label className="form-field">
                    <span className="form-field__label">Back (answer)</span>
                    <input
                      type="text"
                      value={card.back}
                      onChange={(event) => updateCard(card.id, 'back', event.target.value)}
                      placeholder="Enter the answer or definition"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="flashcard-editor__delete"
                  onClick={() => deleteCard(card.id)}
                  disabled={form.cards.length === 1}
                >
                  Remove
                </button>
                {errors.cardErrors[card.id] ? (
                  <p className="form-field__error form-field__error--inline">
                    {errors.cardErrors[card.id]}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <div className="builder-actions">
          <button type="button" className="button button--secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="button button--primary">
            <Save size={16} strokeWidth={2.2} />
            {isEditing ? 'Save Changes' : 'Save Deck'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showLeaveDialog}
        title="Discard your changes?"
        body="Leaving this page now will remove any unsaved edits in the deck builder."
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={() => navigate('/browse')}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </>
  )
}

function CreateDeckPage() {
  const navigate = useNavigate()
  const { deckId } = useParams()
  const { getDeckById } = useDeckLibrary()
  const isEditing = Boolean(deckId)
  const existingDeck = deckId ? getDeckById(deckId) : null

  if (isEditing && !existingDeck) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>Deck not found</h1>
          <p>The deck you tried to edit is missing. Return to the library and choose another deck.</p>
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            Back to browse
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="surface-panel page-header">
        <p className="section-tag">{isEditing ? 'Edit Deck' : 'Create Deck'}</p>
        <h1>{isEditing ? 'Edit deck' : 'Create new deck'}</h1>
        <p>
          Build a custom flashcard deck with structured fields, helpful prompts, and validation that
          prevents incomplete cards from reaching study mode.
        </p>
      </section>

      <DeckEditor
        key={deckId || 'new'}
        deckId={deckId}
        existingDeck={existingDeck}
        isEditing={isEditing}
      />
    </div>
  )
}

export default CreateDeckPage
