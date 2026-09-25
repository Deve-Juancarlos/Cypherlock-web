import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/core/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-background font-semibold hover:bg-primary-light active:bg-primary-dark shadow-[0_1px_2px_rgb(2_6_23/0.5)]',
  secondary:
    'bg-surface text-text-primary border border-divider hover:bg-surface-light/70 hover:border-surface-light',
  ghost: 'text-text-secondary hover:bg-surface hover:text-text-primary',
  danger: 'bg-error/10 text-error border border-error/40 hover:bg-error hover:text-text-primary hover:border-error',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
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
        'transition-[background-color,border-color,color,transform] duration-150 ease-out active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0',
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
