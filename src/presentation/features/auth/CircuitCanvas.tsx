import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * Escena procedural del login (tecnica de riso-windowseat): cada cuadro es una
 * funcion PURA del tiempo `seek(t)` -> determinista, sin estado acumulado, sin
 * librerias. Pistas de circuito ortogonales que salen del emblema (como en el
 * logo) recorridas por pulsos de luz cian.
 */
type Pt = [number, number]

// PRNG determinista (mulberry32): la misma semilla dibuja siempre el mismo circuito.
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildTraces(w: number, h: number): Pt[][] {
  const r = rng(7331)
  const cx = w * 0.5
  const cy = h * 0.46
  const traces: Pt[][] = []
  const n = 26
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + r() * 0.12
    const start: Pt = [cx + Math.cos(ang) * 92, cy + Math.sin(ang) * 92]
    const pts: Pt[] = [start]
    let [x, y] = start
    const horizontal = Math.abs(Math.cos(ang)) > Math.abs(Math.sin(ang))
    const len1 = 40 + r() * 120
    const len2 = 60 + r() * 260
    if (horizontal) {
      x += Math.sign(Math.cos(ang)) * len1
      pts.push([x, y])
      y += Math.sign(Math.sin(ang) || 1) * len1 * 0.6
      pts.push([x, y])
      x += Math.sign(Math.cos(ang)) * len2
    } else {
      y += Math.sign(Math.sin(ang)) * len1
      pts.push([x, y])
      x += Math.sign(Math.cos(ang) || 1) * len1 * 0.6
      pts.push([x, y])
      y += Math.sign(Math.sin(ang)) * len2
    }
    pts.push([x, y])
    traces.push(pts)
  }
  return traces
}

function pathLength(pts: Pt[]) {
  let L = 0
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return L
}

function pointAt(pts: Pt[], d: number): Pt {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (d <= seg) {
      const k = d / seg
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]
    }
    d -= seg
  }
  return pts[pts.length - 1]
}

/** Dibuja el instante `t` (segundos). Pura: mismo t -> mismo cuadro. */
export function seek(ctx: CanvasRenderingContext2D, w: number, h: number, traces: Pt[][], t: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Pistas base
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.13)'
  ctx.lineWidth = 1.25
  for (const tr of traces) {
    ctx.beginPath()
    ctx.moveTo(tr[0][0], tr[0][1])
    for (const p of tr.slice(1)) ctx.lineTo(p[0], p[1])
    ctx.stroke()
    const end = tr[tr.length - 1]
    ctx.fillStyle = 'rgba(34, 211, 238, 0.22)'
    ctx.fillRect(end[0] - 2, end[1] - 2, 4, 4)
  }

  // Pulsos: posicion = funcion del tiempo y de la fase de cada pista
  traces.forEach((tr, i) => {
    const L = pathLength(tr)
    const speed = 70 + (i % 5) * 14
    const phase = (i * 0.37) % 1
    const d = ((t * speed) / L + phase) % 1
    const [px, py] = pointAt(tr, d * L)
    const alpha = Math.sin(d * Math.PI) // aparece y se apaga en los extremos
    const g = ctx.createRadialGradient(px, py, 0, px, py, 14)
    g.addColorStop(0, `rgba(34, 211, 238, ${0.85 * alpha})`)
    g.addColorStop(1, 'rgba(34, 211, 238, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(px, py, 14, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function CircuitCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let traces: Pt[][] = []
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      traces = buildTraces(w, h)
      if (reduce) seek(ctx, w, h, traces, 1.5)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    if (!reduce) {
      const t0 = performance.now()
      const loop = (now: number) => {
        seek(ctx, w, h, traces, (now - t0) / 1000)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduce])

  return <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden />
}
