import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { CIUDAD, EMPRESA, principal, PRODUCTO, telefonos, whatsapp } from './datosContacto'

/** Marca del producto: emblema + CYPHERLOCK. La empresa va en el pie. */
function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/brand/emblema-96.png" alt="" width={30} height={30} className="size-[30px]" />
      <span className={cn('text-[0.875rem] font-semibold tracking-[0.16em]', claro ? 'text-banda-texto' : 'text-texto')}>{PRODUCTO}</span>
    </span>
  )
}

const ENLACES = [
  { href: '#como-abre', label: 'Cómo abre' },
  { href: '#app', label: 'La app' },
  { href: '#instalacion', label: 'Instalación' },
  { href: '#contacto', label: 'Contacto' },
]

function Cabecera() {
  const [conFondo, setConFondo] = useState(false)

  useEffect(() => {
    const onScroll = () => setConFondo(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300',
        conFondo ? 'border-linea bg-noche/85 backdrop-blur-md' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" aria-label={`${PRODUCTO}, inicio`}>
          <Marca />
        </Link>
        <nav aria-label="Secciones" className="hidden items-center gap-7 text-sm text-texto-2 md:flex">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href} className="transition-colors hover:text-texto">
              {e.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <a href={principal.href} className="hidden items-center gap-2 font-mono text-[0.8125rem] text-cobre-claro hover:text-cobre lg:inline-flex">
            <Phone className="size-3.5" aria-hidden />
            {principal.visible}
          </a>
          <Link
            to="/panel/login"
            className="rounded-full border border-linea px-3.5 py-1.5 text-[0.8125rem] text-texto-2 transition-colors hover:border-texto-3 hover:text-texto"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  )
}

function Pie() {
  return (
    <footer className="border-t-[3px] border-cobre bg-banda">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Marca claro />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-banda-texto-2">
            {PRODUCTO} es un producto de {EMPRESA}: cerradura, lector, cámara y una app para decidir quién entra a tu casa.
          </p>
        </div>
        <div>
          <p className="font-mono text-2xs tracking-[0.14em] text-banda-texto-3 uppercase">Contacto</p>
          <ul className="mt-3 space-y-3">
            {telefonos.map((t) => (
              <li key={t.etiqueta}>
                <a href={t.href} className="font-mono text-sm text-banda-texto hover:text-cobre-claro">
                  {t.visible}
                </a>
                <span className="block text-xs text-banda-texto-3">{t.etiqueta}</span>
              </li>
            ))}
            <li>
              <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="text-sm text-banda-texto-2 hover:text-cobre-claro">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-2xs tracking-[0.14em] text-banda-texto-3 uppercase">{EMPRESA}</p>
          <ul className="mt-3 space-y-3 text-sm text-banda-texto-2">
            <li>{CIUDAD}</li>
            <li>
              <Link to="/panel/login" className="hover:text-banda-texto">
                Acceso de administración
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl border-t border-banda-linea px-5 py-5 text-xs text-banda-texto-3 sm:px-8">
        © {new Date().getFullYear()} {EMPRESA}. {PRODUCTO} es una marca de {EMPRESA}.
      </p>
    </footer>
  )
}

/** En celulares: escribir o llamar a un toque. */
function BarraContacto() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-linea bg-noche/95 backdrop-blur-md md:hidden">
      <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="flex h-14 items-center justify-center gap-2 bg-cobre font-medium text-on-cobre">
        <MessageCircle className="size-4" aria-hidden />
        WhatsApp
      </a>
      <a href={principal.href} className="flex h-14 items-center justify-center gap-2 font-medium text-texto">
        <Phone className="size-4" aria-hidden />
        Llamar
      </a>
    </div>
  )
}

export function PublicLayout() {
  useEffect(() => {
    const html = document.documentElement
    html.dataset.sitio = 'publico'
    return () => {
      delete html.dataset.sitio
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-noche pb-14 text-texto md:pb-0">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-cobre focus:px-3 focus:py-2 focus:text-on-cobre"
        >
          Ir al contenido
        </a>
        <Cabecera />
        <main id="contenido">
          <Outlet />
        </main>
        <Pie />
        <BarraContacto />
      </div>
    </MotionConfig>
  )
}
