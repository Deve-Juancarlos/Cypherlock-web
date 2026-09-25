import { useEffect, useState, type ReactNode } from 'react'
import { Button, type ButtonProps } from './Button'

/**
 * Accion destructiva en dos pasos, en linea (sin modal): el primer clic pide
 * confirmacion y vuelve solo a su estado si no se confirma en 4 s.
 */
export function ConfirmButton({
  onConfirm,
  confirmLabel = '¿Confirmar?',
  children,
  variant = 'danger',
  ...rest
}: Omit<ButtonProps, 'onClick'> & { onConfirm: () => void; confirmLabel?: string; children: ReactNode }) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])

  return (
    <Button
      {...rest}
      variant={armed ? 'danger' : variant}
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else setArmed(true)
      }}
      onBlur={() => setArmed(false)}
    >
      {armed ? confirmLabel : children}
    </Button>
  )
}
