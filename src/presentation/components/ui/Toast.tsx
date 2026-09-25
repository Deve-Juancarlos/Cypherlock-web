import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CircleCheck, CircleX, X } from 'lucide-react'
import { toAppError } from '@/core/errors/AppError'
import { cn } from '@/core/utils/cn'

type ToastKind = 'success' | 'error'
interface ToastItem {
  id: number
  kind: ToastKind
  title: string
  detail?: string
}

interface ToastApi {
  success: (title: string, detail?: string) => void
  error: (err: unknown, title?: string) => void
}

const Ctx = createContext<ToastApi | null>(null)
let seq = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((t) => t.id !== id)), [])
  const push = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = ++seq
      setItems((xs) => [...xs.slice(-3), { ...t, id }])
      setTimeout(() => dismiss(id), t.kind === 'error' ? 7000 : 4000)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, detail) => push({ kind: 'success', title, detail }),
      error: (err, title = 'No se pudo completar') => {
        const e = toAppError(err)
        push({
          kind: 'error',
          title,
          detail: e.requestId ? `${e.userMessage} · Ref. ${e.requestId}` : e.userMessage,
        })
      },
    }),
    [push],
  )

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-[var(--radius-card)] border bg-surface p-4 shadow-[var(--shadow-pop)]',
                t.kind === 'success' ? 'border-success/40' : 'border-error/40',
              )}
              role={t.kind === 'error' ? 'alert' : 'status'}
            >
              {t.kind === 'success' ? (
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
              ) : (
                <CircleX className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{t.title}</p>
                {t.detail && <p className="mt-0.5 break-words text-sm text-text-muted">{t.detail}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="cursor-pointer rounded p-0.5 text-text-muted hover:text-text-primary"
                aria-label="Cerrar aviso"
              >
                <X className="size-4" aria-hidden />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useToast fuera de ToastProvider')
  return v
}
