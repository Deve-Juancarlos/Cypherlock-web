import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ParaQuien } from '@/presentation/features/publico/ParaQuien'

const showModalOriginal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
const closeOriginal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) { this.setAttribute('open', '') },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    },
  })
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (showModalOriginal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModalOriginal)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  if (closeOriginal) Object.defineProperty(HTMLDialogElement.prototype, 'close', closeOriginal)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

describe('ParaQuien', () => {
  it('abre el detalle correcto y devuelve el foco al botón al cerrar', async () => {
    render(<ParaQuien />)

    for (const nombre of ['Casa', 'Edificio', 'Alquiler']) {
      const abrir = screen.getByRole('button', { name: `Ver detalles de la solución para ${nombre}` })
      abrir.focus()
      fireEvent.click(abrir)

      const dialogo = await screen.findByRole('dialog')
      expect(dialogo).toHaveTextContent(nombre)
      expect(dialogo).toHaveTextContent('Solicitar instalación')
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalles' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(abrir).toHaveFocus()
    }
  })
})
