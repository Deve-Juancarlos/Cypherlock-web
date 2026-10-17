import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Radio } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatNumber } from '@/core/utils/format'
import type { Resumen } from '@/domain/models'
import { PageHeader } from '../../components/layout/AppShell'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { EventFeed } from '../../components/ui/eventos'
import { useEventos, useResumen } from '../../hooks/queries'
import { useContador } from '../../hooks/useContador'

/** Indicadores 24 h: tarjetas con barra lateral de color segun el estado. */
function Indicador({ label, value, nota, tone, barra }: { label: string; value: number; nota: string; tone: string; barra: string }) {
  const n = useContador(value)
  return (
    <Panel className={cn('border-l-4 px-5 py-4', barra)}>
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
      <p className={cn('mt-2 text-[2.25rem] leading-none font-semibold tabular', tone)}>{formatNumber(n)}</p>
      <p className="mt-2 text-xs text-text-muted">{nota}</p>
    </Panel>
  )
}

function EstadoHoy({ r }: { r: Resumen }) {
  const intrusos = r.ultimas24h.intrusos
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Indicador label="Accesos registrados" value={r.ultimas24h.accesos} nota="Tarjeta, código, QR, rostro o app" tone="text-text-primary" barra="border-l-primary" />
      <Indicador
        label="Intentos de intrusión"
        value={intrusos}
        nota={intrusos ? 'Revisa las puertas afectadas' : 'Sin intentos detectados'}
        tone={intrusos ? 'text-error' : 'text-success'}
        barra={intrusos ? 'border-l-error' : 'border-l-success'}
      />
      <Indicador
        label="Alertas acumuladas"
        value={r.alertasActivas}
        nota="Advertencia o crítico"
        tone={r.alertasActivas ? 'text-warning' : 'text-text-primary'}
        barra={r.alertasActivas ? 'border-l-warning' : 'border-l-divider'}
      />
    </div>
  )
}

/** Barra segmentada con leyenda: composicion, no un "anillo decorativo". */
function Composicion({
  titulo,
  total,
  partes,
}: {
  titulo: string
  total: number
  partes: { label: string; value: number; color: string }[]
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{titulo}</h3>
        <span className="text-sm font-semibold text-text-primary tabular">{formatNumber(total)}</span>
      </div>
      <div className="mt-2 flex h-2 gap-px overflow-hidden rounded-full bg-surface-light" role="img" aria-label={`${titulo}: ${partes.map((p) => `${p.label} ${p.value}`).join(', ')}`}>
        {total > 0 &&
          partes.map((p) => (
            <motion.span
              key={p.label}
              className={p.color}
              initial={{ width: 0 }}
              animate={{ width: `${(p.value / total) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {partes.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className={cn('size-2 rounded-full', p.color)} aria-hidden />
            {p.label}
            <span className="font-semibold text-text-secondary tabular">{formatNumber(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Parque({ r }: { r: Resumen }) {
  const tipos = Object.entries(r.domicilios.porTipo)
  const colorTipo = ['bg-primary', 'bg-primary-dark', 'bg-info']
  return (
    <Panel>
      <PanelHeader title="Parque instalado" description="Qué hay en operación ahora mismo." />
      <div className="flex flex-col gap-5 p-4">
        <Composicion
          titulo="Domicilios"
          total={r.domicilios.total}
          partes={[
            { label: 'Activos', value: r.domicilios.activos, color: 'bg-success' },
            { label: 'Suspendidos', value: r.domicilios.inactivos, color: 'bg-text-disabled' },
          ]}
        />
        {tipos.length > 0 && (
          <Composicion
            titulo="Por tipo de inmueble"
            total={r.domicilios.total}
            partes={tipos.map(([k, v], i) => ({ label: k.charAt(0) + k.slice(1).toLowerCase(), value: v, color: colorTipo[i % 3] }))}
          />
        )}
        <Composicion
          titulo="Cuentas"
          total={r.usuarios.total}
          partes={[
            { label: 'Propietarios', value: r.usuarios.propietarios, color: 'bg-primary' },
            { label: 'Residentes', value: r.usuarios.residentes, color: 'bg-primary-dark' },
            { label: 'Operadores', value: r.usuarios.operadores, color: 'bg-info' },
            {
              label: 'Administradores',
              value: Math.max(0, r.usuarios.total - r.usuarios.propietarios - r.usuarios.residentes - r.usuarios.operadores),
              color: 'bg-text-secondary',
            },
          ]}
        />
        <Composicion
          titulo="Tarjetas RFID"
          total={r.tarjetas.total}
          partes={[
            { label: 'Activas', value: r.tarjetas.activas, color: 'bg-success' },
            { label: 'Inactivas', value: r.tarjetas.total - r.tarjetas.activas, color: 'bg-text-disabled' },
          ]}
        />
      </div>
    </Panel>
  )
}

function ResumenSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 rounded-[var(--radius-card)]" />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 rounded-[var(--radius-card)]" />
        <Skeleton className="h-96 rounded-[var(--radius-card)]" />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const resumen = useResumen()
  const eventos = useEventos(20)

  return (
    <>
      <PageHeader title="Resumen" description="Accesos, intrusiones y alertas de las últimas 24 horas." />
      {resumen.isPending ? (
        <ResumenSkeleton />
      ) : resumen.isError ? (
        <Panel>
          <ErrorState error={resumen.error} onRetry={() => resumen.refetch()} />
        </Panel>
      ) : (
        <div className="flex flex-col gap-5">
          <EstadoHoy r={resumen.data} />
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <Panel>
              <PanelHeader
                title="Actividad reciente"
                description="Se actualiza sola cuando el canal en vivo está conectado."
                actions={
                  <Link to="/panel/actividad" className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-primary hover:underline">
                    Ver todo <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                }
              />
              {eventos.isPending ? (
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : eventos.isError ? (
                <ErrorState error={eventos.error} onRetry={() => eventos.refetch()} />
              ) : eventos.data.length === 0 ? (
                <EmptyState
                  icon={<Radio className="size-5" aria-hidden />}
                  title="Aún no hay actividad"
                  description="Cuando las puertas registren accesos, alertas o cambios, aparecerán aquí al instante."
                />
              ) : (
                <EventFeed eventos={eventos.data} />
              )}
            </Panel>
            <Parque r={resumen.data} />
          </div>
        </div>
      )}
    </>
  )
}
