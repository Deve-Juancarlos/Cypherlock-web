import { afterEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ActivarPage } from '@/presentation/features/activar/ActivarPage'
import { AppError } from '@/core/errors/AppError'
import { http } from '@/network/httpClient'

vi.mock('@/network/httpClient', () => ({ http: vi.fn() }))

afterEach(() => vi.clearAllMocks())

function pagina() {
  render(
    <MemoryRouter initialEntries={['/activar/abcd234567']}>
      <Routes><Route path="/activar/:codigo" element={<ActivarPage />} /></Routes>
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByRole('textbox', { name: 'Usuario' }), { target: { value: 'prop_demo' } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Correo electrónico' }), { target: { value: 'demo@example.com' } })
  fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'Clave12345!' } })
  fireEvent.change(screen.getByLabelText('Repite la contraseña'), { target: { value: 'Clave12345!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Crear usuario y activar cuenta' }))
}

it('envía el código del enlace al backend y confirma el alta de propietario', async () => {
  vi.mocked(http).mockResolvedValue({ id: 12, username: 'prop_demo', rol: 'PROPIETARIO', casa_id: 7 })
  pagina()

  await waitFor(() => expect(http).toHaveBeenCalledWith('/signup', expect.objectContaining({
    method: 'POST', auth: false,
    body: { codigo: 'ABCD234567', username: 'prop_demo', email: 'demo@example.com', password: 'Clave12345!' },
  })))
  expect(await screen.findByRole('status')).toHaveTextContent('Cuenta de propietario activada')
  expect(screen.getByRole('link', { name: 'Abrir la app e iniciar sesión' })).toHaveAttribute(
    'href', expect.stringContaining('intent://app/login#Intent;'),
  )
})

it('muestra el rechazo del backend y no anuncia activación si el código ya se usó', async () => {
  vi.mocked(http).mockRejectedValue(new AppError({
    status: 400, code: 'VALIDATION_ERROR', message: 'Código inválido o vencido.',
  }))
  pagina()

  expect(await screen.findByRole('alert')).toHaveTextContent('Código inválido o vencido.')
  expect(screen.queryByText('Cuenta de propietario activada')).not.toBeInTheDocument()
})
