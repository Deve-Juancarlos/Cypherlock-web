import { Cpu } from 'lucide-react'
import { formatRelative } from '@/core/utils/format'
import { type Domicilio } from '@/domain/models'
import { Badge } from '../../components/ui/Badge'
import { ConfirmButton } from '../../components/ui/ConfirmButton'
import { ErrorState, Skeleton } from '../../components/ui/States'
import { useToast } from '../../components/ui/Toast'
import { useDispositivos, useRevocarDispositivo } from '../../hooks/queries'

/** Puertas de un domicilio: estado y revocacion. El alta la hace el tecnico en la app. */
export function Dispositivos({ domicilio }: { domicilio: Domicilio }) {
  const lista = useDispositivos(domicilio.id)
  const revocar = useRevocarDispositivo(domicilio.id)
  const toast = useToast()

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Dispositivos de la puerta</h3>
      </div>
      <p className="mb-3 text-xs text-text-muted">
        Las puertas las registra y configura el técnico desde la app durante la instalación. Aquí puedes ver su
        estado y revocar una puerta si se pierde o se reemplaza el equipo.
      </p>

      {lista.isPending ? (
        <Skeleton className="h-16" />
      ) : lista.isError ? (
        <ErrorState error={lista.error} onRetry={() => lista.refetch()} />
      ) : lista.data.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-divider px-4 py-6 text-center text-sm text-text-muted">
          Esta casa aún no tiene una puerta configurada. El técnico la registra durante la instalación.
        </p>
      ) : (
        <ul className="divide-y divide-divider/60 rounded-[var(--radius-card)] border border-divider">
          {lista.data.map((d) => (
            <li key={d.uuid} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Cpu className="size-4 text-text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{d.nombre || 'Dispositivo sin nombre'}</p>
                <p className="font-mono text-2xs text-text-muted">
                  {d.uuid.slice(0, 8)} · última señal {formatRelative(d.ultimoHeartbeat)}
                </p>
              </div>
              {!d.activo ? (
                <Badge tone="neutral">Revocado</Badge>
              ) : (
                <>
                  <Badge tone={d.online ? 'success' : 'neutral'} dot>{d.online ? 'En línea' : 'Sin señal'}</Badge>
                  <ConfirmButton
                    size="sm"
                    variant="secondary"
                    confirmLabel="¿Revocar?"
                    onConfirm={() =>
                      revocar.mutate(d.uuid, {
                        onSuccess: () => toast.success('Dispositivo revocado', 'Ya no puede autenticarse ni recibir comandos.'),
                        onError: (err) => toast.error(err),
                      })
                    }
                  >
                    Revocar
                  </ConfirmButton>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ------------------------------------------------------------------ detalle
