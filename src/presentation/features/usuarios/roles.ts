/** Etiquetas y roles asignables desde el panel. */
export const ROL_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  OPERADOR: 'Operador',
  PROPIETARIO: 'Propietario',
  RESIDENTE: 'Residente',
}
export const ROLES_EDITABLES = ['OPERADOR', 'PROPIETARIO', 'RESIDENTE'] as const
