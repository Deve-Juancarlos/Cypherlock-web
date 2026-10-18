/** Banda publicitaria con número y sección de contacto con formulario. */
import { Phone, Clock, MapPin, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { principal, telefonos, whatsapp } from './datosContacto'
import { Formulario } from './Formulario'
import { Aparece, BotonLlamar, BotonWhatsApp, IconoWhatsApp, Seccion, Titulo } from './ui'

export function BandaNumero() {
  return (
    <section aria-label="Teléfono de contacto" className="relative overflow-hidden bg-senal">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-senal via-senal to-[#08606f]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between md:py-20">
        <Aparece className="max-w-xl">
          <p className="font-mono text-2xs font-medium tracking-[0.16em] text-white/70 uppercase">
            Atención personalizada · Perú
          </p>
          <h2 className="mt-3 font-display text-[1.75rem] leading-tight text-white sm:text-[2.2rem] md:text-[2.6rem]">
            ¿Quieres saber cómo quedaría en tu puerta?
          </h2>
          <p className="mt-3 max-w-md text-[1.05rem] leading-relaxed text-white/80">
            Te asesoramos sin compromiso. Instalación en Lima y provincias.
          </p>
        </Aparece>

        <Aparece delay={0.12} className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
          <a href={principal.href} className="group flex shrink-0 items-center gap-3 whitespace-nowrap" aria-label={`Llamar al ${principal.visible}`}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white/50 group-hover:bg-white/20">
              <Phone aria-hidden className="size-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </span>
            <span className="text-[2.1rem] font-medium tracking-[-0.01em] text-white tabular transition-colors duration-300 group-hover:text-white/85 sm:text-[2.6rem]">
              {principal.visible}
            </span>
          </a>

          <motion.a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 font-sans font-semibold text-senal shadow-lg shadow-black/10 transition-shadow duration-300 hover:shadow-xl hover:shadow-black/20"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Contactar por WhatsApp al ${whatsapp.visible}`}
          >
            <IconoWhatsApp />
            <span className="tracking-tight">WhatsApp</span>
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.a>
        </Aparece>
      </div>
    </section>
  )
}

export function Contacto() {
  return (
    <Seccion id="contacto">
      <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <Aparece>
          <Titulo>Hablemos de tu puerta.</Titulo>
          <p className="mt-5 max-w-sm leading-relaxed text-texto-2">
            Escríbenos por WhatsApp o llámanos. Si prefieres, deja tus datos y te devolvemos la llamada en menos de 15 minutos.
          </p>

          <ul className="mt-10 space-y-7">
            {telefonos.map((t) => (
              <li key={t.etiqueta} className="group">
                <div className="flex items-center gap-2">
                  <Phone aria-hidden className="size-3.5 text-senal" />
                  <span className="text-xs font-medium tracking-wide text-texto-3 uppercase">{t.etiqueta}</span>
                </div>
                <a
                  href={t.href}
                  className="mt-1.5 block text-[1.85rem] font-medium tracking-[-0.01em] text-texto tabular transition-all duration-300 hover:text-cobre hover:translate-x-1"
                >
                  {t.visible}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-3 border-t border-linea pt-8">
            <div className="flex items-center gap-3 text-sm text-texto-2">
              <Clock aria-hidden className="size-4 text-senal" />
              <span><strong className="text-texto">Lun - Sáb</strong> · 8:00 a 18:00</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-texto-2">
              <MapPin aria-hidden className="size-4 text-senal" />
              <span><strong className="text-texto">Trujillo</strong> · Instalación en todo Trujillo</span>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <BotonWhatsApp />
            <BotonLlamar className="sm:hidden" />
          </div>
        </Aparece>

        <Aparece delay={0.1}>
          <div className="relative rounded-[var(--radius-card)] border border-linea bg-superficie p-6 shadow-sm sm:p-8">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-cobre px-3 py-1 text-2xs font-semibold text-on-cobre shadow-sm">
              <span aria-hidden className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-on-cobre opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-on-cobre" />
              </span>
              Respuesta en 15 min
            </div>
            <p className="mb-6 font-display text-[1.35rem] text-texto">Solicita tu instalación</p>
            <Formulario />
          </div>
        </Aparece>
      </div>
    </Seccion>
  )
}
