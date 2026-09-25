const nf = new Intl.NumberFormat('es-PE')
const dtf = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
const df = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export const formatNumber = (n: number) => nf.format(n)

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : dtf.format(d)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : df.format(d)
}

/** "hace 5 min", "ayer"... para feeds de actividad. */
export function formatRelative(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—'
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const s = Math.round((t - now) / 1000)
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
