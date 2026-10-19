/** Indicadores de accesos, intrusiones y alertas de las últimas 24 horas. */
import { motion } from 'motion/react'
import { Activity, AlertTriangle, Shield, type LucideIcon } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatNumber } from '@/core/utils/format'
import type { Resumen } from '@/domain/models'
import { Panel } from '../../components/ui/Panel'
import { useContador } from '../../hooks/useContador'

function Indicador({ label, value, nota, tone, barra, chip, icono: Icono }: {
  label: string
  value: number
  nota: string
  tone: string
  barra: string
  chip: string
  icono: LucideIcon
}) {
  const n = useContador(value)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Panel className="relative overflow-hidden px-5 pt-5 pb-4 transition-colors duration-200 hover:border-text-disabled">
        <span aria-hidden className={cn('absolute inset-x-0 top-0 h-[3px]', barra)} />
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-text-secondary">{label}</p>
          <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)]', chip)}>
            <Icono className="size-[1.125rem]" aria-hidden />
          </span>
        </div>
        <p className={cn('mt-2 font-mono text-[2.5rem] leading-none font-semibold tracking-[-0.02em] tabular', tone)}>{formatNumber(n)}</p>
        <p className="mt-3 border-t border-divider pt-3 text-xs text-text-muted">{nota}</p>
      </Panel>
    </motion.div>
  )
}

export function EstadoHoy({ resumen }: { resumen: Resumen }) {
  const intrusos = resumen.ultimas24h.intrusos
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Indicador
        label="Accesos registrados"
        value={resumen.ultimas24h.accesos}
        nota="Tarjeta, código, QR, rostro o app"
        tone="text-text-primary"
        barra="bg-primary"
        chip="bg-primary-50 text-primary"
        icono={Activity}
      />
      <Indicador
        label="Intentos de intrusión"
        value={intrusos}
        nota={intrusos ? 'Revisa las puertas afectadas' : 'Sin intentos detectados'}
        tone={intrusos ? 'text-error' : 'text-success'}
        barra={intrusos ? 'bg-error' : 'bg-success'}
        chip={intrusos ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}
        icono={Shield}
      />
      <Indicador
        label="Alertas acumuladas"
        value={resumen.alertasActivas}
        nota="Advertencia o crítico"
        tone={resumen.alertasActivas ? 'text-warning' : 'text-text-primary'}
        barra={resumen.alertasActivas ? 'bg-warning' : 'bg-divider'}
        chip={resumen.alertasActivas ? 'bg-warning/10 text-warning' : 'bg-surface-light text-text-muted'}
        icono={AlertTriangle}
      />
    </div>
  )
}
