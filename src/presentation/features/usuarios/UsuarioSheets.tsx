import { useState, type FormEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import type { Usuario } from '@/domain/models'
import { Button } from '../../components/ui/Button'
import { InputField, SelectField } from '../../components/ui/Field'
import { Sheet } from '../../components/ui/Sheet'
import { useToast } from '../../components/ui/Toast'
import { useCrearUsuario, usePromoverAdmin } from '../../hooks/queries'
import { ROL_LABEL, ROLES_EDITABLES } from './roles'

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

export function NuevoUsuarioSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
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
export function PromoverSheet({ usuario, onClose }: { usuario: Usuario | null; onClose: () => void }) {
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
