/** Las cuatro formas de abrir una puerta CYPHERLOCK. */
import { Nfc, ScanFace, QrCode, Smartphone } from 'lucide-react'
import { Aparece, Seccion, Titulo } from './ui'

const FORMAS = [
  {
    titulo: 'Tarjeta o llavero',
    texto:
      'Acercas la tarjeta al lector y la puerta abre. Cada persona de la casa tiene la suya. Si alguien la pierde, la desactivas desde la app y deja de abrir en ese momento.',
    dato: 'RFID',
    icono: Nfc,
  },
  {
    titulo: 'Tu rostro',
    texto: 'La cámara de la puerta reconoce a las personas que registraste en tu casa. Nadie de otro domicilio entra en esa lista.',
    dato: 'Cámara en la puerta',
    icono: ScanFace,
  },
  {
    titulo: 'Pase para visitas',
    texto:
      'Desde la app le mandas un enlace por WhatsApp a quien viene a verte. En la puerta lo abre, escribe el código que le diste y la puerta se abre. Sirve para un solo ingreso y lo puedes desactivar cuando quieras.',
    dato: 'Un solo ingreso',
    icono: QrCode,
  },
  {
    titulo: 'Desde tu celular',
    texto: 'Abres la puerta a distancia desde la app, por ejemplo para que entre alguien de tu familia. Cada apertura queda registrada.',
    dato: 'App CYPHERLOCK',
    icono: Smartphone,
  },
]

export function FormasDeAbrir() {
  return (
    <Seccion id="como-abre">
      <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
        <Aparece className="md:sticky md:top-28 md:self-start">
          <Titulo>Cuatro formas de entrar. Ninguna es una llave que se copia.</Titulo>
          <p className="mt-5 max-w-sm leading-relaxed text-texto-2">
            Cada apertura queda registrada con la hora y la forma de acceso. Si algo no cuadra, lo ves en la app.
          </p>
        </Aparece>
        <ol className="divide-y divide-linea border-y border-linea">
          {FORMAS.map((f, i) => {
            const Icono = f.icono
            return (
              <Aparece as="li" key={f.titulo} delay={i * 0.06} className="group grid grid-cols-[3.5rem_1fr] gap-x-5 py-8">
                {/* Columna del icono y número */}
                <div className="relative flex flex-col items-center">
                  <div className="flex size-12 items-center justify-center rounded-full border border-linea bg-superficie transition-all duration-300 group-hover:border-senal group-hover:bg-senal/5 group-hover:shadow-md group-hover:shadow-senal/10">
                    <Icono className="size-5 text-senal transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="mt-2 font-mono text-[0.625rem] tracking-[0.1em] text-texto-3 uppercase">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Columna del contenido */}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-[1.45rem] leading-snug text-texto transition-colors duration-300 group-hover:text-cobre">
                      {f.titulo}
                    </h3>
                    <span className="rounded-full bg-noche-alt px-2.5 py-0.5 font-mono text-2xs tracking-wide text-senal uppercase">
                      {f.dato}
                    </span>
                  </div>
                  <p className="mt-3 max-w-xl leading-relaxed text-texto-2">{f.texto}</p>
                </div>
              </Aparece>
            )
          })}
        </ol>
      </div>
    </Seccion>
  )
}
