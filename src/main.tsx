import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './i18n'
import './index.css'
import App from './App.tsx'
import { restoreQueryCache } from './offline/queryPersister'

registerSW({
  onRegisterError(error) {
    console.error('[PWA] Service worker registration failed:', error)
  },
})

restoreQueryCache().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
