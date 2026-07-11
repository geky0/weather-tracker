import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { applyBrowserProfile } from './lib/browser'
import './index.css'
import App from './App.tsx'

applyBrowserProfile()

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    // Pull updates more aggressively so Firefox/Safari don't keep stale caches
    if (registration) {
      setInterval(() => {
        void registration.update()
      }, 60 * 60 * 1000)
    }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
