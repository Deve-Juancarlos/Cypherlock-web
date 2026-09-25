/**
 * Almacenamiento de la sesion.
 *
 * - access token: solo en memoria (no sobrevive a recargas; se renueva con el refresh).
 * - refresh token: sessionStorage (muere al cerrar la pestana; no se comparte
 *   entre pestanas ni persiste en disco como localStorage).
 * El backend rota el refresh en cada uso y revoca toda la familia si detecta reuso.
 */
const REFRESH_KEY = 'cl.admin.refresh'

let accessToken: string | null = null
type Listener = (hasSession: boolean) => void
const listeners = new Set<Listener>()

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const tokenStorage = {
  getAccess: () => accessToken,
  getRefresh: () => safe(() => sessionStorage.getItem(REFRESH_KEY), null),

  set(access: string, refresh: string) {
    accessToken = access
    safe(() => sessionStorage.setItem(REFRESH_KEY, refresh), undefined)
    listeners.forEach((l) => l(true))
  },

  clear() {
    accessToken = null
    safe(() => sessionStorage.removeItem(REFRESH_KEY), undefined)
    listeners.forEach((l) => l(false))
  },

  subscribe(l: Listener) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}
