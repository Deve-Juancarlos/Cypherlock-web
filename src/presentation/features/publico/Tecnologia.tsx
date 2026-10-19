/** Lo que hay dentro de la puerta: bento oscuro con las piezas del sistema. */
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { BellRing, Camera, CreditCard, KeyRound, Lock, Radio, type LucideIcon } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { Aparece } from './ui'

function Celda({ icono: Icono, titulo, texto, className, delay, children }: {
  icono: LucideIcon
  titulo: string
  texto: string
  className?: string
  delay: number
  children?: ReactNode
}) {
  return (
    <Aparece
      delay={delay}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-banda-linea bg-banda-2/60 p-6 transition-colors duration-500 hover:border-banda-senal/40 sm:p-7',
        className,
      )}
    >
      {/* Brillo que sigue al borde al pasar el cursor */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-banda-senal/0 blur-3xl transition-colors duration-700 group-hover:bg-banda-senal/15" />
      <span className="relative flex size-10 items-center justify-center rounded-xl border border-banda-linea bg-banda text-banda-senal">
        <Icono className="size-[1.125rem]" aria-hidden />
      </span>
      <h3 className="relative mt-5 font-display text-[1.35rem] leading-snug font-semibold text-banda-texto">{titulo}</h3>
      <p className="relative mt-2 max-w-md text-[0.9375rem] leading-relaxed text-banda-texto-2">{texto}</p>
      {children}
    </Aparece>
  )
}

const EN_VIVO = [
  { hora: '08:41', tipo: 'Tarjeta', texto: 'Puerta principal' },
  { hora: '08:12', tipo: 'Pase', texto: 'Técnico de internet' },
  { hora: '07:30', tipo: 'Rostro', texto: 'Puerta principal' },
]

/** Lista de ejemplo que se enciende en cascada. */
function Registro() {
  return (
    <ul aria-hidden className="relative mt-6 space-y-2">
      {EN_VIVO.map((e, i) => (
        <motion.li
          key={e.hora}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
          className="flex items-center gap-3 rounded-xl border border-banda-linea bg-banda/70 px-3.5 py-2.5"
        >
          <span className="size-1.5 rounded-full bg-banda-senal shadow-[0_0_8px_var(--color-banda-senal)]" />
          <span className="font-mono text-2xs text-banda-texto-3">{e.hora}</span>
          <span className="font-mono text-2xs tracking-[0.08em] text-banda-senal uppercase">{e.tipo}</span>
          <span className="ml-auto truncate text-xs text-banda-texto-2">{e.texto}</span>
        </motion.li>
      ))}
    </ul>
  )
}

/** Radar del lector: ondas que salen del candado. */
function Radar() {
  return (
    <div aria-hidden className="relative mt-8 flex h-40 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute size-16 rounded-full border border-banda-senal/50"
          animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i }}
        />
      ))}
      <span className="relative flex size-16 items-center justify-center rounded-full border border-banda-senal/60 bg-banda text-banda-senal shadow-[0_0_40px_-6px_var(--color-banda-senal)]">
        <Lock className="size-6" />
      </span>
    </div>
  )
}

export function Tecnologia() {
  return (
    <section id="tecnologia" className="scroll-mt-20 px-2 py-2 sm:px-4">
      <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-banda ring-1 ring-banda-linea sm:rounded-[2rem]">
        <div aria-hidden className="reticula pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <Aparece className="max-w-2xl">
            <p className="font-mono text-2xs tracking-[0.16em] text-banda-senal uppercase">Dentro de la puerta</p>
            <h2 className="mt-4 font-display text-[2.1rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-banda-texto sm:text-[2.6rem]">
              Cerradura, lector, cámara y app. <span className="text-banda-texto-3">Un solo sistema.</span>
            </h2>
          </Aparece>

          <div className="mt-14 grid gap-4 md:grid-cols-6">
            <Celda
              className="md:col-span-4"
              icono={Radio}
              titulo="Cada entrada, en vivo"
              texto="Cuando la puerta abre, el aviso llega a la app con la hora, la persona y la forma de acceso."
              delay={0}
            >
              <Registro />
            </Celda>
            <Celda
              className="md:col-span-2"
              icono={KeyRound}
              titulo="Sin llaves que copiar"
              texto="Tarjetas, rostros y pases se dan de alta o de baja desde la app."
              delay={0.08}
            >
              <Radar />
            </Celda>
            <Celda className="md:col-span-2" icono={Camera} titulo="Cámara en la puerta" texto="Reconoce solo a las personas registradas en tu casa." delay={0.12} />
            <Celda className="md:col-span-2" icono={CreditCard} titulo="Tarjeta perdida, tarjeta apagada" texto="La desactivas al instante, sin cambiar la chapa." delay={0.16} />
            <Celda className="md:col-span-2" icono={BellRing} titulo="Alertas de intento" texto="Te avisamos si alguien prueba una tarjeta o un rostro que la puerta no reconoce." delay={0.2} />
          </div>
        </div>
      </div>
    </section>
  )
}
