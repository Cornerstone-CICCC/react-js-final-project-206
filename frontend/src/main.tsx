import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: '',
        style: {
          border: '1px solid #F1F5F9',
          padding: '16px',
          color: '#0F172A',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          fontSize: '0.875rem',
          fontWeight: '600',
        },
      }}
    />
  </StrictMode>,
);
