import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DeckProvider } from './context/DeckContext'
import { LanguageProvider } from './context/LanguageContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <BrowserRouter>
      <LanguageProvider>
        <DeckProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </DeckProvider>
      </LanguageProvider>
    </BrowserRouter>

  </StrictMode>,
)
