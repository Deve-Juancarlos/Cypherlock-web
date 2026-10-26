import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { AppError } from '@/core/errors/AppError'
import { http } from '@/network/httpClient'

const alta = z.object({
  id: z.number(),
  username: z.string(),
  rol: z.literal('PROPIETARIO'),
  casa_id: z.number(),
})

export function ActivarCuentaForm({ codigo, onActivated }: { codigo: string; onActivated: () => void }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState('')
  const [creada, setCreada] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function registrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enviando || creada || !codigo) return
    setError('')
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      await http('/signup', {
        method: 'POST',
        auth: false,
        body: { codigo, username: username.trim(), email: email.trim(), password },
        schema: alta,
      })
      setCreada(true)
      onActivated()
      setPassword('')
      setConfirmacion('')
    } catch (e) {
      setError(e instanceof AppError ? e.userMessage : 'No se pudo activar la cuenta. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (creada) {
    return (
      <div role="status" className="mt-6 rounded-[var(--radius-card)] border border-senal bg-superficie p-5 text-left">
        <h2 className="font-semibold text-senal">Cuenta de propietario activada</h2>
        <p className="mt-2 text-sm text-texto-2">
          Ya puedes iniciar sesión en la app con tu usuario y contraseña. Tu cuenta quedó vinculada a tu casa.
        </p>
      </div>
    )
  }

  const campo = 'mt-1 h-11 w-full rounded-[var(--radius-control)] border border-linea bg-noche px-3 text-texto'

  return (
    <form onSubmit={registrar} className="mt-6 space-y-4 rounded-[var(--radius-card)] border border-linea bg-superficie p-5 text-left">
      <h2 className="text-lg font-semibold">Crea tu usuario y activa tu casa</h2>
      <p className="text-sm text-texto-2">Tu código se enviará automáticamente. Solo se puede usar una vez.</p>
      <label className="block text-sm">
        Usuario
        <input className={campo} name="username" autoComplete="username" required minLength={3} maxLength={50}
          pattern="[a-zA-Z0-9_.-]+" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label className="block text-sm">
        Correo electrónico
        <input className={campo} name="email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block text-sm">
        Contraseña (mínimo 10 caracteres, letras y números)
        <input className={campo} name="password" type="password" autoComplete="new-password" required minLength={10}
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <label className="block text-sm">
        Repite la contraseña
        <input className={campo} name="confirmacion" type="password" autoComplete="new-password" required minLength={10}
          value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={enviando || !codigo}
        className="h-12 w-full rounded-[var(--radius-control)] bg-senal font-semibold text-white disabled:opacity-50">
        {enviando ? 'Activando cuenta…' : 'Crear usuario y activar cuenta'}
      </button>
    </form>
  )
}
