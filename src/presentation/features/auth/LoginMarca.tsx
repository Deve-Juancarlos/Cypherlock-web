/** Columna de marca del login (solo escritorio): identidad y contexto de operación. */
import { lazy, Suspense, useSyncExternalStore } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Activity, Building2, Users, Shield, Lock, Fingerprint } from 'lucide-react'

const LoginEscena3D = lazy(() => import('./LoginEscena3D').then((m) => ({ default: m.LoginEscena3D })))
const ESCRITORIO = '(min-width: 1024px)'

function esEscritorio() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(ESCRITORIO).matches
}

function observarEscritorio(notificar: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const media = window.matchMedia(ESCRITORIO)
  media.addEventListener('change', notificar)
  return () => media.removeEventListener('change', notificar)
}

const TAREAS = [
  { icon: Activity, texto: 'Monitoreo en tiempo real de alertas e intentos de intrusión' },
  { icon: Building2, texto: 'Gestión de domicilios y dispositivos de cada puerta' },
  { icon: Users, texto: 'Administración de cuentas, roles y solicitudes de instalación' },
]

const CARACTERISTICAS = [
  { icon: Shield, texto: 'Acceso solo ADMIN' },
  { icon: Lock, texto: 'Sesiones protegidas' },
  { icon: Fingerprint, texto: 'Rostro y RFID' },
]

export function LoginMarca() {
  const reduceMotion = useReducedMotion()
  const escritorio = useSyncExternalStore(observarEscritorio, esEscritorio, () => false)

  return (
    <aside className="relative hidden overflow-hidden border-r-[3px] border-cobre bg-banda text-banda-texto lg:flex lg:flex-col lg:justify-between lg:gap-10 lg:p-12 xl:p-16">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 size-[34rem] rounded-full bg-banda-senal/[0.06] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 size-[28rem] rounded-full bg-cobre/[0.04] blur-3xl" />
      <div aria-hidden className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-banda-senal/40 via-cobre/40 to-transparent" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative flex items-center gap-3"
      >
        <div className="relative">
          <div aria-hidden className="absolute inset-0 rounded-full bg-banda-senal/20 blur-md" />
          <img src="/brand/emblema-96.png" alt="" width={36} height={36} className="relative size-9" loading="eager" />
        </div>
        <span className="text-[0.875rem] font-semibold tracking-[0.16em] text-banda-texto">CYPHERLOCK</span>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        className="relative max-w-md"
      >
        <div className="relative mb-10 h-64 w-full" aria-hidden>
          <div className="pointer-events-none absolute inset-0 rounded-full bg-banda-senal/5 blur-3xl" />
          {escritorio && (
            <Suspense fallback={<img src="/brand/emblema-256.png" alt="" width={112} height={112} className="relative size-28 opacity-90" />}>
              <LoginEscena3D className="absolute inset-0" />
            </Suspense>
          )}
        </div>

        <h2 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.015em] text-banda-texto">
          Panel de operación
        </h2>
        <p className="mt-4 max-w-sm leading-relaxed text-banda-texto-2">
          Desde aquí el equipo administra las puertas instaladas y atiende las solicitudes de instalación.
        </p>

        <ul className="mt-10 space-y-5">
          {TAREAS.map(({ icon: Icon, texto }, i) => (
            <motion.li
              key={texto}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.4 + i * 0.1 }}
              className="group flex items-start gap-3.5"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-banda-2 ring-1 ring-banda-linea transition-colors duration-300 group-hover:ring-banda-senal/50">
                <Icon className="size-4 text-banda-senal" aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-banda-texto-2 transition-colors group-hover:text-banda-texto">
                {texto}
              </span>
            </motion.li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-2">
          {CARACTERISTICAS.map(({ icon: Icon, texto }) => (
            <span key={texto} className="inline-flex items-center gap-2 rounded-full bg-banda-2/80 px-3 py-1.5 text-xs text-banda-texto-3 ring-1 ring-banda-linea">
              <Icon className="size-3.5 text-banda-senal" aria-hidden />
              {texto}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.8 }}
        className="relative text-xs text-banda-texto-3"
      >
        CypherTech Perú · Sistema de uso interno
      </motion.p>
    </aside>
  )
}
