/**
 * Mapa para marcar la casa (Leaflet + teselas de OpenStreetMap). Clic en el
 * mapa o arrastrar el marcador fija el punto. Se carga bajo demanda: Leaflet
 * solo se descarga al llegar al paso de ubicacion.
 */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LIMA, PERU, type Punto } from './modelo'

// Marcador dibujado en CSS: evita las imagenes por defecto de Leaflet, que
// se rompen al empaquetar con Vite.
const pin = L.divIcon({
  className: '',
  html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#e8955a;border:3px solid #0a0f12;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.5)"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

export default function MapaUbicacion({ punto, onPunto }: { punto: Punto | null; onPunto: (p: Punto) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const mapa = useRef<L.Map | null>(null)
  const marcador = useRef<L.Marker | null>(null)
  const avisar = useRef(onPunto)
  useEffect(() => {
    avisar.current = onPunto
  }, [onPunto])

  useEffect(() => {
    if (!host.current) return
    const m = L.map(host.current, {
      center: punto ? [punto.lat, punto.lon] : [LIMA.lat, LIMA.lon],
      zoom: punto ? 17 : 12,
      maxBounds: L.latLngBounds([PERU.latMin, PERU.lonMin], [PERU.latMax, PERU.lonMax]).pad(0.1),
      minZoom: 5,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)
    m.on('click', (e: L.LeafletMouseEvent) => avisar.current({ lat: e.latlng.lat, lon: e.latlng.lng }))
    mapa.current = m
    return () => {
      m.remove()
      mapa.current = null
      marcador.current = null
    }
    // El mapa se crea una sola vez; el punto se sincroniza en el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const m = mapa.current
    if (!m || !punto) return
    const pos = L.latLng(punto.lat, punto.lon)
    if (!marcador.current) {
      marcador.current = L.marker(pos, { icon: pin, draggable: true, keyboard: true, title: 'Tu casa' }).addTo(m)
      marcador.current.on('dragend', () => {
        const p = marcador.current!.getLatLng()
        avisar.current({ lat: p.lat, lon: p.lng })
      })
    } else {
      marcador.current.setLatLng(pos)
    }
    if (!m.getBounds().pad(-0.2).contains(pos)) m.setView(pos, Math.max(m.getZoom(), 16))
  }, [punto])

  return (
    <div
      ref={host}
      role="application"
      aria-label="Mapa: toca o haz clic donde está tu casa; también puedes arrastrar el marcador"
      className="h-72 w-full overflow-hidden rounded-[var(--radius-control)] border border-linea"
    />
  )
}
