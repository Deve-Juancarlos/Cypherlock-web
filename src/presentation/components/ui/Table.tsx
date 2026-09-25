import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { initials } from '@/core/utils/format'

/** Tabla densa de producto: cabecera fija, filas con hover, scroll horizontal propio. */
export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'sticky top-0 border-b border-divider bg-surface px-5 py-2.5 text-xs font-medium text-text-muted',
        className,
      )}
      {...rest}
    />
  )
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-divider/50 transition-colors last:border-0 hover:bg-surface-light/25', className)} {...rest} />
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-5 py-3 align-middle text-text-secondary', className)} {...rest} />
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary-light',
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  label: string
}) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-disabled" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-divider bg-background pr-3 pl-9 text-sm text-text-primary placeholder:text-text-disabled hover:border-surface-light focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
      />
    </label>
  )
}

/** Pestanas segmentadas para filtros de estado. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; count?: number }[]
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 rounded-lg bg-background p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150',
              active ? 'bg-surface-light text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={cn('tabular text-xs', active ? 'text-primary-light' : 'text-text-disabled')}>{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
