/** La app: telefono de ejemplo que gira en 3D con el scroll. */
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Check, Download } from 'lucide-react'
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

function Telefono() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [28, 6])
  const rotateY = useTransform(scrollYProgress, [0, 1], [-24, -10])
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])

  return (
    <div ref={ref} className="flex justify-center [perspective:1400px]">
      <motion.div
        style={{ rotateX, rotateY, y }}
        className="w-[17.5rem] rounded-[2.4rem] border border-banda-linea bg-banda-2 p-2.5 shadow-[0_40px_70px_-28px_rgba(15,33,41,0.45)] [transform-style:preserve-3d]"
      >
        <div className="overflow-hidden rounded-[1.9rem] bg-banda">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <span className="font-mono text-2xs tracking-[0.14em] text-banda-texto-3 uppercase">Mi casa</span>
            <span className="inline-flex items-center gap-1.5 text-2xs text-banda-senal">
              <span className="size-1.5 rounded-full bg-banda-senal" />
              en vivo
            </span>
          </div>
          <div className="px-5 pb-4">
            <p className="font-display text-[1.35rem] leading-tight text-banda-texto">Hoy, 3 entradas</p>
            <p className="mt-0.5 text-2xs text-banda-texto-3">1 alerta</p>
          </div>
          <ul className="border-t border-banda-linea">
            {EVENTOS.map((e) => (
              <li key={e.hora + e.texto} className="grid grid-cols-[2.6rem_1fr] gap-2 border-b border-banda-linea px-5 py-3">
                <span className="font-mono text-2xs text-banda-texto-3">{e.hora}</span>
                <span>
                  <span
                    className={cn(
                      'block font-mono text-[0.625rem] tracking-[0.08em] uppercase',
                      e.nivel === 'alerta' ? 'text-error' : e.nivel === 'info' ? 'text-banda-texto-3' : 'text-banda-senal',
                    )}
                  >
                    {e.tipo}
                  </span>
                  <span className="block text-xs leading-snug text-banda-texto-2">{e.texto}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 p-4">
            <span className="rounded-full bg-cobre py-2 text-center text-2xs font-medium text-on-cobre">Abrir puerta</span>
            <span className="rounded-full border border-banda-linea py-2 text-center text-2xs text-banda-texto">Crear QR</span>
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
          <p className="mt-6 text-center text-xs text-texto-3">Pantalla de ejemplo</p>
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
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-cobre px-6 text-[0.9375rem] font-medium text-on-cobre transition-colors hover:bg-cobre-claro"
            >
              <Download className="size-4" aria-hidden />
              Descargar para Android
            </a>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-texto-2">
              Para clientes con CYPHERLOCK instalado. Ábrela y toca <strong className="text-texto">Activar mi cuenta</strong> con
              el código que te entregó el técnico.
            </p>
          </Aparece>
        </div>
      </div>
    </Seccion>
  )
}
