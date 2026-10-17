/**
 * Pagina que abre la visita desde el QR o el enlace: muestra SOLO el codigo
 * de 6 digitos para marcar en el teclado de la puerta. Sin direccion ni
 * nombres. Se reconsulta cada 15 s para reflejar si ya se uso o el
 * propietario lo desactivo.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { http } from '@/network/httpClient'

const Respuesta = z.object({
  estado: z.string(),
  codigo: z.string().regex(/^\d{6}$/).optional(),
})
type Estado = { tipo: 'cargando' } | { tipo: 'vigente'; codigo: string } | { tipo: 'no_disponible' } | { tipo: 'error' }

const REFRESCO_MS = 15_000

function useCodigoVisita(token: string | undefined): Estado {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })

  useEffect(() => {
    if (!token) return
    let vivo = true
    const consultar = async () => {
      try {
        const r = await http(`/visitas/publica/${encodeURIComponent(token)}/codigo`, { auth: false, schema: Respuesta })
        if (!vivo) return
        setEstado(r.estado === 'VIGENTE' && r.codigo ? { tipo: 'vigente', codigo: r.codigo } : { tipo: 'no_disponible' })
      } catch {
        // Un fallo puntual de red no borra un codigo ya mostrado.
        if (vivo) setEstado((e) => (e.tipo === 'vigente' ? e : { tipo: 'error' }))
      }
    }
    void consultar()
    const id = setInterval(consultar, REFRESCO_MS)
    return () => {
      vivo = false
      clearInterval(id)
    }
  }, [token])

  return token ? estado : { tipo: 'no_disponible' }
}

function Digitos({ codigo }: { codigo: string }) {
  return (
    <p aria-label={`Código ${codigo.split('').join(' ')}`} className="flex justify-center gap-2 sm:gap-3">
      {codigo.split('').map((d, i) => (
        <span
          key={i}
          aria-hidden
          className="grid h-16 w-11 place-items-center rounded-[var(--radius-control)] border border-linea bg-superficie font-mono text-[2rem] font-semibold text-texto shadow-sm sm:h-20 sm:w-14 sm:text-[2.6rem]"
        >
          {d}
        </span>
      ))}
    </p>
  )
}

export function VisitaCodigoPage() {
  const { token } = useParams()
  const estado = useCodigoVisita(token)

  return (
    <div className="flex min-h-dvh flex-col bg-noche text-texto">
      <title>Tu código de acceso · CYPHERLOCK</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <header className="flex items-center justify-center gap-2.5 border-b-[3px] border-cobre bg-banda py-4">
        <img src="/brand/emblema-96.png" alt="" width={28} height={28} className="size-7" />
        <span className="text-[0.875rem] font-semibold tracking-[0.16em] text-banda-texto">CYPHERLOCK</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm text-center" role="status" aria-live="polite">
          {estado.tipo === 'cargando' && <p className="text-texto-2">Cargando tu código…</p>}

          {estado.tipo === 'vigente' && (
            <>
              <p className="text-sm font-medium tracking-wide text-senal">Tu código de acceso</p>
              <div className="mt-5">
                <Digitos codigo={estado.codigo} />
              </div>
              <p className="mt-8 leading-relaxed text-texto-2">
                Márcalo en el <strong className="text-texto">teclado de la puerta</strong>.
              </p>
              <p className="mt-2 text-sm text-texto-3">Sirve para un solo ingreso. Tienes 3 intentos.</p>
            </>
          )}

          {estado.tipo === 'no_disponible' && (
            <>
              <p className="text-lg font-semibold text-texto">Este código ya no está disponible</p>
              <p className="mt-3 leading-relaxed text-texto-2">
                Ya se usó o fue desactivado. Pide un nuevo acceso a quien te invitó.
              </p>
            </>
          )}

          {estado.tipo === 'error' && (
            <>
              <p className="text-lg font-semibold text-texto">No pudimos cargar tu código</p>
              <p className="mt-3 leading-relaxed text-texto-2">Revisa tu conexión. Lo reintentamos en unos segundos.</p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
