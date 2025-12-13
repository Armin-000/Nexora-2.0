import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import App from './App';
import './styles/index.css';

// Stranice
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Početna prezentacijska stranica */}
          <Route path="/" element={<Landing />} />

          {/* Auth stranice */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Glavni chatbot */}
          <Route path="/chat" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);