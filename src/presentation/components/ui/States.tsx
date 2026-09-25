import type { ReactNode } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { toAppError } from '@/core/errors/AppError'
import { cn } from '@/core/utils/cn'
import { Button } from './Button'

/** Bloque de carga con la forma del contenido (no spinners en medio). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[3px] bg-surface-light/60', className)} aria-hidden />
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-divider/60" role="status" aria-label="Cargando">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid gap-4 px-4 py-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className={cn('h-4', c === 0 ? 'w-3/4' : 'w-1/2')} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Vacio que ensena: que es esto y como se llena. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 text-text-disabled">{icon}</div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Error con recuperacion y codigo de referencia (request_id del backend). */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const e = toAppError(error)
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 text-error">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-text-primary">No se pudo cargar</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{e.userMessage}</p>
      {e.requestId && (
        <p className="mt-2 font-mono text-2xs text-text-disabled">Referencia: {e.requestId}</p>
      )}
      {onRetry && (
        <Button size="sm" className="mt-5" onClick={onRetry} icon={<RefreshCw className="size-3.5" aria-hidden />}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
