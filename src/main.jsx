import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import sprite from './sprite.svg?raw';
import './styles.css';
import './app.css';

/* Inline the icon sprite once so <use href="#i-…"> works everywhere */
document.body.insertAdjacentHTML('afterbegin', sprite);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
