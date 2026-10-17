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
        'sticky top-0 whitespace-nowrap border-b border-divider bg-surface-head px-5 py-2.5 text-xs font-semibold text-text-secondary',
        className,
      )}
      {...rest}
    />
  )
}

export function Tr({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-divider last:border-0 even:bg-surface-head/60 hover:bg-primary-50/60', className)} {...rest} />
}

export function Td({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-5 py-3 align-middle text-text-secondary', className)} {...rest} />
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-[var(--radius-control)] border border-divider font-mono text-2xs text-text-muted',
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
    <label className="relative my-2.5 block w-full sm:w-72">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-disabled" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-[var(--radius-control)] border border-[#b9c2ca] bg-surface pr-3 pl-8 text-sm text-text-primary placeholder:text-text-disabled hover:border-text-muted focus:border-primary focus:outline-none"
      />
    </label>
  )
}

/** Filtros de estado como pestanas subrayadas (no pildoras). */
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
    <div role="tablist" aria-label={label} className="-mb-px flex flex-wrap gap-x-5 gap-y-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 border-b-2 py-2.5 text-sm transition-colors duration-100',
              active ? 'border-primary font-semibold text-primary-dark' : 'border-transparent text-text-muted hover:text-text-primary',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className="rounded-full bg-surface-light px-1.5 text-2xs font-medium text-text-muted tabular">{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
