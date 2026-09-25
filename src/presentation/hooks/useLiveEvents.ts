import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Evento } from '@/domain/models'
import { openEventStream, type StreamEvent, type StreamStatus } from '@/network/eventStream'
import { qk } from './queries'

const TIPOS_QUE_CAMBIAN_METRICAS = /ACCESO|INTRUSO|DOMICILIO|USUARIO|TARJETA/

/**
 * Mantiene abierto el canal en vivo mientras hay sesion: los eventos nuevos
 * se insertan al principio de la cache de eventos (sin esperar al polling) y
 * los que afectan metricas invalidan el resumen.
 */
export function useLiveEvents(enabled: boolean) {
  const qc = useQueryClient()
  const [status, setStatus] = useState<StreamStatus>('offline')

  useEffect(() => {
    if (!enabled) return
    const stop = openEventStream({
      onStatus: setStatus,
      onEvent: (e: StreamEvent) => {
        if (typeof e.id !== 'number') {
          // Notificaciones sin id (p. ej. solicitudes): refrescar su lista.
          if (String(e.tipo).startsWith('SOLICITUD')) qc.invalidateQueries({ queryKey: qk.solicitudes })
          return
        }
        const ev: Evento = {
          id: e.id,
          tipo: e.tipo,
          origen: e.origen ?? '',
          mensaje: e.mensaje ?? '',
          nivel: e.nivel ?? 'INFO',
          domicilioId: e.domicilio_id ?? null,
          creadoEn: e.creado_en ?? new Date().toISOString(),
        }
        qc.setQueriesData<Evento[]>({ queryKey: qk.eventos }, (prev) =>
          prev ? [ev, ...prev.filter((x) => x.id !== ev.id)].slice(0, 200) : prev,
        )
        if (TIPOS_QUE_CAMBIAN_METRICAS.test(ev.tipo)) qc.invalidateQueries({ queryKey: qk.resumen })
      },
    })
    return stop
  }, [enabled, qc])

  return status
}
