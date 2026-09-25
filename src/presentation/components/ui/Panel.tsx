import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/core/utils/cn'

/**
 * Superficie base (card). Una sola capa: nunca anidar Panel dentro de Panel;
 * dentro se separa con divisores o espacio.
 */
export function Panel({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-card)] border border-divider/70 bg-surface shadow-[var(--shadow-card)]',
        className,
      )}
      {...rest}
    />
  )
}

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-4', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
