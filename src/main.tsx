import './styles/enterprise.css';
import './index.css';
import './gradientStyles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ModernApp from './ModernApp';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element with id "root" not found');
}

createRoot(rootElement).render(
    <StrictMode>
        <ModernApp />
    </StrictMode>
);
