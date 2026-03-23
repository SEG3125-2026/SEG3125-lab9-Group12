# uoDecks

- Exploring: browse, search, and filter decks
- Following instructions / Production: guided deck creation and editing
- Absorbing information: interactive study mode
- Analyzing results: post-session score breakdown

## Entitys

### `STUDENT`

- Represents the learner who owns decks and study history.
- Needed for future authentication, saved progress, and collaboration.

### `CATEGORY`

- Keeps deck organization consistent and queryable.
- Supports the Lab 7 semantic-network idea by grouping related knowledge domains.

### `DECK`

- Main unit of organization in the UI.
- Stores deck-level metadata used in browse cards and study-session summaries.

### `FLASHCARD`

- Ordered child entity of a deck.
- Stores front/back text and position within the deck.

### `STUDY_SESSION`

- Captures one completed attempt through a deck.
- Enables analytics, score history, and performance comparisons.

### `CARD_RESULT`

- Stores the outcome for each flashcard within a session.
- Supports the Lab 8 results page and future performance dashboards.

### `TAG` and `DECK_TAG`

- Allow flexible many-to-many labels such as `midterm`, `definitions`, or `SEG3125`.
- Useful for advanced browse filters beyond a single category.

## Relationships

- One `STUDENT` can create many `DECK` records.
- One `CATEGORY` can organize many `DECK` records.
- One `DECK` contains many `FLASHCARD` records.
- One `DECK` generates many `STUDY_SESSION` records over time.
- One `STUDY_SESSION` stores many `CARD_RESULT` rows.
- One `FLASHCARD` may appear in many `CARD_RESULT` rows across sessions.
- `TAG` and `DECK` form a many-to-many relationship through `DECK_TAG`.

## Schema

### `students`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `student_id` | UUID | PK | Unique student identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login/account identity |
| `display_name` | VARCHAR(100) | NOT NULL | Friendly name shown in UI |
| `created_at` | TIMESTAMP | NOT NULL | Account creation timestamp |

### `categories`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `category_id` | UUID | PK | Unique category identifier |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Category label |
| `description` | TEXT | NULL | Optional help text |

### `decks`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `deck_id` | UUID | PK | Unique deck identifier |
| `student_id` | UUID | FK -> `students.student_id`, NOT NULL | Deck owner |
| `category_id` | UUID | FK -> `categories.category_id`, NOT NULL | Organization bucket |
| `title` | VARCHAR(150) | NOT NULL | Deck name |
| `description` | TEXT | NULL | Deck summary |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Latest edit time |
| `last_studied_at` | TIMESTAMP | NULL | Latest session time |
| `study_count` | INT | DEFAULT 0 | Number of recorded sessions |

### `flashcards`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `flashcard_id` | UUID | PK | Unique card identifier |
| `deck_id` | UUID | FK -> `decks.deck_id`, NOT NULL | Parent deck |
| `card_order` | INT | NOT NULL | Stable order in the deck |
| `front_text` | TEXT | NOT NULL | Question or prompt |
| `back_text` | TEXT | NOT NULL | Answer or definition |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Latest edit time |

### `study_sessions`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `session_id` | UUID | PK | Unique study-session identifier |
| `student_id` | UUID | FK -> `students.student_id`, NOT NULL | Student who studied |
| `deck_id` | UUID | FK -> `decks.deck_id`, NOT NULL | Deck studied |
| `total_cards` | INT | NOT NULL | Deck size at study time |
| `correct_count` | INT | NOT NULL | Correct answers |
| `incorrect_count` | INT | NOT NULL | Incorrect answers |
| `accuracy_percent` | INT | NOT NULL | Rounded percentage |
| `completed_at` | TIMESTAMP | NOT NULL | Session end time |

### `card_results`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `card_result_id` | UUID | PK | Unique result row |
| `session_id` | UUID | FK -> `study_sessions.session_id`, NOT NULL | Parent session |
| `flashcard_id` | UUID | FK -> `flashcards.flashcard_id`, NOT NULL | Card answered |
| `outcome` | VARCHAR(10) | NOT NULL | `right` or `wrong` |
| `answer_order` | INT | NOT NULL | When the card was answered in the session |

### `tags`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `tag_id` | UUID | PK | Unique tag identifier |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable tag |

### `deck_tags`

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| `deck_id` | UUID | FK -> `decks.deck_id`, PK | Deck reference |
| `tag_id` | UUID | FK -> `tags.tag_id`, PK | Tag reference |
