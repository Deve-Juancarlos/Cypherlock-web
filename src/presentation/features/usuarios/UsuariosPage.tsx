import { useMemo, useState, type FormEvent } from 'react'
import { ShieldCheck, UserPlus, Users } from 'lucide-react'
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import { formatDate } from '@/core/utils/format'
import type { Rol, Usuario } from '@/domain/models'
import { useCurrentUser } from '../../app/providers'
import { PageHeader } from '../../components/layout/AppShell'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmButton } from '../../components/ui/ConfirmButton'
import { InputField, MiniSelect, SelectField } from '../../components/ui/Field'
import { Panel } from '../../components/ui/Panel'
import { Sheet } from '../../components/ui/Sheet'
import { EmptyState, ErrorState, TableSkeleton } from '../../components/ui/States'
import { Avatar, SearchInput, Segmented, Table, Td, Th, Tr } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'
import {
  useCambiarRol,
  useCrearUsuario,
  usePromoverAdmin,
  useSetUsuarioActivo,
  useUsuarios,
} from '../../hooks/queries'

type Filtro = 'TODOS' | Rol
const ROL_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  OPERADOR: 'Operador',
  PROPIETARIO: 'Propietario',
  RESIDENTE: 'Residente',
}
const ROLES_EDITABLES = ['OPERADOR', 'PROPIETARIO', 'RESIDENTE'] as const

// ------------------------------------------------------------------ alta
const NuevoSchema = z.object({
  username: z.string().trim().min(3, 'Mínimo 3 caracteres.').max(50).regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, punto, guion y guion bajo.'),
  email: z.email('Correo no válido.'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres.')
    .regex(/[A-Z]/, 'Incluye una mayúscula.')
    .regex(/[a-z]/, 'Incluye una minúscula.')
    .regex(/\d/, 'Incluye un número.')
    .regex(/[^A-Za-z0-9]/, 'Incluye un símbolo.'),
  rol: z.enum(ROLES_EDITABLES),
  celular: z.string().trim().regex(/^(\+?[0-9\s-]{6,20})?$/, 'Número no válido.').optional(),
})
type NuevoForm = z.input<typeof NuevoSchema>
const VACIO: NuevoForm = { username: '', email: '', password: '', rol: 'OPERADOR', celular: '' }

function NuevoUsuarioSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const crear = useCrearUsuario()
  const toast = useToast()
  const [form, setForm] = useState<NuevoForm>(VACIO)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const set = (k: keyof NuevoForm) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const p = NuevoSchema.safeParse(form)
    if (!p.success) {
      const f = p.error.flatten().fieldErrors
      setErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])))
      return
    }
    setErrors({})
    crear.mutate(
      { ...p.data, celular: p.data.celular || undefined },
      {
        onSuccess: (u) => {
          toast.success('Cuenta creada', `${u.username} ya puede ingresar como ${ROL_LABEL[u.rol] ?? u.rol}.`)
          setForm(VACIO)
          onClose()
        },
        onError: (err) => {
          const ae = toAppError(err)
          if (ae.fields.length) setErrors(Object.fromEntries(ae.fields.map((x) => [x.campo, x.error])))
          toast.error(err, 'No se creó la cuenta')
        },
      },
    )
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nueva cuenta"
      description="Para crear un ADMIN, crea la cuenta y luego usa Promover."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={crear.isPending} onClick={() => submit()}>Crear cuenta</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <InputField label="Usuario" autoComplete="off" value={form.username} onChange={set('username')} error={errors.username} />
        <InputField label="Correo" type="email" autoComplete="off" value={form.email} onChange={set('email')} error={errors.email} />
        <SelectField
          label="Rol"
          value={form.rol}
          onChange={set('rol')}
          options={ROLES_EDITABLES.map((r) => ({ value: r, label: ROL_LABEL[r] }))}
          hint="Operadores instalan equipos; propietarios y residentes usan su casa."
        />
        <InputField
          label="Contraseña temporal"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="8+ caracteres con mayúscula, minúscula, número y símbolo."
        />
        <InputField label="Celular (opcional)" inputMode="tel" value={form.celular} onChange={set('celular')} error={errors.celular} />
        <button type="submit" hidden />
      </form>
    </Sheet>
  )
}

// ------------------------------------------------------------------ promover
function PromoverSheet({ usuario, onClose }: { usuario: Usuario | null; onClose: () => void }) {
  const promover = usePromoverAdmin()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    if (!usuario) return
    if (!password) return setError('Ingresa tu contraseña para confirmar.')
    promover.mutate(
      { id: usuario.id, password },
      {
        onSuccess: (u) => {
          toast.success('Permisos actualizados', `${u.username} ahora es administrador.`)
          setPassword('')
          onClose()
        },
        onError: (err) => setError(toAppError(err).status === 401 ? 'Contraseña incorrecta.' : toAppError(err).userMessage),
      },
    )
  }

  return (
    <Sheet
      open={usuario !== null}
      onClose={() => { setPassword(''); setError(undefined); onClose() }}
      title="Promover a administrador"
      description={usuario ? `${usuario.username} tendrá acceso total al panel y a todas las casas.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={promover.isPending} onClick={() => submit()} icon={<ShieldCheck className="size-4" aria-hidden />}>
            Promover
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate>
        <InputField
          label="Tu contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          hint="Se pide de nuevo para que un token robado no alcance para escalar permisos."
        />
        <button type="submit" hidden />
      </form>
    </Sheet>
  )
}

// ------------------------------------------------------------------ pagina
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

  const lista = usuarios.data ?? []
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider/60 px-5 py-4">
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
                        <Avatar name={u.username} />
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
                    <Td className="text-xs whitespace-nowrap">{formatDate(u.creadoEn)}</Td>
                    <Td>
                      <div className="flex justify-end gap-2">
                        {!esAdmin && u.activo && (
                          <Button size="sm" variant="ghost" onClick={() => setPromover(u)}>Promover</Button>
                        )}
                        {!esYo && !esAdmin &&
                          (u.activo ? (
                            <ConfirmButton
                              size="sm"
                              variant="secondary"
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
