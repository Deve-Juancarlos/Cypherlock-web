/** Piezas compartidas del sitio publico. */
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { ease } from './animacion'
import { principal, whatsapp } from './datosContacto'

/** Entrada al hacer scroll; `as="li"` para usarlo dentro de listas. */
export function Aparece({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li'
}) {
  const M = as === 'li' ? motion.li : motion.div
  return (
    <M
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease, delay }}
      className={className}
    >
      {children}
    </M>
  )
}

export function Titulo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        'font-display text-[2.1rem] leading-[1.08] font-semibold tracking-[-0.02em] text-texto text-balance sm:text-[2.6rem]',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function Seccion({ id, alt, children }: { id?: string; alt?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={cn('scroll-mt-20 border-t border-linea', alt && 'bg-noche-alt')}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">{children}</div>
    </section>
  )
}

const boton = 'inline-flex h-12 items-center gap-2.5 rounded-full px-6 text-[0.9375rem] font-medium transition-colors'

export function BotonWhatsApp({ className, texto = 'Escríbenos por WhatsApp' }: { className?: string; texto?: string }) {
  return (
    <a
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(boton, 'bg-cobre text-on-cobre hover:bg-cobre-claro', className)}
    >
      <MessageCircle className="size-4" aria-hidden />
      {texto}
    </a>
  )
}

export function BotonLlamar({ className }: { className?: string }) {
  return (
    <a href={principal.href} className={cn(boton, 'border border-linea text-texto hover:border-texto-3', className)}>
      <Phone className="size-4" aria-hidden />
      Llamar al <span className="tabular">{principal.visible}</span>
    </a>
  )
}
