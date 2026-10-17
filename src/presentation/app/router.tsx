import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Link, Navigate, RouterProvider } from 'react-router-dom'
import { useSession } from './providers'
import { AppShell } from '../components/layout/AppShell'
import { Skeleton } from '../components/ui/States'
import { LoginPage } from '../features/auth/LoginPage'
import { LandingPage } from '../features/publico/LandingPage'
import { PublicLayout } from '../features/publico/PublicLayout'

// Cada seccion se carga bajo demanda: el login no descarga el panel entero.
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const DomiciliosPage = lazy(() => import('../features/domicilios/DomiciliosPage').then((m) => ({ default: m.DomiciliosPage })))
const UsuariosPage = lazy(() => import('../features/usuarios/UsuariosPage').then((m) => ({ default: m.UsuariosPage })))
const SolicitudesPage = lazy(() => import('../features/solicitudes/SolicitudesPage').then((m) => ({ default: m.SolicitudesPage })))
const ActividadPage = lazy(() => import('../features/eventos/ActividadPage').then((m) => ({ default: m.ActividadPage })))

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Cargando sesión">
      <img src="/brand/emblema-96.png" alt="" width={56} height={56} className="size-14 animate-pulse" />
    </div>
  )
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { state } = useSession()
  if (state.status === 'loading') return <Splash />
  if (state.status !== 'authenticated') return <Navigate to="/panel/login" replace />
  return children
}

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Skeleton className="h-64 rounded-[var(--radius-card)]" />}>{children}</Suspense>
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-mono text-sm text-text-disabled">404</p>
      <h1 className="mt-2 text-xl font-semibold text-text-primary">Esta sección no existe</h1>
      <Link to="/panel" className="mt-4 inline-block text-sm text-primary-light hover:underline">Volver al resumen</Link>
    </div>
  )
}

function NoEncontradaPublica() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-32 sm:px-8">
      <p className="font-mono text-sm text-senal">404</p>
      <h1 className="mt-3 font-display text-4xl text-texto">Esta página no existe.</h1>
      <Link to="/" className="mt-6 inline-block text-texto-2 underline underline-offset-4 hover:text-texto">
        Volver al inicio
      </Link>
    </div>
  )
}

const router = createBrowserRouter([
  // Sitio publico de CypherTech Peru
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: '*', element: <NoEncontradaPublica /> },
    ],
  },
  // Panel de administracion (solo ADMIN)
  { path: '/login', element: <Navigate to="/panel/login" replace /> },
  { path: '/panel/login', element: <LoginPage /> },
  {
    path: '/panel',
    element: (
      <RequireAdmin>
        <AppShell />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Page><DashboardPage /></Page> },
      { path: 'domicilios', element: <Page><DomiciliosPage /></Page> },
      { path: 'usuarios', element: <Page><UsuariosPage /></Page> },
      { path: 'solicitudes', element: <Page><SolicitudesPage /></Page> },
      { path: 'actividad', element: <Page><ActividadPage /></Page> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
