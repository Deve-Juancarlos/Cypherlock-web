/** Numero como publicidad (banda) y seccion de contacto con formulario. */
import { principal, telefonos } from './datosContacto'
import { Formulario } from './Formulario'
import { Aparece, BotonLlamar, BotonWhatsApp, Seccion, Titulo } from './ui'

export function BandaNumero() {
  return (
    <section aria-label="Teléfono de contacto" className="border-y border-linea bg-noche-alt">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <Aparece>
          <p className="max-w-md font-display text-[1.6rem] leading-tight text-texto sm:text-[1.9rem]">
            ¿Quieres saber cómo quedaría en tu puerta? Escríbenos.
          </p>
        </Aparece>
        <Aparece delay={0.1} className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <a href={principal.href} className="text-[2.1rem] font-medium tracking-[-0.01em] text-cobre-claro tabular hover:text-cobre sm:text-[2.6rem]">
            {principal.visible}
          </a>
          <BotonWhatsApp texto="WhatsApp" />
        </Aparece>
      </div>
    </section>
  )
}

export function Contacto() {
  return (
    <Seccion id="contacto">
      <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr]">
        <Aparece>
          <Titulo>Hablemos de tu puerta.</Titulo>
          <p className="mt-5 max-w-sm leading-relaxed text-texto-2">
            Escríbenos por WhatsApp o llámanos. Si prefieres, deja tus datos y te devolvemos la llamada.
          </p>
          <ul className="mt-10 space-y-6">
            {telefonos.map((t) => (
              <li key={t.etiqueta}>
                <span className="text-xs tracking-wide text-texto-3">{t.etiqueta}</span>
                <a href={t.href} className="mt-0.5 block text-[1.85rem] font-medium tracking-[-0.01em] text-texto tabular hover:text-cobre-claro">
                  {t.visible}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <BotonWhatsApp />
            <BotonLlamar className="sm:hidden" />
          </div>
        </Aparece>
        <Aparece delay={0.1}>
          <div className="rounded-[var(--radius-card)] border border-linea bg-superficie p-6 sm:p-8">
            <p className="mb-6 text-sm text-texto-2">Te llamamos nosotros</p>
            <Formulario />
          </div>
        </Aparece>
      </div>
    </Seccion>
  )
}
