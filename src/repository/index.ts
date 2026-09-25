/**
 * Implementaciones HTTP de los repositorios del dominio.
 */
import { tokenStorage } from '@/core/auth/tokenStorage'
import { AppError } from '@/core/errors/AppError'
import {
  authRemote,
  domiciliosRemote,
  eventosRemote,
  metricasRemote,
  solicitudesRemote,
  usuariosRemote,
} from '@/data/datasources/remote'
import type { Repositories } from '@/domain/repositories'
import { ensureSession } from '@/network/httpClient'
import {
  toDispositivo,
  toDomicilio,
  toEvento,
  toMetricaOperador,
  toSolicitud,
  toUsuario,
} from './mappers'

async function sesionAdmin() {
  const me = toUsuario(await authRemote.me())
  if (me.rol !== 'ADMIN' || !me.activo) {
    await cerrarSesion()
    throw new AppError({
      status: 403,
      code: 'FORBIDDEN_ROLE',
      message: 'Este panel es solo para cuentas de administración.',
    })
  }
  return me
}

async function cerrarSesion() {
  const refresh = tokenStorage.getRefresh()
  tokenStorage.clear()
  if (refresh) await authRemote.logout(refresh).catch(() => undefined)
}

export function createHttpRepositories(): Repositories {
  return {
    auth: {
      async login(username, password) {
        const par = await authRemote.login(username.trim(), password)
        tokenStorage.set(par.access_token, par.refresh_token)
        return sesionAdmin()
      },
      async restore() {
        if (!tokenStorage.getRefresh()) return null
        try {
          if (!(await ensureSession())) {
            tokenStorage.clear()
            return null
          }
          return await sesionAdmin()
        } catch {
          tokenStorage.clear()
          return null
        }
      },
      logout: cerrarSesion,
    },

    metricas: {
      async resumen() {
        const [r, a] = await Promise.all([metricasRemote.resumen(), metricasRemote.alertas()])
        return {
          domicilios: {
            total: r.totales.domicilios,
            activos: r.totales.domicilios_activos,
            inactivos: r.totales.domicilios_inactivos,
            porTipo: r.totales.por_tipo_inmueble,
          },
          usuarios: {
            total: r.totales.usuarios,
            operadores: r.totales.operadores,
            propietarios: r.totales.propietarios,
            residentes: r.totales.residentes,
          },
          tarjetas: { total: r.totales.tarjetas, activas: r.totales.tarjetas_activas },
          ultimas24h: r.ultimas_24h,
          alertasActivas: a.alertas_activas,
        }
      },
    },

    usuarios: {
      listar: async () => (await usuariosRemote.list()).map(toUsuario),
      crear: async (d) =>
        toUsuario(
          await usuariosRemote.crear({
            username: d.username.trim(),
            email: d.email.trim(),
            password: d.password,
            rol: d.rol,
            celular: d.celular?.trim() || undefined,
            casa_id: d.casaId,
          }),
        ),
      cambiarRol: async (id, rol) => toUsuario(await usuariosRemote.actualizar(id, { rol })),
      setActivo: async (id, activo) => {
        await (activo ? usuariosRemote.activar(id) : usuariosRemote.desactivar(id))
      },
      promoverAdmin: async (id, pwd) => toUsuario(await usuariosRemote.promoverAdmin(id, pwd)),
    },

    domicilios: {
      listar: async () => (await domiciliosRemote.list()).map(toDomicilio),
      crear: async (d) =>
        toDomicilio(
          await domiciliosRemote.crear({
            nombre: d.nombre.trim(),
            tipo_inmueble: d.tipoInmueble,
            departamento: d.departamento.trim(),
            provincia: d.provincia.trim(),
            distrito: d.distrito.trim(),
            direccion: d.direccion.trim(),
            nro_puerta: d.nroPuerta.trim(),
            max_tarjetas: d.maxTarjetas,
          }),
        ),
      setActivo: async (id, activo) => toDomicilio(await domiciliosRemote.actualizar(id, { activo })),
      liberarPropietario: async (id) =>
        toDomicilio(await domiciliosRemote.actualizar(id, { propietario_username: '' })),
      dispositivos: async (id) => (await domiciliosRemote.dispositivos(id)).map(toDispositivo),
      registrarDispositivo: async (id, d) => {
        const r = await domiciliosRemote.registrarDispositivo(id, {
          nombre: d.nombre.trim(),
          ip: d.ip.trim(),
          puerto: d.puerto,
        })
        return { dispositivo: toDispositivo(r), secreto: r.secreto, claveFirma: r.clave_firma }
      },
      revocarDispositivo: async (id, uuid) => toDispositivo(await domiciliosRemote.revocarDispositivo(id, uuid)),
    },

    solicitudes: {
      listar: async () => (await solicitudesRemote.list()).map(toSolicitud),
      cambiarEstado: async (id, estado) => toSolicitud(await solicitudesRemote.actualizar(id, { estado })),
      asignarOperador: async (id, operador, estadoActual) =>
        toSolicitud(
          await solicitudesRemote.actualizar(id, {
            operador_username: operador,
            // PENDIENTE -> ASIGNADO; en otros estados solo se cambia el operador.
            ...(estadoActual === 'PENDIENTE' ? { estado: 'ASIGNADO' } : {}),
          }),
        ),
      metricasOperadores: async () => (await solicitudesRemote.metricasOperadores()).map(toMetricaOperador),
    },

    eventos: {
      recientes: async (limit = 100) => (await eventosRemote.list(limit)).map(toEvento),
      alertas: async (limit = 100) => (await eventosRemote.alertas(limit)).map(toEvento),
    },
  }
}
