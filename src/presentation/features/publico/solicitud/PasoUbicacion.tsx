/** Paso 2: buscar la direccion, marcar la casa en el mapa (opcional) y referencia escrita. */
import { lazy, Suspense, useState } from 'react'
import { Crosshair, MapPin, Search } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { buscarDireccion, direccionDe, type Lugar } from './geocodificar'
import { dentroDePeru, type Punto } from './modelo'
import { control, Etiqueta, type PasoProps } from './Pasos'

const MapaUbicacion = lazy(() => import('./MapaUbicacion'))

const boton =
  'inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-linea px-3.5 text-sm text-texto ' +
  'transition-colors hover:border-texto-3 disabled:cursor-wait disabled:opacity-60'

export function PasoUbicacion({ datos, errores, cambiar }: PasoProps) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState<Lugar[]>([])
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  /** Fija el punto y, si faltan, completa distrito y direccion con la direccion del lugar. */
  const fijar = async (p: Punto, lugar?: Lugar | null) => {
    if (!dentroDePeru(p.lat, p.lon)) return setAviso('Ese punto está fuera de Perú. Marca la ubicación de tu casa.')
    setAviso(null)
    cambiar('punto', p)
    const l = lugar ?? (datos.direccion && datos.distrito ? null : await direccionDe(p).catch(() => null))
    if (l?.distrito && !datos.distrito) cambiar('distrito', l.distrito)
    if (l?.direccion && !datos.direccion) cambiar('direccion', l.direccion)
  }

  const buscar = async () => {
    if (ocupado || texto.trim().length < 4) return
    setOcupado(true)
    setAviso(null)
    try {
      const r = await buscarDireccion(texto)
      setResultados(r)
      if (r.length === 0) setAviso('No encontramos esa dirección. Prueba con calle y distrito, o marca el punto en el mapa.')
    } catch {
      setAviso('La búsqueda no respondió. Marca el punto directamente en el mapa.')
    } finally {
      setOcupado(false)
    }
  }

  const miUbicacion = () => {
    if (!('geolocation' in navigator)) return setAviso('Tu navegador no permite obtener la ubicación.')
    setOcupado(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => void fijar({ lat: pos.coords.latitude, lon: pos.coords.longitude }).finally(() => setOcupado(false)),
      () => {
        setOcupado(false)
        setAviso('No pudimos obtener tu ubicación. Búscala o márcala en el mapa.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="grid gap-5">
      {/* No es un <form>: va dentro del formulario de la solicitud (no se anidan). */}
      <div className="flex gap-2" role="search">
        <label className="sr-only" htmlFor="buscar-dir">Buscar dirección</label>
        <input id="buscar-dir" className={cn(control, 'mt-0')} placeholder="Ej.: Av. Pardo 731, Miraflores" value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void buscar() } }} />
        <button type="button" onClick={() => void buscar()} className={boton} disabled={ocupado || texto.trim().length < 4}>
          <Search className="size-4" aria-hidden />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      {resultados.length > 0 && (
        <ul className="divide-y divide-linea overflow-hidden rounded-[var(--radius-control)] border border-linea">
          {resultados.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button type="button" onClick={() => { void fijar(r, r); setResultados([]) }}
                className="flex w-full cursor-pointer items-start gap-2 px-3.5 py-2.5 text-left text-sm text-texto-2 hover:bg-superficie">
                <MapPin className="mt-0.5 size-4 shrink-0 text-cobre" aria-hidden />
                {r.etiqueta}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-[var(--radius-control)] bg-superficie" />}>
          <MapaUbicacion punto={datos.punto} onPunto={(p) => void fijar(p)} />
        </Suspense>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p role="status" className={cn('text-xs', datos.punto ? 'text-senal' : 'text-texto-3')}>
            {datos.punto ? 'Ubicación marcada. Puedes arrastrar el marcador para ajustarla.' : 'Opcional: toca el mapa donde está tu casa.'}
          </p>
          <button type="button" onClick={miUbicacion} disabled={ocupado} className={cn(boton, 'h-9')}>
            <Crosshair className="size-4" aria-hidden />
            Usar mi ubicación
          </button>
        </div>
        {aviso && <p role="alert" className="mt-2 text-xs text-warning">{aviso}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_1.4fr]">
        <Etiqueta texto="Distrito o ciudad" error={errores.distrito}>
          <input className={control} autoComplete="address-level2" value={datos.distrito}
            aria-invalid={errores.distrito ? true : undefined} onChange={(e) => cambiar('distrito', e.target.value)} />
        </Etiqueta>
        <Etiqueta texto="Dirección o referencia" error={errores.direccion}>
          <input className={control} autoComplete="street-address" value={datos.direccion}
            aria-invalid={errores.direccion ? true : undefined} onChange={(e) => cambiar('direccion', e.target.value)} />
        </Etiqueta>
      </div>
    </div>
  )
}
