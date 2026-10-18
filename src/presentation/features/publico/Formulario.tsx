/**
 * Solicitud de instalacion en 3 pasos: datos -> ubicacion -> preferencia.
 * Crea una solicitud PENDIENTE en POST /solicitudes/publica; el operador la ve
 * al instante y llama para confirmar la cita.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react'
import { toAppError } from '@/core/errors/AppError'
import { cn } from '@/core/utils/cn'
import { solicitudPublicaRemote } from '@/data/datasources/remote'
import { whatsapp } from './datosContacto'
import { IconoWhatsApp } from './ui'
import {
  aBody, erroresDe, FRANJAS, PASO_DATOS, PASO_PREFERENCIA, PASO_UBICACION, VACIO, type Datos, type Errores,
} from './solicitud/modelo'
import { PasoDatos, PasoPreferencia } from './solicitud/Pasos'
import { PasoUbicacion } from './solicitud/PasoUbicacion'

const PASOS = [
  { titulo: 'Tus datos', esquema: PASO_DATOS },
  { titulo: 'Ubicación', esquema: PASO_UBICACION },
  { titulo: 'Preferencia', esquema: PASO_PREFERENCIA },
] as const

function mensajeError(err: unknown): string {
  const e = toAppError(err)
  if (e.code === 'RATE_LIMITED' || e.status === 429)
    return 'Recibimos varias solicitudes desde tu conexión. Espera unos minutos o escríbenos por WhatsApp.'
  if (e.status === 422) {
    const campos = e.fields.map((f) => f.error).filter(Boolean)
    return campos.length ? campos.join(' ') : 'Revisa los datos: alguno no es válido o falta completar.'
  }
  if (e.code === 'NETWORK_ERROR' || e.status === 503 || e.status === 502 || e.status === 504)
    return 'El servidor de solicitudes no está disponible en este momento. Inténtalo más tarde o escríbenos por WhatsApp.'
  if (e.status === 404) return 'No encontramos el servicio de solicitudes. Escríbenos por WhatsApp mientras lo revisamos.'
  return 'No pudimos enviar tu solicitud. Inténtalo de nuevo o contáctanos por WhatsApp.'
}

const botonPrimario =
  'inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-cobre px-7 text-[0.9375rem] font-semibold text-on-cobre ' +
  'transition-all duration-300 hover:-translate-y-0.5 hover:bg-cobre-claro hover:shadow-lg hover:shadow-cobre/20 ' +
  'disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none'

export function Formulario() {
  const [paso, setPaso] = useState(0)
  const [datos, setDatos] = useState<Datos>(VACIO)
  const [errores, setErrores] = useState<Errores>({})
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado'>('editando')
  const [falla, setFalla] = useState<string | null>(null)
  const [trampa, setTrampa] = useState('')
  const titulo = useRef<HTMLHeadingElement>(null)
  const primerRender = useRef(true)
  const reducirMovimiento = useReducedMotion()

  // Al cambiar de paso, el foco va al titulo (teclado y lectores de pantalla).
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false
      return
    }
    titulo.current?.focus()
  }, [paso])

  const cambiar = <K extends keyof Datos>(k: K, v: Datos[K]) => {
    setDatos((d) => ({ ...d, [k]: v }))
    setErrores((prev) => {
      if (!prev[k]) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

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
      <motion.div
        initial={reducirMovimiento ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        role="status"
        className="flex flex-col items-center py-8 text-center"
      >
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-senal/10">
          <motion.div
            initial={reducirMovimiento ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: reducirMovimiento ? 0 : 0.2 }}
          >
            <Check className="size-8 text-senal" aria-hidden />
          </motion.div>
        </div>
        <p className="font-display text-[1.75rem] leading-tight text-texto">Listo{nombre ? `, ${nombre}` : ''}.</p>
        <p className="mt-3 max-w-sm leading-relaxed text-texto-2">
          Recibimos tu solicitud. Te llamaremos al{' '}
          <span className="font-mono font-medium text-texto">{datos.cliente_telefono.trim()}</span>{' '}
          para confirmar la visita{franja && franja !== 'cualquiera' ? ` (preferencia: ${franja})` : ''}.
        </p>
        <a
          href={whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-senal transition-colors hover:text-cobre"
        >
          <IconoWhatsApp className="size-4" />
          ¿Necesitas una respuesta más rápida? Escríbenos
        </a>
      </motion.div>
    )
  }

  const ultimo = paso === PASOS.length - 1
  return (
    <form onSubmit={enviar} noValidate className="relative">
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Progreso del formulario">
        {PASOS.map((p, i) => {
          const completado = i < paso
          const actual = i === paso
          return (
            <li key={p.titulo} className="relative flex flex-col items-center" aria-current={actual ? 'step' : undefined}>
              {i < PASOS.length - 1 && (
                <span aria-hidden className={cn('absolute top-3 left-[60%] right-[-40%] h-0.5', completado ? 'bg-cobre' : 'bg-linea')} />
              )}
              <span className={cn(
                'relative z-10 flex size-7 items-center justify-center rounded-full border-2 transition-all duration-300',
                actual || completado ? 'border-cobre bg-cobre text-on-cobre' : 'border-linea bg-superficie text-texto-3',
              )}>
                {completado ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <span className="text-xs font-bold">{i + 1}</span>}
              </span>
              <span className={cn(
                'mt-2.5 text-center text-xs font-medium transition-colors duration-300',
                actual ? 'text-texto' : 'text-texto-3',
              )}>{p.titulo}</span>
            </li>
          )
        })}
      </ol>
      <h3 ref={titulo} tabIndex={-1} className="mb-6 scroll-mt-24 text-lg font-semibold text-texto outline-none">
        {PASOS[paso].titulo}
      </h3>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={paso}
          initial={reducirMovimiento ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducirMovimiento ? undefined : { opacity: 0, x: -20 }}
          transition={{ duration: reducirMovimiento ? 0 : 0.3, ease: 'easeInOut' }}
        >
          {paso === 0 && <PasoDatos datos={datos} errores={errores} cambiar={cambiar} />}
          {paso === 1 && <PasoUbicacion datos={datos} errores={errores} cambiar={cambiar} />}
          {paso === 2 && <PasoPreferencia datos={datos} errores={errores} cambiar={cambiar} />}
        </motion.div>
      </AnimatePresence>

      <div className="hidden" aria-hidden>
        <input tabIndex={-1} autoComplete="off" name="sitio_web" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
      </div>
      <AnimatePresence>
        {falla && (
          <motion.div
            initial={reducirMovimiento ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducirMovimiento ? undefined : { opacity: 0 }}
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-lg bg-error/5 p-3 text-sm text-error"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {falla}{' '}
              <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
                Abrir WhatsApp
              </a>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-linea pt-6">
        {paso > 0 ? (
          <button type="button" onClick={() => { setErrores({}); setPaso(paso - 1) }}
            className="group inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-texto-2 transition-colors hover:text-texto">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden /> Atrás
          </button>
        ) : <span />}
        <button type="submit" disabled={estado === 'enviando'} className={botonPrimario}>
          {estado === 'enviando' ? (
            <><Loader2 className="size-4 animate-spin" aria-hidden /> Enviando…</>
          ) : (
            <>{ultimo ? 'Enviar solicitud' : 'Continuar'} <ArrowRight className="size-4" aria-hidden /></>
          )}
        </button>
      </div>
    </form>
  )
}
