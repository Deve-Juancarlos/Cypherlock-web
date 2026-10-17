/** "Te llamamos": crea una solicitud PENDIENTE en POST /solicitudes/publica. */
import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { z } from 'zod'
import { toAppError } from '@/core/errors/AppError'
import { cn } from '@/core/utils/cn'
import { solicitudPublicaRemote } from '@/data/datasources/remote'

const Esquema = z.object({
  cliente_nombre: z.string().trim().min(2, 'Escribe tu nombre.').max(120),
  cliente_telefono: z
    .string()
    .trim()
    .regex(/^(\+?51)?\s?9\d{2}\s?\d{3}\s?\d{3}$/, 'Escribe un celular de 9 dígitos, por ejemplo 987 654 321.'),
  distrito: z.string().trim().min(2, 'Indica tu distrito o ciudad.').max(80),
  direccion: z.string().trim().min(4, 'Escribe una dirección o referencia.').max(200),
  tipo_inmueble: z.enum(['CASA', 'EDIFICIO', 'ALQUILER']),
  notas: z.string().trim().max(400),
})
type Datos = z.infer<typeof Esquema>
type Campo = keyof Datos

const VACIO: Datos = { cliente_nombre: '', cliente_telefono: '', distrito: '', direccion: '', tipo_inmueble: 'CASA', notas: '' }

const control =
  'mt-1.5 w-full rounded-[var(--radius-control)] border border-linea bg-noche px-3.5 py-2.5 text-[0.9375rem] text-texto ' +
  'placeholder:text-texto-3 transition-colors hover:border-texto-3 focus:border-senal focus:outline-none aria-invalid:border-error'

function Etiqueta({ texto, error, className, children }: { texto: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn('block', className)}>
      <span className="text-[0.8125rem] font-medium text-texto-2">{texto}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </label>
  )
}

function mensajeError(err: unknown): string {
  const e = toAppError(err)
  if (e.code === 'RATE_LIMITED' || e.status === 429)
    return 'Recibimos varias solicitudes desde tu conexión. Espera unos minutos o escríbenos por WhatsApp.'
  if (e.status === 422) return 'Revisa los datos del formulario.'
  return 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.'
}

export function Formulario() {
  const [datos, setDatos] = useState<Datos>(VACIO)
  const [trampa, setTrampa] = useState('')
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({})
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado'>('editando')
  const [falla, setFalla] = useState<string | null>(null)

  const campo = (k: Campo) => ({
    value: datos[k],
    'aria-invalid': errores[k] ? true : undefined,
    onChange: (e: { target: { value: string } }) => setDatos((d) => ({ ...d, [k]: e.target.value })),
  })

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setFalla(null)
    const r = Esquema.safeParse(datos)
    if (!r.success) {
      const f = r.error.flatten().fieldErrors
      setErrores(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])))
      return
    }
    setErrores({})
    // Campo trampa: invisible para personas; los bots lo llenan y no se envia nada.
    if (trampa) return setEstado('enviado')
    setEstado('enviando')
    try {
      await solicitudPublicaRemote.crear({ ...r.data, departamento: '' })
      setEstado('enviado')
    } catch (err) {
      setFalla(mensajeError(err))
      setEstado('editando')
    }
  }

  if (estado === 'enviado') {
    const nombre = datos.cliente_nombre.trim().split(/\s+/)[0]
    return (
      <div role="status" className="py-6">
        <Check className="size-6 text-senal" aria-hidden />
        <p className="mt-4 font-display text-[1.6rem] leading-tight text-texto">Listo{nombre ? `, ${nombre}` : ''}.</p>
        <p className="mt-2 leading-relaxed text-texto-2">
          Recibimos tus datos. Te llamaremos al <span className="font-mono">{datos.cliente_telefono.trim()}</span>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} noValidate className="grid gap-5 sm:grid-cols-2">
      <Etiqueta texto="Nombre" error={errores.cliente_nombre} className="sm:col-span-2">
        <input className={control} autoComplete="name" {...campo('cliente_nombre')} />
      </Etiqueta>
      <Etiqueta texto="Celular" error={errores.cliente_telefono}>
        <input className={control} type="tel" inputMode="tel" autoComplete="tel" placeholder="987 654 321" {...campo('cliente_telefono')} />
      </Etiqueta>
      <Etiqueta texto="Distrito o ciudad" error={errores.distrito}>
        <input className={control} autoComplete="address-level2" {...campo('distrito')} />
      </Etiqueta>
      <Etiqueta texto="Dirección o referencia" error={errores.direccion} className="sm:col-span-2">
        <input className={control} autoComplete="street-address" {...campo('direccion')} />
      </Etiqueta>
      <Etiqueta texto="Tipo de inmueble">
        <select className={control} {...campo('tipo_inmueble')}>
          <option value="CASA">Casa</option>
          <option value="EDIFICIO">Edificio</option>
          <option value="ALQUILER">Alquiler</option>
        </select>
      </Etiqueta>
      <div className="hidden" aria-hidden>
        <input tabIndex={-1} autoComplete="off" name="sitio_web" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
      </div>
      <Etiqueta texto="Comentario (opcional)" className="sm:col-span-2">
        <textarea className={cn(control, 'min-h-24 resize-y')} placeholder="Cuántas puertas, a qué hora llamarte…" {...campo('notas')} />
      </Etiqueta>
      {falla && (
        <p role="alert" className="text-sm text-error sm:col-span-2">
          {falla}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={estado === 'enviando'}
          className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-cobre px-7 text-[0.9375rem] font-medium text-on-cobre transition-colors hover:bg-cobre-claro disabled:cursor-wait disabled:opacity-70"
        >
          {estado === 'enviando' ? 'Enviando…' : 'Quiero que me llamen'}
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  )
}
