/** Mapa para marcar la casa (Leaflet + teselas de OpenStreetMap). Se carga bajo demanda. */
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation } from 'lucide-react'
import { PERU, type Punto } from './modelo'

const TRUJILLO = { lat: -8.1116, lon: -79.0288 }

const pin = L.divIcon({
  className: 'custom-brand-pin',
  html: `
    <div>
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.059 0 0 8.059 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.059 27.941 0 18 0Z" fill="var(--color-cobre)"/>
        <circle cx="18" cy="17" r="7" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
})

export default function MapaUbicacion({
  punto,
  onPunto,
  onUsarUbicacion,
  cargandoUbicacion,
  deshabilitado = false,
}: {
  punto: Punto | null
  onPunto: (p: Punto) => void
  onUsarUbicacion: () => void
  cargandoUbicacion: boolean
  deshabilitado?: boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  const mapa = useRef<L.Map | null>(null)
  const marcador = useRef<L.Marker | null>(null)
  const avisar = useRef(onPunto)

  useEffect(() => { avisar.current = onPunto }, [onPunto])

  useEffect(() => {
    if (!host.current) return
    const m = L.map(host.current, {
      center: punto ? [punto.lat, punto.lon] : [TRUJILLO.lat, TRUJILLO.lon],
      zoom: punto ? 17 : 14,
      zoomControl: false,
      maxBounds: L.latLngBounds([PERU.latMin, PERU.lonMin], [PERU.latMax, PERU.lonMax]).pad(0.1),
      minZoom: 5,
      maxZoom: 19,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(m)
    m.on('click', (e: L.LeafletMouseEvent) => avisar.current({ lat: e.latlng.lat, lon: e.latlng.lng }))
    mapa.current = m
    return () => {
      m.remove()
      mapa.current = null
      marcador.current = null
    }
    // El mapa se crea una vez; el punto se sincroniza en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const m = mapa.current
    if (!m || !punto) return
    const pos = L.latLng(punto.lat, punto.lon)
    if (!marcador.current) {
      const nuevoMarcador = L.marker(pos, {
        icon: pin,
        draggable: true,
        keyboard: true,
        title: 'Ubicación de instalación',
      }).addTo(m)
      nuevoMarcador.on('dragend', () => {
        const p = nuevoMarcador.getLatLng()
        avisar.current({ lat: p.lat, lon: p.lng })
      })
      marcador.current = nuevoMarcador
    } else {
      marcador.current.setLatLng(pos)
    }
    if (!m.getBounds().pad(-0.1).contains(pos)) {
      const zoom = Math.max(m.getZoom(), 16)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) m.setView(pos, zoom)
      else m.flyTo(pos, zoom, { duration: 1.2 })
    }
  }, [punto])

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-[var(--radius-control)] border border-linea bg-noche-alt">
      <div ref={host} role="application"
        aria-label="Mapa interactivo: toca o haz clic donde está tu casa, o arrastra el marcador"
        className="h-full w-full" />
      <button type="button" onClick={onUsarUbicacion} disabled={deshabilitado || cargandoUbicacion}
        className="absolute right-4 bottom-4 z-[1000] flex size-10 cursor-pointer items-center justify-center rounded-full border border-linea bg-superficie shadow-md transition-all hover:scale-105 hover:bg-noche-alt active:scale-95 disabled:cursor-wait disabled:opacity-50"
        title="Usar mi ubicación actual" aria-label="Usar mi ubicación actual">
        {cargandoUbicacion ? (
          <span className="size-4 animate-spin rounded-full border-2 border-senal border-t-transparent" aria-hidden />
        ) : (
          <Navigation className="size-4 text-senal" aria-hidden />
        )}
      </button>
      {!punto && (
        <div className="pointer-events-none absolute top-4 left-1/2 z-[1000] -translate-x-1/2 whitespace-nowrap rounded-full border border-linea bg-superficie/90 px-3 py-1.5 text-xs font-medium text-texto-2 shadow-sm backdrop-blur-sm">
          Toca el mapa o usa tu ubicación
        </div>
      )}
    </div>
  )
}
