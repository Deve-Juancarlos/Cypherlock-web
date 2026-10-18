/** Paso 2: buscar la dirección, marcar la casa en el mapa y escribir una referencia. */
import { lazy, Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, Search, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { buscarDireccion, direccionDe, type Lugar } from './geocodificar'
import { dentroDePeru, type Punto } from './modelo'
import { control, Etiqueta, type PasoProps } from './Pasos'

const MapaUbicacion = lazy(() => import('./MapaUbicacion'))

const botonBusqueda =
  'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] border border-linea bg-noche px-4 text-sm font-medium text-texto ' +
  'transition-all duration-200 hover:border-senal hover:bg-senal/5 hover:text-senal ' +
  'disabled:cursor-wait disabled:opacity-60 disabled:hover:border-linea disabled:hover:bg-noche disabled:hover:text-texto'

export function PasoUbicacion({ datos, errores, cambiar }: PasoProps) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState<Lugar[]>([])
  const [ocupado, setOcupado] = useState<'busqueda' | 'ubicacion' | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'error' | 'info'; mensaje: string } | null>(null)

  /** Fija el punto y, si faltan, completa distrito y dirección con el lugar elegido. */
  const fijar = async (p: Punto, lugar?: Lugar | null) => {
    if (!dentroDePeru(p.lat, p.lon)) {
      return setAviso({ tipo: 'error', mensaje: 'Ese punto está fuera de Perú. Por favor, marca la ubicación de tu casa.' })
    }
    setAviso(null)
    cambiar('punto', p)
    const l = lugar ?? (datos.direccion && datos.distrito ? null : await direccionDe(p).catch(() => null))
    if (l?.distrito && !datos.distrito) cambiar('distrito', l.distrito)
    if (l?.direccion && !datos.direccion) cambiar('direccion', l.direccion)
  }

  const buscar = async () => {
    if (ocupado || texto.trim().length < 4) return
    setOcupado('busqueda')
    setAviso(null)
    try {
      const r = await buscarDireccion(texto)
      setResultados(r)
      if (r.length === 0) {
        setAviso({ tipo: 'info', mensaje: 'No encontramos esa dirección. Prueba con calle y distrito o márcala en el mapa.' })
      }
    } catch {
      setAviso({ tipo: 'error', mensaje: 'La búsqueda no respondió. Marca el punto directamente en el mapa.' })
    } finally {
      setOcupado(null)
    }
  }

  const miUbicacion = () => {
    if (ocupado) return
    if (!('geolocation' in navigator)) {
      return setAviso({ tipo: 'error', mensaje: 'Tu navegador no permite obtener la ubicación.' })
    }
    setOcupado('ubicacion')
    setAviso(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fijar({ lat: pos.coords.latitude, lon: pos.coords.longitude }).finally(() => setOcupado(null))
      },
      () => {
        setOcupado(null)
        setAviso({ tipo: 'info', mensaje: 'No pudimos obtener tu ubicación. Búscala por nombre o márcala en el mapa.' })
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="grid gap-6">
      <div className="relative flex gap-2" role="search">
        <label className="sr-only" htmlFor="buscar-dir">Buscar dirección</label>
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-3" aria-hidden />
          <input id="buscar-dir" className={cn(control, 'mt-0 pl-10')} placeholder="Ej.: Av. España 123, Trujillo"
            value={texto} onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void buscar() } }} />
        </div>
        <button type="button" onClick={() => void buscar()} className={botonBusqueda}
          disabled={Boolean(ocupado) || texto.trim().length < 4} aria-label="Buscar dirección">
          {ocupado === 'busqueda' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />}
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {resultados.length > 0 && (
          <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="divide-y divide-linea overflow-hidden rounded-[var(--radius-control)] border border-linea bg-noche">
            {resultados.map((r, i) => (
              <motion.li key={`${r.lat},${r.lon}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}>
                <button type="button" onClick={() => { void fijar(r, r); setResultados([]) }}
                  className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left text-sm text-texto-2 transition-colors hover:bg-superficie hover:text-texto">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-cobre" aria-hidden />
                  <span className="flex-1">{r.etiqueta}</span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {aviso && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} role={aviso.tipo === 'error' ? 'alert' : 'status'}
            className={cn(
              'flex items-start gap-2.5 overflow-hidden rounded-lg border p-3 text-xs font-medium',
              aviso.tipo === 'error' ? 'border-error/30 bg-error/5 text-error' : 'border-warning/30 bg-warning/5 text-warning',
            )}>
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{aviso.mensaje}</span>
            <button type="button" onClick={() => setAviso(null)} className="ml-auto cursor-pointer underline opacity-70 hover:opacity-100">
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <Suspense fallback={<div className="h-72 w-full animate-pulse rounded-[var(--radius-control)] border border-linea bg-noche-alt" />}>
          <MapaUbicacion punto={datos.punto} onPunto={(p) => void fijar(p)}
            onUsarUbicacion={miUbicacion} cargandoUbicacion={ocupado === 'ubicacion'} deshabilitado={Boolean(ocupado)} />
        </Suspense>
        <p role="status" className={cn('mt-2 text-xs', datos.punto ? 'text-senal' : 'text-texto-3')}>
          {datos.punto ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden /> Ubicación marcada. Arrastra el marcador para ajustarla.
            </span>
          ) : 'Opcional: toca el mapa donde está tu casa o usa el botón de ubicación.'}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_1.4fr]">
        <Etiqueta texto="Distrito o ciudad" error={errores.distrito}>
          <input className={control} autoComplete="address-level2" placeholder="Ej. Trujillo" value={datos.distrito}
            aria-invalid={errores.distrito ? true : undefined} onChange={(e) => cambiar('distrito', e.target.value)} />
        </Etiqueta>
        <Etiqueta texto="Dirección o referencia" error={errores.direccion}>
          <input className={control} autoComplete="street-address" placeholder="Ej. Frente a la plaza, casa azul" value={datos.direccion}
            aria-invalid={errores.direccion ? true : undefined} onChange={(e) => cambiar('direccion', e.target.value)} />
        </Etiqueta>
      </div>
    </div>
  )
}
