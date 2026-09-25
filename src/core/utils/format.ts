const nf = new Intl.NumberFormat('es-PE')
const dtf = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
const df = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })
const hf = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
const dmf = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' })
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export const formatNumber = (n: number) => nf.format(n)

/**
 * Fecha ISO del backend. Si viene sin zona ("2026-09-25T03:10:00"), es UTC:
 * sin esto el navegador la toma como hora local y en Lima queda 5 h corrida
 * ("dentro de 1 hora" para algo que paso hace 4).
 */
export function parseIso(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const conZona = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso) || !iso.includes('T') ? iso : `${iso}Z`
  const d = new Date(conZona)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateTime(iso: string | null | undefined): string {
  const d = parseIso(iso)
  return d ? dtf.format(d) : '—'
}

export function formatDate(iso: string | null | undefined): string {
  const d = parseIso(iso)
  return d ? df.format(d) : '—'
}

/** "14:32" si es de hoy; "24 set." si es de otro dia. */
export function formatHora(iso: string | null | undefined, now = new Date()): string {
  const d = parseIso(iso)
  if (!d) return '—'
  return d.toDateString() === now.toDateString() ? hf.format(d) : dmf.format(d)
}

/** "27 set. · 14:30": fecha y hora compactas para columnas de tabla. */
export function formatFechaCorta(iso: string | null | undefined): string {
  const d = parseIso(iso)
  return d ? `${dmf.format(d)} · ${hf.format(d)}` : '—'
}

/** "hace 5 min", "ayer"... para feeds de actividad. */
export function formatRelative(iso: string | null | undefined, now = Date.now()): string {
  const d = parseIso(iso)
  if (!d) return '—'
  const s = Math.round((d.getTime() - now) / 1000)
  const abs = Math.abs(s)
  if (abs < 60) return rtf.format(s, 'second')
  if (abs < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(s / 3600), 'hour')
  return rtf.format(Math.round(s / 86400), 'day')
}

/** Iniciales para avatares: "juan_perez" -> "JP". */
export function initials(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase() || '?'
}
