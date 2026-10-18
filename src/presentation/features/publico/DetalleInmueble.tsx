/** Diálogo público con los detalles de un tipo de inmueble. */
import { useEffect, useRef } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { whatsapp } from './datosContacto'
import { IconoWhatsApp } from './ui'
import type { Inmueble } from './datosInmuebles'

interface Props {
  inmueble: Inmueble | null
  onClose: () => void
}

export function DetalleInmueble({ inmueble, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !inmueble) return

    const focoAnterior = document.activeElement as HTMLElement | null
    const overflowAnterior = document.body.style.overflow
    const cerrar = () => {
      onCloseRef.current()
      focoAnterior?.focus({ preventScroll: true })
    }

    dialog.addEventListener('close', cerrar)
    dialog.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      dialog.removeEventListener('close', cerrar)
      if (dialog.open) dialog.close()
      document.body.style.overflow = overflowAnterior
      focoAnterior?.focus({ preventScroll: true })
    }
  }, [inmueble])

  if (!inmueble) return null

  const irAContacto = () => {
    dialogRef.current?.close()
    requestAnimationFrame(() => {
      const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document.getElementById('contacto')?.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth' })
    })
  }

  const Icono = inmueble.icono

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close() }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[90vw] max-w-lg overflow-y-auto rounded-2xl border border-linea bg-superficie p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      aria-labelledby="detalle-inmueble-titulo"
    >
      <div className={`relative flex items-center gap-4 border-b border-linea p-6 ${inmueble.bgIcono}`}>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-superficie shadow-sm">
          <Icono className={`size-6 ${inmueble.iconoColor}`} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="detalle-inmueble-titulo" className="font-display text-2xl font-semibold text-texto">
            {inmueble.titulo}
          </h2>
          <p className="text-sm text-texto-2">Solución CYPHERLOCK</p>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-texto-3 transition-colors hover:bg-linea hover:text-texto"
          aria-label="Cerrar detalles"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="p-6">
        <ul className="space-y-4">
          {inmueble.detalles.map((detalle) => (
            <li key={detalle} className="flex items-start gap-3 text-sm leading-relaxed text-texto-2">
              <span aria-hidden className={`mt-2 size-1.5 shrink-0 rounded-full ${inmueble.colorGradient}`} />
              {detalle}
            </li>
          ))}
        </ul>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={irAContacto}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-cobre px-4 text-sm font-semibold text-on-cobre transition-all hover:bg-cobre-claro hover:shadow-lg hover:shadow-cobre/20"
          >
            Solicitar instalación
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-linea bg-noche px-4 text-sm font-semibold text-texto transition-all hover:bg-noche-alt hover:text-senal"
          >
            <IconoWhatsApp className="size-4" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </dialog>
  )
}
