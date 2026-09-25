/**
 * Configuracion de entorno (solo valores publicos: todo lo que entra en el
 * bundle del navegador es visible para cualquiera).
 */
const trimSlash = (u: string) => u.replace(/\/+$/, '')

export const env = {
  /** Base de la API. Vacio = mismo origen (en dev lo resuelve el proxy de Vite). */
  apiBaseUrl: trimSlash(import.meta.env.VITE_API_BASE_URL ?? ''),
  apiPrefix: '/api/v1',
  /** Refresco del dashboard y listas (ms). */
  refetchIntervalMs: 30_000,
} as const

export function wsUrl(path: string): string {
  const base = env.apiBaseUrl || window.location.origin
  return base.replace(/^http/, 'ws') + path
}
