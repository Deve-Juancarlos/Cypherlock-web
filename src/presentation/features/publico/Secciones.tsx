/** Secciones informativas: formas de abrir, instalacion y tipos de inmueble. */
import { useRef } from 'react'
import { motion, useScroll } from 'motion/react'
import { Aparece, Seccion, Titulo } from './ui'

const FORMAS = [
  {
    titulo: 'Tarjeta o llavero',
    texto:
      'Acercas la tarjeta al lector y la puerta abre. Cada persona de la casa tiene la suya. Si alguien la pierde, la desactivas desde la app y deja de abrir en ese momento.',
    dato: 'RFID',
  },
  {
    titulo: 'Tu rostro',
    texto: 'La cámara de la puerta reconoce a las personas que registraste en tu casa. Nadie de otro domicilio entra en esa lista.',
    dato: 'Cámara en la puerta',
  },
  {
    titulo: 'Código QR para visitas',
    texto: 'Generas un código para quien viene a verte y se lo mandas por mensaje. Sirve una sola vez y vence.',
    dato: 'Un solo uso',
  },
  {
    titulo: 'Código numérico temporal',
    texto: 'Para quien llega sin celular: el técnico, un familiar, el delivery. Se usa una vez y deja de valer.',
    dato: 'Un solo uso',
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
          {FORMAS.map((f, i) => (
            <Aparece as="li" key={f.titulo} delay={i * 0.06} className="group grid grid-cols-[2.5rem_1fr] gap-x-4 py-8">
              <span className="pt-1.5 font-mono text-sm text-senal">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-[1.45rem] leading-snug text-texto transition-colors group-hover:text-cobre-claro">
                    {f.titulo}
                  </h3>
                  <span className="font-mono text-2xs tracking-wide text-texto-3 uppercase">{f.dato}</span>
                </div>
                <p className="mt-2.5 max-w-xl leading-relaxed text-texto-2">{f.texto}</p>
              </div>
            </Aparece>
          ))}
        </ol>
      </div>
    </Seccion>
  )
}

const PASOS = [
  { titulo: 'Nos escribes o llamas', texto: 'Te preguntamos por tu puerta y cuántas personas viven en la casa.' },
  { titulo: 'Coordinamos la visita', texto: 'Acordamos contigo el día y la hora de la instalación.' },
  { titulo: 'Instalamos y probamos', texto: 'Cerradura, lector y cámara. Registramos las tarjetas y los rostros de tu casa.' },
  { titulo: 'Te entregamos la app', texto: 'Te enseñamos a dar accesos, crear códigos y revisar el historial.' },
]

export function Instalacion() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] })

  return (
    <Seccion id="instalacion" alt>
      <Aparece className="max-w-2xl">
        <Titulo>De tu primer mensaje a tu primera puerta abierta.</Titulo>
      </Aparece>
      <div ref={ref} className="relative mt-14">
        <div aria-hidden className="absolute top-[0.4rem] right-0 left-0 hidden h-px bg-linea md:block" />
        <motion.div
          aria-hidden
          style={{ scaleX: scrollYProgress }}
          className="absolute top-[0.4rem] right-0 left-0 hidden h-px origin-left bg-senal md:block"
        />
        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-8">
          {PASOS.map((p, i) => (
            <Aparece as="li" key={p.titulo} delay={i * 0.08}>
              <span className="relative z-10 block size-3.5 rounded-full border-2 border-senal bg-noche-alt" />
              <p className="mt-5 font-mono text-xs text-texto-3">Paso {i + 1}</p>
              <h3 className="mt-1.5 font-display text-[1.3rem] leading-snug text-texto">{p.titulo}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-texto-2">{p.texto}</p>
            </Aparece>
          ))}
        </ol>
      </div>
    </Seccion>
  )
}

const TIPOS = [
  { titulo: 'Casa', texto: 'Una o varias puertas. Cada persona de la familia con su propio acceso y su propio historial.' },
  { titulo: 'Edificio', texto: 'Cada departamento por separado: un vecino no ve ni abre lo que no le corresponde.' },
  { titulo: 'Alquiler', texto: 'Das acceso al inquilino y lo retiras cuando se muda, sin cambiar chapas ni recoger llaves.' },
]

export function ParaQuien() {
  return (
    <Seccion>
      <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-linea bg-linea md:grid-cols-3">
        {TIPOS.map((t, i) => (
          <Aparece key={t.titulo} delay={i * 0.07} className="bg-noche p-8">
            <h3 className="font-display text-[1.6rem] text-texto">{t.titulo}</h3>
            <p className="mt-3 leading-relaxed text-texto-2">{t.texto}</p>
          </Aparece>
        ))}
      </div>
    </Seccion>
  )
}
