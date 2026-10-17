import { useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Activity,
  ClipboardList,
  Cpu,
  CreditCard,
  DoorOpen,
  Home,
  ShieldAlert,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import type { Evento } from '@/domain/models'
import { cn } from '@/core/utils/cn'
import { formatDateTime, formatHora, formatRelative } from '@/core/utils/format'
import { useDomicilios } from '../../hooks/queries'
import { Badge, type Tone } from './Badge'

export function toneDeNivel(nivel: string): Tone {
  if (nivel === 'CRITICAL') return 'error'
  if (nivel === 'WARN') return 'warning'
  return 'neutral'
}

const NIVEL: Record<string, string> = { INFO: 'Informativo', WARN: 'Advertencia', CRITICAL: 'Crítico' }

/** Icono por familia de evento (prefijo del tipo). */
function iconoDe(tipo: string): LucideIcon {
  if (tipo.startsWith('ACCESO') || tipo.startsWith('VISITA') || tipo.startsWith('OTP')) return DoorOpen
  if (tipo.startsWith('INTRUSO') || tipo.startsWith('ALARMA') || tipo.startsWith('FACIAL')) return ShieldAlert
  if (tipo.startsWith('USUARIO')) return UserPlus
  if (tipo.startsWith('DOMICILIO')) return Home
  if (tipo.startsWith('TARJETA')) return CreditCard
  if (tipo.startsWith('SOLICITUD')) return ClipboardList
  if (tipo.startsWith('HEARTBEAT') || tipo.startsWith('BOOT') || tipo.startsWith('ESP32') || tipo.startsWith('DISPOSITIVO')) return Cpu
  return Activity
}

const circulo: Record<Tone, string> = {
  neutral: 'bg-primary-50 text-primary',
  primary: 'bg-primary-50 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
}

const etiqueta = (tipo: string) => tipo.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())

/**
 * Registro de eventos como tabla: hora | evento | origen | domicilio | nivel.
 * Lo que llega por el canal en vivo entra con un desplazamiento corto.
 */
export function EventFeed({ eventos }: { eventos: Evento[]; dense?: boolean }) {
  const reduce = useReducedMotion()
  const domicilios = useDomicilios()
  const nombres = useMemo(() => new Map((domicilios.data ?? []).map((d) => [d.id, d.nombre])), [domicilios.data])

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-divider bg-surface-head text-xs font-semibold text-text-secondary">
            <th scope="col" className="w-20 px-5 py-2.5">Hora</th>
            <th scope="col" className="px-3 py-2.5">Evento</th>
            <th scope="col" className="hidden px-3 py-2.5 md:table-cell">Origen</th>
            <th scope="col" className="hidden px-3 py-2.5 lg:table-cell">Domicilio</th>
            <th scope="col" className="px-5 py-2.5 text-right">Nivel</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {eventos.map((ev) => {
              const tone = toneDeNivel(ev.nivel)
              const Icono = iconoDe(ev.tipo)
              return (
                <motion.tr
                  key={ev.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-divider last:border-0 hover:bg-primary-50/50"
                >
                  <td className="px-5 py-3 align-top">
                    <time
                      dateTime={ev.creadoEn ?? undefined}
                      title={`${formatDateTime(ev.creadoEn)} · ${formatRelative(ev.creadoEn)}`}
                      className="font-medium text-text-secondary tabular"
                    >
                      {formatHora(ev.creadoEn)}
                    </time>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-start gap-3">
                      <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', circulo[tone])} aria-hidden>
                        <Icono className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary">{etiqueta(ev.tipo)}</p>
                        <p className="mt-0.5 line-clamp-2 break-words text-[0.8125rem] text-text-muted">{ev.mensaje || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 align-top text-text-secondary md:table-cell">{ev.origen}</td>
                  <td className="hidden max-w-[14rem] px-3 py-3 align-top text-text-secondary lg:table-cell">
                    {ev.domicilioId === null ? <span className="text-text-disabled">—</span> : (nombres.get(ev.domicilioId) ?? `#${ev.domicilioId}`)}
                  </td>
                  <td className="px-5 py-3 text-right align-top">
                    <Badge tone={tone === 'neutral' ? 'primary' : tone}>{NIVEL[ev.nivel] ?? ev.nivel}</Badge>
                  </td>
                </motion.tr>
              )
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
