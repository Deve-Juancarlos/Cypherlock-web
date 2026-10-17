/**
 * Solicitud de instalacion en 3 pasos: datos -> ubicacion -> preferencia.
 * Crea una solicitud PENDIENTE en POST /solicitudes/publica; el operador la ve
 * al instante y llama para confirmar la cita.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { toAppError } from '@/core/errors/AppError'
import { cn } from '@/core/utils/cn'
import { solicitudPublicaRemote } from '@/data/datasources/remote'
import {
  aBody, erroresDe, FRANJAS, PASO_DATOS, PASO_PREFERENCIA, PASO_UBICACION, VACIO, type Datos, type Errores,
} from './solicitud/modelo'
import { PasoDatos, PasoPreferencia } from './solicitud/Pasos'
import { PasoUbicacion } from './solicitud/PasoUbicacion'

const PASOS = [
  { titulo: 'Tus datos', esquema: PASO_DATOS },
  { titulo: 'Ubicación', esquema: PASO_UBICACION },
  { titulo: 'Preferencia de visita', esquema: PASO_PREFERENCIA },
] as const

function mensajeError(err: unknown): string {
  const e = toAppError(err)
  if (e.code === 'RATE_LIMITED' || e.status === 429)
    return 'Recibimos varias solicitudes desde tu conexión. Espera unos minutos o escríbenos por WhatsApp.'
  if (e.status === 422) return 'Revisa los datos: alguno no es válido.'
  return 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.'
}

const botonPrimario =
  'inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-cobre px-7 text-[0.9375rem] font-medium text-on-cobre ' +
  'transition-colors hover:bg-cobre-claro disabled:cursor-wait disabled:opacity-70'

export function Formulario() {
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState<Datos>(VACIO)
  const [errores, setErrores] = useState<Errores>({})
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado'>('editando')
  const [falla, setFalla] = useState<string | null>(null)
  const [trampa, setTrampa] = useState('')
  const titulo = useRef<HTMLHeadingElement>(null)
  const primerRender = useRef(true)

  // Al cambiar de paso, el foco va al titulo (teclado y lectores de pantalla).
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    titulo.current?.focus()
  }, [paso])

  const cambiar = <K extends keyof Datos>(k: K, v: Datos[K]) => setDatos((d) => ({ ...d, [k]: v }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setFalla(null)
    const errs = erroresDe(PASOS[paso].esquema.safeParse(datos))
    setErrores(errs)
    if (Object.keys(errs).length) return
    if (paso < PASOS.length - 1) return setPaso(paso + 1)
    // Campo trampa: invisible para personas; los bots lo llenan y no se envia nada.
    if (trampa) return setEstado('enviado')
    setEstado('enviando')
    try {
      await solicitudPublicaRemote.crear(aBody(datos))
      setEstado('enviado')
    } catch (err) {
      setFalla(mensajeError(err))
      setEstado('editando')
    }
  }

  if (estado === 'enviado') {
    const nombre = datos.cliente_nombre.trim().split(/\s+/)[0]
    const franja = FRANJAS.find((f) => f.id === datos.franja)?.texto.toLowerCase()
    return (
      <div role="status" className="py-6">
        <Check className="size-6 text-senal" aria-hidden />
        <p className="mt-4 font-display text-[1.6rem] leading-tight text-texto">Listo{nombre ? `, ${nombre}` : ''}.</p>
        <p className="mt-2 leading-relaxed text-texto-2">
          Recibimos tu solicitud. Te llamaremos al <span className="font-mono">{datos.cliente_telefono.trim()}</span> para
          confirmar la visita{franja && franja !== 'cualquiera' ? ` (preferencia: ${franja})` : ''}.
        </p>
      </div>
    )
  }

  const ultimo = paso === PASOS.length - 1
  return (
    <form onSubmit={enviar} noValidate>
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Progreso">
        {PASOS.map((p, i) => (
          <li key={p.titulo} aria-current={i === paso ? 'step' : undefined}>
            <span className={cn('block h-1 rounded-full', i <= paso ? 'bg-cobre' : 'bg-linea')} />
            <span className={cn('mt-2 block text-xs', i === paso ? 'text-texto' : 'text-texto-3')}>
              {i + 1}. {p.titulo}
            </span>
          </li>
        ))}
      </ol>
      <h3 ref={titulo} tabIndex={-1} className="mb-5 scroll-mt-24 text-lg font-medium text-texto outline-none">
        {PASOS[paso].titulo}
      </h3>

      {paso === 0 && <PasoDatos datos={datos} errores={errores} cambiar={cambiar} />}
      {paso === 1 && <PasoUbicacion datos={datos} errores={errores} cambiar={cambiar} />}
      {paso === 2 && <PasoPreferencia datos={datos} errores={errores} cambiar={cambiar} />}

      <div className="hidden" aria-hidden>
        <input tabIndex={-1} autoComplete="off" name="sitio_web" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
      </div>
      {falla && <p role="alert" className="mt-5 text-sm text-error">{falla}</p>}

      <div className="mt-7 flex items-center justify-between gap-3">
        {paso > 0 ? (
          <button type="button" onClick={() => { setErrores({}); setPaso(paso - 1) }}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-texto-2 hover:text-texto">
            <ArrowLeft className="size-4" aria-hidden /> Atrás
          </button>
        ) : <span />}
        <button type="submit" disabled={estado === 'enviando'} className={botonPrimario}>
          {estado === 'enviando' ? 'Enviando…' : ultimo ? 'Enviar solicitud' : 'Continuar'}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  )
}
