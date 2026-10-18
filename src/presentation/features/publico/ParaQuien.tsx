/** Tipos de inmueble donde se puede instalar CYPHERLOCK. */
import { useState } from 'react'
import { Aparece, Seccion, Titulo } from './ui'
import { INMUEBLES, type Inmueble } from './datosInmuebles'
import { DetalleInmueble } from './DetalleInmueble'

export function ParaQuien() {
  const [inmuebleActivo, setInmuebleActivo] = useState<Inmueble | null>(null)

  return (
    <Seccion>
      <Aparece className="mb-12 max-w-2xl">
        <Titulo>Hecho para tu tipo de propiedad.</Titulo>
        <p className="mt-4 leading-relaxed text-texto-2">
          CYPHERLOCK se adapta a cómo vives, no al revés.
        </p>
      </Aparece>

      <div className="grid gap-6 md:grid-cols-3">
        {INMUEBLES.map((t, i) => {
          const Icono = t.icono
          return (
            <Aparece
              key={t.id}
              delay={i * 0.1}
              className="group relative overflow-hidden rounded-2xl border border-linea bg-superficie p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-texto/10"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${t.colorGradient}`} />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className={`absolute -top-12 -right-12 size-48 rounded-full ${t.bgIcono} blur-3xl`} />
              </div>

              <div className="absolute top-6 right-6 font-mono text-6xl font-bold text-linea/30 transition-colors duration-500 group-hover:text-cobre/20">
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="relative mb-6">
                <div className={`inline-flex size-16 items-center justify-center rounded-2xl ${t.bgIcono} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                  <Icono className={`size-8 ${t.iconoColor} transition-transform duration-500 group-hover:scale-110`} aria-hidden />
                </div>
              </div>

              <h3 className="font-display text-[2rem] font-semibold text-texto transition-colors duration-500 group-hover:text-cobre">
                {t.titulo}
              </h3>
              <p className="mt-4 leading-relaxed text-texto-2">
                {t.resumen}
              </p>

              <button
                type="button"
                onClick={() => setInmuebleActivo(t)}
                className="mt-8 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-linea bg-noche px-4 py-3 text-sm font-semibold text-texto-2 transition-all duration-300 hover:border-cobre hover:bg-cobre/5 hover:text-cobre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-senal"
                aria-label={`Ver detalles de la solución para ${t.titulo}`}
                aria-haspopup="dialog"
              >
                <span>Ver detalles</span>
                <span aria-hidden className="flex size-7 items-center justify-center rounded-full border border-linea bg-superficie transition-colors group-hover:border-cobre/30">
                  <svg className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </Aparece>
          )
        })}
      </div>
      <DetalleInmueble inmueble={inmuebleActivo} onClose={() => setInmuebleActivo(null)} />
    </Seccion>
  )
}
