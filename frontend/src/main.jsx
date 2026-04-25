import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CollectionProvider } from './context/CollectionContext.jsx';
import { EnvironmentProvider } from './context/EnvironmentContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EnvironmentProvider>
          <CollectionProvider>
            <App />
          </CollectionProvider>
        </EnvironmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
