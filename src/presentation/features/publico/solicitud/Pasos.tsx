/** Los pasos del formulario: datos y preferencia (ubicación está en su propio archivo). */
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Home, Building2, KeyRound, Clock, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { DIAS, FRANJAS, TIPOS, type Datos, type Dia, type Errores, type Tipo } from './modelo'

export const control =
  'mt-1.5 w-full rounded-[var(--radius-control)] border border-linea bg-noche px-3.5 py-2.5 text-[0.9375rem] text-texto ' +
  'placeholder:text-texto-3 transition-all duration-200 hover:border-texto-3 ' +
  'focus:border-senal focus:ring-2 focus:ring-senal/20 focus:outline-none ' +
  'aria-invalid:border-error aria-invalid:focus:ring-error/20'

export function Etiqueta({ texto, error, className, children }: { texto: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn('block', className)}>
      <span className="text-[0.8125rem] font-medium text-texto-2">{texto}</span>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-error"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )
}

export interface PasoProps {
  datos: Datos
  errores: Errores
  cambiar: <K extends keyof Datos>(k: K, v: Datos[K]) => void
}

const opcionBase = (activa: boolean, colorActivo: 'cobre' | 'senal' = 'cobre') =>
  cn(
    'group relative flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] border px-3 py-2.5 text-sm font-medium transition-all duration-200',
    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-senal',
    activa
      ? colorActivo === 'cobre'
        ? 'border-cobre bg-cobre/10 text-cobre-claro'
        : 'border-senal bg-senal/10 text-senal'
      : 'border-linea bg-noche text-texto-2 hover:border-texto-3 hover:bg-noche-alt',
  )

const ICONOS_TIPO: Record<Tipo, typeof Home> = {
  CASA: Home,
  EDIFICIO: Building2,
  ALQUILER: KeyRound,
}

export function PasoDatos({ datos, errores, cambiar }: PasoProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Etiqueta texto="Nombre completo" error={errores.cliente_nombre} className="sm:col-span-2">
        <input className={control} autoComplete="name" placeholder="Ej. Juan Pérez" value={datos.cliente_nombre}
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
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TIPOS.map((t) => {
            const Icono = ICONOS_TIPO[t.id]
            const esActivo = datos.tipo_inmueble === t.id
            return (
              <label key={t.id} className={opcionBase(esActivo)}>
                <input type="radio" name="tipo_inmueble" value={t.id} className="sr-only" checked={esActivo}
                  onChange={() => cambiar('tipo_inmueble', t.id)} />
                <Icono className={cn('size-4 shrink-0 transition-colors', esActivo ? 'text-cobre-claro' : 'text-texto-3')} aria-hidden />
                <span>{t.texto}</span>
                {esActivo && <Check className="absolute top-2.5 right-2 size-3.5 text-cobre-claro" aria-hidden />}
              </label>
            )
          })}
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
          {DIAS.map((d) => {
            const esActivo = datos.dias.includes(d.id)
            return (
              <button key={d.id} type="button" aria-pressed={esActivo} onClick={() => alternar(d.id)}
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-md border text-sm font-semibold transition-all duration-200',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-senal',
                  esActivo
                    ? 'border-cobre bg-cobre text-on-cobre shadow-sm shadow-cobre/20'
                    : 'border-linea bg-noche text-texto-2 hover:border-texto-3 hover:bg-noche-alt',
                )}>
                {d.corto}
                {esActivo && <Check className="absolute -top-1 -right-1 size-3.5 rounded-full bg-cobre-claro p-[1px] text-on-cobre" aria-hidden />}
              </button>
            )
          })}
        </div>
        <AnimatePresence initial={false}>
          {errores.dias && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-error">
              <AlertCircle className="size-3.5 shrink-0" aria-hidden />
              {errores.dias}
            </motion.p>
          )}
        </AnimatePresence>
      </fieldset>

      <fieldset>
        <legend className="text-[0.8125rem] font-medium text-texto-2">¿En qué horario prefieres la visita?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {FRANJAS.map((f) => {
            const esActivo = datos.franja === f.id
            return (
              <label key={f.id} className={cn(opcionBase(esActivo, 'senal'), 'flex-col items-start gap-1.5 text-left')}>
                <input type="radio" name="franja" value={f.id} className="sr-only" checked={esActivo}
                  onChange={() => cambiar('franja', f.id)} />
                <span className="flex items-center gap-2">
                  <Clock className={cn('size-4', esActivo ? 'text-senal' : 'text-texto-3')} aria-hidden />
                  <span className={cn('font-semibold', esActivo ? 'text-senal' : 'text-texto')}>{f.texto}</span>
                </span>
                <span className="text-xs text-texto-3">{f.detalle}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <Etiqueta texto="Comentario adicional (opcional)" error={errores.notas}>
        <textarea className={cn(control, 'min-h-24 resize-y')} value={datos.notas}
          placeholder="Ej. Tengo 2 puertas, el timbre no funciona, llamar después de las 6pm..."
          onChange={(e) => cambiar('notas', e.target.value)} />
      </Etiqueta>

      <div className="rounded-lg bg-noche-alt p-3 text-xs leading-relaxed text-texto-3">
        <strong className="text-texto-2">Nota:</strong> Esta es solo una preferencia. Un asesor de CypherTech te llamará para confirmar el día y la hora exacta de la instalación.
      </div>
    </div>
  )
}
