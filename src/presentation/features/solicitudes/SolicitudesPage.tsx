import { useMemo, useState } from 'react'
import { ClipboardList, Star } from 'lucide-react'
import { formatDateTime, formatFechaCorta, formatNumber } from '@/core/utils/format'
import { TRANSICIONES, type EstadoSolicitud, type Solicitud } from '@/domain/models'
import { PageHeader } from '../../components/layout/AppShell'
import { Badge, type Tone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmButton } from '../../components/ui/ConfirmButton'
import { MiniSelect } from '../../components/ui/Field'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { EmptyState, ErrorState, Skeleton, TableSkeleton } from '../../components/ui/States'
import { SearchInput, Segmented, Table, Td, Th, Tr } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'
import {
  useAsignarOperador,
  useCambiarEstadoSolicitud,
  useMetricasOperadores,
  useSolicitudes,
  useUsuarios,
} from '../../hooks/queries'

const ESTADOS: EstadoSolicitud[] = ['PENDIENTE', 'ASIGNADO', 'CONFIRMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO']
const LABEL: Record<EstadoSolicitud, string> = {
  PENDIENTE: 'Pendiente',
  ASIGNADO: 'Asignada',
  CONFIRMADO: 'Confirmada',
  EN_CURSO: 'En curso',
  COMPLETADO: 'Completada',
  CANCELADO: 'Cancelada',
}
const TONE: Record<EstadoSolicitud, Tone> = {
  PENDIENTE: 'warning',
  ASIGNADO: 'info',
  CONFIRMADO: 'primary',
  EN_CURSO: 'primary',
  COMPLETADO: 'success',
  CANCELADO: 'neutral',
}
/** Verbo de cada transicion para el boton ("Confirmar", "Iniciar"...). */
const VERBO: Partial<Record<EstadoSolicitud, string>> = {
  CONFIRMADO: 'Confirmar',
  EN_CURSO: 'Iniciar',
  COMPLETADO: 'Completar',
  PENDIENTE: 'Devolver',
}

type Filtro = 'ABIERTAS' | EstadoSolicitud
const ABIERTAS: EstadoSolicitud[] = ['PENDIENTE', 'ASIGNADO', 'CONFIRMADO', 'EN_CURSO']

function Acciones({ s }: { s: Solicitud }) {
  const cambiar = useCambiarEstadoSolicitud()
  const toast = useToast()
  const mover = (estado: EstadoSolicitud) =>
    cambiar.mutate(
      { id: s.id, estado },
      {
        onSuccess: () => toast.success(`Solicitud #${s.id}`, `Ahora está ${LABEL[estado].toLowerCase()}.`),
        onError: (e) => toast.error(e, 'No se cambió el estado'),
      },
    )
  const siguientes = TRANSICIONES[s.estado].filter((e) => e !== 'CANCELADO' && e !== 'ASIGNADO')
  return (
    <div className="flex justify-end gap-1.5">
      {siguientes.map((e) => (
        <Button key={e} size="sm" variant={e === 'PENDIENTE' ? 'ghost' : 'secondary'} disabled={cambiar.isPending} onClick={() => mover(e)}>
          {VERBO[e] ?? LABEL[e]}
        </Button>
      ))}
      {TRANSICIONES[s.estado].includes('CANCELADO') && (
        <ConfirmButton size="sm" variant="ghost" confirmLabel="¿Cancelar?" onConfirm={() => mover('CANCELADO')}>
          Cancelar
        </ConfirmButton>
      )}
    </div>
  )
}

function Operadores() {
  const m = useMetricasOperadores()
  return (
    <Panel>
      <PanelHeader title="Operadores" description="Carga y calidad del servicio." />
      {m.isPending ? (
        <div className="flex flex-col gap-3 p-4">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : m.isError ? (
        <ErrorState error={m.error} onRetry={() => m.refetch()} />
      ) : m.data.length === 0 ? (
        <p className="p-4 text-[0.8125rem] text-text-muted">Cuando asignes solicitudes, aquí verás el avance de cada operador.</p>
      ) : (
        <ul className="divide-y divide-divider/70">
          {m.data.map((o) => (
            <li key={o.operador} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-text-primary">{o.operador}</p>
                <span className="inline-flex items-center gap-1 font-mono text-xs text-warning tabular">
                  <Star className="size-3 fill-current" aria-hidden />
                  {o.ratingPromedio ? o.ratingPromedio.toFixed(1) : '—'}
                </span>
              </div>
              <div className="mt-2 flex h-1 gap-px overflow-hidden bg-background" aria-hidden>
                <span className="bg-success" style={{ width: `${o.total ? (o.completadas / o.total) * 100 : 0}%` }} />
                <span className="bg-primary" style={{ width: `${o.total ? (o.enCurso / o.total) * 100 : 0}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-text-muted tabular">
                {formatNumber(o.completadas)} completadas · {formatNumber(o.enCurso)} en curso · {formatNumber(o.total)} en total
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function SolicitudesPage() {
  const solicitudes = useSolicitudes()
  const usuarios = useUsuarios()
  const asignar = useAsignarOperador()
  const toast = useToast()
  const [filtro, setFiltro] = useState<Filtro>('ABIERTAS')
  const [q, setQ] = useState('')

  // Referencia estable: sin esto el useMemo de abajo se recalcula en cada render.
  const lista = useMemo(() => solicitudes.data ?? [], [solicitudes.data])
  const operadores = (usuarios.data ?? []).filter((u) => u.rol === 'OPERADOR' && u.activo)
  const pasa = (s: Solicitud, f: Filtro) => (f === 'ABIERTAS' ? ABIERTAS.includes(s.estado) : s.estado === f)
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase()
    return lista.filter((s) => pasa(s, filtro) && (!t || [s.cliente, s.telefono, s.direccion, s.operador].some((x) => x.toLowerCase().includes(t))))
  }, [lista, filtro, q])

  return (
    <>
      <PageHeader title="Solicitudes" description="Pedidos de instalación: asignación, agenda y cierre." />
      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-divider px-4 pt-1 pb-0 sm:pb-0">
            <Segmented
              label="Filtrar por estado"
              value={filtro}
              onChange={setFiltro}
              options={(['ABIERTAS', ...ESTADOS] as Filtro[]).map((f) => ({
                value: f,
                label: f === 'ABIERTAS' ? 'Abiertas' : LABEL[f],
                count: solicitudes.data ? lista.filter((s) => pasa(s, f)).length : undefined,
              }))}
            />
            <SearchInput value={q} onChange={setQ} placeholder="Cliente, teléfono u operador" label="Buscar solicitudes" />
          </div>

          {solicitudes.isPending ? (
            <TableSkeleton cols={5} />
          ) : solicitudes.isError ? (
            <ErrorState error={solicitudes.error} onRetry={() => solicitudes.refetch()} />
          ) : visibles.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="size-5" aria-hidden />}
              title={filtro === 'ABIERTAS' ? 'No hay solicitudes abiertas' : `Sin solicitudes ${LABEL[filtro as EstadoSolicitud]?.toLowerCase()}`}
              description="Las solicitudes llegan desde el formulario público y desde los operadores; aparecerán aquí para asignarlas."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Cliente</Th>
                  <Th>Cita</Th>
                  <Th>Operador</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Siguiente paso</Th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((s) => {
                  const abierta = ABIERTAS.includes(s.estado) && s.estado !== 'EN_CURSO'
                  return (
                    <Tr key={s.id}>
                      <Td>
                        <p className="whitespace-nowrap font-medium text-text-primary">
                          {s.cliente} <span className="font-mono text-2xs font-normal text-text-disabled">#{s.id}</span>
                        </p>
                        <p className="whitespace-nowrap text-xs text-text-muted">
                          {s.telefono}
                          {s.zona && ` · ${s.zona}`}
                        </p>
                      </Td>
                      <Td className="font-mono text-xs whitespace-nowrap">{s.fechaCita ? <span title={formatDateTime(s.fechaCita)}>{formatFechaCorta(s.fechaCita)}</span> : <span className="text-text-disabled">Sin agendar</span>}</Td>
                      <Td>
                        {abierta ? (
                          <MiniSelect
                            aria-label={`Operador de la solicitud ${s.id}`}
                            value={s.operador}
                            disabled={asignar.isPending || usuarios.isPending}
                            onChange={(e) =>
                              e.target.value &&
                              asignar.mutate(
                                { id: s.id, operador: e.target.value, estadoActual: s.estado },
                                {
                                  onSuccess: () => toast.success('Operador asignado', `${e.target.value} atenderá la solicitud #${s.id}.`),
                                  onError: (err) => toast.error(err, 'No se asignó'),
                                },
                              )
                            }
                            options={[
                              { value: '', label: 'Sin asignar' },
                              ...operadores.map((o) => ({ value: o.username, label: o.username })),
                              ...(s.operador && !operadores.some((o) => o.username === s.operador) ? [{ value: s.operador, label: s.operador }] : []),
                            ]}
                          />
                        ) : (
                          s.operador || <span className="text-text-disabled">—</span>
                        )}
                      </Td>
                      <Td><Badge tone={TONE[s.estado]} dot>{LABEL[s.estado]}</Badge></Td>
                      <Td className="whitespace-nowrap"><Acciones s={s} /></Td>
                    </Tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Panel>
        <Operadores />
      </div>
    </>
  )
}
