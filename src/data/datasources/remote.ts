/**
 * Data sources remotos: una funcion por endpoint, sin logica de negocio.
 * Devuelven DTOs validados (snake_case, tal como los manda el backend).
 */
import { z } from 'zod'
import { http } from '@/network/httpClient'
import { endpoints } from '@/network/endpoints'
import { TokenPairDto, UsuarioDto } from '../dto/auth.dto'
import {
  AlertasDto,
  DispositivoCreadoDto,
  DispositivoDto,
  DomicilioDto,
  EventoDto,
  MetricaOperadorDto,
  ResumenDto,
  SolicitudDto,
} from '../dto/operacion.dto'

export const authRemote = {
  login: (username: string, password: string) =>
    http(endpoints.auth.login, { method: 'POST', body: { username, password }, schema: TokenPairDto, auth: false }),
  logout: (refresh_token: string) =>
    http(endpoints.auth.logout, { method: 'POST', body: { refresh_token }, auth: false }),
  me: () => http(endpoints.auth.me, { schema: UsuarioDto }),
}

export const metricasRemote = {
  resumen: () => http(endpoints.metricas.resumen, { schema: ResumenDto }),
  alertas: () => http(endpoints.metricas.alertas, { schema: AlertasDto }),
}

export interface UsuarioCreateBody {
  username: string
  email: string
  password: string
  rol: 'OPERADOR' | 'PROPIETARIO' | 'RESIDENTE'
  celular?: string
  casa_id?: number
}
export type UsuarioPatchBody = Partial<{ username: string; email: string; rol: string; casa_id: number | null; activo: boolean }>

export const usuariosRemote = {
  list: () => http(endpoints.usuarios.list, { schema: z.array(UsuarioDto) }),
  crear: (body: UsuarioCreateBody) =>
    http(endpoints.usuarios.registro, { method: 'POST', body, schema: UsuarioDto }),
  actualizar: (id: number, body: UsuarioPatchBody) =>
    http(endpoints.usuarios.byId(id), { method: 'PATCH', body, schema: UsuarioDto }),
  activar: (id: number) => http(endpoints.usuarios.activar(id), { method: 'POST' }),
  desactivar: (id: number) => http(endpoints.usuarios.desactivar(id), { method: 'POST' }),
  promoverAdmin: (id: number, admin_password: string) =>
    http(endpoints.usuarios.promoverAdmin(id), { method: 'POST', body: { admin_password }, schema: UsuarioDto }),
}

export interface DomicilioCreateBody {
  nombre?: string
  tipo_inmueble: string
  departamento?: string
  provincia?: string
  distrito?: string
  direccion?: string
  nro_puerta?: string
  max_tarjetas?: number
}
export type DomicilioPatchBody = Partial<DomicilioCreateBody & { activo: boolean; propietario_username: string }>

export const domiciliosRemote = {
  list: () => http(endpoints.domicilios.list, { schema: z.array(DomicilioDto) }),
  crear: (body: DomicilioCreateBody) =>
    http(endpoints.domicilios.list, { method: 'POST', body, schema: DomicilioDto }),
  actualizar: (id: number, body: DomicilioPatchBody) =>
    http(endpoints.domicilios.byId(id), { method: 'PATCH', body, schema: DomicilioDto }),
  dispositivos: (id: number) =>
    http(endpoints.domicilios.dispositivos(id), { schema: z.array(DispositivoDto) }),
  registrarDispositivo: (id: number, body: { nombre?: string; ip?: string; puerto?: number }) =>
    http(endpoints.domicilios.dispositivos(id), { method: 'POST', body, schema: DispositivoCreadoDto }),
  revocarDispositivo: (id: number, uuid: string) =>
    http(endpoints.domicilios.revocarDispositivo(id, uuid), { method: 'POST', schema: DispositivoDto }),
}

export const solicitudesRemote = {
  list: () => http(endpoints.solicitudes.list, { schema: z.array(SolicitudDto) }),
  actualizar: (id: number, body: Record<string, unknown>) =>
    http(endpoints.solicitudes.byId(id), { method: 'PATCH', body, schema: SolicitudDto }),
  metricasOperadores: () =>
    http(endpoints.solicitudes.metricasOperadores, { schema: z.array(MetricaOperadorDto) }),
}

export const eventosRemote = {
  list: (limit = 100) => http(endpoints.eventos.list, { query: { limit }, schema: z.array(EventoDto) }),
  alertas: (limit = 100) => http(endpoints.eventos.alertas, { query: { limit }, schema: z.array(EventoDto) }),
}
