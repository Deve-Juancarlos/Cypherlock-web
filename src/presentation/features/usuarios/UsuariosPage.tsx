import { useMemo, useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { formatDate } from '@/core/utils/format'
import type { Rol, Usuario } from '@/domain/models'
import { useCurrentUser } from '../../app/providers'
import { PageHeader } from '../../components/layout/AppShell'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmButton } from '../../components/ui/ConfirmButton'
import { MiniSelect } from '../../components/ui/Field'
import { Panel } from '../../components/ui/Panel'
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States'
import { SearchInput, Segmented, Table, Td, Th, Tr } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'
import { useCambiarRol, useSetUsuarioActivo, useUsuarios } from '../../hooks/queries'
import { ROL_LABEL, ROLES_EDITABLES } from './roles'
import { NuevoUsuarioSheet, PromoverSheet } from './UsuarioSheets'

type Filtro = 'TODOS' | Rol

export function UsuariosPage() {
  const me = useCurrentUser()
  const usuarios = useUsuarios()
  const cambiarRol = useCambiarRol()
  const setActivo = useSetUsuarioActivo()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [nuevo, setNuevo] = useState(false)
  const [promover, setPromover] = useState<Usuario | null>(null)

  // Referencia estable: sin esto el useMemo de abajo se recalcula en cada render.
  const lista = useMemo(() => usuarios.data ?? [], [usuarios.data])
  const conteo = (r: Filtro) => (r === 'TODOS' ? lista.length : lista.filter((u) => u.rol === r).length)
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase()
    return lista.filter(
      (u) => (filtro === 'TODOS' || u.rol === filtro) && (!t || u.username.toLowerCase().includes(t) || u.email.toLowerCase().includes(t)),
    )
  }, [lista, q, filtro])

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Cuentas del sistema: roles, estado y acceso."
        actions={<Button variant="primary" onClick={() => setNuevo(true)} icon={<UserPlus className="size-4" aria-hidden />}>Nueva cuenta</Button>}
      />
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-divider px-4 pt-1">
          <Segmented
            label="Filtrar por rol"
            value={filtro}
            onChange={setFiltro}
            options={(['TODOS', 'ADMIN', 'OPERADOR', 'PROPIETARIO', 'RESIDENTE'] as Filtro[]).map((r) => ({
              value: r,
              label: r === 'TODOS' ? 'Todos' : ROL_LABEL[r],
              count: usuarios.data ? conteo(r) : undefined,
            }))}
          />
          <SearchInput value={q} onChange={setQ} placeholder="Buscar por usuario o correo" label="Buscar usuarios" />
        </div>

        {usuarios.isPending ? (
          <TableSkeleton cols={5} />
        ) : usuarios.isError ? (
          <ErrorState error={usuarios.error} onRetry={() => usuarios.refetch()} />
        ) : visibles.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" aria-hidden />}
            title={lista.length ? 'Ninguna cuenta coincide' : 'Todavía no hay cuentas'}
            description={lista.length ? 'Prueba con otro nombre o quita el filtro de rol.' : 'Crea la primera cuenta de operador para empezar a instalar domicilios.'}
            action={!lista.length ? <Button variant="primary" onClick={() => setNuevo(true)}>Nueva cuenta</Button> : undefined}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Cuenta</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Casa</Th>
                <Th>Alta</Th>
                <Th className="text-right">Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((u) => {
                const esYo = u.id === me.id
                const esAdmin = u.rol === 'ADMIN'
                return (
                  <Tr key={u.id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-text-primary">
                            {u.username} {esYo && <span className="text-xs font-normal text-text-muted">(tú)</span>}
                          </p>
                          <p className="truncate text-xs text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      {esAdmin ? (
                        <Badge tone="primary">Admin</Badge>
                      ) : (
                        <MiniSelect
                          aria-label={`Rol de ${u.username}`}
                          value={u.rol}
                          disabled={cambiarRol.isPending}
                          onChange={(e) =>
                            cambiarRol.mutate(
                              { id: u.id, rol: e.target.value as (typeof ROLES_EDITABLES)[number] },
                              {
                                onSuccess: () => toast.success('Rol actualizado', `${u.username} ahora es ${ROL_LABEL[e.target.value]}.`),
                                onError: (err) => toast.error(err, 'No se cambió el rol'),
                              },
                            )
                          }
                          options={ROLES_EDITABLES.map((r) => ({ value: r, label: ROL_LABEL[r] }))}
                        />
                      )}
                    </Td>
                    <Td>
                      <Badge tone={u.activo ? 'success' : 'neutral'} dot>{u.activo ? 'Activa' : 'Desactivada'}</Badge>
                    </Td>
                    <Td className="font-mono text-xs tabular">{u.casaId ?? '—'}</Td>
                    <Td className="font-mono text-xs whitespace-nowrap">{formatDate(u.creadoEn)}</Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        {!esAdmin && u.activo && (
                          <Button size="sm" variant="ghost" onClick={() => setPromover(u)}>Promover</Button>
                        )}
                        {!esYo && !esAdmin &&
                          (u.activo ? (
                            <ConfirmButton
                              size="sm"
                              variant="ghost"
                              confirmLabel="¿Desactivar?"
                              onConfirm={() =>
                                setActivo.mutate(
                                  { id: u.id, activo: false },
                                  {
                                    onSuccess: () => toast.success('Cuenta desactivada', `${u.username} ya no puede ingresar.`),
                                    onError: (err) => toast.error(err),
                                  },
                                )
                              }
                            >
                              Desactivar
                            </ConfirmButton>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() =>
                                setActivo.mutate(
                                  { id: u.id, activo: true },
                                  { onSuccess: () => toast.success('Cuenta reactivada'), onError: (err) => toast.error(err) },
                                )
                              }
                            >
                              Reactivar
                            </Button>
                          ))}
                      </div>
                    </Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </Panel>

      <NuevoUsuarioSheet open={nuevo} onClose={() => setNuevo(false)} />
      <PromoverSheet usuario={promover} onClose={() => setPromover(null)} />
    </>
  )
}
