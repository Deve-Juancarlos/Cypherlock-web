import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Radio, RefreshCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { PageHeader } from '../../components/layout/AppShell'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { EventFeed } from '../../components/ui/eventos'
import { useEventos, useResumen } from '../../hooks/queries'
import { EstadoHoy } from './DashboardIndicadores'
import { Parque } from './DashboardParque'

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
  const [ultimaActualizacion, setUltimaActualizacion] = useState(() => new Date())

  const actualizar = async () => {
    await Promise.all([resumen.refetch(), eventos.refetch()])
    setUltimaActualizacion(new Date())
  }

  return (
    <>
      <PageHeader
        title="Resumen"
        description="Accesos, intrusiones y alertas de las últimas 24 horas."
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">
              Actualizado: {ultimaActualizacion.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button type="button" onClick={() => void actualizar()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-divider bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-light">
              <RefreshCw className="size-3.5" aria-hidden />Actualizar
            </button>
          </div>
        }
      />

      {resumen.isPending ? (
        <ResumenSkeleton />
      ) : resumen.isError ? (
        <Panel><ErrorState error={resumen.error} onRetry={() => resumen.refetch()} /></Panel>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col gap-6">
          <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium ring-1 ${resumen.data.alertasActivas ? 'bg-warning/10 text-warning ring-warning/20' : 'bg-success/10 text-success ring-success/20'}`}>
            {resumen.data.alertasActivas ? <AlertTriangle className="size-4" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}
            <span>{resumen.data.alertasActivas ? `${resumen.data.alertasActivas} alertas activas` : 'Sin alertas activas'}</span>
            <span className="ml-auto text-text-muted">
              <Clock className="mr-1 inline size-3" aria-hidden />
              {eventos.isPending ? 'Cargando actividad…' : eventos.isError ? 'Actividad no disponible' : `${eventos.data.length} eventos recientes`}
            </span>
          </div>

          <EstadoHoy resumen={resumen.data} />

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <Panel>
              <PanelHeader
                title={<span className="inline-flex items-center gap-2"><Radio className="size-4" aria-hidden />Actividad reciente</span>}
                description="Se actualiza sola cuando el canal en vivo está conectado."
                actions={
                  <Link to="/panel/actividad" className="group inline-flex items-center gap-1 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-dark">
                    Ver todo <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                }
              />
              {eventos.isPending ? (
                <div className="flex flex-col gap-3 p-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <Skeleton className="h-12" />
                    </motion.div>
                  ))}
                </div>
              ) : eventos.isError ? (
                <ErrorState error={eventos.error} onRetry={() => eventos.refetch()} />
              ) : eventos.data.length === 0 ? (
                <EmptyState icon={<Radio className="size-5" aria-hidden />} title="Aún no hay actividad"
                  description="Cuando las puertas registren accesos, alertas o cambios, aparecerán aquí al instante." />
              ) : (
                <EventFeed eventos={eventos.data} />
              )}
            </Panel>

            <Parque resumen={resumen.data} />
          </div>
        </motion.div>
      )}
    </>
  )
}
