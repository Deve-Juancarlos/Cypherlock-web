import { useEffect, useRef, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Phone, Menu, X, ArrowUpRight } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import { CIUDAD, EMPRESA, principal, PRODUCTO, telefonos, whatsapp } from './datosContacto'
import { IconoWhatsApp } from './ui'

/** Marca del producto: emblema + CYPHERLOCK. */
function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]">
      <img src="/brand/emblema-96.png" alt="" width={30} height={30} className="size-[30px]" loading="eager" decoding="async" />
      <span className={cn(
        'text-[0.875rem] font-semibold tracking-[0.16em] transition-colors',
        claro ? 'text-banda-texto group-hover:text-white' : 'text-texto group-hover:text-cobre',
      )}>{PRODUCTO}</span>
    </span>
  )
}

const ENLACES = [
  { href: '#como-abre', label: 'Cómo abre' },
  { href: '#tecnologia', label: 'Tecnología' },
  { href: '#app', label: 'La app' },
  { href: '#instalacion', label: 'Instalación' },
  { href: '#contacto', label: 'Contacto' },
]

function Cabecera() {
  const [conFondo, setConFondo] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const botonMenu = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setConFondo(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuAbierto) return
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alPulsar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuAbierto(false)
        botonMenu.current?.focus()
      }
    }
    const media = window.matchMedia('(min-width: 768px)')
    const alCambiar = () => { if (media.matches) setMenuAbierto(false) }
    media.addEventListener('change', alCambiar)
    window.addEventListener('keydown', alPulsar)
    return () => {
      document.body.style.overflow = overflowAnterior
      media.removeEventListener('change', alCambiar)
      window.removeEventListener('keydown', alPulsar)
    }
  }, [menuAbierto])

  return (
    <>
      <header className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        conFondo ? 'border-linea bg-noche/85 shadow-sm backdrop-blur-md' : 'border-transparent bg-noche',
      )}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" aria-label={`${PRODUCTO}, inicio`} onClick={() => setMenuAbierto(false)}>
            <Marca />
          </Link>

          <nav aria-label="Secciones" className="hidden items-center gap-6 text-sm font-medium text-texto-2 md:flex lg:gap-8">
            {ENLACES.map((e) => (
              <a key={e.href} href={e.href}
                className="relative whitespace-nowrap transition-colors hover:text-texto after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cobre after:transition-all hover:after:w-full">
                {e.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <a href={principal.href} className="group hidden items-center gap-2 whitespace-nowrap font-mono text-[0.8125rem] font-medium text-cobre transition-colors hover:text-cobre-claro xl:inline-flex">
              <Phone className="size-3.5 transition-transform group-hover:rotate-12" aria-hidden />
              {principal.visible}
            </a>
            <Link to="/panel/login" className="rounded-full border border-linea px-4 py-2 text-[0.8125rem] font-medium text-texto-2 transition-all hover:border-texto-3 hover:bg-noche-alt hover:text-texto">
              Ingresar
            </Link>
          </div>

          <button
            ref={botonMenu}
            type="button"
            className="flex size-10 items-center justify-center rounded-full text-texto hover:bg-noche-alt md:hidden"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuAbierto ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            id="menu-movil"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-linea bg-noche px-5 pt-6 pb-8 shadow-xl md:hidden"
          >
            <nav aria-label="Secciones y contacto móvil" className="flex flex-col gap-4">
              {ENLACES.map((e, i) => (
                <motion.a key={e.href} href={e.href}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="text-lg font-medium text-texto hover:text-cobre"
                  onClick={() => setMenuAbierto(false)}>
                  {e.label}
                </motion.a>
              ))}
              <div className="my-2 h-px bg-linea" />
              <a href={principal.href} className="flex items-center gap-3 text-base font-medium text-texto-2 hover:text-cobre">
                <Phone className="size-4" aria-hidden /> Llamar al {principal.visible}
              </a>
              <a href={whatsapp.href} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3 text-base font-medium text-texto-2 hover:text-cobre">
                <IconoWhatsApp className="size-4" /> Escribir por WhatsApp
              </a>
              <Link to="/panel/login" className="mt-4 flex items-center justify-center gap-2 rounded-full border border-linea py-3 text-sm font-medium text-texto-2 hover:bg-noche-alt">
                Ingresar al panel <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
          <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-banda-texto-3 uppercase">Contacto</p>
          <ul className="mt-4 space-y-4">
            {telefonos.map((t) => (
              <li key={t.etiqueta} className="group">
                <a href={t.href} className="inline-flex items-center gap-2 font-mono text-sm font-medium text-banda-texto transition-all group-hover:translate-x-1 group-hover:text-cobre-claro">{t.visible}</a>
                <span className="mt-0.5 block text-xs text-banda-texto-3">{t.etiqueta}</span>
              </li>
            ))}
            <li className="group">
              <a href={whatsapp.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-banda-texto-2 transition-all group-hover:translate-x-1 group-hover:text-cobre-claro">
                <IconoWhatsApp className="size-4" /> WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-2xs font-semibold tracking-[0.14em] text-banda-texto-3 uppercase">{EMPRESA}</p>
          <ul className="mt-4 space-y-4 text-sm text-banda-texto-2">
            <li className="flex items-center gap-2"><span aria-hidden className="size-1.5 rounded-full bg-cobre" />{CIUDAD}</li>
            <li>
              <Link to="/panel/login" className="group inline-flex items-center gap-1 transition-colors hover:text-banda-texto">
                Acceso de administración <ArrowUpRight className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-banda-linea px-5 py-6 sm:px-8">
        <p className="text-center text-xs text-banda-texto-3">
          © {new Date().getFullYear()} {EMPRESA}. {PRODUCTO} es una marca de {EMPRESA}.
        </p>
      </div>
    </footer>
  )
}

/** En celulares: escribir o llamar a un toque. */
function BarraContacto() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-linea bg-noche/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md md:hidden">
      <a href={whatsapp.href} target="_blank" rel="noopener noreferrer"
        className="group flex h-14 items-center justify-center gap-2 bg-cobre font-semibold text-on-cobre transition-all active:scale-[0.98] active:bg-cobre-claro">
        <IconoWhatsApp className="size-4" /> WhatsApp
      </a>
      <a href={principal.href} className="flex h-14 items-center justify-center gap-2 font-semibold text-texto transition-all active:scale-[0.98] active:bg-noche-alt">
        <Phone className="size-4" aria-hidden /> Llamar
      </a>
    </div>
  )
}

export function PublicLayout() {
  useEffect(() => {
    const html = document.documentElement
    html.dataset.sitio = 'publico'
    return () => { delete html.dataset.sitio }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-noche pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-texto md:pb-0">
        <a href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-cobre focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-cobre focus:shadow-lg">
          Ir al contenido principal
        </a>
        <Cabecera />
        <main id="contenido" tabIndex={-1} className="scroll-mt-20">
          <Outlet />
        </main>
        <Pie />
        <BarraContacto />
      </div>
    </MotionConfig>
  )
}
