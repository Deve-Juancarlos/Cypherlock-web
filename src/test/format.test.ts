import { describe, expect, it } from 'vitest'
import { formatRelative, parseIso } from '@/core/utils/format'

describe('fechas del backend', () => {
  it('una fecha sin zona se interpreta como UTC (no como hora local)', () => {
    expect(parseIso('2026-09-25T03:10:00')?.toISOString()).toBe('2026-09-25T03:10:00.000Z')
    expect(parseIso('2026-09-25T03:10:00.123456')?.toISOString()).toBe('2026-09-25T03:10:00.123Z')
  })

  it('respeta la zona cuando viene', () => {
    expect(parseIso('2026-09-25T03:10:00+00:00')?.toISOString()).toBe('2026-09-25T03:10:00.000Z')
    expect(parseIso('2026-09-24T22:10:00-05:00')?.toISOString()).toBe('2026-09-25T03:10:00.000Z')
  })

  it('un evento de hace 4 h no aparece "en el futuro"', () => {
    const ahora = Date.parse('2026-09-25T07:10:00Z')
    expect(formatRelative('2026-09-25T03:10:00', ahora)).toBe('hace 4 horas')
  })

  it('valores vacios o invalidos', () => {
    expect(parseIso(null)).toBeNull()
    expect(parseIso('no-es-fecha')).toBeNull()
  })
})
