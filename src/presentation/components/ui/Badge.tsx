import type { ReactNode } from 'react'
import { cn } from '@/core/utils/cn'

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'

const texto: Record<Tone, string> = {
  neutral: 'text-text-muted',
  primary: 'text-primary-light',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
}

const marca: Record<Tone, string> = {
  neutral: 'bg-text-disabled',
  primary: 'bg-primary-light',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
}

/**
 * Estado como texto con indicador cuadrado (`dot`) o como etiqueta con borde
 * fino. Sin pildoras rellenas: en una tabla densa el color va en el texto.
 */
export function Badge({ tone = 'neutral', dot, children, className }: {
  tone?: Tone
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium',
        texto[tone],
        !dot && 'rounded-[3px] border border-current/35 px-1.5 py-px',
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 shrink-0', marca[tone])} aria-hidden />}
      {children}
    </span>
  )
}
