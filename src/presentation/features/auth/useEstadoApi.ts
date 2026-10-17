import { useEffect, useState } from 'react'
import { env } from '@/core/config/env'

export type EstadoApi = 'verificando' | 'en_linea' | 'despertando'

/**
 * Consulta /health de la API. En Render (plan gratis) la instancia se duerme:
 * la primera respuesta puede tardar casi un minuto, asi que mientras no
 * responda se reintenta cada 5 s y el login lo explica en vez de parecer roto.
 * /health no pasa por el rate limit, asi que reintentar no bloquea el login.
 */
export function useEstadoApi(): EstadoApi {
  const [estado, setEstado] = useState<EstadoApi>('verificando')

  useEffect(() => {
    let vivo = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let ctrl: AbortController | undefined

    const consultar = async () => {
      // Un controlador por intento: uno abortado no puede reutilizarse.
      const actual = new AbortController()
      ctrl = actual
      const limite = setTimeout(() => actual.abort(), 8000)
      try {
        const r = await fetch(`${env.apiBaseUrl}/health`, { cache: 'no-store', signal: actual.signal })
        // Solo cuenta un JSON {"status":"OK"}: el fallback SPA tambien responde 200.
        const ok = r.ok && (await r.json().catch(() => null))?.status === 'OK'
        if (!vivo) return
        setEstado(ok ? 'en_linea' : 'despertando')
        if (!ok) timer = setTimeout(consultar, 5000)
      } catch {
        if (!vivo) return
        setEstado('despertando')
        timer = setTimeout(consultar, 5000)
      } finally {
        clearTimeout(limite)
      }
    }
    void consultar()

    return () => {
      vivo = false
      clearTimeout(timer)
      ctrl?.abort()
    }
  }, [])

  return estado
}
