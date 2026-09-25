import { useMemo, useState } from 'react'
import { Radio } from 'lucide-react'
import { PageHeader } from '../../components/layout/AppShell'
import { Panel } from '../../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States'
import { SearchInput, Segmented } from '../../components/ui/Table'
import { EventFeed } from '../../components/ui/eventos'
import { useEventos } from '../../hooks/queries'

type Nivel = 'TODOS' | 'INFO' | 'WARN' | 'CRITICAL'
const NIVELES: { value: Nivel; label: string }[] = [
  { value: 'TODOS', label: 'Todo' },
  { value: 'INFO', label: 'Informativos' },
  { value: 'WARN', label: 'Advertencias' },
  { value: 'CRITICAL', label: 'Críticos' },
]

export function ActividadPage() {
  const eventos = useEventos(200)
  const [nivel, setNivel] = useState<Nivel>('TODOS')
  const [q, setQ] = useState('')

  const lista = eventos.data ?? []
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase()
    return lista.filter(
      (e) => (nivel === 'TODOS' || e.nivel === nivel) && (!t || `${e.tipo} ${e.mensaje} ${e.origen}`.toLowerCase().includes(t)),
    )
  }, [lista, nivel, q])

  return (
    <>
      <PageHeader title="Actividad" description="Accesos, alertas y cambios de todas las casas, en orden cronológico." />
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider/60 px-5 py-4">
          <Segmented
            label="Filtrar por nivel"
            value={nivel}
            onChange={setNivel}
            options={NIVELES.map((n) => ({
              ...n,
              count: eventos.data ? (n.value === 'TODOS' ? lista.length : lista.filter((e) => e.nivel === n.value).length) : undefined,
            }))}
          />
          <SearchInput value={q} onChange={setQ} placeholder="Buscar tipo, mensaje u origen" label="Buscar eventos" />
        </div>
        {eventos.isPending ? (
          <div className="flex flex-col gap-4 p-5">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : eventos.isError ? (
          <ErrorState error={eventos.error} onRetry={() => eventos.refetch()} />
        ) : visibles.length === 0 ? (
          <EmptyState
            icon={<Radio className="size-5" aria-hidden />}
            title={lista.length ? 'Ningún evento coincide' : 'Sin actividad registrada'}
            description={lista.length ? 'Cambia el nivel o la búsqueda.' : 'Los accesos, alertas y cambios de configuración aparecerán aquí en tiempo real.'}
          />
        ) : (
          <EventFeed eventos={visibles} dense />
        )}
      </Panel>
    </>
  )
}
