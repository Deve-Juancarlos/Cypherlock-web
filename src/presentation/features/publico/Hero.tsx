import { lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { ease } from './animacion'
import { Cifras, TarjetasFlotantes } from './HeroDetalles'
import { BotonLlamar, BotonWhatsApp } from './ui'

const PuertaEscena = lazy(() => import('./PuertaEscena'))

const entrar = (delay: number, y = 18) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease, delay },
})

export function Hero() {
  return (
    <section className="px-2 pt-2 sm:px-4 sm:pt-3">
      {/* Escenario oscuro: la puerta 3D brilla sobre la banda de marca */}
      <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-banda text-banda-texto ring-1 ring-banda-linea sm:rounded-[2rem]">
        <div aria-hidden className="reticula pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[38%] right-[-12%] -z-10 hidden size-[46rem] -translate-y-1/2 rounded-full bg-banda-senal/[0.12] blur-[120px] md:block"
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-[28rem] rounded-full bg-banda-cobre/[0.08] blur-[110px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-2 px-5 pt-12 pb-6 sm:px-8 md:grid-cols-[1.05fr_1fr] md:pt-16 md:pb-10">
          <div>
            <motion.p
              {...entrar(0, 0)}
              className="inline-flex items-center gap-2 rounded-full border border-banda-linea bg-banda-2/70 px-3 py-1.5 font-mono text-2xs tracking-[0.14em] text-banda-senal uppercase"
            >
              <span aria-hidden className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-banda-senal opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-banda-senal" />
              </span>
              Cerraduras inteligentes · Perú
            </motion.p>
            <motion.h1
              {...entrar(0.05, 26)}
              className="mt-6 font-display text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.025em] text-banda-texto sm:text-[3.6rem] lg:text-[4.4rem]"
            >
              Tu puerta sabe <em className="font-normal text-banda-cobre">quién</em> llega.
            </motion.h1>
            <motion.p {...entrar(0.15)} className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-banda-texto-2">
              CYPHERLOCK abre con tarjeta, con tu rostro o con un código que le mandas a tu visita. Desde el celular ves
              cada entrada en el momento en que ocurre. Lo instalamos en casas, edificios y departamentos en alquiler.
            </motion.p>
            <motion.div {...entrar(0.25, 14)} className="mt-9 flex flex-wrap items-center gap-3">
              <BotonWhatsApp className="focus-visible:ring-offset-banda" />
              <BotonLlamar className="border-banda-senal/60 text-banda-senal hover:border-banda-senal hover:bg-banda-senal/10 focus-visible:ring-banda-senal focus-visible:ring-offset-banda" />
            </motion.div>
          </div>

          <div className="relative h-[22rem] sm:h-[28rem] md:h-[36rem]">
            <Suspense fallback={null}>
              <PuertaEscena className="absolute inset-0" />
            </Suspense>
            <TarjetasFlotantes />
          </div>
        </div>

        <Cifras />
      </div>
    </section>
  )
}
