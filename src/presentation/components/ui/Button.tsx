import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/core/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary font-medium hover:bg-primary-light active:bg-primary-dark',
  secondary: 'border border-divider text-text-primary hover:border-text-disabled hover:bg-surface-light',
  ghost: 'text-text-muted hover:bg-surface-light hover:text-text-primary',
  danger: 'border border-error/50 text-error hover:bg-error hover:border-error hover:text-white',
}

const sizes: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[0.8125rem] gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-[var(--radius-control)]',
        'transition-[background-color,border-color,color] duration-100 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
})
