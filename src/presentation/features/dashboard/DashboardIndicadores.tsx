/** Indicadores de accesos, intrusiones y alertas de las últimas 24 horas. */
import { motion } from 'motion/react'
import { Activity, AlertTriangle, Shield, type LucideIcon } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatNumber } from '@/core/utils/format'
import type { Resumen } from '@/domain/models'
import { Panel } from '../../components/ui/Panel'
import { useContador } from '../../hooks/useContador'

function Indicador({ label, value, nota, tone, barra, icono: Icono }: {
  label: string
  value: number
  nota: string
  tone: string
  barra: string
  icono: LucideIcon
}) {
  const n = useContador(value)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
      <Panel className={cn('group relative overflow-hidden border-l-4 px-5 py-5 transition-shadow duration-300 hover:shadow-lg', barra)}>
        <Icono className="absolute -right-3 -bottom-3 size-24 opacity-[0.04] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.08]" aria-hidden />
        <div className="relative">
          <p className="text-sm font-semibold text-text-secondary">{label}</p>
          <p className={cn('mt-3 text-[2.5rem] leading-none font-bold tabular', tone)}>{formatNumber(n)}</p>
          <p className="mt-2 text-xs text-text-muted">{nota}</p>
        </div>
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
        barra="border-l-primary"
        icono={Activity}
      />
      <Indicador
        label="Intentos de intrusión"
        value={intrusos}
        nota={intrusos ? 'Revisa las puertas afectadas' : 'Sin intentos detectados'}
        tone={intrusos ? 'text-error' : 'text-success'}
        barra={intrusos ? 'border-l-error' : 'border-l-success'}
        icono={Shield}
      />
      <Indicador
        label="Alertas acumuladas"
        value={resumen.alertasActivas}
        nota="Advertencia o crítico"
        tone={resumen.alertasActivas ? 'text-warning' : 'text-text-primary'}
        barra={resumen.alertasActivas ? 'border-l-warning' : 'border-l-divider'}
        icono={AlertTriangle}
      />
    </div>
  )
}
