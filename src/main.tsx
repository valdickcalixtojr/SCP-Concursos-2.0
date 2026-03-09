import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebaseSync } from './services/firebaseSync';
import { notificationService } from './services/notificationService';
import { useConcursoStore } from './store';
import { mockConcursos } from './data/mockData';

// Initialize services
initFirebaseSync();
notificationService.init();

// Load mock data if no data exists
const { concursos, setConcursos } = useConcursoStore.getState();
if (concursos.length === 0) {
  setConcursos(mockConcursos);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
