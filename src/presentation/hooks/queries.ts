/**
 * Hooks de datos (casos de uso de la UI). Solo hablan con los repositorios del
 * dominio; claves de cache centralizadas para invalidar de forma consistente.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { env } from '@/core/config/env'
import type { EstadoSolicitud, Rol } from '@/domain/models'
import type { NuevoDomicilio, NuevoUsuario } from '@/domain/repositories'
import { useRepos } from '../app/providers'

export const qk = {
  resumen: ['resumen'] as const,
  usuarios: ['usuarios'] as const,
  domicilios: ['domicilios'] as const,
  dispositivos: (id: number) => ['domicilios', id, 'dispositivos'] as const,
  solicitudes: ['solicitudes'] as const,
  metricasOperadores: ['solicitudes', 'metricas-operadores'] as const,
  eventos: ['eventos'] as const,
}

// ------------------------------------------------------------ lecturas
export function useResumen() {
  const r = useRepos()
  return useQuery({ queryKey: qk.resumen, queryFn: () => r.metricas.resumen(), refetchInterval: env.refetchIntervalMs })
}

export function useUsuarios() {
  const r = useRepos()
  return useQuery({ queryKey: qk.usuarios, queryFn: () => r.usuarios.listar() })
}

export function useDomicilios() {
  const r = useRepos()
  return useQuery({ queryKey: qk.domicilios, queryFn: () => r.domicilios.listar() })
}

export function useDispositivos(domicilioId: number | null) {
  const r = useRepos()
  return useQuery({
    queryKey: qk.dispositivos(domicilioId ?? 0),
    queryFn: () => r.domicilios.dispositivos(domicilioId!),
    enabled: domicilioId !== null,
  })
}

export function useSolicitudes() {
  const r = useRepos()
  return useQuery({ queryKey: qk.solicitudes, queryFn: () => r.solicitudes.listar(), refetchInterval: env.refetchIntervalMs })
}

export function useMetricasOperadores() {
  const r = useRepos()
  return useQuery({ queryKey: qk.metricasOperadores, queryFn: () => r.solicitudes.metricasOperadores() })
}

export function useEventos(limit = 100) {
  const r = useRepos()
  return useQuery({ queryKey: [...qk.eventos, limit], queryFn: () => r.eventos.recientes(limit), refetchInterval: env.refetchIntervalMs })
}

// ------------------------------------------------------------ escrituras
function useInvalidate() {
  const qc = useQueryClient()
  return (...keys: readonly (readonly unknown[])[]) => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: k })))
}

export function useCrearUsuario() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({ mutationFn: (d: NuevoUsuario) => r.usuarios.crear(d), onSuccess: () => inv(qk.usuarios, qk.resumen) })
}

export function useCambiarRol() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (v: { id: number; rol: Exclude<Rol, 'ADMIN'> }) => r.usuarios.cambiarRol(v.id, v.rol),
    onSuccess: () => inv(qk.usuarios, qk.resumen),
  })
}

export function useSetUsuarioActivo() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (v: { id: number; activo: boolean }) => r.usuarios.setActivo(v.id, v.activo),
    onSuccess: () => inv(qk.usuarios),
  })
}

export function usePromoverAdmin() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (v: { id: number; password: string }) => r.usuarios.promoverAdmin(v.id, v.password),
    onSuccess: () => inv(qk.usuarios),
  })
}

export function useCrearDomicilio() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({ mutationFn: (d: NuevoDomicilio) => r.domicilios.crear(d), onSuccess: () => inv(qk.domicilios, qk.resumen) })
}

export function useSetDomicilioActivo() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (v: { id: number; activo: boolean }) => r.domicilios.setActivo(v.id, v.activo),
    onSuccess: () => inv(qk.domicilios, qk.resumen),
  })
}

export function useLiberarPropietario() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({ mutationFn: (id: number) => r.domicilios.liberarPropietario(id), onSuccess: () => inv(qk.domicilios) })
}

export function useRegistrarDispositivo(domicilioId: number) {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (d: { nombre: string; ip: string; puerto: number }) => r.domicilios.registrarDispositivo(domicilioId, d),
    onSuccess: () => inv(qk.dispositivos(domicilioId)),
  })
}

export function useRevocarDispositivo(domicilioId: number) {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (uuid: string) => r.domicilios.revocarDispositivo(domicilioId, uuid),
    onSuccess: () => inv(qk.dispositivos(domicilioId)),
  })
}

export function useCambiarEstadoSolicitud() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (v: { id: number; estado: EstadoSolicitud }) => r.solicitudes.cambiarEstado(v.id, v.estado),
    onSuccess: () => inv(qk.solicitudes),
  })
}

export function useAsignarOperador() {
  const r = useRepos()
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (v: { id: number; operador: string; estadoActual: EstadoSolicitud }) =>
      r.solicitudes.asignarOperador(v.id, v.operador, v.estadoActual),
    onSuccess: () => inv(qk.solicitudes),
  })
}
