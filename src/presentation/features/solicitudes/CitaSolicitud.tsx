/**
 * Columna "Cita": la fecha confirmada si existe; si no, la preferencia que el
 * cliente marco en la web (no es una cita) y el enlace al punto en el mapa.
 */
import { MapPin } from 'lucide-react'
import { formatDateTime, formatFechaCorta } from '@/core/utils/format'
import type { Solicitud } from '@/domain/models'

const DIA: Record<string, string> = { LUN: 'Lun', MAR: 'Mar', MIE: 'Mié', JUE: 'Jue', VIE: 'Vie', SAB: 'Sáb', DOM: 'Dom' }
const FRANJA: Record<string, string> = { MANANA: 'mañana', TARDE: 'tarde', CUALQUIERA: 'cualquier hora' }

export function CitaSolicitud({ s }: { s: Solicitud }) {
  const p = s.preferencia
  return (
    <div className="text-xs">
      {s.fechaCita ? (
        <span title={formatDateTime(s.fechaCita)} className="font-mono">{formatFechaCorta(s.fechaCita)}</span>
      ) : p ? (
        <span className="text-text-secondary" title="Preferencia del cliente: el operador debe confirmar la cita">
          Prefiere: {p.dias.map((d) => DIA[d] ?? d).join(', ')} · {FRANJA[p.franja] ?? p.franja}
        </span>
      ) : (
        <span className="font-mono text-text-disabled">Sin agendar</span>
      )}
      {s.ubicacion && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${s.ubicacion.lat}&mlon=${s.ubicacion.lon}#map=18/${s.ubicacion.lat}/${s.ubicacion.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <MapPin className="size-3" aria-hidden />
          Ver en mapa
        </a>
      )}
    </div>
  )
}
