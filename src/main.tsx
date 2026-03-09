import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebaseSync } from './services/firebaseSync';
import { notificationService } from './services/notificationService';

initFirebaseSync();
notificationService.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
