/** Entidades del dominio (camelCase, independientes del formato de la API). */

export type Rol = 'ADMIN' | 'OPERADOR' | 'PROPIETARIO' | 'RESIDENTE'
export const ROLES: Rol[] = ['ADMIN', 'OPERADOR', 'PROPIETARIO', 'RESIDENTE']

export interface Usuario {
  id: number
  username: string
  email: string
  celular: string | null
  rol: Rol | string
  activo: boolean
  casaId: number | null
  creadoEn: string
}

export interface Sesion {
  usuario: Usuario
}

export interface Resumen {
  domicilios: { total: number; activos: number; inactivos: number; porTipo: Record<string, number> }
  usuarios: { total: number; operadores: number; propietarios: number; residentes: number }
  tarjetas: { total: number; activas: number }
  ultimas24h: { accesos: number; intrusos: number }
  alertasActivas: number
}

export type TipoInmueble = 'CASA' | 'EDIFICIO' | 'ALQUILER'
export const TIPOS_INMUEBLE: TipoInmueble[] = ['CASA', 'EDIFICIO', 'ALQUILER']

export interface Domicilio {
  id: number
  nombre: string
  codigoContrato: string
  contratoUsado: boolean
  tipoInmueble: string
  activo: boolean
  propietario: string
  operador: string
  maxTarjetas: number
  direccion: string
  ubicacion: string
  esp32Configurado: boolean
  creadoEn: string
}

export interface Dispositivo {
  id: number
  uuid: string
  domicilioId: number
  nombre: string
  ip: string
  puerto: number
  firmware: string | null
  activo: boolean
  online: boolean
  ultimoHeartbeat: string | null
  creadoEn: string
}

/** Credenciales que se muestran UNA vez al registrar un dispositivo. */
export interface CredencialesDispositivo {
  dispositivo: Dispositivo
  secreto: string
  claveFirma: string
}

export type EstadoSolicitud = 'PENDIENTE' | 'ASIGNADO' | 'CONFIRMADO' | 'EN_CURSO' | 'COMPLETADO' | 'CANCELADO'

/** Misma maquina de estados que el backend (TRANSICIONES_SOLICITUD). */
export const TRANSICIONES: Record<EstadoSolicitud, EstadoSolicitud[]> = {
  PENDIENTE: ['ASIGNADO', 'CANCELADO'],
  ASIGNADO: ['CONFIRMADO', 'PENDIENTE', 'CANCELADO'],
  CONFIRMADO: ['EN_CURSO', 'ASIGNADO', 'CANCELADO'],
  EN_CURSO: ['COMPLETADO', 'CANCELADO'],
  COMPLETADO: [],
  CANCELADO: [],
}

export interface Solicitud {
  id: number
  cliente: string
  telefono: string
  email: string
  direccion: string
  zona: string
  tipoInmueble: string
  notas: string
  operador: string
  creadoPor: string
  fechaCita: string | null
  estado: EstadoSolicitud
  calificacion: number | null
  domicilioId: number | null
  creadoEn: string
  actualizadoEn: string
}

export interface MetricaOperador {
  operador: string
  total: number
  completadas: number
  enCurso: number
  ratingPromedio: number
}

export type NivelEvento = 'INFO' | 'WARN' | 'CRITICAL'

export interface Evento {
  id: number
  tipo: string
  origen: string
  mensaje: string
  nivel: NivelEvento | string
  domicilioId: number | null
  creadoEn: string | null
}
