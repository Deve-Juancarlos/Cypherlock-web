import type { ReactNode } from 'react'
import { cn } from '@/core/utils/cn'

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info'

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-light/60 text-text-secondary',
  primary: 'bg-primary/15 text-primary-light',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-info',
}

const dots: Record<Tone, string> = {
  neutral: 'bg-text-muted',
  primary: 'bg-primary-light',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
}

export function Badge({ tone = 'neutral', dot, children, className }: {
  tone?: Tone
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dots[tone])} aria-hidden />}
      {children}
    </span>
  )
}
