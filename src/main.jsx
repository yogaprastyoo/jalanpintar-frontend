import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/index.css';
import '@/utils/clearDummyData'; // Auto-expose clearDummyData() to window

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
