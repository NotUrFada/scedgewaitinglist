import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Error boundary for better error handling
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #050505; color: #fff; font-family: sans-serif;">
      <div style="text-align: center;">
        <h1 style="margin-bottom: 1rem;">Error Loading App</h1>
        <p style="color: #999;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p style="color: #666; margin-top: 1rem; font-size: 0.875rem;">Check the console for details</p>
      </div>
    </div>
  `;
}