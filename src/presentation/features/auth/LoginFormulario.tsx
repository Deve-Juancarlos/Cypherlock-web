/** Controles del acceso admin; la validación y el envío viven en LoginPage. */
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'

export interface Credenciales {
  username: string
  password: string
}

interface Props {
  form: Credenciales
  errors: Partial<Record<keyof Credenciales, string>>
  sending: boolean
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onChange: (field: keyof Credenciales, value: string) => void
}

export function LoginFormulario({ form, errors, sending, onSubmit, onChange }: Props) {
  const [verClave, setVerClave] = useState(false)
  const [mayus, setMayus] = useState(false)
  const reduceMotion = useReducedMotion()
  const detectarMayus = (e: KeyboardEvent<HTMLInputElement>) => setMayus(e.getModifierState('CapsLock'))

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.1 }}
      >
        <InputField
          label="Usuario"
          name="username"
          autoComplete="username"
          autoFocus
          spellCheck={false}
          autoCapitalize="none"
          value={form.username}
          error={errors.username}
          onChange={(e) => onChange('username', e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.2 }}
      >
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
          onChange={(e) => onChange('password', e.target.value)}
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
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.3 }}
      >
        <Button type="submit" variant="primary" className="mt-2 h-11 w-full text-[0.9375rem] font-semibold" loading={sending}>
          {sending ? 'Verificando…' : 'Iniciar sesión'}
        </Button>
      </motion.div>
    </form>
  )
}
