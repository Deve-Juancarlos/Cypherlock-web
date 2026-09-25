import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '@/core/utils/cn'

const control =
  'w-full h-10 rounded-[var(--radius-control)] bg-background border border-divider px-3 text-sm text-text-primary ' +
  'placeholder:text-text-disabled transition-[border-color,box-shadow] duration-150 ' +
  'hover:border-surface-light focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-error aria-invalid:ring-error/20'

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
      <label htmlFor={id} className="text-sm font-medium text-text-secondary">
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

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { label, hint, error, className, ...rest },
  ref,
) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy }) => (
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(control, className)}
          {...rest}
        />
      )}
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
        'h-8 cursor-pointer rounded-lg border border-divider bg-background px-2 text-sm text-text-secondary',
        'hover:border-surface-light focus:border-primary focus:outline-none disabled:opacity-50',
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
