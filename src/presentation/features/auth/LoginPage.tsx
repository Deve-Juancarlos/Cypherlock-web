import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, TriangleAlert, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import { cn } from '@/core/utils/cn'
import { useSession } from '../../app/providers'
import { LoginFormulario, type Credenciales } from './LoginFormulario'
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

const ESTADO: Record<EstadoApi, { texto: string; punto: string; color: string }> = {
  verificando: { texto: 'Conectando con el servidor…', punto: 'bg-text-disabled animate-pulse', color: 'text-text-muted' },
  en_linea: { texto: 'Servidor en línea', punto: 'bg-success', color: 'text-success' },
  despertando: {
    texto: 'El servidor está despertando; puede tardar hasta un minuto.',
    punto: 'bg-warning animate-pulse',
    color: 'text-warning',
  },
}

function EstadoServidor({ estado }: { estado: EstadoApi }) {
  const e = ESTADO[estado]
  return (
    <p role="status" className="flex items-center gap-2 text-xs">
      <span className={cn('size-1.5 shrink-0 rounded-full', e.punto)} aria-hidden />
      <span className={cn('font-medium', e.color)}>{e.texto}</span>
    </p>
  )
}

export function LoginPage() {
  const { state, login } = useSession()
  const estadoApi = useEstadoApi()
  const reduceMotion = useReducedMotion()
  const [form, setForm] = useState<Credenciales>({ username: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Credenciales, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  if (state.status === 'authenticated') return <Navigate to="/panel" replace />
  const expired = state.status === 'anonymous' && state.reason === 'expired'

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    <div className="min-h-dvh bg-surface lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <title>Ingresar · Panel CYPHERLOCK</title>
      <meta name="robots" content="noindex, nofollow" />
      <LoginMarca />

      <div className="flex min-h-dvh flex-col">
        <header className="flex h-14 items-center justify-between border-b-[3px] border-cobre bg-banda px-5 text-banda-texto sm:px-8 lg:border-0 lg:bg-transparent lg:px-12 lg:text-text-primary">
          <span className="flex items-center gap-2.5 lg:invisible">
            <span className="relative">
              <span aria-hidden className="absolute inset-0 rounded-full bg-banda-senal/20 blur-sm" />
              <img src="/brand/emblema-96.png" alt="" className="relative size-6" width={24} height={24} />
            </span>
            <span className="text-[0.8125rem] font-semibold tracking-[0.12em]">CYPHERLOCK</span>
          </span>
          <Link to="/" className="group inline-flex items-center gap-1.5 text-[0.8125rem] text-banda-texto-2 transition-colors hover:text-banda-texto lg:text-text-muted lg:hover:text-primary">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span className="hidden sm:inline">Volver al sitio</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </header>

        <main className="flex flex-1 items-start justify-center px-5 pt-[10vh] pb-16 lg:items-center lg:px-12 lg:pt-0">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[24rem]"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20">
              <ShieldCheck className="size-3.5" aria-hidden />
              Acceso exclusivo para administradores
            </div>

            <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.01em] text-text-primary">Iniciar sesión</h1>
            <p className="mt-2 text-[0.8125rem] text-text-muted">Solo cuentas con rol de administrador.</p>
            <div className="mt-5"><EstadoServidor estado={estadoApi} /></div>

            <AnimatePresence initial={false}>
              {(expired || formError) && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-lg border-l-2 border-error bg-error/5 px-4 py-3 text-[0.8125rem]"
                >
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-error" aria-hidden />
                  <p className="leading-relaxed text-text-secondary">{formError ?? 'Tu sesión expiró. Vuelve a ingresar.'}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <LoginFormulario
              form={form}
              errors={errors}
              sending={sending}
              onSubmit={onSubmit}
              onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
            />

            <div className="mt-8 rounded-lg bg-surface-light p-4 text-xs leading-relaxed text-text-muted ring-1 ring-divider">
              <strong className="text-text-secondary">Seguridad:</strong> Tras 5 intentos fallidos la cuenta se bloquea 15 minutos.
              {' '}Operadores, propietarios y residentes usan la app móvil.
            </div>
          </motion.div>
        </main>

        <footer className="border-t border-divider px-5 py-4 text-center text-xs text-text-muted lg:px-12">
          © {new Date().getFullYear()} CypherTech Perú · Todos los derechos reservados
        </footer>
      </div>
    </div>
  )
}
