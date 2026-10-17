/** Los tres pasos del formulario: datos, ubicacion (en su archivo) y preferencia. */
import type { ReactNode } from 'react'
import { cn } from '@/core/utils/cn'
import { DIAS, FRANJAS, TIPOS, type Datos, type Dia, type Errores } from './modelo'

export const control =
  'mt-1.5 w-full rounded-[var(--radius-control)] border border-linea bg-noche px-3.5 py-2.5 text-[0.9375rem] text-texto ' +
  'placeholder:text-texto-3 transition-colors hover:border-texto-3 focus:border-senal focus:outline-none aria-invalid:border-error'

export function Etiqueta({ texto, error, className, children }: { texto: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn('block', className)}>
      <span className="text-[0.8125rem] font-medium text-texto-2">{texto}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </label>
  )
}

export interface PasoProps {
  datos: Datos
  errores: Errores
  cambiar: <K extends keyof Datos>(k: K, v: Datos[K]) => void
}

const opcion = (activa: boolean) =>
  cn(
    'cursor-pointer rounded-[var(--radius-control)] border px-3 py-2.5 text-sm transition-colors',
    activa ? 'border-cobre bg-cobre/10 text-texto' : 'border-linea text-texto-2 hover:border-texto-3',
  )

export function PasoDatos({ datos, errores, cambiar }: PasoProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Etiqueta texto="Nombre" error={errores.cliente_nombre} className="sm:col-span-2">
        <input className={control} autoComplete="name" value={datos.cliente_nombre}
          aria-invalid={errores.cliente_nombre ? true : undefined}
          onChange={(e) => cambiar('cliente_nombre', e.target.value)} />
      </Etiqueta>
      <Etiqueta texto="Celular" error={errores.cliente_telefono} className="sm:col-span-2">
        <input className={control} type="tel" inputMode="tel" autoComplete="tel" placeholder="987 654 321"
          value={datos.cliente_telefono} aria-invalid={errores.cliente_telefono ? true : undefined}
          onChange={(e) => cambiar('cliente_telefono', e.target.value)} />
      </Etiqueta>
      <fieldset className="sm:col-span-2">
        <legend className="text-[0.8125rem] font-medium text-texto-2">Tipo de inmueble</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {TIPOS.map((t) => (
            <label key={t.id} className={cn(opcion(datos.tipo_inmueble === t.id), 'text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-senal')}>
              <input type="radio" name="tipo" value={t.id} className="sr-only" checked={datos.tipo_inmueble === t.id}
                onChange={() => cambiar('tipo_inmueble', t.id)} />
              {t.texto}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export function PasoPreferencia({ datos, errores, cambiar }: PasoProps) {
  const alternar = (d: Dia) => cambiar('dias', datos.dias.includes(d) ? datos.dias.filter((x) => x !== d) : [...datos.dias, d])
  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="text-[0.8125rem] font-medium text-texto-2">¿Qué días te acomodan para la visita?</legend>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {DIAS.map((d) => (
            <button key={d.id} type="button" aria-pressed={datos.dias.includes(d.id)} onClick={() => alternar(d.id)}
              className={cn(opcion(datos.dias.includes(d.id)), 'px-0 text-center')}>
              {d.corto}
            </button>
          ))}
        </div>
        {errores.dias && <span className="mt-1 block text-xs text-error">{errores.dias}</span>}
      </fieldset>
      <fieldset>
        <legend className="text-[0.8125rem] font-medium text-texto-2">¿En qué horario?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {FRANJAS.map((f) => (
            <label key={f.id} className={cn(opcion(datos.franja === f.id), 'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-senal')}>
              <input type="radio" name="franja" value={f.id} className="sr-only" checked={datos.franja === f.id}
                onChange={() => cambiar('franja', f.id)} />
              <span className="block font-medium">{f.texto}</span>
              <span className="block text-xs text-texto-3">{f.detalle}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Etiqueta texto="Comentario (opcional)" error={errores.notas}>
        <textarea className={cn(control, 'min-h-24 resize-y')} value={datos.notas}
          placeholder="Cuántas puertas, a qué hora llamarte…" onChange={(e) => cambiar('notas', e.target.value)} />
      </Etiqueta>
      <p className="text-xs leading-relaxed text-texto-3">
        Es una preferencia: un asesor te llamará para confirmar el día y la hora de la visita.
      </p>
    </div>
  )
}
