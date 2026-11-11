import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { openTerminal } from './components/Terminal.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Lift the intro screen once the page has painted and the fonts are in (or after 1.5s at most)
requestAnimationFrame(() => {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => window.__introDone?.());
});

// A hello for anyone who opens DevTools
window.steven = () => {
  openTerminal();
  return 'Opening the terminal…';
};
console.log(
  '%c Hi developer 👋 %c\n\nThanks for peeking under the hood.\nType %csteven()%c here, or press ` on the page, to open my terminal.\nThe source is on GitHub: https://github.com/StevenTI1191',
  'background:#111;color:#F4F4F0;font:700 14px monospace;padding:6px 10px;border-radius:6px',
  'color:inherit;font:13px monospace',
  'color:#2563EB;font:700 13px monospace',
  'color:inherit;font:13px monospace'
);
