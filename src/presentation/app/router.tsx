import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Link, Navigate, RouterProvider } from 'react-router-dom'
import { useSession } from './providers'
import { AppShell } from '../components/layout/AppShell'
import { Skeleton } from '../components/ui/States'
import { LoginPage } from '../features/auth/LoginPage'

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
  if (state.status !== 'authenticated') return <Navigate to="/login" replace />
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
      <Link to="/" className="mt-4 inline-block text-sm text-primary-light hover:underline">Volver al resumen</Link>
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
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
