import './styles/enterprise.css';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ModernApp from './ModernApp';

// Own scroll restoration ourselves. With the default 'auto', the browser restores scroll on the
// archive overlays' history.back() and fights useScrollLock's restore, which "teleported" the page
// on mobile. The archive route hooks + useScrollLock now control scroll position explicitly.
if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element with id "root" not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <ModernApp />
    </StrictMode>
);
