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
import { Avatar } from '../ui/Table'

const NAV = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/domicilios', label: 'Domicilios', icon: Building2 },
  { to: '/usuarios', label: 'Usuarios', icon: Users },
  { to: '/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { to: '/actividad', label: 'Actividad', icon: Activity },
]

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <img src="/brand/emblema-96.png" alt="" className="size-9" width={36} height={36} />
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-[0.18em] text-text-primary">CYPHERLOCK</p>
        <p className="text-2xs text-text-muted">Administración</p>
      </div>
    </div>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Principal" className="flex flex-col gap-0.5">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
              isActive
                ? 'bg-primary/12 font-medium text-text-primary'
                : 'text-text-muted hover:bg-surface/70 hover:text-text-primary',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-activo"
                  className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary-light"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <Icon className={cn('size-4', isActive ? 'text-primary-light' : '')} aria-hidden />
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
    <div className="flex items-center gap-3 rounded-lg px-2 py-2">
      <Avatar name={user.username} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">{user.username}</p>
        <p className="truncate text-2xs text-text-muted">{user.email}</p>
      </div>
      <button
        onClick={logout}
        className="cursor-pointer rounded-md p-2 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut className="size-4" aria-hidden />
      </button>
    </div>
  )
}

const STATUS_COPY: Record<StreamStatus, { label: string; cls: string }> = {
  live: { label: 'En vivo', cls: 'bg-success' },
  connecting: { label: 'Conectando…', cls: 'bg-warning animate-pulse' },
  offline: { label: 'Sin canal en vivo', cls: 'bg-text-disabled' },
}

function LiveStatus({ status }: { status: StreamStatus }) {
  const s = STATUS_COPY[status]
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-divider bg-surface px-3 py-1 text-xs text-text-secondary" role="status">
      <span className={cn('size-2 rounded-full', s.cls)} aria-hidden />
      {s.label}
    </span>
  )
}

export function AppShell() {
  const [menu, setMenu] = useState(false)
  const status = useLiveEvents(true)
  const location = useLocation()

  useEffect(() => setMenu(false), [location.pathname])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Barra lateral (desktop) */}
      <aside className="sticky top-0 hidden h-dvh flex-col justify-between border-r border-divider/60 bg-rail px-3 py-5 lg:flex">
        <div className="flex flex-col gap-8">
          <Brand />
          <NavItems />
        </div>
        <UserBlock />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-divider/60 bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            onClick={() => setMenu(true)}
            className="cursor-pointer rounded-md p-2 text-text-secondary hover:bg-surface lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ml-auto">
            <LiveStatus status={status} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* Navegacion movil */}
      <AnimatePresence>
        {menu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[rgb(2_6_23/0.6)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenu(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-72 flex-col justify-between bg-rail px-3 py-5 shadow-[var(--shadow-pop)]"
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <Brand />
                  <button onClick={() => setMenu(false)} className="cursor-pointer rounded-md p-2 text-text-muted hover:text-text-primary" aria-label="Cerrar menú">
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary text-balance">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
