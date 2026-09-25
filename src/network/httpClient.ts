import type { ZodType } from 'zod'
import { env } from '@/core/config/env'
import { tokenStorage } from '@/core/auth/tokenStorage'
import { AppError, fromResponse } from '@/core/errors/AppError'
import { endpoints } from './endpoints'

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface RequestOptions<T> {
  method?: Method
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  /** Esquema zod para validar la respuesta (contrato con el backend). */
  schema?: ZodType<T>
  /** false = no adjuntar Bearer ni intentar refresh (login, refresh). */
  auth?: boolean
  signal?: AbortSignal
}

let refreshing: Promise<boolean> | null = null
let onSessionExpired: () => void = () => {}

/** La capa de presentacion registra que hacer cuando la sesion ya no se puede renovar. */
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn
}

function buildUrl(path: string, query?: RequestOptions<unknown>['query']): string {
  const url = `${env.apiBaseUrl}${env.apiPrefix}${path}`
  if (!query) return url
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v))
  const s = qs.toString()
  return s ? `${url}?${s}` : url
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Renueva el par de tokens UNA sola vez aunque varias peticiones reciban 401 a
 * la vez (single-flight): el backend rota el refresh y revoca todo si se reusa.
 */
async function refreshSession(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return false
  refreshing ??= (async () => {
    try {
      const res = await fetch(buildUrl(endpoints.auth.refresh), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      })
      if (!res.ok) return false
      const data = (await res.json()) as { access_token: string; refresh_token: string }
      tokenStorage.set(data.access_token, data.refresh_token)
      return true
    } catch {
      return false
    } finally {
      queueMicrotask(() => (refreshing = null))
    }
  })()
  return refreshing
}

export async function http<T = unknown>(path: string, opts: RequestOptions<T> = {}): Promise<T> {
  const { method = 'GET', body, query, schema, auth = true, signal } = opts

  const doFetch = () => {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    const token = tokenStorage.getAccess()
    if (auth && token) headers.Authorization = `Bearer ${token}`
    return fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  }

  let res: Response
  try {
    res = await doFetch()
    if (res.status === 401 && auth) {
      if (await refreshSession()) {
        res = await doFetch()
      } else {
        tokenStorage.clear()
        onSessionExpired()
      }
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err
    throw new AppError({ status: 0, code: 'NETWORK_ERROR', message: String((err as Error)?.message ?? err) })
  }

  const data = await parseBody(res)
  if (!res.ok) throw fromResponse(res.status, data)
  if (!schema) return data as T

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    // El backend cambio su contrato: fallar claro en vez de pintar datos rotos.
    console.error('[http] respuesta fuera de contrato', path, parsed.error.issues)
    throw new AppError({ status: res.status, code: 'INVALID_RESPONSE', message: 'Respuesta inesperada del servidor.' })
  }
  return parsed.data
}

/**
 * Tras recargar la pagina el access token (solo en memoria) se pierde: si hay
 * refresh, se renueva ANTES de la primera peticion en vez de provocar un 401.
 */
export async function ensureSession(): Promise<boolean> {
  if (tokenStorage.getAccess()) return true
  return refreshSession()
}

/** Solo para pruebas. */
export const __internals = { buildUrl, refreshSession }
