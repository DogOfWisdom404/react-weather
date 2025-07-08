import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './components/Weather.css'
import Weather from './components/Weather.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Weather />
  </StrictMode>,
)
