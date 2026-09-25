import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { Button } from './Button'

/**
 * Panel lateral para crear/editar y ver detalle sin perder el contexto de la
 * lista (preferido sobre modales). Cierra con Esc y con el fondo; atrapa el foco
 * al abrir y lo devuelve al cerrar.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'max-w-lg',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const prevFocus = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    prevFocus.current = document.activeElement as HTMLElement
    // Foco al primer campo del formulario; si no hay, al primer control.
    const t = setTimeout(() => {
      const p = panelRef.current
      ;(p?.querySelector<HTMLElement>('input,select,textarea') ?? p?.querySelector<HTMLElement>('button'))?.focus()
    }, 60)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prevFocus.current?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="presentation">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`absolute inset-y-0 right-0 flex w-full ${width} flex-col border-l border-divider bg-surface shadow-[var(--shadow-pop)]`}
            initial={reduce ? { opacity: 0 } : { x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: 48, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-divider px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar panel" className="-mr-2 px-2">
                <X className="size-4" aria-hidden />
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <footer className="flex justify-end gap-2 border-t border-divider px-6 py-4">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
