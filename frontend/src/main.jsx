import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';
import { ClientAuthProvider } from './auth/ClientAuth.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClientAuthProvider>
        <App />
      </ClientAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
