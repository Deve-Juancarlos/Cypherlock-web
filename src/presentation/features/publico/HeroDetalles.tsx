/** Piezas del hero: tarjetas flotantes sobre la escena 3D y franja de cifras. */
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { BellRing, ShieldCheck } from 'lucide-react'
import { ease } from './animacion'

const CIFRAS = [
  { valor: '4', texto: 'formas de abrir tu puerta' },
  { valor: '1', texto: 'ingreso por cada pase de visita' },
  { valor: '24/7', texto: 'registro de cada entrada' },
  { valor: '15 min', texto: 'para devolverte la llamada' },
]

function Flotante({ className, delay, children }: { className: string; delay: number; children: ReactNode }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
      transition={{
        opacity: { duration: 0.8, ease, delay },
        scale: { duration: 0.8, ease, delay },
        y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.8 },
      }}
      className={`absolute z-10 hidden rounded-2xl border border-white/10 bg-banda-vidrio px-4 py-3 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.8)] backdrop-blur-md md:block ${className}`}
    >
      {children}
    </motion.div>
  )
}

/** Tarjetas decorativas de ejemplo: lo que verías en la app. */
export function TarjetasFlotantes() {
  return (
    <>
      <Flotante className="top-[14%] left-[-4%]" delay={0.7}>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-banda-senal/15 text-banda-senal">
            <ShieldCheck className="size-[1.125rem]" />
          </span>
          <div className="leading-tight">
            <p className="text-[0.8125rem] font-semibold text-banda-texto">Acceso concedido</p>
            <p className="mt-0.5 font-mono text-2xs text-banda-texto-3">Tarjeta · Rosa · 08:41</p>
          </div>
        </div>
      </Flotante>
      <Flotante className="right-[2%] bottom-[20%]" delay={0.95}>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-banda-cobre/15 text-banda-cobre">
            <BellRing className="size-[1.125rem]" />
          </span>
          <div className="leading-tight">
            <p className="text-[0.8125rem] font-semibold text-banda-texto">Pase de visita</p>
            <p className="mt-0.5 font-mono text-2xs text-banda-texto-3">Un solo ingreso · activo</p>
          </div>
        </div>
      </Flotante>
    </>
  )
}

export function Cifras() {
  return (
    <dl className="relative grid grid-cols-2 border-t border-banda-linea md:grid-cols-4">
      {CIFRAS.map((c, i) => (
        <motion.div
          key={c.texto}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.4 + i * 0.08 }}
          className="flex flex-col-reverse gap-1 border-banda-linea px-5 py-6 odd:border-r sm:px-8 md:border-r md:last:border-r-0"
        >
          <dt className="text-[0.8125rem] leading-snug text-banda-texto-2">{c.texto}</dt>
          <dd className="font-display text-[1.9rem] leading-none font-semibold tracking-[-0.02em] text-banda-texto tabular">
            {c.valor}
          </dd>
        </motion.div>
      ))}
    </dl>
  )
}
