import './styles/enterprise.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './gradientStyles.css'
import ModernApp from './ModernApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ModernApp />
  </StrictMode>,
)
