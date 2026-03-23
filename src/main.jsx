import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { DeckProvider } from './context/DeckContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <BrowserRouter>
      <DeckProvider>
        <ToastProvider>

          <App />
          
        </ToastProvider>
      </DeckProvider>
    </BrowserRouter>

  </StrictMode>,
)
