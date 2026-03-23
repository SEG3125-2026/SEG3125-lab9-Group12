import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import AboutPage from './pages/AboutPage'
import BrowsePage from './pages/BrowsePage'
import CreateDeckPage from './pages/CreateDeckPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ResultsPage from './pages/ResultsPage'
import StudyPage from './pages/StudyPage'

function App() {
  return (
    <Routes>

      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="create" element={<CreateDeckPage />} />
        <Route path="edit/:deckId" element={<CreateDeckPage />} />
        <Route path="study/:deckId" element={<StudyPage />} />
        <Route path="results/:sessionId" element={<ResultsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
