import { Link } from 'react-router-dom'
import { ArrowRight, Radio, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { formatNumber } from '@/core/utils/format'
import type { Resumen } from '@/domain/models'
import { PageHeader } from '../../components/layout/AppShell'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { EventFeed } from '../../components/ui/eventos'
import { useEventos, useResumen } from '../../hooks/queries'

/**
 * Indicadores 24 h: tarjetas de color solido segun el estado (no decorativo:
 * rojo solo si hubo intrusiones, ambar solo si hay alertas).
 */
function EstadoHoy({ r }: { r: Resumen }) {
  const intrusos = r.ultimas24h.intrusos
  const items = [
    { label: 'Accesos registrados', value: r.ultimas24h.accesos, nota: 'Tarjeta, código, QR, rostro o app', fondo: 'bg-[#0b4a57]', Icono: ShieldCheck },
    {
      label: 'Intentos de intrusión',
      value: intrusos,
      nota: intrusos ? 'Revisa las puertas afectadas' : 'Sin intentos detectados',
      fondo: intrusos ? 'bg-[#8a1f1f]' : 'bg-[#17543a]',
      Icono: intrusos ? ShieldAlert : ShieldCheck,
    },
    {
      label: 'Alertas acumuladas',
      value: r.alertasActivas,
      nota: 'Advertencias y eventos críticos',
      fondo: r.alertasActivas ? 'bg-[#7a4f0b]' : 'bg-[#2b3740]',
      Icono: TriangleAlert,
    },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(({ label, value, nota, fondo, Icono }) => (
        <section key={label} className={cn('relative overflow-hidden rounded-[var(--radius-card)] px-5 py-4 text-white', fondo)}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-white/90">{label}</h2>
            <span className="rounded-[3px] bg-white/15 px-1.5 py-0.5 text-2xs font-medium text-white/90">24 h</span>
          </div>
          <p className="mt-2 text-[2.5rem] leading-none font-semibold tabular">{formatNumber(value)}</p>
          <p className="mt-2 text-xs text-white/80">{nota}</p>
          <Icono className="absolute right-4 bottom-3 size-12 text-white/20" strokeWidth={1.5} aria-hidden />
        </section>
      ))}
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
            <span key={p.label} className={p.color} style={{ width: `${(p.value / total) * 100}%` }} />
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
  const eventos = useEventos(10)

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
                  <Link
                    to="/panel/actividad"
                    className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-control)] border border-divider bg-surface px-3 text-[0.8125rem] font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
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
