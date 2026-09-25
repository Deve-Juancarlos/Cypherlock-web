import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { tokenStorage } from '@/core/auth/tokenStorage'
import { TRANSICIONES } from '@/domain/models'
import { createHttpRepositories } from '@/repository'
import { toDomicilio } from '@/repository/mappers'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const usuario = (rol: string) => ({
  id: 1, username: 'ana', email: 'ana@x.com', rol, activo: true, casa_id: null, creado_en: '2026-09-24T00:00:00Z',
})

describe('AuthRepository', () => {
  const fetchMock = vi.fn()
  beforeEach(() => vi.stubGlobal('fetch', fetchMock))
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    tokenStorage.clear()
  })

  const responder = (rol: string) =>
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('/login')) return json(200, { access_token: 'a', refresh_token: 'r', token_type: 'bearer', expires_in: 3600 })
      if (url.endsWith('/me')) return json(200, usuario(rol))
      if (url.endsWith('/auth/logout')) return json(200, { status: 'OK' })
      return json(404, {})
    })

  it('ADMIN entra al panel', async () => {
    responder('ADMIN')
    const u = await createHttpRepositories().auth.login('ana', 'x')
    expect(u.rol).toBe('ADMIN')
    expect(tokenStorage.getRefresh()).toBe('r')
  })

  it.each(['OPERADOR', 'PROPIETARIO', 'RESIDENTE'])('%s es rechazado y su sesion se cierra', async (rol) => {
    responder(rol)
    await expect(createHttpRepositories().auth.login('ana', 'x')).rejects.toMatchObject({ code: 'FORBIDDEN_ROLE' })
    expect(tokenStorage.getRefresh()).toBeNull()
    expect(fetchMock.mock.calls.some(([u]) => String(u).endsWith('/auth/logout'))).toBe(true)
  })
})

describe('mappers y reglas de dominio', () => {
  it('toDomicilio arma direccion/ubicacion y detecta el contrato usado', () => {
    const d = toDomicilio({
      id: 3, nombre: '', codigo_contrato: 'ABCD2345', tipo_inmueble: 'CASA', activo: true, propietario_username: '',
      departamento: 'Lima', provincia: 'Lima', distrito: 'Miraflores', direccion: 'Av. Larco', nro_puerta: '120',
      operador_username: 'op1', max_tarjetas: 2, esp32_ip: '', esp32_port: 80, foto_url: '', creado_en: '2026-09-24T00:00:00Z',
    })
    expect(d.nombre).toBe('Domicilio 3')
    expect(d.direccion).toBe('Av. Larco, 120')
    expect(d.ubicacion).toBe('Miraflores, Lima, Lima')
    expect(d.contratoUsado).toBe(false)
    expect(d.esp32Configurado).toBe(false)
  })

  it('la maquina de estados coincide con la del backend', () => {
    expect(TRANSICIONES.COMPLETADO).toEqual([])
    expect(TRANSICIONES.CANCELADO).toEqual([])
    expect(TRANSICIONES.ASIGNADO).not.toContain('COMPLETADO')
    expect(TRANSICIONES.EN_CURSO).toEqual(['COMPLETADO', 'CANCELADO'])
  })
})
