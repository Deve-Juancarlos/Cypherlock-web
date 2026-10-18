/**
 * Activacion del propietario. El tecnico envia por WhatsApp el enlace
 * /activar/CODIGO: aqui se descarga la app y se abre con el codigo ya escrito
 * (enlace cypherlock://app/signup?codigo=...). Si la app no esta instalada,
 * Android descarga el APK.
 */
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Copy, Download, KeyRound, Smartphone } from 'lucide-react'

const APK = '/descargas/cypherlock-android.apk'
const PAQUETE = 'com.example.cypherlock_flutter'

function enlaceApp(codigo: string) {
  const respaldo = encodeURIComponent(`${window.location.origin}${APK}`)
  return `intent://app/signup?codigo=${codigo}#Intent;scheme=cypherlock;package=${PAQUETE};S.browser_fallback_url=${respaldo};end`
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <li className="rounded-[var(--radius-card)] border border-linea bg-superficie p-5 text-left">
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-senal font-semibold text-white">{n}</span>
        <h2 className="text-base font-semibold">{titulo}</h2>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-texto-2">{children}</div>
    </li>
  )
}

export function ActivarPage() {
  const { codigo: crudo = '' } = useParams()
  const codigo = crudo.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20)
  const [copiado, setCopiado] = useState(false)
  const boton =
    'flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold transition-opacity active:opacity-80'

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-noche text-texto">
      <title>Activa tu cuenta · CYPHERLOCK</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <header className="flex items-center justify-center gap-2.5 border-b-[3px] border-cobre bg-banda py-4">
        <img src="/brand/emblema-96.png" alt="" width={28} height={28} className="size-7" />
        <span className="text-[0.875rem] font-semibold tracking-[0.16em] text-banda-texto">CYPHERLOCK</span>
      </header>

      <main className="flex flex-1 justify-center px-5 py-8">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-senal/10 text-senal">
            <KeyRound className="size-7" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">Tu CYPHERLOCK ya está instalado</h1>
          <p className="mt-2 text-sm text-texto-2">Activa tu cuenta en 3 pasos para abrir tu puerta desde el celular.</p>

          <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-senal bg-superficie px-4 py-5">
            <p className="text-xs tracking-[0.12em] text-texto-3 uppercase">Tu código de activación</p>
            <p className="mt-1 font-mono text-[1.9rem] font-semibold tracking-[0.12em] text-senal">{codigo || '—'}</p>
            <button type="button" onClick={copiar} disabled={!codigo} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-senal">
              {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copiado ? 'Copiado' : 'Copiar código'}
            </button>
          </div>

          <ol className="mt-6 space-y-3">
            <Paso n={1} titulo="Descarga la app">
              <p>Solo para Android. Si el celular lo pregunta, permite instalar apps desde el navegador.</p>
              <a href={APK} download className={`${boton} mt-4 border border-senal text-senal`}>
                <Download className="size-5" aria-hidden /> Descargar CYPHERLOCK
              </a>
            </Paso>
            <Paso n={2} titulo="Abre la app con tu código">
              <p>Cuando esté instalada, vuelve a esta página y toca el botón. La app se abrirá con tu código ya escrito.</p>
              <a href={codigo ? enlaceApp(codigo) : undefined} className={`${boton} mt-4 bg-senal text-white`}>
                <Smartphone className="size-5" aria-hidden /> Abrir la app y activar
              </a>
            </Paso>
            <Paso n={3} titulo="Crea tu usuario y contraseña">
              <p>
                Elige tu nombre de usuario, tu correo y una contraseña, y toca <strong className="text-texto">Activar mi cuenta</strong>.
                Luego inicia sesión: verás tu puerta lista para abrir.
              </p>
              <p className="mt-2 text-texto-3">
                ¿El botón no abre la app? Ábrela tú, toca «Activar mi cuenta» en la pantalla de ingreso y escribe el código de arriba.
              </p>
            </Paso>
          </ol>
          <p className="mt-6 text-xs text-texto-3">El código sirve una sola vez. No lo compartas con nadie.</p>
        </div>
      </main>
    </div>
  )
}
