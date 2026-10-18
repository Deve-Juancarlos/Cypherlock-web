/** Piezas compartidas del sitio publico. */
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
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

export function IconoWhatsApp({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={cn('size-5 fill-current transition-transform duration-300 group-hover:scale-110', className)}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function BotonWhatsApp({ className, texto }: { className?: string; texto?: string }) {
  return (
    <motion.a
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('group inline-flex items-center gap-2.5 rounded-md bg-cobre px-6 py-3.5 font-sans font-semibold text-on-cobre shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-cobre/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-senal focus-visible:ring-offset-2 focus-visible:ring-offset-noche', className)}
      aria-label={`Contactar a Ventas y atención de CypherTech Perú por WhatsApp al ${whatsapp.visible}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <IconoWhatsApp />
      <span className="tracking-tight">{texto ?? `Escríbenos al ${whatsapp.visible}`}</span>
    </motion.a>
  )
}

export function BotonLlamar({ className }: { className?: string }) {
  return (
    <motion.a
      href={principal.href}
      className={cn('group inline-flex items-center gap-2.5 rounded-md border border-senal bg-transparent px-6 py-3.5 font-sans font-semibold text-senal transition-colors duration-300 hover:bg-senal/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-senal focus-visible:ring-offset-2 focus-visible:ring-offset-noche', className)}
      aria-label={`Llamar a Ventas y atención de CypherTech Perú al ${principal.visible}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Icono de Teléfono (Heroicons style) */}
      <svg
        className="h-5 w-5 stroke-current transition-transform duration-300 group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      <span className="tracking-tight">Llamar al {principal.visible}</span>
    </motion.a>
  )
}
