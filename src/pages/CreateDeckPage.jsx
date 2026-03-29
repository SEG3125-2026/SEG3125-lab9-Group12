import { Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import { useDeckLibrary } from '../context/DeckContext'
import { useLanguage } from '../context/LanguageContext'
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

function validateForm(form, t) {
  const nextErrors = {
    cardErrors: {},
  }

  if (!form.title.trim()) {
    nextErrors.title = t('create.validationTitle')
  }

  if (!form.category.trim()) {
    nextErrors.category = t('create.validationCategory')
  }

  if (!form.description.trim()) {
    nextErrors.description = t('create.validationDescription')
  }

  const meaningfulCards = form.cards.filter((card) => card.front.trim() || card.back.trim())

  if (meaningfulCards.length < 2) {
    nextErrors.cards = t('create.validationCards')
  }

  form.cards.forEach((card) => {
    const hasFront = Boolean(card.front.trim())
    const hasBack = Boolean(card.back.trim())
    const isEmpty = !hasFront && !hasBack

    if ((hasFront || hasBack) && (!hasFront || !hasBack)) {
      nextErrors.cardErrors[card.id] = t('create.validationCardSide')
      return
    }

    if (isEmpty && meaningfulCards.length < 2) {
      nextErrors.cardErrors[card.id] = t('create.validationCardSide')
    }
  })

  return nextErrors
}

function DeckEditor({ deckId, existingDeck, isEditing }) {
  const navigate = useNavigate()
  const { createDeck, updateDeck } = useDeckLibrary()
  const { t } = useLanguage()
  const { pushToast } = useToast()
  const initialForm = existingDeck ? mapDeckToForm(existingDeck) : createEmptyForm()
  const initialSerialized = JSON.stringify(initialForm)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({ cardErrors: {} })
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showTipsModal, setShowTipsModal] = useState(false)
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
        title: t('create.toastFlashcardRemovedTitle'),
        message: t('create.toastFlashcardRemovedMessage'),
        tone: 'info',
        actionLabel: t('common.undo'),
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

    const validationErrors = validateForm(form, t)
    setErrors(validationErrors)

    if (
      validationErrors.title ||
      validationErrors.category ||
      validationErrors.description ||
      validationErrors.cards ||
      Object.keys(validationErrors.cardErrors).length > 0
    ) {
      pushToast({
        title: t('create.toastFixTitle'),
        message: t('create.toastFixMessage'),
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
      title: isEditing ? t('create.toastUpdatedTitle') : t('create.toastSavedTitle'),
      message: t('create.toastSavedMessage'),
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
        <section className="surface-panel builder-main builder-main--full">
          <div className="section-heading">
            <div>
              <p className="section-tag">{t('create.deckInfoTag')}</p>
              <h2>{t('create.deckInfoTitle')}</h2>
              <p>{t('create.requiredNote')}</p>
            </div>
            <div className="topics-header__actions">
              <span className="badge">{form.cards.length} {t('create.draftCards')}</span>
              <button type="button" className="button button--primary" onClick={() => setShowTipsModal(true)}>
                {t('create.viewTips')}
              </button>
            </div>
          </div>

          <label className={errors.title ? 'form-field form-field--has-helper' : 'form-field'}>
            <span className="form-field__label">
              {t('create.deckName')}
              <span style={{ color: 'red' }}>*</span>
              {errors.title ? (
                <span className="field-hint field-hint--danger" tabIndex={0} aria-label={errors.title}>
                  !
                </span>
              ) : null}
            </span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder={t('create.deckNamePlaceholder')}
            />
            {errors.title ? (
              <span className="form-field__helper-bubble" role="status" aria-live="polite">
                {errors.title}
              </span>
            ) : null}
          </label>

          <label className={errors.category ? 'form-field form-field--has-helper' : 'form-field'}>
            <span className="form-field__label">
              {t('create.category')}
              <span style={{ color: 'red' }}>*</span>
              {errors.category ? (
                <span className="field-hint field-hint--danger" tabIndex={0} aria-label={errors.category}>
                  !
                </span>
              ) : null}
            </span>
            <input
              type="text"
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              placeholder={t('create.categoryPlaceholder')}
            />
            {errors.category ? (
              <span className="form-field__helper-bubble" role="status" aria-live="polite">
                {errors.category}
              </span>
            ) : null}
          </label>

          <label className={errors.description ? 'form-field form-field--has-helper' : 'form-field'}>
            <span className="form-field__label">
              {t('create.description')}
              <span style={{ color: 'red' }}>*</span>
              {errors.description ? (
                <span className="field-hint field-hint--danger" tabIndex={0} aria-label={errors.description}>
                  !
                </span>
              ) : null}
            </span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder={t('create.descriptionPlaceholder')}
            />
            {errors.description ? (
              <span className="form-field__helper-bubble" role="status" aria-live="polite">
                {errors.description}
              </span>
            ) : null}
          </label>
        </section>

        <section className="surface-panel builder-main">
          <div className="section-heading">
            <div>
              <p className="section-tag">{t('create.flashcardsTag')}</p>
              <h2>{t('create.flashcardsTitle')}</h2>
            </div>
            <button type="button" className="button button--secondary" onClick={addCard}>
              <Plus size={16} strokeWidth={2.2} />
              {t('create.addCard')}
            </button>
          </div>

          {errors.cards ? <p className="form-field__error">{errors.cards}</p> : null}

          <div className="builder-cards">
            {form.cards.map((card, index) => {
              const hasCardError = Boolean(errors.cardErrors[card.id])
              const missingFront = hasCardError && !card.front.trim()
              const missingBack = hasCardError && !card.back.trim()

              return (
                <article
                  key={card.id}
                  className={hasCardError ? 'flashcard-editor flashcard-editor--error' : 'flashcard-editor'}
                >
                  <div className="flashcard-editor__count">{index + 1}</div>
                  <div className="flashcard-editor__inputs">
                    <label className={missingFront ? 'form-field form-field--has-helper' : 'form-field'}>
                      <span className="form-field__label">
                        {t('create.frontLabel')}
                        {missingFront ? (
                          <span
                            className="field-hint field-hint--danger"
                            tabIndex={0}
                            aria-label={t('create.validationFrontRequired')}
                          >
                            !
                          </span>
                        ) : null}
                      </span>
                      <input
                        type="text"
                        value={card.front}
                        onChange={(event) => updateCard(card.id, 'front', event.target.value)}
                        aria-invalid={missingFront}
                        placeholder={t('create.frontPlaceholder')}
                      />
                      {missingFront ? (
                        <span className="form-field__helper-bubble" role="status" aria-live="polite">
                          {t('create.validationFrontRequired')}
                        </span>
                      ) : null}
                    </label>
                    <label className={missingBack ? 'form-field form-field--has-helper' : 'form-field'}>
                      <span className="form-field__label">
                        {t('create.backLabel')}
                        {missingBack ? (
                          <span
                            className="field-hint field-hint--danger"
                            tabIndex={0}
                            aria-label={t('create.validationBackRequired')}
                          >
                            !
                          </span>
                        ) : null}
                      </span>
                      <input
                        type="text"
                        value={card.back}
                        onChange={(event) => updateCard(card.id, 'back', event.target.value)}
                        aria-invalid={missingBack}
                        placeholder={t('create.backPlaceholder')}
                      />
                      {missingBack ? (
                        <span className="form-field__helper-bubble" role="status" aria-live="polite">
                          {t('create.validationBackRequired')}
                        </span>
                      ) : null}
                    </label>
                  </div>
                  <button
                    type="button"
                    className="flashcard-editor__delete"
                    onClick={() => deleteCard(card.id)}
                    disabled={form.cards.length === 1}
                  >
                    {t('create.remove')}
                  </button>
                  {errors.cardErrors[card.id] ? (
                    <p className="form-field__error form-field__error--inline">
                      {errors.cardErrors[card.id]}
                    </p>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        <div className="builder-actions">
          <button type="button" className="button button--secondary" onClick={handleCancel}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="button button--primary">
            <Save size={16} strokeWidth={2.2} />
            {isEditing ? t('create.saveChanges') : t('create.saveDeck')}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showLeaveDialog}
        title={t('create.discardTitle')}
        body={t('create.discardBody')}
        confirmLabel={t('create.discardConfirm')}
        tone="danger"
        onConfirm={() => navigate('/browse')}
        onCancel={() => setShowLeaveDialog(false)}
      />

      {showTipsModal ? (
        <div className="dialog-backdrop" role="presentation" onClick={() => setShowTipsModal(false)}>
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="builder-tips-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="section-tag">{t('create.tipsTag')}</p>
            <h2 id="builder-tips-title">{t('create.tipsTitle')}</h2>
            <ul className="checklist checklist--dialog">
              <li>{t('create.tip1')}</li>
              <li>{t('create.tip2')}</li>
              <li>{t('create.tip3')}</li>
              <li>{t('create.tip4')}</li>
            </ul>
            <div className="dialog__actions">
              <button type="button" className="button button--primary" onClick={() => setShowTipsModal(false)}>
                {t('common.close')}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

function CreateDeckPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { deckId } = useParams()
  const { getDeckById } = useDeckLibrary()
  const isEditing = Boolean(deckId)
  const existingDeck = deckId ? getDeckById(deckId) : null

  if (isEditing && !existingDeck) {
    return (
      <div className="page">
        <section className="surface-panel empty-state">
          <h1>{t('create.deckNotFoundTitle')}</h1>
          <p>{t('create.deckNotFoundBody')}</p>
          <button type="button" className="button button--primary" onClick={() => navigate('/browse')}>
            {t('create.backToBrowse')}
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="page-header">
        <p className="section-tag">{isEditing ? t('create.editTag') : t('create.createTag')}</p>
        <h1>{isEditing ? t('create.editTitle') : t('create.createTitle')}</h1>
        <p>{t('create.pageDescription')}</p>
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
