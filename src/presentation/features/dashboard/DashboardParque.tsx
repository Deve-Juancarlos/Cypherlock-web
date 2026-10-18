/** Distribución de domicilios, cuentas y tarjetas instaladas. */
import { motion } from 'motion/react'
import { CreditCard, Home, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatNumber } from '@/core/utils/format'
import type { Resumen } from '@/domain/models'
import { Panel, PanelHeader } from '../../components/ui/Panel'

interface Parte {
  label: string
  value: number
  color: string
}

function Composicion({ titulo, total, partes, icono: Icono }: {
  titulo: string
  total: number
  partes: Parte[]
  icono: LucideIcon
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icono className="size-4 text-text-muted" aria-hidden />
          <h3 className="text-sm font-semibold text-text-primary">{titulo}</h3>
        </div>
        <span className="text-sm font-bold text-text-primary tabular">{formatNumber(total)}</span>
      </div>
      <div className="mt-3 flex h-2.5 gap-px overflow-hidden rounded-full bg-surface-light" role="img"
        aria-label={`${titulo}: ${partes.map((p) => `${p.label} ${p.value}`).join(', ')}`}>
        {total > 0 && partes.map((p, i) => (
          <motion.span
            key={p.label}
            className={cn(p.color, 'transition-opacity hover:opacity-80')}
            initial={{ width: 0 }}
            animate={{ width: `${(p.value / total) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
            title={`${p.label}: ${p.value}`}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {partes.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-xs text-text-muted">
            <span className={cn('size-2.5 rounded-full', p.color)} aria-hidden />
            <span className="font-medium">{p.label}</span>
            <span className="font-bold text-text-secondary tabular">{formatNumber(p.value)}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export function Parque({ resumen }: { resumen: Resumen }) {
  const tipos = Object.entries(resumen.domicilios.porTipo)
  const colorTipo = ['bg-primary', 'bg-primary-dark', 'bg-info']
  return (
    <Panel>
      <PanelHeader
        title={<span className="inline-flex items-center gap-2"><Home className="size-4" aria-hidden />Parque instalado</span>}
        description="Qué hay en operación ahora mismo."
      />
      <div className="flex flex-col gap-6 p-5">
        <Composicion titulo="Domicilios" total={resumen.domicilios.total} icono={Home} partes={[
          { label: 'Activos', value: resumen.domicilios.activos, color: 'bg-success' },
          { label: 'Suspendidos', value: resumen.domicilios.inactivos, color: 'bg-text-disabled' },
        ]} />
        {tipos.length > 0 && (
          <Composicion titulo="Por tipo de inmueble" total={resumen.domicilios.total} icono={Home}
            partes={tipos.map(([k, v], i) => ({
              label: k.charAt(0) + k.slice(1).toLowerCase(),
              value: v,
              color: colorTipo[i % colorTipo.length],
            }))} />
        )}
        <Composicion titulo="Cuentas" total={resumen.usuarios.total} icono={Users} partes={[
          { label: 'Propietarios', value: resumen.usuarios.propietarios, color: 'bg-primary' },
          { label: 'Residentes', value: resumen.usuarios.residentes, color: 'bg-primary-dark' },
          { label: 'Operadores', value: resumen.usuarios.operadores, color: 'bg-info' },
          {
            label: 'Administradores',
            value: Math.max(0, resumen.usuarios.total - resumen.usuarios.propietarios - resumen.usuarios.residentes - resumen.usuarios.operadores),
            color: 'bg-text-secondary',
          },
        ]} />
        <Composicion titulo="Tarjetas RFID" total={resumen.tarjetas.total} icono={CreditCard} partes={[
          { label: 'Activas', value: resumen.tarjetas.activas, color: 'bg-success' },
          { label: 'Inactivas', value: resumen.tarjetas.total - resumen.tarjetas.activas, color: 'bg-text-disabled' },
        ]} />
      </div>
    </Panel>
  )
}
