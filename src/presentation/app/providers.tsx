import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppError } from '@/core/errors/AppError'
import type { Usuario } from '@/domain/models'
import type { Repositories } from '@/domain/repositories'
import { setSessionExpiredHandler } from '@/network/httpClient'
import { ToastProvider } from '../components/ui/Toast'

// ------------------------------------------------------------ DI de repositorios
const ReposCtx = createContext<Repositories | null>(null)

export function useRepos(): Repositories {
  const r = useContext(ReposCtx)
  if (!r) throw new Error('useRepos fuera de AppProviders')
  return r
}

// ------------------------------------------------------------ sesion
type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous'; reason?: 'expired' }
  | { status: 'authenticated'; user: Usuario }

interface SessionApi {
  state: SessionState
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const SessionCtx = createContext<SessionApi | null>(null)

export function useSession(): SessionApi {
  const s = useContext(SessionCtx)
  if (!s) throw new Error('useSession fuera de AppProviders')
  return s
}

export function useCurrentUser(): Usuario {
  const { state } = useSession()
  if (state.status !== 'authenticated') throw new Error('Sin sesion')
  return state.user
}

function SessionProvider({ repos, queryClient, children }: { repos: Repositories; queryClient: QueryClient; children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: 'loading' })

  useEffect(() => {
    let vivo = true
    repos.auth.restore().then((user) => {
      if (vivo) setState(user ? { status: 'authenticated', user } : { status: 'anonymous' })
    })
    setSessionExpiredHandler(() => {
      queryClient.clear()
      setState({ status: 'anonymous', reason: 'expired' })
    })
    return () => {
      vivo = false
    }
  }, [repos, queryClient])

  const login = useCallback(
    async (username: string, password: string) => {
      const user = await repos.auth.login(username, password)
      setState({ status: 'authenticated', user })
    },
    [repos],
  )

  const logout = useCallback(async () => {
    await repos.auth.logout()
    queryClient.clear()
    setState({ status: 'anonymous' })
  }, [repos, queryClient])

  const api = useMemo(() => ({ state, login, logout }), [state, login, logout])
  return <SessionCtx.Provider value={api}>{children}</SessionCtx.Provider>
}

// ------------------------------------------------------------ raiz
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        refetchOnWindowFocus: true,
        // No reintentar errores de negocio (4xx); si los de red/5xx una vez.
        retry: (count, err) => !(err instanceof AppError && err.status >= 400 && err.status < 500) && count < 1,
      },
    },
  })
}

export function AppProviders({ repos, children }: { repos: Repositories; children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient)
  return (
    <ReposCtx.Provider value={repos}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <SessionProvider repos={repos} queryClient={queryClient}>
            {children}
          </SessionProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ReposCtx.Provider>
  )
}
