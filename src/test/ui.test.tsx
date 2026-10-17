import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppError } from '@/core/errors/AppError'
import type { Repositories } from '@/domain/repositories'
import { AppProviders } from '@/presentation/app/providers'
import { LoginPage } from '@/presentation/features/auth/LoginPage'

function fakeRepos(login: Repositories['auth']['login']): Repositories {
  const vacio = async () => []
  return {
    auth: { login, restore: async () => null, logout: async () => undefined },
    metricas: { resumen: vi.fn() },
    usuarios: { listar: vacio, crear: vi.fn(), cambiarRol: vi.fn(), setActivo: vi.fn(), promoverAdmin: vi.fn() },
    domicilios: {
      listar: vacio, crear: vi.fn(), setActivo: vi.fn(), liberarPropietario: vi.fn(),
      dispositivos: vacio, registrarDispositivo: vi.fn(), revocarDispositivo: vi.fn(),
    },
    solicitudes: { listar: vacio, cambiarEstado: vi.fn(), asignarOperador: vi.fn(), metricasOperadores: vacio },
    eventos: { recientes: vacio, alertas: vacio },
  } as unknown as Repositories
}

function renderLogin(login: Repositories['auth']['login']) {
  return render(
    <AppProviders repos={fakeRepos(login)}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AppProviders>,
  )
}

describe('LoginPage', () => {
  it('valida antes de llamar a la API', async () => {
    const login = vi.fn()
    renderLogin(login)
    fireEvent.click(await screen.findByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText(/Ingresa tu usuario/)).toBeInTheDocument()
    expect(screen.getByText(/Ingresa tu contraseña/)).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('muestra un mensaje claro si la cuenta no es ADMIN', async () => {
    const login = vi.fn().mockRejectedValue(
      new AppError({ status: 403, code: 'FORBIDDEN_ROLE', message: 'Este panel es solo para cuentas de administración.' }),
    )
    renderLogin(login)
    fireEvent.change(await screen.findByLabelText('Usuario'), { target: { value: 'operador1' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Clave123!' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('solo para cuentas de administración'))
    expect(screen.getByLabelText('Contraseña')).toHaveValue('')
  })

  it('credenciales incorrectas: mensaje generico', async () => {
    const login = vi.fn().mockRejectedValue(new AppError({ status: 401, code: 'UNAUTHORIZED', message: 'Credenciales invalidas' }))
    renderLogin(login)
    fireEvent.change(await screen.findByLabelText('Usuario'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mala' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.'))
  })
})
