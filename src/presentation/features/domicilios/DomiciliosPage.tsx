import { useMemo, useState, type FormEvent } from 'react'
import { Building2, Check, Copy, Cpu, KeyRound, Plus, TriangleAlert } from 'lucide-react'
import { z } from 'zod'
import { formatDate, formatRelative } from '@/core/utils/format'
import { TIPOS_INMUEBLE, type CredencialesDispositivo, type Domicilio } from '@/domain/models'
import { PageHeader } from '../../components/layout/AppShell'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmButton } from '../../components/ui/ConfirmButton'
import { InputField, SelectField } from '../../components/ui/Field'
import { Panel } from '../../components/ui/Panel'
import { Sheet } from '../../components/ui/Sheet'
import { EmptyState, ErrorState, Skeleton, TableSkeleton } from '../../components/ui/States'
import { SearchInput, Segmented, Table, Td, Th, Tr } from '../../components/ui/Table'
import { useToast } from '../../components/ui/Toast'
import {
  useCrearDomicilio,
  useDispositivos,
  useDomicilios,
  useLiberarPropietario,
  useRegistrarDispositivo,
  useRevocarDispositivo,
  useSetDomicilioActivo,
} from '../../hooks/queries'

const tipoLabel = (t: string) => t.charAt(0) + t.slice(1).toLowerCase()

// ------------------------------------------------------------------ copiar
function CopyField({ label, value }: { label: string; value: string }) {
  const [ok, setOk] = useState(false)
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-text-muted">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-divider bg-background p-2 pl-3">
        <code className="min-w-0 flex-1 break-all font-mono text-xs text-text-primary">{value}</code>
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Copiar ${label}`}
          onClick={async () => {
            await navigator.clipboard.writeText(value).catch(() => undefined)
            setOk(true)
            setTimeout(() => setOk(false), 1600)
          }}
          icon={ok ? <Check className="size-3.5 text-success" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        >
          {ok ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ dispositivos
const IpSchema = z.object({
  nombre: z.string().trim().max(100),
  ip: z.string().trim().regex(/^(\d{1,3}\.){3}\d{1,3}$|^$/, 'IPv4 no válida (ej. 192.168.1.50).'),
  puerto: z.coerce.number().int().min(1, 'Puerto 1–65535.').max(65535, 'Puerto 1–65535.'),
})

function Dispositivos({ domicilio }: { domicilio: Domicilio }) {
  const lista = useDispositivos(domicilio.id)
  const registrar = useRegistrarDispositivo(domicilio.id)
  const revocar = useRevocarDispositivo(domicilio.id)
  const toast = useToast()
  const [form, setForm] = useState({ nombre: '', ip: '', puerto: '80' })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [creds, setCreds] = useState<CredencialesDispositivo | null>(null)
  const [abierto, setAbierto] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const p = IpSchema.safeParse(form)
    if (!p.success) {
      const f = p.error.flatten().fieldErrors
      return setErrors({ ip: f.ip?.[0], puerto: f.puerto?.[0], nombre: f.nombre?.[0] })
    }
    setErrors({})
    registrar.mutate(p.data, {
      onSuccess: (c) => {
        setCreds(c)
        setAbierto(false)
        setForm({ nombre: '', ip: '', puerto: '80' })
      },
      onError: (err) => toast.error(err, 'No se registró el dispositivo'),
    })
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Dispositivos de la puerta</h3>
        {!abierto && !creds && (
          <Button size="sm" onClick={() => setAbierto(true)} icon={<Plus className="size-3.5" aria-hidden />}>Registrar</Button>
        )}
      </div>

      {creds && (
        <div role="alert" className="mb-4 rounded-xl border border-warning/50 bg-warning/10 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary">Guarda estas credenciales ahora</p>
              <p className="mt-0.5 text-sm text-text-secondary">
                No se vuelven a mostrar. Grábalas en el firmware del ESP32: el ID y el secreto autentican la puerta;
                la clave de firma verifica los comandos.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <CopyField label="ID del dispositivo (X-Device-ID)" value={creds.dispositivo.uuid} />
            <CopyField label="Secreto (X-API-Key)" value={creds.secreto} />
            <CopyField label="Clave de firma HMAC" value={creds.claveFirma} />
          </div>
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => setCreds(null)}>Ya las guardé</Button>
        </div>
      )}

      {abierto && (
        <form onSubmit={submit} noValidate className="mb-4 flex flex-col gap-3 rounded-xl border border-divider bg-background/60 p-4">
          <InputField label="Nombre" placeholder="Puerta principal" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} error={errors.nombre} />
          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <InputField label="IP en la red de la casa" placeholder="192.168.1.50" inputMode="decimal" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} error={errors.ip} />
            <InputField label="Puerto" inputMode="numeric" value={form.puerto} onChange={(e) => setForm({ ...form, puerto: e.target.value })} error={errors.puerto} />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" type="submit" loading={registrar.isPending}>Registrar y generar credenciales</Button>
          </div>
        </form>
      )}

      {lista.isPending ? (
        <Skeleton className="h-16" />
      ) : lista.isError ? (
        <ErrorState error={lista.error} onRetry={() => lista.refetch()} />
      ) : lista.data.length === 0 ? (
        <p className="rounded-xl border border-dashed border-divider px-4 py-6 text-center text-sm text-text-muted">
          Esta casa aún no tiene dispositivo. Sin uno, la puerta no puede abrirse desde la app ni con códigos.
        </p>
      ) : (
        <ul className="divide-y divide-divider/60 rounded-xl border border-divider">
          {lista.data.map((d) => (
            <li key={d.uuid} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Cpu className="size-4 text-text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{d.nombre || 'Dispositivo sin nombre'}</p>
                <p className="font-mono text-2xs text-text-muted">
                  {d.ip || 'sin IP'}:{d.puerto} · {d.uuid.slice(0, 8)} · heartbeat {formatRelative(d.ultimoHeartbeat)}
                </p>
              </div>
              {!d.activo ? (
                <Badge tone="neutral">Revocado</Badge>
              ) : (
                <>
                  <Badge tone={d.online ? 'success' : 'neutral'} dot>{d.online ? 'En línea' : 'Sin señal'}</Badge>
                  <ConfirmButton
                    size="sm"
                    variant="secondary"
                    confirmLabel="¿Revocar?"
                    onConfirm={() =>
                      revocar.mutate(d.uuid, {
                        onSuccess: () => toast.success('Dispositivo revocado', 'Ya no puede autenticarse ni recibir comandos.'),
                        onError: (err) => toast.error(err),
                      })
                    }
                  >
                    Revocar
                  </ConfirmButton>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ------------------------------------------------------------------ detalle
function DetalleSheet({ domicilio, onClose }: { domicilio: Domicilio | null; onClose: () => void }) {
  const setActivo = useSetDomicilioActivo()
  const liberar = useLiberarPropietario()
  const toast = useToast()
  const d = domicilio

  return (
    <Sheet open={d !== null} onClose={onClose} title={d?.nombre ?? ''} description={d ? `${tipoLabel(d.tipoInmueble)} · alta ${formatDate(d.creadoEn)}` : undefined} width="max-w-xl">
      {d && (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-text-muted">Código de contrato</dt>
              <dd className="mt-0.5 font-mono text-text-primary">{d.codigoContrato}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Estado</dt>
              <dd className="mt-1"><Badge tone={d.activo ? 'success' : 'neutral'} dot>{d.activo ? 'Activo' : 'Suspendido'}</Badge></dd>
            </div>
            <div>
              <dt className="text-text-muted">Propietario</dt>
              <dd className="mt-0.5 text-text-primary">{d.propietario || <span className="text-text-muted">Sin reclamar</span>}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Instalado por</dt>
              <dd className="mt-0.5 text-text-primary">{d.operador || '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-text-muted">Dirección</dt>
              <dd className="mt-0.5 text-text-primary">{d.direccion || '—'}{d.ubicacion && <span className="text-text-muted"> · {d.ubicacion}</span>}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-divider pt-5">
            {d.activo ? (
              <ConfirmButton
                size="sm"
                confirmLabel="¿Suspender la casa?"
                onConfirm={() =>
                  setActivo.mutate(
                    { id: d.id, activo: false },
                    { onSuccess: () => { toast.success('Domicilio suspendido', 'Sus puertas dejan de operar.'); onClose() }, onError: (e) => toast.error(e) },
                  )
                }
              >
                Suspender
              </ConfirmButton>
            ) : (
              <Button
                size="sm"
                variant="primary"
                loading={setActivo.isPending}
                onClick={() =>
                  setActivo.mutate({ id: d.id, activo: true }, { onSuccess: () => { toast.success('Domicilio reactivado'); onClose() }, onError: (e) => toast.error(e) })
                }
              >
                Reactivar
              </Button>
            )}
            {d.propietario && (
              <ConfirmButton
                size="sm"
                variant="secondary"
                confirmLabel="¿Liberar y reabrir el código?"
                onConfirm={() =>
                  liberar.mutate(d.id, {
                    onSuccess: () => { toast.success('Propietario liberado', 'El código de contrato vuelve a servir para un nuevo registro.'); onClose() },
                    onError: (e) => toast.error(e),
                  })
                }
              >
                Liberar propietario
              </ConfirmButton>
            )}
          </div>

          <Dispositivos domicilio={d} />
        </>
      )}
    </Sheet>
  )
}

// ------------------------------------------------------------------ alta
const NuevoSchema = z.object({
  nombre: z.string().trim().max(100),
  tipoInmueble: z.enum(TIPOS_INMUEBLE),
  departamento: z.string().trim().max(80),
  provincia: z.string().trim().max(80),
  distrito: z.string().trim().max(80),
  direccion: z.string().trim().min(3, 'Indica la dirección.').max(160),
  nroPuerta: z.string().trim().max(40),
})
const VACIO = { nombre: '', tipoInmueble: 'CASA', departamento: '', provincia: '', distrito: '', direccion: '', nroPuerta: '' }

function NuevoDomicilioSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const crear = useCrearDomicilio()
  const toast = useToast()
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const p = NuevoSchema.safeParse(form)
    if (!p.success) {
      const f = p.error.flatten().fieldErrors
      return setErrors(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])))
    }
    setErrors({})
    crear.mutate(p.data, {
      onSuccess: (d) => {
        toast.success('Domicilio creado', `Código de contrato: ${d.codigoContrato}`)
        setForm(VACIO)
        onClose()
      },
      onError: (err) => toast.error(err, 'No se creó el domicilio'),
    })
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nuevo domicilio"
      description="Se genera un código de contrato de un solo uso para que el propietario se registre."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={crear.isPending} onClick={() => submit()}>Crear domicilio</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <InputField label="Nombre (opcional)" placeholder="Casa familia Pérez" value={form.nombre} onChange={set('nombre')} error={errors.nombre} />
        <SelectField label="Tipo de inmueble" value={form.tipoInmueble} onChange={set('tipoInmueble')} options={TIPOS_INMUEBLE.map((t) => ({ value: t, label: tipoLabel(t) }))} />
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <InputField label="Dirección" value={form.direccion} onChange={set('direccion')} error={errors.direccion} />
          <InputField label="N.º / puerta" value={form.nroPuerta} onChange={set('nroPuerta')} error={errors.nroPuerta} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InputField label="Distrito" value={form.distrito} onChange={set('distrito')} />
          <InputField label="Provincia" value={form.provincia} onChange={set('provincia')} />
          <InputField label="Departamento" value={form.departamento} onChange={set('departamento')} />
        </div>
        <button type="submit" hidden />
      </form>
    </Sheet>
  )
}

// ------------------------------------------------------------------ pagina
type Filtro = 'TODOS' | 'ACTIVOS' | 'SUSPENDIDOS' | 'SIN_DUENO'

export function DomiciliosPage() {
  const domicilios = useDomicilios()
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [nuevo, setNuevo] = useState(false)
  const [detalleId, setDetalleId] = useState<number | null>(null)

  const lista = domicilios.data ?? []
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider/60 px-5 py-4">
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
