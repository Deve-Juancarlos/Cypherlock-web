import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/core/utils/cn'
import type { StreamStatus } from '@/network/eventStream'
import { useCurrentUser, useSession } from '../../app/providers'
import { useLiveEvents } from '../../hooks/useLiveEvents'

const NAV = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/domicilios', label: 'Domicilios', icon: Building2 },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { to: '/actividad', label: 'Actividad', icon: Activity },
]

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <img src="/brand/emblema-96.png" alt="" className="size-7" width={28} height={28} />
      <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-text-primary">CYPHERLOCK</p>
    </div>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Principal" className="flex flex-col">
      <p className="rotulo mb-1.5 px-3">Operación</p>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 border-l-2 px-3 py-[7px] text-sm transition-colors duration-100',
              isActive
                ? 'border-primary bg-surface text-text-primary'
                : 'border-transparent text-text-muted hover:bg-surface/60 hover:text-text-primary',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('size-4', isActive ? 'text-primary' : 'text-text-disabled')} aria-hidden />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function UserBlock() {
  const user = useCurrentUser()
  const { logout } = useSession()
  return (
    <div className="flex items-center gap-2 border-t border-divider px-3 pt-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8125rem] font-medium text-text-primary">{user.username}</p>
        <p className="truncate text-2xs text-text-disabled">Administrador</p>
      </div>
      <button
        onClick={logout}
        className="cursor-pointer rounded-[var(--radius-control)] p-1.5 text-text-disabled transition-colors hover:bg-surface-light hover:text-text-primary"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut className="size-4" aria-hidden />
      </button>
    </div>
  )
}

const STATUS_COPY: Record<StreamStatus, { label: string; cls: string }> = {
  live: { label: 'Canal en vivo', cls: 'bg-success' },
  connecting: { label: 'Conectando', cls: 'bg-warning animate-pulse' },
  offline: { label: 'Sin canal en vivo', cls: 'bg-text-disabled' },
}

function LiveStatus({ status }: { status: StreamStatus }) {
  const s = STATUS_COPY[status]
  return (
    <span className="inline-flex items-center gap-2 font-mono text-2xs tracking-wide text-text-muted uppercase" role="status">
      <span className={cn('size-1.5', s.cls)} aria-hidden />
      {s.label}
    </span>
  )
}

const fechaCorta = new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })

export function AppShell() {
  const [menu, setMenu] = useState(false)
  const status = useLiveEvents(true)
  const location = useLocation()

  useEffect(() => setMenu(false), [location.pathname])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[14rem_1fr]">
      {/* Barra lateral (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col justify-between border-r border-divider bg-rail py-4 lg:flex">
        <div className="flex flex-col gap-7">
          <Brand />
          <NavItems />
        </div>
        <UserBlock />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex h-11 items-center justify-between gap-4 border-b border-divider bg-background px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setMenu(true)}
            className="-ml-1.5 cursor-pointer rounded-[var(--radius-control)] p-1.5 text-text-secondary hover:bg-surface-light lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <div className="-ml-2 lg:hidden">
            <Brand />
          </div>
          <p className="hidden font-mono text-2xs tracking-wide text-text-disabled uppercase lg:block">
            {fechaCorta.format(new Date())}
          </p>
          <div className="ml-auto">
            <LiveStatus status={status} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>

      {/* Navegacion movil */}
      <AnimatePresence>
        {menu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenu(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-64 flex-col justify-between border-r border-divider bg-rail py-4"
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-7">
                <div className="flex items-center justify-between pr-2">
                  <Brand />
                  <button onClick={() => setMenu(false)} className="cursor-pointer rounded-[var(--radius-control)] p-1.5 text-text-muted hover:text-text-primary" aria-label="Cerrar menú">
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
                <NavItems onNavigate={() => setMenu(false)} />
              </div>
              <UserBlock />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.01em] text-text-primary text-balance">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[0.8125rem] text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
