/**
 * Pase de visita desde la web: la puerta NO tiene teclado; la visita escribe su
 * codigo aqui y la API manda abrir la puerta. Contrato:
 *   GET  /visitas/publica/{token}        -> {estado, intentos_restantes, requiere_ubicacion}
 *   POST /visitas/publica/{token}/abrir  {codigo, latitud?, longitud?}
 */
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import { http } from '@/network/httpClient'

export const EstadoPase = z.object({
  estado: z.string(),
  intentos_restantes: z.number().optional(),
  requiere_ubicacion: z.boolean().optional(),
})
export type EstadoPase = z.infer<typeof EstadoPase>

const ruta = (token: string) => `/visitas/publica/${encodeURIComponent(token)}`

export const consultarPase = (token: string) => http(ruta(token), { auth: false, schema: EstadoPase })

export interface Ubicacion {
  latitud: number
  longitud: number
}

/** Ubicacion del navegador (alta precision, 10 s). Rechaza con un mensaje claro. */
export function pedirUbicacion(): Promise<Ubicacion> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Tu navegador no permite compartir la ubicación.'))
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitud: p.coords.latitude, longitud: p.coords.longitude }),
      () => reject(new Error('Necesitamos tu ubicación para comprobar que estás en la puerta. Actívala y vuelve a intentar.')),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    )
  })
}

export type Resultado = { tipo: 'abierta' } | { tipo: 'error'; mensaje: string; agotado?: boolean }

export async function abrirConCodigo(token: string, codigo: string, ubicacion?: Ubicacion): Promise<Resultado> {
  try {
    await http(`${ruta(token)}/abrir`, { method: 'POST', auth: false, body: { codigo, ...ubicacion } })
    return { tipo: 'abierta' }
  } catch (err) {
    const e = toAppError(err)
    if (e.status === 410) return { tipo: 'error', mensaje: 'Este pase ya no está disponible.', agotado: true }
    if ([400, 403, 503, 504].includes(e.status) && e.message) return { tipo: 'error', mensaje: e.message }
    return { tipo: 'error', mensaje: e.userMessage }
  }
}
