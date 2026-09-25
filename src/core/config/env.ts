/**
 * Configuracion de entorno (solo valores publicos: todo lo que entra en el
 * bundle del navegador es visible para cualquiera).
 */
const trimSlash = (u: string) => u.replace(/\/+$/, '')

export const env = {
  /** Base de la API. Vacio = mismo origen (en dev lo resuelve el proxy de Vite). */
  apiBaseUrl: trimSlash(import.meta.env.VITE_API_BASE_URL ?? ''),
  apiPrefix: '/api/v1',
  /**
   * Base del WebSocket. En Render el HTTP pasa por una regla de reescritura
   * del sitio estatico (mismo origen), pero los WebSocket no se reescriben:
   * van directo a la API (CORS no aplica a WebSocket).
   */
  wsBaseUrl: trimSlash(import.meta.env.VITE_WS_BASE_URL ?? ''),
  /** Refresco del dashboard y listas (ms). */
  refetchIntervalMs: 30_000,
} as const

export function wsUrl(path: string): string {
  const base = env.wsBaseUrl || env.apiBaseUrl || window.location.origin
  return base.replace(/^http/, 'ws') + path
}
