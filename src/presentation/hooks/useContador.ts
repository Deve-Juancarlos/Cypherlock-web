import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Cuenta de 0 al valor en `ms` (ease-out). Con "reducir movimiento" devuelve
 * el valor final de inmediato. Si el valor cambia, anima desde el anterior.
 */
export function useContador(valor: number, ms = 700): number {
  const reduce = useReducedMotion()
  const [actual, setActual] = useState(reduce ? valor : 0)

  useEffect(() => {
    if (reduce) return
    let raf = 0
    const desde = actual
    const inicio = performance.now()
    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / ms)
      setActual(Math.round(desde + (valor - desde) * (1 - (1 - p) ** 3)))
      if (p < 1) raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
    // `actual` es el punto de partida, no una dependencia: solo se reanima si cambia `valor`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, ms, reduce])

  return reduce ? valor : actual
}
