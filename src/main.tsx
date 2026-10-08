import './styles/tokens.css';
import './styles/base.css';
import './styles/glass.css';
import './components/nav.css';
import './scenes/hero.css';
import './lib/gsap';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

// Scroll position is ours: pinned scenes and dialogs restore it explicitly.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
