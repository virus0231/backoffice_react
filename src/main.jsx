import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

if (typeof window !== 'undefined' && !window.__BACKOFFICE_FETCH_PATCHED__) {
  const originalFetch = window.fetch
  window.fetch = (input, init = {}) => {
    const headers = new Headers(init.headers || {})
    const token = localStorage.getItem('auth_token')
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    const xsrfMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    if (xsrfMatch && !headers.has('X-XSRF-TOKEN')) {
      headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfMatch[1]))
    }
    return originalFetch(input, { ...init, headers })
  }
  window.__BACKOFFICE_FETCH_PATCHED__ = true
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
