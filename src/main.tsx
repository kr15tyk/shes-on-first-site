import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Clean URLs (BrowserRouter) for normal hosting — needs the included .htaccess
// on Hostinger so deep links resolve. The portable single-file preview is built
// with VITE_ROUTER=hash so it works when served from any path (or file://).
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)
