# ---OVERVIEW---

This repository contains a flashcard management system designed for efficient study sessions and deck customization.

## Application Checklist

### Navigation & Discovery
- [ ] **Home:** Accessible landing page.
- [ ] **About:** Background and the description of the application.
- [ ] **Browse Overview:** View and manage all decks.
- [ ] **Recent Activities:** Quick access to recently used or created content.

### Deck Creation & Validation
- [ ] **Create New Deck:** Interface for adding custom study material.
- [ ] **Builder Tips:** Contextual help for creating high-quality cards.
- [ ] **Error Handling:** - Prevents submission if fields are empty.
    - Requires all fields to be "Filled up" before saving.
- [ ] **Navigation:** Smooth transition back to "Browse" after creation.

### Study Mode (Gameplay)
- [ ] **Play Deck:** Start a session with newly created or existing cards.
- [ ] **Play Again:** Option to restart the deck for reinforcement.
- [ ] **100% Completion:** Victory visual and sound feedback upon finishing a deck perfectly.
- [ ] **Action Buttons:** Clear controls for navigating through cards.
- [ ] **Exit Strategy:** Easy return to the other sections.

### Localization & Language
- [ ] **French Toggle:** Global UI language switch available on all pages.
- [ ] **Input Persistence:** > **Note:** Card content remains in the user's original input language. The system does not alter user-generated text to ensure accuracy.
- [ ] **Future Roadmap:** Implementation of a **dynamic translator** for card content.

# --- FRONTEND - USABILITY HEURISTICS ---
## 1. Visibility of System Status
The UI ensures users always know what is happening through real-time feedback.
* **Progress Tracking:** Study sessions include a progress bar and card counter for immediate feedback.
* **Active States:** The navigation bar uses a **red pill highlight** to indicate the user's current location.
* **Success Feedback:** The "Study session complete!" screen features a large circular accuracy meter for a high-impact summary.

## 2. Match Between System & Real World (Mapping)
The app uses familiar metaphors and language tailored to student life.
* **Terminology:** Concepts like "Decks," "Flashcards," and "Course Categories" align with physical study habits.
* **Iconography:** Standard conventions are followed (e.g., 🔍 for search, 📖 for "About," and ➕ for "Create").

## 3. User Control & Freedom
Users are provided with clear "emergency exits" and undo capabilities.
* **Exit Routes:** A "Back to Decks" button allows users to leave a study session at any time.
* **Management:** The "Browse" and "Recently Viewed" sections offer "Edit" and "Delete" buttons for full control over content.

## 4. Consistency & Standards
The interface maintains a unified look and feel throughout the application.
* **Color Palette:** Primary actions utilize **uOttawa Red**, paired with soft grays for secondary containers to maintain brand identity.
* **Layout:** A card-based design is applied universally, from the "About" page to the "Library," creating a predictable visual rhythm.

## 5. Error Prevention
The system is designed to stop errors before they occur.
* **Form Validation:** Red asterisks and specific warnings (e.g., *"Each flashcard needs both a front and a back"*) prevent saving broken decks.
* **Constraint Handling:** The "Save" function remains disabled until all requirements are met.

## 6. Recognition Rather Than Recall
Information is kept visible to reduce the user's memory load.
* **Recently Viewed Decks:** Recent activity is pinned to the Browse page so users don't have to search for their last project.
* **Visual Summaries:** The Library Overview provides a snapshot of all available decks and categories at a glance.

## 7. Flexibility & Efficiency of Use
The app caters to both novice and power users.
* **Keyboard Shortcuts:** Advanced users can navigate faster using `SPACE`, `W`, `C`, and `R`.
* **Filters:** Category selectors allow for quick sorting of large libraries.

## 8. Aesthetic & Minimalist Design
The UI provides only necessary information in an elegant way.
* **Whitespace:** The landing page uses generous spacing to focus attention on the "Start Learning" call to action.
* **No Clutter:** Secondary information is tucked behind "Learn More" or "Show Less" toggles.

## 9. Help Users Recognize, Diagnose, & Recover from Errors
Error messages are expressed in plain language and provide clear solutions.
* **Visual Cues:** Missing fields are highlighted in red with a warning icon for instant recognition.
* **Plain Language:** Notifications explain *why* an action was stopped (e.g., *"The builder keeps incomplete cards from being saved to prevent study errors"*).

## 10. Help & Documentation
Proactive and in-place hints guide the user through complex tasks.
* **Proactive Hints:** A "View Builder Tips" button is integrated directly into the creation screen.
* **Integrated Manual:** The "About" section explains the study structure and how the platform supports student needs.


# --- BACKEND ---

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
