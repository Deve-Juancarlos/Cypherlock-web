import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import { useSession } from '../../app/providers'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'

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
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-12 items-center justify-between border-b border-divider px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <img src="/brand/emblema-96.png" alt="" className="size-6" width={24} height={24} />
          <span className="text-[0.8125rem] font-semibold tracking-[0.12em]">CYPHERLOCK</span>
        </div>
        <span className="rotulo hidden sm:inline">Panel de administración</span>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pt-[14vh] pb-16">
        <div className="w-full max-w-[22rem]">
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">Ingresar</h1>
          <p className="mt-1 text-[0.8125rem] text-text-muted">Solo cuentas con rol de administrador.</p>

          {(expired || formError) && (
            <div role="alert" className="mt-5 flex items-start gap-2.5 border-l-2 border-error bg-error/8 px-3 py-2.5 text-[0.8125rem]">
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
              spellCheck={false}
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
            <Button type="submit" variant="primary" className="mt-1 w-full" loading={sending}>
              {sending ? 'Verificando…' : 'Ingresar'}
            </Button>
          </form>

          <p className="mt-6 border-t border-divider pt-4 text-xs text-text-disabled">
            Tras 5 intentos fallidos la cuenta se bloquea 15 minutos. Operadores, propietarios y residentes usan la app móvil.
          </p>
        </div>
      </main>
    </div>
  )
}
