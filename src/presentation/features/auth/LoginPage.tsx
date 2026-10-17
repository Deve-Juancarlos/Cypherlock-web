import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, TriangleAlert } from 'lucide-react'
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import { cn } from '@/core/utils/cn'
import { useSession } from '../../app/providers'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'
import { LoginMarca } from './LoginMarca'
import { useEstadoApi, type EstadoApi } from './useEstadoApi'

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

const ESTADO: Record<EstadoApi, { texto: string; punto: string }> = {
  verificando: { texto: 'Conectando con el servidor…', punto: 'bg-text-disabled animate-pulse' },
  en_linea: { texto: 'Servidor en línea', punto: 'bg-success' },
  despertando: { texto: 'El servidor está despertando; puede tardar hasta un minuto.', punto: 'bg-warning animate-pulse' },
}

function EstadoServidor({ estado }: { estado: EstadoApi }) {
  const e = ESTADO[estado]
  return (
    <p role="status" className="flex items-center gap-2 text-xs text-text-muted">
      <span className={cn('size-1.5 shrink-0 rounded-full', e.punto)} aria-hidden />
      {e.texto}
    </p>
  )
}

export function LoginPage() {
  const { state, login } = useSession()
  const estadoApi = useEstadoApi()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<'username' | 'password', string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verClave, setVerClave] = useState(false)
  const [mayus, setMayus] = useState(false)

  if (state.status === 'authenticated') return <Navigate to="/panel" replace />
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

  const detectarMayus = (e: KeyboardEvent<HTMLInputElement>) => setMayus(e.getModifierState('CapsLock'))

  return (
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <title>Ingresar · Panel CYPHERLOCK</title>
      <meta name="robots" content="noindex, nofollow" />
      <LoginMarca />

      <div className="flex min-h-dvh flex-col">
        <header className="flex h-14 items-center justify-between border-b-[3px] border-cobre bg-noche px-5 text-texto sm:px-8 lg:border-0 lg:bg-transparent lg:text-text-primary">
          <span className="flex items-center gap-2.5 lg:invisible">
            <img src="/brand/emblema-96.png" alt="" className="size-6" width={24} height={24} />
            <span className="text-[0.8125rem] font-semibold tracking-[0.12em]">CYPHERLOCK</span>
          </span>
          <Link to="/" className="inline-flex items-center gap-1.5 text-[0.8125rem] text-texto-2 transition-colors hover:underline lg:text-text-muted lg:hover:text-primary">
            <ArrowLeft className="size-3.5" aria-hidden />
            Volver al sitio
          </Link>
        </header>

        <main className="flex flex-1 items-start justify-center px-5 pt-[12vh] pb-16 lg:items-center lg:pt-0">
          <div className="w-full max-w-[22rem]">
            <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.01em] text-text-primary">Iniciar sesión</h1>
            <p className="mt-1.5 text-[0.8125rem] text-text-muted">Solo cuentas con rol de administrador.</p>
            <div className="mt-4">
              <EstadoServidor estado={estadoApi} />
            </div>

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
                autoCapitalize="none"
                value={form.username}
                error={errors.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <InputField
                label="Contraseña"
                name="password"
                type={verClave ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                error={errors.password}
                hint={mayus ? 'Bloq Mayús está activado.' : undefined}
                onKeyDown={detectarMayus}
                onKeyUp={detectarMayus}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                trailing={
                  <button
                    type="button"
                    onClick={() => setVerClave((v) => !v)}
                    className="cursor-pointer rounded-[var(--radius-control)] p-1.5 text-text-disabled transition-colors hover:text-text-primary"
                    aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={verClave}
                  >
                    {verClave ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  </button>
                }
              />
              <Button type="submit" variant="primary" className="mt-1 h-10 w-full" loading={sending}>
                {sending ? 'Verificando…' : 'Iniciar sesión'}
              </Button>
            </form>

            <p className="mt-6 border-t border-divider pt-4 text-xs leading-relaxed text-text-disabled">
              Tras 5 intentos fallidos la cuenta se bloquea 15 minutos. Operadores, propietarios y residentes usan la app móvil.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
