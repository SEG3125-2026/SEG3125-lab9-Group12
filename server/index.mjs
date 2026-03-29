import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import express from 'express'
import { sampleDecks } from '../src/data/sampleDecks.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const dataDir = path.join(projectRoot, 'data')
const distDir = path.join(projectRoot, 'dist')
const databasePath = path.join(dataDir, 'uodecks.sqlite')
const port = Number(process.env.PORT || 3001)

fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(databasePath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_studied_at TEXT,
    study_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    deck_id TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    card_order INTEGER NOT NULL,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS recent_views (
    deck_id TEXT PRIMARY KEY,
    viewed_at TEXT NOT NULL,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    deck_id TEXT NOT NULL,
    deck_title TEXT NOT NULL,
    category TEXT NOT NULL,
    total_cards INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    incorrect_count INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS card_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('right', 'wrong')),
    FOREIGN KEY (session_id) REFERENCES study_sessions(id) ON DELETE CASCADE
  );
`)

function createId(prefix) {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`
}

function sanitizeCards(cards = []) {
  return cards
    .filter((card) => card.front.trim() || card.back.trim())
    .map((card, index) => ({
      id: card.id || createId('card-'),
      front: card.front.trim(),
      back: card.back.trim(),
      order: index + 1,
    }))
}

function mapDeckRow(deckRow, cardRows) {
  return {
    id: deckRow.id,
    title: deckRow.title,
    category: deckRow.category,
    description: deckRow.description,
    createdAt: deckRow.created_at,
    updatedAt: deckRow.updated_at,
    lastStudiedAt: deckRow.last_studied_at,
    studyCount: deckRow.study_count,
    cards: cardRows.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      order: card.card_order,
    })),
  }
}

function getDecks() {
  const deckRows = db
    .prepare(
      `SELECT id, title, category, description, created_at, updated_at, last_studied_at, study_count
       FROM decks
       ORDER BY datetime(updated_at) DESC, title ASC`,
    )
    .all()

  const cardRows = db
    .prepare(
      `SELECT id, deck_id, front, back, card_order
       FROM cards
       ORDER BY deck_id ASC, card_order ASC`,
    )
    .all()

  const cardsByDeck = new Map()
  for (const row of cardRows) {
    const deckCards = cardsByDeck.get(row.deck_id) || []
    deckCards.push(row)
    cardsByDeck.set(row.deck_id, deckCards)
  }

  return deckRows.map((deckRow) => mapDeckRow(deckRow, cardsByDeck.get(deckRow.id) || []))
}

function getRecentDecks(decks) {
  const recentRows = db
    .prepare(
      `SELECT deck_id
       FROM recent_views
       ORDER BY datetime(viewed_at) DESC
       LIMIT 4`,
    )
    .all()

  const decksById = new Map(decks.map((deck) => [deck.id, deck]))
  return recentRows.map((row) => decksById.get(row.deck_id)).filter(Boolean)
}

function getStudySessions() {
  const sessionRows = db
    .prepare(
      `SELECT id, deck_id, deck_title, category, total_cards, correct_count, incorrect_count, accuracy, completed_at
       FROM study_sessions
       ORDER BY datetime(completed_at) DESC
       LIMIT 24`,
    )
    .all()

  if (sessionRows.length === 0) {
    return []
  }

  const resultsRows = db
    .prepare(
      `SELECT session_id, card_id, front, back, result
       FROM card_results
       WHERE session_id IN (${sessionRows.map(() => '?').join(',')})
       ORDER BY id ASC`,
    )
    .all(...sessionRows.map((row) => row.id))

  const resultsBySession = new Map()
  for (const row of resultsRows) {
    const sessionResults = resultsBySession.get(row.session_id) || []
    sessionResults.push({
      cardId: row.card_id,
      front: row.front,
      back: row.back,
      result: row.result,
    })
    resultsBySession.set(row.session_id, sessionResults)
  }

  return sessionRows.map((row) => ({
    id: row.id,
    deckId: row.deck_id,
    deckTitle: row.deck_title,
    category: row.category,
    totalCards: row.total_cards,
    correctCount: row.correct_count,
    incorrectCount: row.incorrect_count,
    accuracy: row.accuracy,
    completedAt: row.completed_at,
    responses: resultsBySession.get(row.id) || [],
  }))
}

function getLibrarySnapshot() {
  const decks = getDecks()
  return {
    decks,
    recentDecks: getRecentDecks(decks),
    studySessions: getStudySessions(),
  }
}

const insertDeckRow = db.prepare(
  `INSERT INTO decks (id, title, category, description, created_at, updated_at, last_studied_at, study_count)
   VALUES (@id, @title, @category, @description, @createdAt, @updatedAt, @lastStudiedAt, @studyCount)`,
)
const insertCardRow = db.prepare(
  `INSERT INTO cards (id, deck_id, front, back, card_order)
   VALUES (@id, @deckId, @front, @back, @cardOrder)`,
)
const updateDeckRow = db.prepare(
  `UPDATE decks
   SET title = @title,
       category = @category,
       description = @description,
       updated_at = @updatedAt,
       last_studied_at = @lastStudiedAt,
       study_count = @studyCount
   WHERE id = @id`,
)
const deleteCardsByDeck = db.prepare('DELETE FROM cards WHERE deck_id = ?')
const deleteDeckRow = db.prepare('DELETE FROM decks WHERE id = ?')
const upsertRecentView = db.prepare(
  `INSERT INTO recent_views (deck_id, viewed_at)
   VALUES (?, ?)
   ON CONFLICT(deck_id) DO UPDATE SET viewed_at = excluded.viewed_at`,
)
const updateDeckAfterStudy = db.prepare(
  `UPDATE decks
   SET updated_at = ?, last_studied_at = ?, study_count = study_count + 1
   WHERE id = ?`,
)
const insertStudySession = db.prepare(
  `INSERT INTO study_sessions (
      id, deck_id, deck_title, category, total_cards, correct_count, incorrect_count, accuracy, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
)
const insertCardResult = db.prepare(
  `INSERT INTO card_results (session_id, card_id, front, back, result)
   VALUES (?, ?, ?, ?, ?)`,
)

const saveDeck = db.transaction((deckInput, existingDeck = null) => {
  const timestamp = new Date().toISOString()
  const cards = sanitizeCards(deckInput.cards)
  const title = deckInput.title.trim()
  const category = deckInput.category.trim()
  const description = deckInput.description.trim()

  if (!title) {
    throw new Error('Deck title is required.')
  }

  if (!category) {
    throw new Error('Deck category is required.')
  }

  if (cards.length < 2) {
    throw new Error('A deck needs at least two complete flashcards.')
  }

  const deck = {
    id: deckInput.id || existingDeck?.id || createId('deck-'),
    title,
    category,
    description,
    createdAt: deckInput.createdAt || existingDeck?.createdAt || timestamp,
    updatedAt: existingDeck ? timestamp : deckInput.updatedAt || timestamp,
    lastStudiedAt: deckInput.lastStudiedAt ?? existingDeck?.lastStudiedAt ?? null,
    studyCount: deckInput.studyCount ?? existingDeck?.studyCount ?? 0,
  }

  if (existingDeck) {
    updateDeckRow.run(deck)
    deleteCardsByDeck.run(deck.id)
  } else {
    insertDeckRow.run(deck)
  }

  for (const card of cards) {
    insertCardRow.run({
      id: card.id,
      deckId: deck.id,
      front: card.front,
      back: card.back,
      cardOrder: card.order,
    })
  }

  upsertRecentView.run(deck.id, timestamp)

  return {
    ...deck,
    cards,
  }
})

const removeDeck = db.transaction((deckId) => {
  const deck = getDecks().find((item) => item.id === deckId)
  if (!deck) {
    return null
  }

  deleteDeckRow.run(deckId)
  return deck
})

const logStudySession = db.transaction((summary) => {
  const completedAt = new Date().toISOString()
  const totalCards = Number(summary.totalCards)
  const correctCount = Number(summary.correctCount)
  const incorrectCount = Number(summary.incorrectCount)
  const accuracy = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0

  const session = {
    id: summary.id || createId('session-'),
    deckId: summary.deckId,
    deckTitle: summary.deckTitle,
    category: summary.category,
    totalCards,
    correctCount,
    incorrectCount,
    accuracy,
    completedAt,
    responses: summary.responses || [],
  }

  if (!session.deckId || !session.deckTitle) {
    throw new Error('Study session is missing required deck information.')
  }

  insertStudySession.run(
    session.id,
    session.deckId,
    session.deckTitle,
    session.category,
    session.totalCards,
    session.correctCount,
    session.incorrectCount,
    session.accuracy,
    session.completedAt,
  )

  for (const response of session.responses) {
    insertCardResult.run(
      session.id,
      response.cardId,
      response.front,
      response.back,
      response.result,
    )
  }

  updateDeckAfterStudy.run(completedAt, completedAt, session.deckId)
  upsertRecentView.run(session.deckId, completedAt)

  return session
})

function seedDatabaseIfNeeded() {
  const row = db.prepare('SELECT COUNT(*) AS count FROM decks').get()
  if (row.count > 0) {
    return
  }

  for (const deck of sampleDecks) {
    saveDeck(deck)
  }

  const initialRecentDecks = ['deck-csi2101', 'deck-csi2110']
  initialRecentDecks.forEach((deckId, index) => {
    upsertRecentView.run(deckId, new Date(Date.now() - index * 60000).toISOString())
  })
}

seedDatabaseIfNeeded()

const app = express()
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    databasePath,
  })
})

app.get('/api/library', (_request, response) => {
  response.json(getLibrarySnapshot())
})

app.post('/api/decks', (request, response) => {
  try {
    const deck = saveDeck(request.body)
    response.status(201).json({
      deck,
      library: getLibrarySnapshot(),
    })
  } catch (error) {
    response.status(400).json({
      error: error.message,
    })
  }
})

app.put('/api/decks/:deckId', (request, response) => {
  const existingDeck = getDecks().find((deck) => deck.id === request.params.deckId)

  if (!existingDeck) {
    response.status(404).json({ error: 'Deck not found.' })
    return
  }

  try {
    const deck = saveDeck(
      {
        ...request.body,
        id: existingDeck.id,
      },
      existingDeck,
    )
    response.json({
      deck,
      library: getLibrarySnapshot(),
    })
  } catch (error) {
    response.status(400).json({
      error: error.message,
    })
  }
})

app.delete('/api/decks/:deckId', (request, response) => {
  const deletedDeck = removeDeck(request.params.deckId)

  if (!deletedDeck) {
    response.status(404).json({ error: 'Deck not found.' })
    return
  }

  response.json({
    deletedDeck,
    library: getLibrarySnapshot(),
  })
})

app.post('/api/decks/:deckId/access', (request, response) => {
  const existingDeck = db.prepare('SELECT id FROM decks WHERE id = ?').get(request.params.deckId)

  if (!existingDeck) {
    response.status(404).json({ error: 'Deck not found.' })
    return
  }

  upsertRecentView.run(request.params.deckId, new Date().toISOString())
  response.json(getLibrarySnapshot())
})

app.post('/api/study-sessions', (request, response) => {
  const existingDeck = db.prepare('SELECT id FROM decks WHERE id = ?').get(request.body.deckId)

  if (!existingDeck) {
    response.status(404).json({ error: 'Deck not found.' })
    return
  }

  try {
    const session = logStudySession(request.body)
    response.status(201).json({
      session,
      library: getLibrarySnapshot(),
    })
  } catch (error) {
    response.status(400).json({
      error: error.message,
    })
  }
})

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('/{*path}', (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next()
      return
    }

    response.sendFile(path.join(distDir, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`uoDecks server running on http://localhost:${port}`)
  console.log(`SQLite database: ${databasePath}`)
})
