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
        'rounded-[var(--radius-card)] border border-divider bg-surface shadow-[0_1px_2px_rgb(16_24_32/0.04)]',
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
    <header className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-divider bg-surface-head px-5 py-3.5', className)}>
      <div className="min-w-0">
        <h2 className="text-[0.975rem] leading-snug font-semibold text-text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-[0.8125rem] text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
