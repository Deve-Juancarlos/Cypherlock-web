import { useMemo, useState } from 'react'
import { Building2, KeyRound, Plus } from 'lucide-react'
import { type Domicilio } from '@/domain/models'
import { PageHeader } from '../../components/layout/AppShell'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States'
import { SearchInput, Segmented, Table, Td, Th, Tr } from '../../components/ui/Table'
import { useDomicilios } from '../../hooks/queries'
import { DetalleSheet, NuevoDomicilioSheet } from './DomicilioSheets'
import { tipoLabel } from './formato'

type Filtro = 'TODOS' | 'ACTIVOS' | 'SUSPENDIDOS' | 'SIN_DUENO'

export function DomiciliosPage() {
  const domicilios = useDomicilios()
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [nuevo, setNuevo] = useState(false)
  const [detalleId, setDetalleId] = useState<number | null>(null)

  // Referencia estable: sin esto el useMemo de abajo se recalcula en cada render.
  const lista = useMemo(() => domicilios.data ?? [], [domicilios.data])
  const pasa = (d: Domicilio, f: Filtro) =>
    f === 'TODOS' || (f === 'ACTIVOS' && d.activo) || (f === 'SUSPENDIDOS' && !d.activo) || (f === 'SIN_DUENO' && !d.propietario)
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase()
    return lista.filter(
      (d) =>
        pasa(d, filtro) &&
        (!t || [d.nombre, d.codigoContrato, d.propietario, d.direccion, d.ubicacion].some((x) => x.toLowerCase().includes(t))),
    )
  }, [lista, q, filtro])
  const detalle = lista.find((d) => d.id === detalleId) ?? null

  return (
    <>
      <PageHeader
        title="Domicilios"
        description="Casas instaladas, su propietario y los dispositivos de cada puerta."
        actions={<Button variant="primary" onClick={() => setNuevo(true)} icon={<Plus className="size-4" aria-hidden />}>Nuevo domicilio</Button>}
      />
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-4 pt-1">
          <Segmented
            label="Filtrar domicilios"
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: 'TODOS', label: 'Todos' },
              { value: 'ACTIVOS', label: 'Activos' },
              { value: 'SUSPENDIDOS', label: 'Suspendidos' },
              { value: 'SIN_DUENO', label: 'Sin propietario' },
            ].map((o) => ({ ...o, value: o.value as Filtro, count: domicilios.data ? lista.filter((d) => pasa(d, o.value as Filtro)).length : undefined }))}
          />
          <SearchInput value={q} onChange={setQ} placeholder="Buscar por nombre, código o dirección" label="Buscar domicilios" />
        </div>

        {domicilios.isPending ? (
          <TableSkeleton cols={6} />
        ) : domicilios.isError ? (
          <ErrorState error={domicilios.error} onRetry={() => domicilios.refetch()} />
        ) : visibles.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" aria-hidden />}
            title={lista.length ? 'Ningún domicilio coincide' : 'Aún no hay domicilios'}
            description={lista.length ? 'Cambia la búsqueda o el filtro.' : 'Crea el primero: se genera un código para que el propietario registre su cuenta.'}
            action={!lista.length ? <Button variant="primary" onClick={() => setNuevo(true)}>Nuevo domicilio</Button> : undefined}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Domicilio</Th>
                <Th>Contrato</Th>
                <Th>Propietario</Th>
                <Th>Operador</Th>
                <Th>Puerta</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((d) => (
                <Tr key={d.id} className="cursor-pointer" onClick={() => setDetalleId(d.id)}>
                  <Td>
                    <button className="cursor-pointer text-left" onClick={(e) => { e.stopPropagation(); setDetalleId(d.id) }}>
                      <p className="font-medium text-text-primary">{d.nombre}</p>
                      <p className="text-xs text-text-muted">{tipoLabel(d.tipoInmueble)}{d.direccion && ` · ${d.direccion}`}</p>
                    </button>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-text-primary">{d.codigoContrato}</span>
                    {!d.contratoUsado && <Badge tone="info" className="ml-2">Disponible</Badge>}
                  </Td>
                  <Td>{d.propietario || <span className="text-text-disabled">—</span>}</Td>
                  <Td>{d.operador || <span className="text-text-disabled">—</span>}</Td>
                  <Td>
                    {d.esp32Configurado ? (
                      <span className="inline-flex items-center gap-1.5 text-xs"><KeyRound className="size-3.5 text-primary-light" aria-hidden />Configurada</span>
                    ) : (
                      <span className="text-xs text-text-disabled">Pendiente</span>
                    )}
                  </Td>
                  <Td><Badge tone={d.activo ? 'success' : 'neutral'} dot>{d.activo ? 'Activo' : 'Suspendido'}</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>

      <NuevoDomicilioSheet open={nuevo} onClose={() => setNuevo(false)} />
      <DetalleSheet domicilio={detalle} onClose={() => setDetalleId(null)} />
    </>
  )
}
