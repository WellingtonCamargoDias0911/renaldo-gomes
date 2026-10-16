import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { GuestsPage } from './pages/GuestsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GuestsPage />
  </StrictMode>,
)
