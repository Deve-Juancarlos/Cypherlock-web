/** Proceso de instalación con una línea de progreso animada al hacer scroll. */
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { MessageCircle, CalendarDays, Wrench, SmartphoneNfc } from 'lucide-react'
import { Aparece, Seccion, Titulo } from './ui'

const PASOS = [
  { titulo: 'Nos escribes o llamas', texto: 'Te preguntamos por tu puerta y cuántas personas viven en la casa.', icono: MessageCircle },
  { titulo: 'Coordinamos la visita', texto: 'Acordamos contigo el día y la hora de la instalación.', icono: CalendarDays },
  { titulo: 'Instalamos y probamos', texto: 'Cerradura, lector y cámara. Registramos las tarjetas y los rostros de tu casa.', icono: Wrench },
  { titulo: 'Te entregamos la app', texto: 'Te enseñamos a dar accesos, crear códigos y revisar el historial.', icono: SmartphoneNfc },
]

export function Instalacion() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 70%'],
  })

  // Usamos scaleX en lugar de width para mejor performance (GPU acceleration)
  const progresoPosicion = useTransform(scrollYProgress, (v) => `${v * 100}%`)

  return (
    <Seccion id="instalacion" alt>
      <Aparece className="max-w-2xl">
        <Titulo>De tu primer mensaje a tu primera puerta abierta.</Titulo>
        <p className="mt-4 text-texto-2 leading-relaxed">
          Un proceso simple, transparente y sin sorpresas.
        </p>
      </Aparece>

      <div ref={ref} className="relative mt-16 md:mt-20">
        {/* Línea base (fondo) */}
        <div
          aria-hidden
          className="absolute top-3.5 right-0 left-0 hidden h-px bg-linea md:block"
        />

        {/* Línea de progreso animada con gradiente y glow */}
        <motion.div
          aria-hidden
          style={{
            scaleX: scrollYProgress,
            transformOrigin: 'left center',
          }}
          className="absolute top-3.5 left-0 right-0 hidden h-px md:block"
        >
          {/* Gradiente principal */}
          <div className="h-full bg-gradient-to-r from-senal via-cobre to-hoja" />

          {/* Efecto de brillo/glow sobre la línea */}
          <div className="absolute inset-0 bg-gradient-to-r from-senal/40 via-cobre/40 to-hoja/40 blur-sm" />
        </motion.div>

        {/* Punto brillante que "sigue" el progreso */}
        <motion.div
          aria-hidden
          style={{ left: progresoPosicion }}
          className="absolute top-3.5 hidden size-2 -translate-x-1/2 rounded-full bg-cobre shadow-[0_0_12px_rgba(185,84,28,0.6)] md:block"
        />

        <ol className="relative grid gap-12 md:grid-cols-4 md:gap-6">
          {PASOS.map((p, i) => {
            const Icono = p.icono
            return (
              <Aparece as="li" key={p.titulo} delay={i * 0.08} className="group">
                {/* Círculo con icono - mejorado con anillo exterior */}
                <div className="relative">
                  {/* Anillo exterior animado */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-cobre/20"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  />

                  {/* Círculo principal */}
                  <div className="relative z-10 flex size-7 items-center justify-center rounded-full border-2 border-senal bg-noche-alt transition-all duration-300 group-hover:border-cobre group-hover:bg-cobre/10 group-hover:shadow-lg group-hover:shadow-cobre/20">
                    <Icono className="size-3.5 text-senal transition-all duration-300 group-hover:text-cobre group-hover:scale-110" />
                  </div>
                </div>

                {/* Número de paso con mejor jerarquía */}
                <p className="mt-6 font-mono text-[0.6875rem] font-semibold tracking-wider text-texto-3 uppercase">
                  Paso <span className="text-senal font-bold">{String(i + 1).padStart(2, '0')}</span>
                </p>

                {/* Título con transición suave */}
                <h3 className="mt-2 font-display text-[1.35rem] leading-snug font-semibold text-texto transition-colors duration-300 group-hover:text-cobre">
                  {p.titulo}
                </h3>

                {/* Descripción */}
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-texto-2">
                  {p.texto}
                </p>
              </Aparece>
            )
          })}
        </ol>
      </div>
    </Seccion>
  )
}
