/** Columna de marca del login (solo escritorio): quien entra y a que. */
import { Activity, Building2, Users } from 'lucide-react'

const TAREAS = [
  { icon: Activity, texto: 'Alertas e intentos de intrusión de las últimas 24 horas' },
  { icon: Building2, texto: 'Domicilios y las credenciales de cada puerta' },
  { icon: Users, texto: 'Cuentas, roles y solicitudes de instalación' },
]

export function LoginMarca() {
  return (
    <aside className="relative hidden overflow-hidden border-r-[3px] border-cobre bg-noche text-texto lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Halo del emblema: la unica luz de la pantalla */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 size-[34rem] rounded-full bg-senal/[0.05] blur-3xl" />

      <div className="relative flex items-center gap-3">
        <img src="/brand/emblema-96.png" alt="" width={36} height={36} className="size-9" />
        <span className="text-[0.875rem] font-semibold tracking-[0.16em]">CYPHERLOCK</span>
      </div>

      <div className="relative max-w-md">
        <img src="/brand/emblema-256.png" alt="" width={112} height={112} className="mb-10 size-28 opacity-90" />
        <h2 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.015em]">
          Panel de operación
        </h2>
        <p className="mt-4 leading-relaxed text-texto-2">Desde aquí el equipo administra todas las puertas instaladas.</p>
        <ul className="mt-10 space-y-4">
          {TAREAS.map(({ icon: Icon, texto }) => (
            <li key={texto} className="flex items-start gap-3 text-sm text-texto-2">
              <Icon className="mt-0.5 size-4 shrink-0 text-senal" aria-hidden />
              {texto}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-texto-3">CypherTech Perú · Sistema de uso interno</p>
    </aside>
  )
}
