import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LockKeyhole, TriangleAlert } from 'lucide-react'
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import { useSession } from '../../app/providers'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'
import { CircuitCanvas } from './CircuitCanvas'

const LoginSchema = z.object({
  username: z.string().trim().min(3, 'Ingresa tu usuario (mínimo 3 caracteres).'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

function mensajeLogin(err: unknown): string {
  const e = toAppError(err)
  if (e.code === 'FORBIDDEN_ROLE') return e.message
  if (e.status === 401) return e.message.includes('bloqueada') ? e.message : 'Usuario o contraseña incorrectos.'
  return e.userMessage
}

export function LoginPage() {
  const { state, login } = useSession()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<'username' | 'password', string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  if (state.status === 'authenticated') return <Navigate to="/" replace />
  const expired = state.status === 'anonymous' && state.reason === 'expired'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const parsed = LoginSchema.safeParse(form)
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors
      setErrors({ username: f.username?.[0], password: f.password?.[0] })
      return
    }
    setErrors({})
    setSending(true)
    try {
      await login(parsed.data.username, parsed.data.password)
    } catch (err) {
      setFormError(mensajeLogin(err))
      setForm((f) => ({ ...f, password: '' }))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Escena de marca */}
      <div className="relative hidden overflow-hidden border-r border-divider/60 bg-rail lg:block">
        <CircuitCanvas />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <motion.img
            src="/brand/emblema-256.png"
            alt=""
            width={184}
            height={158}
            className="w-46 drop-shadow-[0_18px_40px_rgb(2_6_23/0.8)]"
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="absolute bottom-8 left-10 max-w-sm text-sm text-text-muted">
          Control de acceso para cada puerta instalada: domicilios, dispositivos, cuentas y actividad en un solo lugar.
        </p>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/brand/emblema-96.png" alt="" className="size-10" width={40} height={40} />
            <span className="text-sm font-bold tracking-[0.18em]">CYPHERLOCK</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">Ingresar al panel</h1>
          <p className="mt-1.5 text-sm text-text-muted">Acceso exclusivo para cuentas de administración.</p>

          {(expired || formError) && (
            <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-error/40 bg-error/10 p-3.5 text-sm">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
              <p className="text-text-secondary">{formError ?? 'Tu sesión expiró. Vuelve a ingresar.'}</p>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <InputField
              label="Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={form.username}
              error={errors.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <InputField
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="primary" className="mt-2 w-full" loading={sending} icon={<LockKeyhole className="size-4" aria-hidden />}>
              {sending ? 'Verificando…' : 'Ingresar'}
            </Button>
          </form>

          <p className="mt-8 text-xs text-text-disabled">
            Tras 5 intentos fallidos la cuenta se bloquea 15 minutos.
          </p>
        </div>
      </div>
    </div>
  )
}
