import { z } from 'zod'

// ---------------------------------------------------------------- metricas
export const ResumenDto = z.object({
  totales: z.object({
    domicilios: z.number(),
    domicilios_activos: z.number(),
    domicilios_inactivos: z.number(),
    por_tipo_inmueble: z.record(z.string(), z.number()),
    usuarios: z.number(),
    operadores: z.number(),
    propietarios: z.number(),
    residentes: z.number(),
    tarjetas: z.number(),
    tarjetas_activas: z.number(),
  }),
  ultimas_24h: z.object({ accesos: z.number(), intrusos: z.number() }),
})
export type ResumenDto = z.infer<typeof ResumenDto>

export const AlertasDto = z.object({ alertas_activas: z.number() })

// ---------------------------------------------------------------- domicilios
export const DomicilioDto = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo_contrato: z.string(),
  tipo_inmueble: z.string(),
  activo: z.boolean(),
  propietario_username: z.string(),
  departamento: z.string(),
  provincia: z.string(),
  distrito: z.string(),
  direccion: z.string(),
  nro_puerta: z.string(),
  operador_username: z.string(),
  max_tarjetas: z.number(),
  esp32_ip: z.string(),
  esp32_port: z.number(),
  esp32_configurado_en: z.string().nullable().optional(),
  foto_url: z.string(),
  latitud: z.number().nullable().optional(),
  longitud: z.number().nullable().optional(),
  creado_en: z.string(),
})
export type DomicilioDto = z.infer<typeof DomicilioDto>

export const DispositivoDto = z.object({
  id: z.number(),
  uuid: z.string(),
  domicilio_id: z.number(),
  nombre: z.string(),
  ip: z.string(),
  puerto: z.number(),
  firmware_version: z.string().nullable().optional(),
  activo: z.boolean(),
  online: z.boolean(),
  ultimo_heartbeat: z.string().nullable().optional(),
  creado_en: z.string(),
})
export type DispositivoDto = z.infer<typeof DispositivoDto>

/** Respuesta del alta: trae los secretos UNA sola vez. */
export const DispositivoCreadoDto = DispositivoDto.extend({
  secreto: z.string(),
  clave_firma: z.string(),
})
export type DispositivoCreadoDto = z.infer<typeof DispositivoCreadoDto>

// ---------------------------------------------------------------- solicitudes
export const SolicitudDto = z.object({
  id: z.number(),
  cliente_nombre: z.string(),
  cliente_telefono: z.string(),
  cliente_email: z.string(),
  direccion: z.string(),
  departamento: z.string(),
  provincia: z.string(),
  distrito: z.string(),
  tipo_inmueble: z.string(),
  notas: z.string(),
  operador_username: z.string(),
  creado_por_username: z.string(),
  fecha_cita: z.string().nullable().optional(),
  estado: z.string(),
  motivo_cancelacion: z.string(),
  calificacion: z.number().nullable().optional(),
  comentario_cliente: z.string(),
  domicilio_id: z.number().nullable().optional(),
  creado_en: z.string(),
  actualizado_en: z.string(),
  completado_en: z.string().nullable().optional(),
})
export type SolicitudDto = z.infer<typeof SolicitudDto>

export const MetricaOperadorDto = z.object({
  operador: z.string(),
  total: z.number(),
  completadas: z.number(),
  en_curso: z.number(),
  rating_promedio: z.number(),
})
export type MetricaOperadorDto = z.infer<typeof MetricaOperadorDto>

// ---------------------------------------------------------------- eventos
export const EventoDto = z.object({
  id: z.number(),
  tipo: z.string(),
  origen: z.string(),
  mensaje: z.string(),
  nivel: z.string(),
  domicilio_id: z.number().nullable().optional(),
  creado_en: z.string().nullable(),
})
export type EventoDto = z.infer<typeof EventoDto>
