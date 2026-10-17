import type { UsuarioDto } from '@/data/dto/auth.dto'
import type {
  DispositivoDto,
  DomicilioDto,
  EventoDto,
  MetricaOperadorDto,
  SolicitudDto,
} from '@/data/dto/operacion.dto'
import type {
  Dispositivo,
  Domicilio,
  EstadoSolicitud,
  Evento,
  MetricaOperador,
  Solicitud,
  Usuario,
} from '@/domain/models'

const join = (...parts: string[]) => parts.map((p) => p.trim()).filter(Boolean).join(', ')

export const toUsuario = (d: UsuarioDto): Usuario => ({
  id: d.id,
  username: d.username,
  email: d.email,
  celular: d.celular ?? null,
  rol: d.rol,
  activo: d.activo,
  casaId: d.casa_id ?? null,
  creadoEn: d.creado_en,
})

export const toDomicilio = (d: DomicilioDto): Domicilio => ({
  id: d.id,
  nombre: d.nombre || `Domicilio ${d.id}`,
  codigoContrato: d.codigo_contrato,
  contratoUsado: d.propietario_username !== '',
  tipoInmueble: d.tipo_inmueble,
  activo: d.activo,
  propietario: d.propietario_username,
  operador: d.operador_username,
  maxTarjetas: d.max_tarjetas,
  direccion: join(d.direccion, d.nro_puerta),
  ubicacion: join(d.distrito, d.provincia, d.departamento),
  esp32Configurado: Boolean(d.esp32_ip),
  creadoEn: d.creado_en,
})

export const toDispositivo = (d: DispositivoDto): Dispositivo => ({
  id: d.id,
  uuid: d.uuid,
  domicilioId: d.domicilio_id,
  nombre: d.nombre,
  ip: d.ip,
  puerto: d.puerto,
  firmware: d.firmware_version ?? null,
  activo: d.activo,
  online: d.online,
  ultimoHeartbeat: d.ultimo_heartbeat ?? null,
  creadoEn: d.creado_en,
})

export const toSolicitud = (d: SolicitudDto): Solicitud => ({
  id: d.id,
  cliente: d.cliente_nombre,
  telefono: d.cliente_telefono,
  email: d.cliente_email,
  direccion: d.direccion,
  zona: join(d.distrito, d.provincia),
  tipoInmueble: d.tipo_inmueble,
  notas: d.notas,
  operador: d.operador_username,
  creadoPor: d.creado_por_username,
  fechaCita: d.fecha_cita ?? null,
  ubicacion: d.latitud != null && d.longitud != null ? { lat: d.latitud, lon: d.longitud } : null,
  preferencia: d.preferencia_visita ?? null,
  estado: d.estado as EstadoSolicitud,
  calificacion: d.calificacion ?? null,
  domicilioId: d.domicilio_id ?? null,
  creadoEn: d.creado_en,
  actualizadoEn: d.actualizado_en,
})

export const toMetricaOperador = (d: MetricaOperadorDto): MetricaOperador => ({
  operador: d.operador,
  total: d.total,
  completadas: d.completadas,
  enCurso: d.en_curso,
  ratingPromedio: d.rating_promedio,
})

export const toEvento = (d: EventoDto): Evento => ({
  id: d.id,
  tipo: d.tipo,
  origen: d.origen,
  mensaje: d.mensaje,
  nivel: d.nivel,
  domicilioId: d.domicilio_id ?? null,
  creadoEn: d.creado_en,
})
