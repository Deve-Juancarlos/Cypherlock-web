import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createHttpRepositories } from '@/repository'
import { AppProviders } from '@/presentation/app/providers'
import { AppRouter } from '@/presentation/app/router'

// Composicion: la implementacion HTTP de los repositorios se inyecta aqui.
const repos = createHttpRepositories()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders repos={repos}>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
