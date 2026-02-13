import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: { style: { background: '#33a75d' } },
          error: { style: { background: '#de4e4e' } },
        }}
      />
    </AuthProvider>
  </StrictMode>,
);
