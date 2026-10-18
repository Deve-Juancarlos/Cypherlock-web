/** Tipos de inmueble donde se puede instalar CYPHERLOCK. */
import { Home, Building2, KeyRound } from 'lucide-react'
import { Aparece, Seccion, Titulo } from './ui'

const TIPOS = [
  {
    titulo: 'Casa',
    colorGradient: 'bg-gradient-to-r from-senal to-cobre',
    iconoColor: 'text-senal',
    bgIcono: 'bg-senal/10',
    texto: 'Una o varias puertas. Cada persona de la familia con su propio acceso y su propio historial.',
    icono: Home,
  },
  {
    titulo: 'Edificio',
    colorGradient: 'bg-gradient-to-r from-cobre to-hoja',
    iconoColor: 'text-cobre',
    bgIcono: 'bg-cobre/10',
    texto: 'Cada departamento por separado: un vecino no ve ni abre lo que no le corresponde.',
    icono: Building2,
  },
  {
    titulo: 'Alquiler',
    colorGradient: 'bg-gradient-to-r from-hoja to-senal',
    iconoColor: 'text-hoja',
    bgIcono: 'bg-hoja/10',
    texto: 'Das acceso al inquilino y lo retiras cuando se muda, sin cambiar chapas ni recoger llaves.',
    icono: KeyRound,
  },
]

export function ParaQuien() {
  return (
    <Seccion>
      <Aparece className="mb-12 max-w-2xl">
        <Titulo>Hecho para tu tipo de propiedad.</Titulo>
        <p className="mt-4 leading-relaxed text-texto-2">
          CYPHERLOCK se adapta a cómo vives, no al revés.
        </p>
      </Aparece>

      <div className="grid gap-6 md:grid-cols-3">
        {TIPOS.map((t, i) => {
          const Icono = t.icono
          return (
            <Aparece
              key={t.titulo}
              delay={i * 0.1}
              className="group relative overflow-hidden rounded-2xl border border-linea bg-superficie p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-texto/10"
            >
              {/* Borde superior con gradiente de color */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${t.colorGradient}`} />

              {/* Patrón de fondo sutil (decorativo) */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className={`absolute -top-12 -right-12 size-48 rounded-full ${t.bgIcono} blur-3xl`} />
              </div>

              {/* Número de card (jerarquía visual) */}
              <div className="absolute top-6 right-6 font-mono text-6xl font-bold text-linea/30 transition-colors duration-500 group-hover:text-cobre/20">
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Icono con fondo elaborado */}
              <div className="relative mb-6">
                <div className={`inline-flex size-16 items-center justify-center rounded-2xl ${t.bgIcono} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}>
                  <Icono className={`size-8 ${t.iconoColor} transition-transform duration-500 group-hover:scale-110`} />
                </div>
              </div>

              {/* Título con mejor jerarquía */}
              <h3 className="font-display text-[2rem] font-semibold text-texto transition-colors duration-500 group-hover:text-cobre">
                {t.titulo}
              </h3>

              {/* Descripción */}
              <p className="mt-4 leading-relaxed text-texto-2">
                {t.texto}
              </p>

              {/* Indicador "Más información" con animación slide */}
              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-texto-3 transition-all duration-500">
                <span className="translate-x-0 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                  Ver detalles
                </span>
                <div className="flex size-8 items-center justify-center rounded-full border border-linea transition-all duration-500 group-hover:border-cobre group-hover:bg-cobre group-hover:text-on-cobre">
                  <svg
                    className="size-4 transition-transform duration-500 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Aparece>
          )
        })}
      </div>
    </Seccion>
  )
}
