/** La app: teléfono de ejemplo que gira en 3D con el scroll. */
import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { Check, Download, Wifi, BatteryFull, Signal } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { Aparece, Seccion, Titulo } from './ui'

const EVENTOS = [
  { hora: '08:41', tipo: 'Tarjeta', texto: 'Puerta principal · Rosa', nivel: 'ok' },
  { hora: '08:12', tipo: 'QR visita', texto: 'Canjeado · Técnico de internet', nivel: 'ok' },
  { hora: '07:58', tipo: 'Alerta', texto: '3 intentos con tarjeta no registrada', nivel: 'alerta' },
  { hora: '07:30', tipo: 'Rostro', texto: 'Puerta principal · Daniel', nivel: 'ok' },
  { hora: 'ayer', tipo: 'Tarjeta', texto: 'Desactivada · llavero perdido', nivel: 'info' },
] as const

const PUNTOS = [
  'Avisos cuando alguien intenta entrar con una tarjeta o un rostro que no reconoce.',
  'Historial de entradas por persona y por forma de acceso.',
  'Abrir la puerta a distancia y crear códigos para visitas.',
  'Dar de baja una tarjeta perdida sin cambiar la chapa.',
]

/** Genera un transform escalonado para cada evento de la lista. */
function useEventoAnimado(scrollYProgress: MotionValue<number>, indice: number) {
  // Cada evento aparece un poco después que el anterior
  const inicio = 0.15 + indice * 0.08
  const fin = inicio + 0.25
  const opacidad = useTransform(scrollYProgress, [inicio - 0.05, inicio, fin], [0, 0, 1])
  const y = useTransform(scrollYProgress, [inicio - 0.05, inicio, fin], [12, 12, 0])
  return { opacity: opacidad, y }
}

function Evento({ evento, indice, scrollYProgress }: {
  evento: (typeof EVENTOS)[number]
  indice: number
  scrollYProgress: MotionValue<number>
}) {
  const anim = useEventoAnimado(scrollYProgress, indice)
  return (
    <motion.li
      style={anim}
      className="grid grid-cols-[2.6rem_1fr] gap-2 border-b border-banda-linea/40 px-6 py-3.5"
    >
      <span className="font-mono text-2xs text-banda-texto-3">{evento.hora}</span>
      <span>
        <span className={cn(
          'block font-mono text-[0.625rem] tracking-[0.08em] uppercase font-medium',
          evento.nivel === 'alerta' ? 'text-error' : evento.nivel === 'info' ? 'text-banda-texto-3' : 'text-banda-senal',
        )}>{evento.tipo}</span>
        <span className="mt-0.5 block text-xs leading-snug text-banda-texto-2">{evento.texto}</span>
      </span>
    </motion.li>
  )
}

function BarraEstado() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1">
      <span className="font-mono text-[0.625rem] font-medium text-banda-texto-2">9:41</span>
      <div className="flex items-center gap-1.5 text-banda-texto-2">
        <Signal className="size-3" />
        <Wifi className="size-3" />
        <BatteryFull className="size-3" />
      </div>
    </div>
  )
}

function Telefono() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Física de scroll mejorada: más suave y con "acercamiento"
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [32, 8, 2])
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-28, -12, -4])
  const rotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [4, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 10, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 0.96, 1])

  return (
    <div ref={ref} className="flex justify-center [perspective:1600px]">
      <motion.div
        style={{ rotateX, rotateY, rotateZ, y, scale }}
        className="relative w-[18rem] [transform-style:preserve-3d]"
      >
        {/* Botones laterales del teléfono (volumen y power) */}
        <div className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l-sm bg-banda-linea" />
        <div className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l-sm bg-banda-linea" />
        <div className="absolute -right-[3px] top-28 h-12 w-[3px] rounded-r-sm bg-banda-linea" />

        {/* Cuerpo del teléfono con bisel metálico */}
        <div className="rounded-[2.6rem] border border-banda-linea bg-gradient-to-br from-banda-2 to-banda p-[3px] shadow-[0_50px_100px_-30px_rgba(10,15,18,0.6)]">
          {/* Pantalla */}
          <div className="relative overflow-hidden rounded-[2.35rem] bg-banda">
            {/* Reflejo de cristal (glassmorphism) */}
            <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
            {/* Brillo superior sutil */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 z-30 bg-gradient-to-b from-white/[0.04] to-transparent" />

            {/* Notch / Isla dinámica */}
            <div className="absolute left-1/2 top-3 z-40 h-6 w-24 -translate-x-1/2 rounded-full bg-banda ring-1 ring-banda-linea/50" />

            {/* Contenido de la pantalla */}
            <div className="relative z-10 flex h-[36rem] flex-col">
              <BarraEstado />

              {/* Cabecera de la app */}
              <div className="flex items-center justify-between px-6 pt-4 pb-3">
                <span className="font-mono text-2xs tracking-[0.14em] text-banda-texto-3 uppercase">
                  Mi casa
                </span>
                <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-banda-senal">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-banda-senal opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-banda-senal" />
                  </span>
                  en vivo
                </span>
              </div>

              {/* Resumen del día */}
              <div className="px-6 pb-5">
                <p className="font-display text-[1.4rem] leading-tight text-banda-texto">
                  Hoy, 3 entradas
                </p>
                <p className="mt-1 text-2xs text-banda-texto-3">1 alerta · 2 reconocidas</p>
              </div>

              {/* Lista de eventos con animación escalonada */}
              <ul className="flex-1 border-t border-banda-linea/60">
                {EVENTOS.map((e, i) => (
                  <Evento key={e.hora + e.texto} evento={e} indice={i} scrollYProgress={scrollYProgress} />
                ))}
              </ul>

              {/* Botones de acción dentro de la app */}
              <div className="grid grid-cols-2 gap-2.5 p-5 pb-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full bg-cobre py-2.5 text-center text-2xs font-semibold text-on-cobre shadow-sm shadow-cobre/30 transition-shadow hover:shadow-md hover:shadow-cobre/40"
                >
                  Abrir puerta
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full border border-banda-linea bg-banda-2/50 py-2.5 text-center text-2xs font-medium text-banda-texto transition-colors hover:bg-banda-2 hover:text-banda-texto-2"
                >
                  Crear QR
                </motion.button>
              </div>

              {/* Indicador home (barra inferior estilo iOS) */}
              <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-banda-texto-3/40" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function LaApp() {
  return (
    <Seccion id="app" alt>
      <div className="grid items-center gap-16 overflow-hidden md:grid-cols-2">
        <div className="order-2 md:order-1">
          <Telefono />
          <p className="mt-8 text-center text-xs text-texto-3">Pantalla de ejemplo</p>
        </div>
        <div className="order-1 md:order-2">
          <Aparece>
            <Titulo>Lo que pasa en tu puerta, en tu bolsillo.</Titulo>
          </Aparece>
          <ul className="mt-8 space-y-4">
            {PUNTOS.map((p, i) => (
              <Aparece as="li" key={p} delay={0.05 + i * 0.06} className="flex gap-3.5 leading-relaxed text-texto-2">
                <Check className="mt-1 size-4 shrink-0 text-senal" aria-hidden />
                {p}
              </Aparece>
            ))}
          </ul>
          <Aparece delay={0.3} className="mt-9">
            <a
              href="/descargas/cypherlock-android.apk"
              download
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-cobre px-6 text-[0.9375rem] font-medium text-on-cobre transition-all duration-300 hover:bg-cobre-claro hover:shadow-lg hover:shadow-cobre/20 hover:-translate-y-0.5"
            >
              <Download className="size-4" aria-hidden />
              Descargar para Android
            </a>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-texto-2">
              Para clientes con CYPHERLOCK instalado. Ábrela y toca{' '}
              <strong className="text-texto">Activar mi cuenta</strong> con el código que te entregó el técnico.
            </p>
          </Aparece>
        </div>
      </div>
    </Seccion>
  )
}
