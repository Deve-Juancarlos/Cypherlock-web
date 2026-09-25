import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { tokenStorage } from '@/core/auth/tokenStorage'
import { AppError, fromResponse } from '@/core/errors/AppError'
import { http, setSessionExpiredHandler } from '@/network/httpClient'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('AppError.fromResponse', () => {
  it('lee el formato de error del backend', () => {
    const e = fromResponse(403, {
      detail: 'No tienes acceso a este domicilio',
      error: { code: 'FORBIDDEN_TENANT', message: 'No tienes acceso a este domicilio', request_id: 'rid-123', details: {} },
    })
    expect(e.code).toBe('FORBIDDEN_TENANT')
    expect(e.requestId).toBe('rid-123')
    expect(e.userMessage).toBe('No tienes acceso a este domicilio')
  })

  it('expone los campos invalidos de un 422', () => {
    const e = fromResponse(422, {
      error: { code: 'VALIDATION_ERROR', message: 'Datos invalidos', details: { campos: [{ campo: 'email', error: 'invalido' }] } },
    })
    expect(e.fields).toEqual([{ campo: 'email', error: 'invalido' }])
  })

  it('no filtra detalles en errores 5xx', () => {
    expect(fromResponse(500, { detail: 'Traceback...' }).userMessage).not.toContain('Traceback')
  })
})

describe('httpClient', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    tokenStorage.set('access-viejo', 'refresh-1')
  })
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    tokenStorage.clear()
  })

  it('adjunta el Bearer y valida la respuesta contra el esquema', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: 1 }))
    const r = await http('/x', { schema: z.object({ ok: z.number() }) })
    expect(r).toEqual({ ok: 1 })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer access-viejo')
  })

  it('respuesta fuera de contrato -> INVALID_RESPONSE (no pinta datos rotos)', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { ok: 'no-numero' }))
    await expect(http('/x', { schema: z.object({ ok: z.number() }) })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('ante 401 concurrentes renueva el token UNA sola vez y reintenta', async () => {
    let refreshCalls = 0
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refreshCalls++
        await new Promise((r) => setTimeout(r, 10))
        return json(200, { access_token: 'access-nuevo', refresh_token: 'refresh-2' })
      }
      const auth = (init.headers as Record<string, string>).Authorization
      return auth === 'Bearer access-nuevo' ? json(200, { ok: 1 }) : json(401, { detail: 'Token invalido' })
    })
    const [a, b, c] = await Promise.all([http('/a'), http('/b'), http('/c')])
    expect([a, b, c]).toEqual([{ ok: 1 }, { ok: 1 }, { ok: 1 }])
    expect(refreshCalls).toBe(1)
    expect(tokenStorage.getRefresh()).toBe('refresh-2')
  })

  it('si el refresh falla limpia la sesion y avisa', async () => {
    const expired = vi.fn()
    setSessionExpiredHandler(expired)
    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith('/auth/refresh') ? json(401, {}) : json(401, { detail: 'Token invalido' }),
    )
    await expect(http('/a')).rejects.toBeInstanceOf(AppError)
    expect(expired).toHaveBeenCalledOnce()
    expect(tokenStorage.getRefresh()).toBeNull()
  })

  it('fallo de red -> NETWORK_ERROR con mensaje para la persona', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const err = (await http('/x').catch((e: unknown) => e)) as AppError
    expect(err.code).toBe('NETWORK_ERROR')
    expect(err.userMessage).toMatch(/conexión/)
  })
})
