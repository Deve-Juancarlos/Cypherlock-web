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
        'rounded-[var(--radius-card)] border border-divider bg-surface',
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
    <header className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-divider px-4 py-3', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
