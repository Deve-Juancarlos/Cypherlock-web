/**
 * Contacto publico. Etapa MVP: un solo numero para ventas y atencion, con
 * WhatsApp como canal principal (es como escribe la gente en Peru). Cuando
 * exista soporte, agregarlo como segunda linea en TELEFONOS.
 */
export const EMPRESA = 'CypherTech Perú'
export const PRODUCTO = 'CYPHERLOCK'
export const CIUDAD = 'Perú'

interface Linea {
  etiqueta: string
  /** E.164 sin espacios. */
  e164: string
}

const TELEFONOS: Linea[] = [{ etiqueta: 'Ventas y atención', e164: '+51986590488' }]
const WHATSAPP = '+51986590488'

const MENSAJE_WA = 'Hola, quiero información sobre CYPHERLOCK para mi casa.'

/** "+51986590488" -> "986 590 488" (asi lo reconoce cualquiera en Peru). */
export function formatoLocal(e164: string): string {
  const d = e164.replace(/\D/g, '').replace(/^51/, '')
  return d.length === 9 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : e164
}

export const telefonos = TELEFONOS.map((t) => ({
  etiqueta: t.etiqueta,
  visible: formatoLocal(t.e164),
  href: `tel:${t.e164}`,
}))

export const principal = telefonos[0]

export const whatsapp = {
  visible: formatoLocal(WHATSAPP),
  href: `https://wa.me/${WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(MENSAJE_WA)}`,
}
