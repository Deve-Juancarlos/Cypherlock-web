/**
 * Busqueda de direcciones con Nominatim (OpenStreetMap), gratis y sin clave.
 * Politica de uso: maximo 1 consulta por segundo y nada de autocompletar
 * mientras se escribe. Por eso solo se consulta al pulsar "Buscar" o al
 * soltar el marcador, y las consultas se espacian aqui mismo.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
import type { Punto } from './modelo'

const BASE = 'https://nominatim.openstreetmap.org'
const ESPERA_MS = 1100
let ultima = 0

async function consultar<T>(ruta: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const espera = ultima + ESPERA_MS - Date.now()
  if (espera > 0) await new Promise((r) => setTimeout(r, espera))
  ultima = Date.now()
  const qs = new URLSearchParams({ format: 'jsonv2', 'accept-language': 'es', ...params })
  const r = await fetch(`${BASE}${ruta}?${qs}`, { signal })
  if (!r.ok) throw new Error(`Nominatim ${r.status}`)
  return (await r.json()) as T
}

interface Crudo {
  lat: string
  lon: string
  display_name: string
  address?: Record<string, string>
}

export interface Lugar extends Punto {
  etiqueta: string
  distrito: string
  direccion: string
}

function aLugar(c: Crudo): Lugar {
  const a = c.address ?? {}
  const calle = [a.road ?? a.pedestrian ?? a.residential, a.house_number].filter(Boolean).join(' ')
  return {
    lat: Number(c.lat),
    lon: Number(c.lon),
    etiqueta: c.display_name,
    distrito: a.city_district ?? a.suburb ?? a.city ?? a.town ?? a.village ?? '',
    direccion: calle,
  }
}

export async function buscarDireccion(texto: string, signal?: AbortSignal): Promise<Lugar[]> {
  const q = texto.trim()
  if (q.length < 4) return []
  const res = await consultar<Crudo[]>('/search', { q, countrycodes: 'pe', addressdetails: '1', limit: '5' }, signal)
  return res.map(aLugar)
}

export async function direccionDe(p: Punto, signal?: AbortSignal): Promise<Lugar | null> {
  const res = await consultar<Crudo & { error?: string }>(
    '/reverse',
    { lat: String(p.lat), lon: String(p.lon), zoom: '18', addressdetails: '1' },
    signal,
  )
  return res.error ? null : aLugar(res)
}
