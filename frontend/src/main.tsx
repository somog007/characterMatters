import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { initAnalytics } from './services/analytics'
import './index.css'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE', // Replace with actual DSN
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
})

initAnalytics()

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>,
)