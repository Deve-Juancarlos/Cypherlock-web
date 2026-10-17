import { useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, Building2, ChevronRight, ClipboardList, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react'
import { cn } from '@/core/utils/cn'
import type { StreamStatus } from '@/network/eventStream'
import { useCurrentUser, useSession } from '../../app/providers'
import { useLiveEvents } from '../../hooks/useLiveEvents'

const NAV = [
  { to: '/panel', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/panel/domicilios', label: 'Domicilios', icon: Building2 },
  { to: '/panel/usuarios', label: 'Usuarios', icon: Users },
  { to: '/panel/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { to: '/panel/actividad', label: 'Actividad', icon: Activity },
]

const ALTO_CABECERA = 'top-[3.6875rem]' // 56px de franja + 3px de linea

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Principal" className="flex flex-col py-4">
      <p className="mb-2 px-5 text-xs font-semibold text-texto-3">Operación</p>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 border-l-[3px] px-5 py-2.5 text-sm transition-colors duration-100',
              isActive
                ? 'border-cobre bg-white/[0.07] font-semibold text-texto'
                : 'border-transparent text-texto-2 hover:bg-white/[0.04] hover:text-texto',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('size-[1.125rem]', isActive ? 'text-cobre-claro' : 'text-texto-3')} aria-hidden />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

const ESTADO_CANAL: Record<StreamStatus, { label: string; punto: string }> = {
  live: { label: 'En vivo', punto: 'bg-[#4ade80]' },
  connecting: { label: 'Conectando', punto: 'bg-[#fbbf24] animate-pulse' },
  offline: { label: 'Sin conexión en vivo', punto: 'bg-texto-3' },
}

function Cabecera({ status, onMenu }: { status: StreamStatus; onMenu: () => void }) {
  const user = useCurrentUser()
  const { logout } = useSession()
  const canal = ESTADO_CANAL[status]
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-cobre bg-noche text-texto">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button onClick={onMenu} className="-ml-1 cursor-pointer rounded-[var(--radius-control)] p-1.5 text-texto-2 hover:bg-white/10 lg:hidden" aria-label="Abrir menú">
          <Menu className="size-5" aria-hidden />
        </button>
        <Link to="/panel" className="flex items-center gap-3">
          <img src="/brand/emblema-96.png" alt="" className="size-8" width={32} height={32} />
          <span className="text-[0.9375rem] font-semibold tracking-[0.14em]">CYPHERLOCK</span>
        </Link>
        <span aria-hidden className="hidden h-6 w-px bg-linea sm:block" />
        <span className="hidden text-sm text-texto-2 sm:block">Panel de administración</span>

        <div className="ml-auto flex items-center gap-5">
          <span role="status" className="hidden items-center gap-2 text-xs text-texto-2 md:inline-flex">
            <span className={cn('size-2 rounded-full', canal.punto)} aria-hidden />
            {canal.label}
          </span>
          <span aria-hidden className="hidden h-6 w-px bg-linea md:block" />
          <div className="text-right leading-tight">
            <p className="text-sm font-medium">{user.username}</p>
            <p className="text-2xs text-texto-3">Administrador</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-linea px-2.5 py-1.5 text-xs text-texto-2 transition-colors hover:border-texto-3 hover:text-texto"
          >
            <LogOut className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function PieLateral() {
  return <p className="border-t border-linea px-5 py-4 text-2xs text-texto-3">CypherTech Perú · Uso interno</p>
}

export function AppShell() {
  // El menu queda abierto solo en la ruta donde se abrio: navegar lo cierra
  // (incluido atras/adelante) sin un efecto que sincronice estado.
  const [menuEn, setMenuEn] = useState<string | null>(null)
  const status = useLiveEvents(true)
  const location = useLocation()

  const menu = menuEn === location.pathname
  const setMenu = (abierto: boolean) => setMenuEn(abierto ? location.pathname : null)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <title>Panel · CYPHERLOCK</title>
      <meta name="robots" content="noindex, nofollow" />
      <Cabecera status={status} onMenu={() => setMenu(true)} />

      <div className="flex-1 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className={cn('sticky hidden h-[calc(100dvh-3.6875rem)] flex-col justify-between bg-noche lg:flex', ALTO_CABECERA)}>
          <NavItems />
          <PieLateral />
        </aside>
        <main className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Navegacion movil */}
      <AnimatePresence>
        {menu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 flex-col justify-between bg-noche"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <div className="flex h-14 items-center justify-between border-b-[3px] border-cobre bg-noche px-4 text-texto">
                  <span className="text-sm font-semibold tracking-[0.14em]">CYPHERLOCK</span>
                  <button onClick={() => setMenu(false)} className="cursor-pointer rounded-[var(--radius-control)] p-1.5 text-texto-2 hover:text-texto" aria-label="Cerrar menú">
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <NavItems onNavigate={() => setMenu(false)} />
              </div>
              <PieLateral />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Encabezado de pagina con migas de pan ("Inicio > Seccion"). */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  const enInicio = useLocation().pathname === '/panel'
  return (
    <div className="mb-6">
      <nav aria-label="Ruta" className="mb-2 flex items-center gap-1.5 text-xs text-text-muted">
        <Link to="/panel" className="hover:text-primary hover:underline">Inicio</Link>
        {!enInicio && (
          <>
            <ChevronRight className="size-3" aria-hidden />
            <span aria-current="page" className="text-text-secondary">{title}</span>
          </>
        )}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-divider pb-5">
        <div>
          <h1 className="text-[1.625rem] leading-tight font-semibold tracking-[-0.01em] text-text-primary text-balance">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
