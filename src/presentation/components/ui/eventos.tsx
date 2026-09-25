import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Evento } from '@/domain/models'
import { cn } from '@/core/utils/cn'
import { formatDateTime, formatHora, formatRelative } from '@/core/utils/format'
import type { Tone } from './Badge'

export function toneDeNivel(nivel: string): Tone {
  if (nivel === 'CRITICAL') return 'error'
  if (nivel === 'WARN') return 'warning'
  return 'neutral'
}

const marca: Record<Tone, string> = {
  neutral: 'bg-text-disabled',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
}

const textoTipo: Record<Tone, string> = {
  neutral: 'text-text-primary',
  primary: 'text-primary-light',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
}

const etiqueta = (tipo: string) => tipo.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())

/**
 * Feed de eventos con forma de registro: hora | nivel | que paso | donde.
 * Lo que llega por el canal en vivo entra con un desplazamiento corto; el
 * resto aparece sin coreografia.
 */
export function EventFeed({ eventos, dense = false }: { eventos: Evento[]; dense?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <ol className="divide-y divide-divider/70">
      <AnimatePresence initial={false}>
        {eventos.map((ev) => {
          const tone = toneDeNivel(ev.nivel)
          return (
            <motion.li
              key={ev.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn('grid grid-cols-[3.25rem_1fr] gap-x-3 px-4 sm:grid-cols-[3.25rem_1fr_auto]', dense ? 'py-2' : 'py-2.5')}
            >
              <time
                dateTime={ev.creadoEn ?? undefined}
                title={`${formatDateTime(ev.creadoEn)} · ${formatRelative(ev.creadoEn)}`}
                className="pt-px font-mono text-xs text-text-disabled tabular"
              >
                {formatHora(ev.creadoEn)}
              </time>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[0.8125rem]">
                  <span className={cn('size-1.5 shrink-0', marca[tone])} aria-hidden />
                  <span className={cn('font-medium', textoTipo[tone])}>{etiqueta(ev.tipo)}</span>
                  <span className="sr-only">nivel {ev.nivel}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 pl-3.5 break-words text-[0.8125rem] text-text-muted">{ev.mensaje || '—'}</p>
              </div>
              <p className="col-start-2 mt-1 pl-3.5 font-mono text-2xs text-text-disabled sm:col-start-3 sm:mt-0 sm:pl-0 sm:text-right">
                {ev.origen}
                {ev.domicilioId !== null && <span className="block">casa {ev.domicilioId}</span>}
              </p>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )
}
