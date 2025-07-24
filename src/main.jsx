// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

//Import TanStack Query Client
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

//React Query Devtools (for debugging)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

//Create the client instance
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
