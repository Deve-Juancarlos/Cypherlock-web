import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '@/presentation/features/dashboard/DashboardPage'

vi.mock('@/presentation/hooks/queries', () => ({
  useResumen: () => ({
    isPending: false,
    isError: false,
    data: {
      domicilios: { total: 0, activos: 0, inactivos: 0, porTipo: {} },
      usuarios: { total: 0, operadores: 0, propietarios: 0, residentes: 0 },
      tarjetas: { total: 0, activas: 0 },
      ultimas24h: { accesos: 0, intrusos: 0 },
      alertasActivas: 0,
    },
    refetch: vi.fn(),
  }),
  useEventos: () => ({ isPending: true, isError: false, data: undefined, refetch: vi.fn() }),
}))

describe('DashboardPage', () => {
  it('muestra el resumen aunque la actividad todavía esté cargando', () => {
    render(<MemoryRouter><DashboardPage /></MemoryRouter>)

    expect(screen.getByText('Sin alertas activas')).toBeInTheDocument()
    expect(screen.getByText('Cargando actividad…')).toBeInTheDocument()
    expect(screen.getByText('Parque instalado')).toBeInTheDocument()
  })
})
