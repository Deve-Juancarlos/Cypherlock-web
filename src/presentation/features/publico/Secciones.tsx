/** Secciones informativas: formas de abrir, instalacion y tipos de inmueble. */
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Nfc, ScanFace, QrCode, Smartphone, MessageCircle, CalendarDays, Wrench, SmartphoneNfc, Home, Building2, KeyRound } from 'lucide-react'
import { Aparece, Seccion, Titulo } from './ui'

const FORMAS = [
  {
    titulo: 'Tarjeta o llavero',
    texto:
      'Acercas la tarjeta al lector y la puerta abre. Cada persona de la casa tiene la suya. Si alguien la pierde, la desactivas desde la app y deja de abrir en ese momento.',
    dato: 'RFID',
    icono: Nfc,
  },
  {
    titulo: 'Tu rostro',
    texto: 'La cámara de la puerta reconoce a las personas que registraste en tu casa. Nadie de otro domicilio entra en esa lista.',
    dato: 'Cámara en la puerta',
    icono: ScanFace,
  },
  {
    titulo: 'Pase para visitas',
    texto:
      'Desde la app le mandas un enlace por WhatsApp a quien viene a verte. En la puerta lo abre, escribe el código que le diste y la puerta se abre. Sirve para un solo ingreso y lo puedes desactivar cuando quieras.',
    dato: 'Un solo ingreso',
    icono: QrCode,
  },
  {
    titulo: 'Desde tu celular',
    texto: 'Abres la puerta a distancia desde la app, por ejemplo para que entre alguien de tu familia. Cada apertura queda registrada.',
    dato: 'App CYPHERLOCK',
    icono: Smartphone,
  },
]

export function FormasDeAbrir() {
  return (
    <Seccion id="como-abre">
      <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <Aparece className="md:sticky md:top-28 md:self-start">
          <Titulo>Cuatro formas de entrar. Ninguna es una llave que se copia.</Titulo>
          <p className="mt-5 max-w-sm leading-relaxed text-texto-2">
            Cada apertura queda registrada con la hora y la forma de acceso. Si algo no cuadra, lo ves en la app.
          </p>
        </Aparece>
        <ol className="divide-y divide-linea border-y border-linea">
          {FORMAS.map((f, i) => {
            const Icono = f.icono
            return (
              <Aparece as="li" key={f.titulo} delay={i * 0.06} className="group grid grid-cols-[3.5rem_1fr] gap-x-5 py-8">
                {/* Columna del icono y número */}
                <div className="relative flex flex-col items-center">
                  <div className="flex size-12 items-center justify-center rounded-full border border-linea bg-superficie transition-all duration-300 group-hover:border-senal group-hover:bg-senal/5 group-hover:shadow-md group-hover:shadow-senal/10">
                    <Icono className="size-5 text-senal transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="mt-2 font-mono text-[0.625rem] tracking-[0.1em] text-texto-3 uppercase">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Columna del contenido */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-[1.45rem] leading-snug text-texto transition-colors duration-300 group-hover:text-cobre">
                      {f.titulo}
                    </h3>
                    <span className="rounded-full bg-noche-alt px-2.5 py-0.5 font-mono text-2xs tracking-wide text-senal uppercase">
                      {f.dato}
                    </span>
                  </div>
                  <p className="mt-3 max-w-xl leading-relaxed text-texto-2">{f.texto}</p>
                </div>
              </Aparece>
            )
          })}
        </ol>
      </div>
    </Seccion>
  )
}

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
          style={{
            left: progresoPosicion,
          }}
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

const TIPOS = [
  {
    titulo: 'Casa',
    color: 'border-t-senal',
    iconoColor: 'text-senal',
    bgIcono: 'bg-senal/10',
    texto: 'Una o varias puertas. Cada persona de la familia con su propio acceso y su propio historial.',
    icono: Home,
  },
  {
    titulo: 'Edificio',
    color: 'border-t-cobre',
    iconoColor: 'text-cobre',
    bgIcono: 'bg-cobre/10',
    texto: 'Cada departamento por separado: un vecino no ve ni abre lo que no le corresponde.',
    icono: Building2,
  },
  {
    titulo: 'Alquiler',
    color: 'border-t-hoja',
    iconoColor: 'text-hoja',
    bgIcono: 'bg-hoja/10',
    texto: 'Das acceso al inquilino y lo retiras cuando se muda, sin cambiar chapas ni recoger llaves.',
    icono: KeyRound,
  },
]

export function ParaQuien() {
  return (
    <Seccion>
      <Aparece className="mb-12 max-w-2xl">
        <Titulo>Hecho para tu tipo de propiedad.</Titulo>
        <p className="mt-4 leading-relaxed text-texto-2">
          CYPHERLOCK se adapta a cómo vives, no al revés.
        </p>
      </Aparece>
      <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-linea bg-linea md:grid-cols-3">
        {TIPOS.map((t, i) => {
          const Icono = t.icono
          return (
            <Aparece
              key={t.titulo}
              delay={i * 0.07}
              className={`group relative border-t-4 bg-superficie p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-texto/5 ${t.color}`}
            >
              {/* Icono grande con fondo de color */}
              <div className={`inline-flex size-14 items-center justify-center rounded-2xl ${t.bgIcono} transition-transform duration-300 group-hover:scale-110`}>
                <Icono className={`size-7 ${t.iconoColor}`} />
              </div>

              <h3 className="mt-6 font-display text-[1.75rem] text-texto transition-colors duration-300 group-hover:text-cobre">
                {t.titulo}
              </h3>
              <p className="mt-3 leading-relaxed text-texto-2">{t.texto}</p>

              {/* Indicador de flecha sutil en hover */}
              <div className="mt-6 flex items-center gap-1.5 text-xs font-medium text-texto-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span>Más información</span>
                <svg className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Aparece>
          )
        })}
      </div>
    </Seccion>
  )
}
