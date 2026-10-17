/**
 * Solicitud de instalacion (web publica): datos, validaciones por paso y el
 * body de POST /solicitudes/publica. `preferencia_visita` es una PREFERENCIA:
 * el operador confirma la cita por telefono.
 */
import { z } from 'zod'

export const DIAS = [
  { id: 'LUN', corto: 'Lun' },
  { id: 'MAR', corto: 'Mar' },
  { id: 'MIE', corto: 'Mié' },
  { id: 'JUE', corto: 'Jue' },
  { id: 'VIE', corto: 'Vie' },
  { id: 'SAB', corto: 'Sáb' },
  { id: 'DOM', corto: 'Dom' },
] as const
export type Dia = (typeof DIAS)[number]['id']

export const FRANJAS = [
  { id: 'MANANA', texto: 'Mañana', detalle: '8:00 a 13:00' },
  { id: 'TARDE', texto: 'Tarde', detalle: '14:00 a 19:00' },
  { id: 'CUALQUIERA', texto: 'Cualquiera', detalle: 'Me adapto' },
] as const
export type Franja = (typeof FRANJAS)[number]['id']

export const TIPOS = [
  { id: 'CASA', texto: 'Casa' },
  { id: 'EDIFICIO', texto: 'Edificio' },
  { id: 'ALQUILER', texto: 'Alquiler' },
] as const
export type Tipo = (typeof TIPOS)[number]['id']

/** Peru aproximado: el backend rechaza coordenadas fuera de este rango. */
export const PERU = { latMin: -18.4, latMax: 0.1, lonMin: -81.4, lonMax: -68.6 }
export const LIMA = { lat: -12.0464, lon: -77.0428 }
export const dentroDePeru = (lat: number, lon: number) =>
  lat >= PERU.latMin && lat <= PERU.latMax && lon >= PERU.lonMin && lon <= PERU.lonMax

export interface Punto {
  lat: number
  lon: number
}

export interface Datos {
  cliente_nombre: string
  cliente_telefono: string
  tipo_inmueble: Tipo
  distrito: string
  direccion: string
  punto: Punto | null
  dias: Dia[]
  franja: Franja
  notas: string
}

export const VACIO: Datos = {
  cliente_nombre: '',
  cliente_telefono: '',
  tipo_inmueble: 'CASA',
  distrito: '',
  direccion: '',
  punto: null,
  dias: [],
  franja: 'CUALQUIERA',
  notas: '',
}

export const PASO_DATOS = z.object({
  cliente_nombre: z.string().trim().min(2, 'Escribe tu nombre.').max(120),
  cliente_telefono: z
    .string()
    .trim()
    .regex(/^(\+?51)?\s?9\d{2}\s?\d{3}\s?\d{3}$/, 'Escribe un celular de 9 dígitos, por ejemplo 987 654 321.'),
})

export const PASO_UBICACION = z.object({
  distrito: z.string().trim().min(2, 'Indica tu distrito o ciudad.').max(80),
  direccion: z.string().trim().min(4, 'Escribe la dirección o una referencia.').max(200),
})

export const PASO_PREFERENCIA = z.object({
  dias: z.array(z.string()).min(1, 'Elige al menos un día.'),
  notas: z.string().trim().max(400),
})

export type Errores = Partial<Record<keyof Datos, string>>

export function erroresDe(r: z.ZodSafeParseResult<unknown>): Errores {
  if (r.success) return {}
  const f = r.error.flatten().fieldErrors as Record<string, string[] | undefined>
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]]))
}

/** Body para la API. Los dias van en el orden de la semana. */
export function aBody(d: Datos) {
  return {
    cliente_nombre: d.cliente_nombre.trim(),
    cliente_telefono: d.cliente_telefono.trim(),
    tipo_inmueble: d.tipo_inmueble,
    distrito: d.distrito.trim(),
    departamento: '',
    direccion: d.direccion.trim(),
    notas: d.notas.trim(),
    ...(d.punto ? { latitud: Number(d.punto.lat.toFixed(6)), longitud: Number(d.punto.lon.toFixed(6)) } : {}),
    preferencia_visita: { dias: DIAS.map((x) => x.id).filter((x) => d.dias.includes(x)), franja: d.franja },
  }
}
