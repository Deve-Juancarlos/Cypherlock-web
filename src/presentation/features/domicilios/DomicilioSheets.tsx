import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { formatDate } from '@/core/utils/format'
import { TIPOS_INMUEBLE, type Domicilio } from '@/domain/models'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmButton } from '../../components/ui/ConfirmButton'
import { InputField, SelectField } from '../../components/ui/Field'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/Toast'
import { useCrearDomicilio, useLiberarPropietario, useSetDomicilioActivo } from '../../hooks/queries'
import { Dispositivos } from './Dispositivos'
import { tipoLabel } from './formato'

export function DetalleSheet({ domicilio, onClose }: { domicilio: Domicilio | null; onClose: () => void }) {
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

export function NuevoDomicilioSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
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
