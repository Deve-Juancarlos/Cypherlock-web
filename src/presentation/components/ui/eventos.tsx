import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  BellRing,
  CircleCheck,
  DoorOpen,
  KeyRound,
  ShieldAlert,
  ShieldX,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { Evento } from '@/domain/models'
import { cn } from '@/core/utils/cn'
import { formatDateTime, formatRelative } from '@/core/utils/format'
import type { Tone } from './Badge'

export function toneDeNivel(nivel: string): Tone {
  if (nivel === 'CRITICAL') return 'error'
  if (nivel === 'WARN') return 'warning'
  return 'neutral'
}

function iconoDeTipo(tipo: string): LucideIcon {
  if (/INTRUSO|DENEGAD|BLOQUEAD|FALLIDO/.test(tipo)) return ShieldX
  if (/ALARMA|REPLAY/.test(tipo)) return ShieldAlert
  if (/ACCESO|CIERRE|VISITA_USADA/.test(tipo)) return DoorOpen
  if (/TARJETA|OTP|DISPOSITIVO/.test(tipo)) return KeyRound
  if (/USUARIO|PASSWORD|VINCULACION/.test(tipo)) return UserRound
  if (/SOLICITUD|DOMICILIO/.test(tipo)) return CircleCheck
  return BellRing
}

const toneIcon: Record<Tone, string> = {
  neutral: 'bg-surface-light/60 text-text-secondary',
  primary: 'bg-primary/15 text-primary-light',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-info',
}

const etiqueta = (tipo: string) => tipo.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())

/**
 * Feed de eventos. Los que llegan por el canal en vivo entran con un unico
 * gesto (desenfoque -> nitido); el resto aparece sin coreografia.
 */
export function EventFeed({ eventos, dense = false }: { eventos: Evento[]; dense?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <ol className="divide-y divide-divider/50">
      <AnimatePresence initial={false}>
        {eventos.map((ev) => {
          const tone = toneDeNivel(ev.nivel)
          const Icon = iconoDeTipo(ev.tipo)
          return (
            <motion.li
              key={ev.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn('flex gap-3 px-5', dense ? 'py-2.5' : 'py-3.5')}
            >
              <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg', toneIcon[tone])}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-medium text-text-primary">{etiqueta(ev.tipo)}</p>
                  <time
                    dateTime={ev.creadoEn ?? undefined}
                    title={formatDateTime(ev.creadoEn)}
                    className="shrink-0 text-xs text-text-disabled tabular"
                  >
                    {formatRelative(ev.creadoEn)}
                  </time>
                </div>
                <p className="mt-0.5 line-clamp-2 break-words text-sm text-text-muted">{ev.mensaje || '—'}</p>
                <p className="mt-1 font-mono text-2xs text-text-disabled">
                  {ev.origen}
                  {ev.domicilioId !== null && ` · domicilio ${ev.domicilioId}`}
                </p>
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )
}
