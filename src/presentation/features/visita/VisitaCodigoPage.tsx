/**
 * Pase de visita: la visita escribe su codigo de 6 digitos en este teclado y la
 * puerta se abre. El codigo NO se muestra aqui (llega por separado); si la casa
 * tiene coordenadas se pide la ubicacion para comprobar que esta en la puerta.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Delete, LockOpen } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { abrirConCodigo, consultarPase, pedirUbicacion, type EstadoPase } from './visitaApi'

type Vista = 'cargando' | 'teclado' | 'abriendo' | 'abierta' | 'no_disponible'

function Casillas({ codigo }: { codigo: string }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`${codigo.length} de 6 dígitos`}>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'grid h-14 w-11 place-items-center rounded-[var(--radius-control)] border bg-superficie font-mono text-[1.8rem] font-semibold',
            i < codigo.length ? 'border-senal text-texto' : 'border-linea text-texto-3',
          )}
        >
          {i < codigo.length ? '•' : ''}
        </span>
      ))}
    </div>
  )
}

function Teclado({ onDigito, onBorrar, deshabilitado }: { onDigito: (d: string) => void; onBorrar: () => void; deshabilitado: boolean }) {
  const tecla =
    'h-16 rounded-[var(--radius-card)] border border-linea bg-superficie text-[1.6rem] font-medium text-texto transition-colors active:bg-noche-alt disabled:opacity-50'
  return (
    <div className="grid grid-cols-3 gap-3" role="group" aria-label="Teclado numérico">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
        <button key={d} type="button" className={tecla} disabled={deshabilitado} onClick={() => onDigito(d)}>{d}</button>
      ))}
      <span />
      <button type="button" className={tecla} disabled={deshabilitado} onClick={() => onDigito('0')}>0</button>
      <button type="button" className={cn(tecla, 'grid place-items-center')} disabled={deshabilitado} onClick={onBorrar} aria-label="Borrar">
        <Delete className="size-6" aria-hidden />
      </button>
    </div>
  )
}

export function VisitaCodigoPage() {
  const { token = '' } = useParams()
  const [vista, setVista] = useState<Vista>('cargando')
  const [pase, setPase] = useState<EstadoPase | null>(null)
  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    consultarPase(token)
      .then((p) => {
        setPase(p)
        setVista(p.estado === 'VIGENTE' ? 'teclado' : 'no_disponible')
      })
      .catch(() => setVista('no_disponible'))
  }, [token])

  const abrir = async (completo: string) => {
    setVista('abriendo')
    setMensaje(null)
    let ubicacion
    if (pase?.requiere_ubicacion) {
      try {
        ubicacion = await pedirUbicacion()
      } catch (e) {
        setMensaje((e as Error).message)
        setCodigo('')
        return setVista('teclado')
      }
    }
    const r = await abrirConCodigo(token, completo, ubicacion)
    if (r.tipo === 'abierta') return setVista('abierta')
    setMensaje(r.mensaje)
    setCodigo('')
    setVista(r.agotado ? 'no_disponible' : 'teclado')
  }

  const digito = (d: string) => {
    if (vista !== 'teclado' || codigo.length >= 6) return
    const nuevo = codigo + d
    setCodigo(nuevo)
    if (nuevo.length === 6) void abrir(nuevo)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-noche text-texto">
      <title>Abrir la puerta · CYPHERLOCK</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <header className="flex items-center justify-center gap-2.5 border-b-[3px] border-cobre bg-banda py-4">
        <img src="/brand/emblema-96.png" alt="" width={28} height={28} className="size-7" />
        <span className="text-[0.875rem] font-semibold tracking-[0.16em] text-banda-texto">CYPHERLOCK</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-xs text-center">
          {vista === 'cargando' && <p role="status" className="text-texto-2">Cargando tu pase…</p>}

          {(vista === 'teclado' || vista === 'abriendo') && (
            <>
              <h1 className="text-xl font-semibold">Escribe tu código</h1>
              <p className="mt-2 text-sm text-texto-2">Los 6 dígitos que te envió quien te invitó.</p>
              <div className="mt-6"><Casillas codigo={codigo} /></div>
              <p role="alert" aria-live="assertive" className="mt-4 min-h-10 text-sm text-error">{mensaje}</p>
              {vista === 'abriendo' && <p role="status" className="mb-3 text-sm text-senal">Abriendo la puerta…</p>}
              <Teclado onDigito={digito} onBorrar={() => setCodigo((c) => c.slice(0, -1))} deshabilitado={vista === 'abriendo'} />
              <p className="mt-5 text-xs text-texto-3">
                {pase?.requiere_ubicacion ? 'Te pediremos tu ubicación para comprobar que estás en la puerta. ' : ''}
                Un solo ingreso{typeof pase?.intentos_restantes === 'number' ? ` · ${pase.intentos_restantes} intentos` : ''}.
              </p>
            </>
          )}

          {vista === 'abierta' && (
            <div role="status">
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-hoja/10 text-hoja">
                <LockOpen className="size-10" aria-hidden />
              </span>
              <p className="mt-5 text-2xl font-semibold">¡Puerta abierta!</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-texto-2"><Check className="size-4 text-hoja" aria-hidden /> Bienvenido. Empuja la puerta para entrar.</p>
            </div>
          )}

          {vista === 'no_disponible' && (
            <div role="status">
              <p className="text-lg font-semibold">Este pase ya no está disponible</p>
              <p className="mt-3 leading-relaxed text-texto-2">
                {mensaje ?? 'Ya se usó, se bloqueó por intentos fallidos o fue desactivado.'} Pide un nuevo pase a quien te invitó.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
