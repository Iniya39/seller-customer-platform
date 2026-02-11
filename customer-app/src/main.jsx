import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { StatusBar } from '@capacitor/status-bar'
import App from './App.jsx'
import './styles/global.css'
import { initBackButtonListener } from './hooks/useBackButton'

// Initialize back button listener
initBackButtonListener()

// Configure native status bar so content never goes behind it (Android ignores web meta tags)
if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
}

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


