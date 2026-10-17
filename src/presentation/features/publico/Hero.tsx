import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { ease } from './animacion'
import { BotonLlamar, BotonWhatsApp } from './ui'

const PuertaEscena = lazy(() => import('./PuertaEscena'))

const entrar = (delay: number, y = 18) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease, delay },
})

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Resplandor tenue detras de la puerta: da profundidad sin degradados de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-10%] hidden size-[42rem] -translate-y-1/2 rounded-full bg-senal/[0.05] blur-3xl md:block"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-4 px-5 pt-10 pb-16 sm:px-8 md:grid-cols-[1.05fr_1fr] md:pt-16 md:pb-24">
        <div>
          <motion.p {...entrar(0, 0)} className="font-mono text-xs tracking-[0.14em] text-senal uppercase">
            Cerraduras inteligentes · Perú
          </motion.p>
          <motion.h1
            {...entrar(0.05, 26)}
            className="mt-5 font-display text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.025em] text-texto sm:text-[3.6rem] lg:text-[4.25rem]"
          >
            Tu puerta sabe <em className="font-normal text-cobre-claro">quién</em> llega.
          </motion.h1>
          <motion.p {...entrar(0.15)} className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-texto-2">
            CYPHERLOCK abre con tarjeta, con tu rostro o con un código que le mandas a tu visita. Desde el celular ves
            cada entrada en el momento en que ocurre. Lo instalamos en casas, edificios y departamentos en alquiler.
          </motion.p>
          <motion.div {...entrar(0.25, 14)} className="mt-9 flex flex-wrap items-center gap-3">
            <BotonWhatsApp />
            <BotonLlamar />
          </motion.div>
        </div>

        <div className="relative h-[22rem] [mask-image:linear-gradient(to_bottom,black_82%,transparent)] sm:h-[28rem] md:h-[36rem]">
          <Suspense fallback={null}>
            <PuertaEscena className="absolute inset-0" />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
