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

const relleno: Record<Tone, string> = {
  neutral: 'bg-surface-light border-divider',
  primary: 'bg-primary-50 border-primary/25',
  success: 'bg-success/[0.08] border-success/25',
  warning: 'bg-warning/[0.08] border-warning/25',
  error: 'bg-error/[0.07] border-error/25',
  info: 'bg-info/[0.07] border-info/25',
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
 * Estado como etiqueta rellena con borde fino (estilo institucional); `dot`
 * agrega el indicador circular delante del texto.
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
        relleno[tone],
        'rounded-[3px] border px-2 py-0.5',
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', marca[tone])} aria-hidden />}
      {children}
    </span>
  )
}
