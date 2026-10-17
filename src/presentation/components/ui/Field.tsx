import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '@/core/utils/cn'

const control =
  // Borde #8a96a0: contraste 3:1 sobre blanco (WCAG 1.4.11), el campo se reconoce como editable.
  'w-full h-10 rounded-[var(--radius-control)] bg-surface border border-[#8a96a0] px-3 text-sm text-text-primary ' +
  'placeholder:text-text-disabled transition-colors duration-100 ' +
  'hover:border-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ' +
  'disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-error'

interface FieldShellProps {
  label: string
  hint?: string
  error?: string
  children: (ids: { id: string; describedBy?: string }) => ReactNode
}

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  const id = useId()
  const msgId = `${id}-msg`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.8125rem] font-medium text-text-secondary">
        {label}
      </label>
      {children({ id, describedBy: error || hint ? msgId : undefined })}
      {(error || hint) && (
        <p id={msgId} className={cn('text-xs', error ? 'text-error' : 'text-text-muted')}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  /** Control dentro del campo, a la derecha (p. ej. mostrar contrasena). */
  trailing?: ReactNode
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { label, hint, error, className, trailing, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy }) => {
        const input = (
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(control, trailing && 'pr-10', className)}
            {...rest}
          />
        )
        if (!trailing) return input
        return (
          <div className="relative">
            {input}
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{trailing}</div>
          </div>
        )
      }}
    </FieldShell>
  )
})

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  hint?: string
  error?: string
  options: { value: string; label: string }[]
}

export function SelectField({ label, hint, error, options, className, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy }) => (
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(control, 'cursor-pointer appearance-none pr-8', className)}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}

/** Select compacto para barras de filtros y acciones en tabla. */
export function MiniSelect({
  className,
  options,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select
      className={cn(
        // Discreto en tablas: se lee como texto hasta que se pasa el cursor.
        '-mx-1.5 h-7 cursor-pointer rounded-[var(--radius-control)] border border-transparent bg-transparent px-1.5 text-sm text-text-secondary',
        'hover:border-divider hover:bg-background focus:border-primary focus:bg-background focus:outline-none disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
