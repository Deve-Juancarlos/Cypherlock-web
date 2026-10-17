/** Rutas de la API de CYPHERLOCK usadas por el panel admin (prefijo /api/v1). */
export const endpoints = {
  auth: {
    login: '/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/me',
  },
  metricas: {
    resumen: '/metricas/resumen',
    alertas: '/metricas/alertas',
  },
  usuarios: {
    list: '/usuarios',
    registro: '/registro',
    byId: (id: number) => `/usuarios/${id}`,
    activar: (id: number) => `/usuarios/${id}/activar`,
    desactivar: (id: number) => `/usuarios/${id}/desactivar`,
    promoverAdmin: (id: number) => `/usuarios/${id}/promover-admin`,
  },
  domicilios: {
    list: '/domicilios',
    byId: (id: number) => `/domicilios/${id}`,
    dispositivos: (id: number) => `/domicilios/${id}/dispositivos`,
    revocarDispositivo: (id: number, uuid: string) => `/domicilios/${id}/dispositivos/${encodeURIComponent(uuid)}/revocar`,
  },
  solicitudes: {
    list: '/solicitudes',
    publica: '/solicitudes/publica',
    byId: (id: number) => `/solicitudes/${id}`,
    metricasOperadores: '/solicitudes/operadores/metricas',
  },
  eventos: {
    list: '/eventos',
    alertas: '/eventos/alertas',
  },
} as const

export const WS_EVENTOS = '/ws/eventos'
