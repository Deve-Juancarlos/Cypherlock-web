/**
 * Contratos de repositorio. La presentacion depende de estas interfaces,
 * no de HTTP: se pueden sustituir por fakes en pruebas.
 */
import type {
  CredencialesDispositivo,
  Dispositivo,
  Domicilio,
  EstadoSolicitud,
  Evento,
  MetricaOperador,
  Resumen,
  Rol,
  Solicitud,
  Usuario,
} from '../models'

export interface AuthRepository {
  /** Inicia sesion y exige rol ADMIN; si no, cierra la sesion y lanza error. */
  login(username: string, password: string): Promise<Usuario>
  /** Recupera la sesion de la pestana (refresh token) o null. */
  restore(): Promise<Usuario | null>
  logout(): Promise<void>
}

export interface MetricasRepository {
  resumen(): Promise<Resumen>
}

export interface NuevoUsuario {
  username: string
  email: string
  password: string
  rol: Exclude<Rol, 'ADMIN'>
  celular?: string
  casaId?: number
}

export interface UsuariosRepository {
  listar(): Promise<Usuario[]>
  crear(data: NuevoUsuario): Promise<Usuario>
  cambiarRol(id: number, rol: Exclude<Rol, 'ADMIN'>): Promise<Usuario>
  setActivo(id: number, activo: boolean): Promise<void>
  promoverAdmin(id: number, passwordAdmin: string): Promise<Usuario>
}

export interface NuevoDomicilio {
  nombre: string
  tipoInmueble: string
  departamento: string
  provincia: string
  distrito: string
  direccion: string
  nroPuerta: string
  maxTarjetas?: number
}

export interface DomiciliosRepository {
  listar(): Promise<Domicilio[]>
  crear(data: NuevoDomicilio): Promise<Domicilio>
  setActivo(id: number, activo: boolean): Promise<Domicilio>
  liberarPropietario(id: number): Promise<Domicilio>
  dispositivos(id: number): Promise<Dispositivo[]>
  registrarDispositivo(id: number, data: { nombre: string; ip: string; puerto: number }): Promise<CredencialesDispositivo>
  revocarDispositivo(id: number, uuid: string): Promise<Dispositivo>
}

export interface SolicitudesRepository {
  listar(): Promise<Solicitud[]>
  cambiarEstado(id: number, estado: EstadoSolicitud): Promise<Solicitud>
  asignarOperador(id: number, operador: string, estadoActual: EstadoSolicitud): Promise<Solicitud>
  metricasOperadores(): Promise<MetricaOperador[]>
}

export interface EventosRepository {
  recientes(limit?: number): Promise<Evento[]>
  alertas(limit?: number): Promise<Evento[]>
}

export interface Repositories {
  auth: AuthRepository
  metricas: MetricasRepository
  usuarios: UsuariosRepository
  domicilios: DomiciliosRepository
  solicitudes: SolicitudesRepository
  eventos: EventosRepository
}
