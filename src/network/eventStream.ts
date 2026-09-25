/**
 * Canal en vivo /ws/eventos.
 *
 * - Autenticacion por PRIMER MENSAJE ({type:"auth", access_token}): el JWT no
 *   viaja en la URL (no queda en logs de proxies ni en el historial).
 * - Cierre 1008 = token vencido/invalido: se renueva el access token con el
 *   refresh (via una peticion autenticada) y se reconecta.
 * - Reconexion con backoff exponencial acotado.
 */
import { wsUrl } from '@/core/config/env'
import { tokenStorage } from '@/core/auth/tokenStorage'
import { http } from './httpClient'
import { endpoints, WS_EVENTOS } from './endpoints'

export type StreamStatus = 'connecting' | 'live' | 'offline'

export interface StreamEvent {
  id?: number
  tipo: string
  origen?: string
  mensaje?: string
  nivel?: string
  domicilio_id?: number | null
  creado_en?: string | null
  [k: string]: unknown
}

export function openEventStream(handlers: {
  onEvent: (e: StreamEvent) => void
  onStatus: (s: StreamStatus) => void
}): () => void {
  let ws: WebSocket | null = null
  let stopped = false
  let attempt = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const schedule = () => {
    if (stopped) return
    handlers.onStatus('offline')
    const delay = Math.min(30_000, 1000 * 2 ** attempt++)
    timer = setTimeout(connect, delay)
  }

  const connect = () => {
    if (stopped) return
    const token = tokenStorage.getAccess()
    if (!token) return schedule()
    handlers.onStatus('connecting')
    ws = new WebSocket(wsUrl(WS_EVENTOS))
    ws.onopen = () => ws?.send(JSON.stringify({ type: 'auth', access_token: token }))
    ws.onmessage = (msg) => {
      let data: StreamEvent
      try {
        data = JSON.parse(String(msg.data))
      } catch {
        return
      }
      if (data.type === 'auth_ok') {
        attempt = 0
        handlers.onStatus('live')
        return
      }
      handlers.onEvent(data)
    }
    ws.onclose = async (ev) => {
      ws = null
      if (stopped) return
      if (ev.code === 1008) {
        // Token vencido: una peticion autenticada fuerza el refresh del par.
        await http(endpoints.auth.me).catch(() => undefined)
      }
      schedule()
    }
  }

  connect()
  return () => {
    stopped = true
    clearTimeout(timer)
    ws?.close(1000)
  }
}
