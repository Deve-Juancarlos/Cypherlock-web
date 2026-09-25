import { Link } from 'react-router-dom'
import { ArrowRight, Radio } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatNumber } from '@/core/utils/format'
import type { Resumen } from '@/domain/models'
import { PageHeader } from '../../components/layout/AppShell'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { EventFeed } from '../../components/ui/eventos'
import { useEventos, useResumen } from '../../hooks/queries'

/** Franja de estado 24 h: una sola superficie, las cifras hablan por su tono. */
function EstadoHoy({ r }: { r: Resumen }) {
  const items = [
    {
      label: 'Accesos registrados',
      value: r.ultimas24h.accesos,
      nota: 'Tarjeta, código, QR, rostro o app',
      tone: 'text-text-primary',
    },
    {
      label: 'Intentos de intrusión',
      value: r.ultimas24h.intrusos,
      nota: r.ultimas24h.intrusos ? 'Revisa las puertas afectadas' : 'Sin intentos detectados',
      tone: r.ultimas24h.intrusos ? 'text-error' : 'text-success',
    },
    {
      label: 'Alertas acumuladas',
      value: r.alertasActivas,
      nota: 'Advertencia o crítico',
      tone: r.alertasActivas ? 'text-warning' : 'text-text-primary',
    },
  ]
  return (
    <Panel className="grid divide-y divide-divider sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((it) => (
        <div key={it.label} className="px-4 py-4">
          <p className="rotulo">{it.label}</p>
          <p className={cn('mt-2 font-mono text-[1.75rem] leading-none font-medium tabular', it.tone)}>{formatNumber(it.value)}</p>
          <p className="mt-2 text-xs text-text-disabled">{it.nota}</p>
        </div>
      ))}
    </Panel>
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
        <h3 className="text-[0.8125rem] font-medium text-text-secondary">{titulo}</h3>
        <span className="font-mono text-sm text-text-primary tabular">{formatNumber(total)}</span>
      </div>
      <div className="mt-2 flex h-1.5 gap-px overflow-hidden bg-background" role="img" aria-label={`${titulo}: ${partes.map((p) => `${p.label} ${p.value}`).join(', ')}`}>
        {total > 0 &&
          partes.map((p) => (
            <span key={p.label} className={p.color} style={{ width: `${(p.value / total) * 100}%` }} />
          ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {partes.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className={cn('size-1.5', p.color)} aria-hidden />
            {p.label}
            <span className="font-mono text-text-secondary tabular">{formatNumber(p.value)}</span>
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
                  <Link to="/actividad" className="inline-flex items-center gap-1 text-[0.8125rem] text-text-muted hover:text-primary-light">
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
